import os
import re
import json
import shutil
import subprocess
from pathlib import Path
from typing import List, Tuple

import pymupdf  # PyMuPDF
from pypdf import PdfReader

from ai.skill_extractor import extract_skills
from ai.skill_normalizer import normalize_skills


# --------------------------------------------------
# Load role knowledge base
# --------------------------------------------------

ROLE_DATA_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "roles.json"
)


def load_roles():
    with open(ROLE_DATA_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


ROLE_DATABASE = load_roles()


# --------------------------------------------------
# Scoring configuration
# --------------------------------------------------

# Relevance = COVERAGE_WEIGHT * coverage + FOCUS_WEIGHT * focus
#   coverage: how much of the role's skill list the certificate covers
#   focus:    share of the certificate's skills that are relevant to the role
COVERAGE_WEIGHT = 0.5
FOCUS_WEIGHT = 0.5


# --------------------------------------------------
# Tesseract configuration
# --------------------------------------------------

DEFAULT_TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def find_tesseract() -> str:
    """
    Finds tesseract.exe using, in order:
    1. TESSERACT_CMD environment variable
    2. PATH
    3. Default Windows install location
    """

    env_path = os.getenv("TESSERACT_CMD")

    if env_path and os.path.exists(env_path):
        return env_path

    on_path = shutil.which("tesseract")

    if on_path:
        return on_path

    if os.path.exists(DEFAULT_TESSERACT_PATH):
        return DEFAULT_TESSERACT_PATH

    return ""


# Below this many characters the text layer is unusable
MIN_TEXT_LENGTH = 30

# Below this many characters the text layer is probably missing
# image-only parts (logos, issuer names), so OCR is added on top.
HYBRID_TEXT_LENGTH = 500


# --------------------------------------------------
# Known certificate issuers: (display name, regex)
# --------------------------------------------------

ISSUER_PATTERNS = [
    ("NPTEL", r"nptel"),
    ("Udemy", r"udemy|ude\.my"),
    ("Coursera", r"coursera"),
    ("edX", r"(?<!\w)edx(?!\w)"),
    ("Udacity", r"udacity"),
    ("LinkedIn Learning", r"linkedin learning"),
    ("HackerRank", r"hackerrank"),
    ("Infosys Springboard", r"infosys springboard|springboard"),
    ("Great Learning", r"great learning|mygreatlearning"),
    ("Simplilearn", r"simplilearn"),
    ("freeCodeCamp", r"freecodecamp"),
    ("Kaggle", r"kaggle"),
    ("DeepLearning.AI", r"deeplearning\.ai"),
    ("AWS", r"(?<!\w)aws(?!\w)|amazon web services"),
    ("Google", r"(?<!\w)google(?!\w)"),
    ("Microsoft", r"(?<!\w)microsoft(?!\w)"),
    ("IBM", r"(?<!\w)ibm(?!\w)"),
    ("Oracle", r"(?<!\w)oracle(?!\w)"),
    ("Cisco", r"(?<!\w)cisco(?!\w)"),
]


# --------------------------------------------------
# PDF text extraction (text layer + OCR)
# --------------------------------------------------

def extract_text_pypdf(pdf_path: str) -> str:
    """
    Extracts text from the PDF's text layer.
    Returns an empty string for scanned/image-only PDFs.
    """

    reader = PdfReader(pdf_path)

    pages = []

    for page in reader.pages:
        text = page.extract_text()

        if text:
            pages.append(text)

    return "\n".join(pages)


def ocr_png_bytes(png_bytes: bytes, tesseract_path: str) -> str:
    """
    Runs the Tesseract executable directly on PNG image bytes
    (no pytesseract / pandas / Pillow needed).
    """

    try:
        result = subprocess.run(
            [tesseract_path, "stdin", "stdout", "-l", "eng"],
            input=png_bytes,
            capture_output=True,
            timeout=90
        )

    except subprocess.TimeoutExpired:
        raise ValueError("OCR timed out while reading the certificate.")

    except OSError as error:
        raise ValueError(
            f"Could not run Tesseract ({error}). "
            "Check the installation or the TESSERACT_CMD variable."
        )

    if result.returncode != 0:
        message = result.stderr.decode("utf-8", errors="ignore").strip()
        raise ValueError(f"Tesseract failed: {message[:200]}")

    output = result.stdout.decode("utf-8", errors="ignore")

    # Normalise Windows line endings
    return output.replace("\r\n", "\n").replace("\r", "\n")


def extract_text_ocr(
    pdf_path: str,
    dpi: int = 300,
    max_pages: int = 3
) -> str:
    """
    OCR for scanned or image-based PDFs.

    Each page is rendered to a PNG with PyMuPDF and
    passed to Tesseract.
    """

    tesseract_path = find_tesseract()

    if not tesseract_path:
        raise ValueError(
            "Tesseract OCR was not found. Install it or set the "
            "TESSERACT_CMD environment variable to tesseract.exe."
        )

    document = pymupdf.open(pdf_path)

    pages = []

    try:
        for index, page in enumerate(document):

            if index >= max_pages:
                break

            pixmap = page.get_pixmap(dpi=dpi)

            pages.append(
                ocr_png_bytes(
                    pixmap.tobytes("png"),
                    tesseract_path
                )
            )

    finally:
        document.close()

    return "\n".join(pages)


def merge_texts(primary: str, secondary: str) -> str:
    """
    Merges two extractions of the same document, keeping the
    order of the first and dropping duplicate lines.
    """

    seen = set()
    merged = []

    for line in (primary + "\n" + secondary).splitlines():

        key = " ".join(line.lower().split())

        if not key or key in seen:
            continue

        seen.add(key)
        merged.append(line.strip())

    return "\n".join(merged)


def extract_pdf_text(pdf_path: str) -> Tuple[str, str]:
    """
    Extracts text from a certificate PDF.

    1. Text layer long enough       -> "text"
    2. Text layer short             -> text layer + OCR merged -> "text+ocr"
       (OCR recovers logos / issuer names that are images)
    3. No usable text layer         -> OCR only -> "ocr"

    Returns:
        (text, method)
    """

    try:
        text = extract_text_pypdf(pdf_path)
    except Exception:
        text = ""

    text_length = len(text.strip())

    if text_length >= HYBRID_TEXT_LENGTH:
        return text, "text"

    try:
        ocr_text = extract_text_ocr(pdf_path)

    except ValueError:
        # OCR unavailable: use the text layer if it is usable
        if text_length >= MIN_TEXT_LENGTH:
            return text, "text"
        raise

    if text_length >= MIN_TEXT_LENGTH:
        return merge_texts(text, ocr_text), "text+ocr"

    return ocr_text, "ocr"


# --------------------------------------------------
# Text cleaning
# --------------------------------------------------

def clean_lines(text: str) -> List[str]:
    """
    Cleans extracted text into useful lines.
    """

    lines = []

    for line in text.splitlines():

        line = line.strip()

        if line and len(line) > 1:
            lines.append(line)

    return lines


# --------------------------------------------------
# Certificate name
# --------------------------------------------------

# Lines containing these are footer / verification text, not titles
BOILERPLATE_MARKERS = (
    "to verify",
    "verify at",
    "roll no",
    "no. of credits",
    "credits recommended",
    "certificate id",
    "certificate no",
    "certificate url",
    "credential id",
    "credential url",
    "reference number",
    "ude.my",
    "scan the",
    "issued on",
    "date of issue",
    "www.",
    "http",
)

# "(12 week course)" -> the course title follows on the next line
WEEK_COURSE_PATTERN = re.compile(
    r"\(\s*\d+\s*-?\s*week\s+course\s*\)",
    re.IGNORECASE
)

# "CERTIFICATE OF COMPLETION" heading -> the title follows (Udemy style)
HEADING_PATTERN = re.compile(
    r"^\W*certificate\s+of\s+\w+",
    re.IGNORECASE
)

# Lines that mean the title has ended (instructors, dates, ids, ...)
TITLE_STOP_PATTERN = re.compile(
    r"^\W*(instructors?|date|length|issued|presented|awarded|reference|"
    r"certificate\s+(no|number|url|id)|this\s+is\s+to\s+certify|"
    r"credential|signed|signature)\b",
    re.IGNORECASE
)

# A line that ends with "...successfully completed" -> title is next line
LEAD_IN_PATTERN = re.compile(
    r"(successfully\s+completed|has\s+completed|completion\s+of|"
    r"completed\s+the\s+course|completed\s+the\s+program)\s*:?\s*$",
    re.IGNORECASE
)

# "successfully completed <Title> ..." on a single line
INLINE_PATTERN = re.compile(
    r"(?:successfully\s+completed|has\s+completed|completion\s+of)\s+"
    r"(?:the\s+)?(?:online\s+)?(?:course\s+)?[\"â€œ']?"
    r"([A-Za-z0-9][^\"â€'\n]{3,120}?)[\"â€']?\s*"
    r"(?:$|\s+(?:course|offered|on|by|from)\b)",
    re.IGNORECASE
)


def is_boilerplate(line: str) -> bool:
    line_lower = line.lower()
    return any(marker in line_lower for marker in BOILERPLATE_MARKERS)


def detect_certificate_name(lines: List[str]) -> str:
    """
    Attempts to identify the certificate / course title.

    1. NPTEL style: title follows "(N week course)"
    2. Udemy style: title follows "Certificate of Completion"
    3. Lead-in line ("successfully completed") -> next line
    4. Inline "successfully completed <title>"
    5. Keyword line (certificate, course, ...) that is not footer text
    6. First non-footer line
    """

    # 1. NPTEL style
    for index, line in enumerate(lines):

        if WEEK_COURSE_PATTERN.search(line):

            for candidate in lines[index + 1:index + 3]:
                if not is_boilerplate(candidate):
                    return candidate[:200]

    # 2. Heading style: title (up to 3 wrapped lines) follows the heading
    for index, line in enumerate(lines):

        if HEADING_PATTERN.match(line):

            title_lines = []

            for candidate in lines[index + 1:index + 5]:

                if (
                    TITLE_STOP_PATTERN.match(candidate)
                    or is_boilerplate(candidate)
                ):
                    break

                title_lines.append(candidate)

                if len(title_lines) == 3:
                    break

            if title_lines:
                return " ".join(title_lines)[:200]

    # 3. Lead-in line followed by the title
    for index, line in enumerate(lines):

        if LEAD_IN_PATTERN.search(line):

            for candidate in lines[index + 1:index + 3]:
                if not is_boilerplate(candidate):
                    return candidate[:200]

    # 4. Inline title
    for line in lines:

        match = INLINE_PATTERN.search(line)

        if match:
            return match.group(1).strip()[:200]

    # 5. Keyword fallback, skipping footer text
    certificate_keywords = [
        "certificate",
        "certification",
        "course",
        "completion",
        "achievement"
    ]

    for line in lines:

        if is_boilerplate(line):
            continue

        line_lower = line.lower()

        if any(keyword in line_lower for keyword in certificate_keywords):
            return line[:200]

    # 6. First usable line
    for line in lines:

        if not is_boilerplate(line):
            return line[:200]

    return "Unknown Certificate"


# --------------------------------------------------
# Issuer
# --------------------------------------------------

def detect_issuer(
    lines: List[str],
    full_text: str = ""
) -> str:
    """
    Attempts to identify the organization that issued
    the certificate.

    1. Explicit phrases such as "issued by X"
    2. Known issuer names found anywhere in the text
       (also recognised from URLs and roll numbers,
       e.g. ude.my/... or NPTEL26CS55...)
    """

    explicit_patterns = [
        r"issued by\s*[:\-]?\s*(.+)",
        r"provided by\s*[:\-]?\s*(.+)",
        r"offered by\s*[:\-]?\s*(.+)",
        r"awarded by\s*[:\-]?\s*(.+)",
        r"certified by\s*[:\-]?\s*(.+)",
    ]

    for line in lines:

        for pattern in explicit_patterns:

            match = re.search(pattern, line, re.IGNORECASE)

            if match:
                return match.group(1).strip()[:150]

    search_text = (full_text or "\n".join(lines)).lower()

    for issuer_name, pattern in ISSUER_PATTERNS:

        if re.search(pattern, search_text):
            return issuer_name

    return "Unknown Issuer"


# --------------------------------------------------
# Career relevance
# --------------------------------------------------

def calculate_certificate_relevance(
    detected_skills: List[str],
    career_goal: str
):
    """
    Calculates how relevant the certificate is
    to the student's selected career goal.

    relevance = COVERAGE_WEIGHT * coverage + FOCUS_WEIGHT * focus

    coverage: required skills count for 70, important skills for 30
              (how much of the role the certificate covers)
    focus:    percentage of the certificate's detected skills that
              belong to the role (how on-topic the certificate is)
    """

    if career_goal not in ROLE_DATABASE:

        return {
            "relevance_score": 0,
            "matched_skills": []
        }

    role = ROLE_DATABASE[career_goal]

    required_skills = normalize_skills(
        role.get("required_skills", [])
    )

    important_skills = normalize_skills(
        role.get("important_skills", [])
    )

    detected = normalize_skills(detected_skills)

    student_skills = set(detected)

    matched_required = [
        skill
        for skill in required_skills
        if skill in student_skills
    ]

    matched_important = [
        skill
        for skill in important_skills
        if skill in student_skills
    ]

    # Coverage (0-100)
    if required_skills:
        required_score = (
            len(matched_required)
            / len(required_skills)
        ) * 70
    else:
        required_score = 0

    if important_skills:
        important_score = (
            len(matched_important)
            / len(important_skills)
        ) * 30
    else:
        important_score = 0

    coverage = required_score + important_score

    # Focus (0-100)
    role_skills = set(required_skills) | set(important_skills)

    relevant_detected = [
        skill
        for skill in detected
        if skill in role_skills
    ]

    if detected:
        focus = (len(relevant_detected) / len(detected)) * 100
    else:
        focus = 0

    relevance_score = (
        COVERAGE_WEIGHT * coverage
        + FOCUS_WEIGHT * focus
    )

    return {
        "relevance_score": round(relevance_score, 2),
        "matched_skills": matched_required + matched_important
    }


# --------------------------------------------------
# Main pipeline
# --------------------------------------------------

def analyze_certification(
    pdf_path: str,
    career_goal: str
):
    """
    Complete certification analysis pipeline.
    """

    if career_goal not in ROLE_DATABASE:
        raise ValueError(
            f"Unsupported career goal: {career_goal}"
        )

    # 1. Extract text (text layer, OCR, or both)
    text, extraction_method = extract_pdf_text(pdf_path)

    if not text.strip():
        raise ValueError(
            "Could not extract readable text "
            "from the certificate PDF."
        )

    # 2. Clean extracted text
    lines = clean_lines(text)

    # 3. Detect certificate information
    certificate_name = detect_certificate_name(lines)

    issuer = detect_issuer(lines, text)

    # 4. Extract skills
    detected_skills = extract_skills(text)

    detected_skills = normalize_skills(detected_skills)

    # 5. Calculate career relevance
    relevance = calculate_certificate_relevance(
        detected_skills,
        career_goal
    )

    # 6. Determine relevance category
    score = relevance["relevance_score"]

    if score >= 60:
        relevance_level = "High"
    elif score >= 30:
        relevance_level = "Medium"
    elif score > 0:
        relevance_level = "Low"
    else:
        relevance_level = "Not Relevant"

    # 7. Return analysis
    return {
        "certificate_name": certificate_name,
        "issuer": issuer,
        "career_goal": career_goal,
        "skills": detected_skills,
        "matched_skills": relevance["matched_skills"],
        "relevance_score": score,
        "relevance_level": relevance_level,
        "extraction_method": extraction_method,
        "evidence_text": text[:3000]
    }
