import re
from typing import Dict, List, Optional, Tuple

from ai.certification_analyzer import analyze_certification
from ai.profile_analyzer import analyze_profile
from ai.role_database import ROLE_DATABASE


def classify_certificate(certificate_name: str, text: str) -> str:
    """
    Classifies a certificate as "hackathon", "internship" or
    "course" from its wording.
    """

    haystack = f"{certificate_name} {text}".lower()

    if "hackathon" in haystack:
        return "hackathon"

    if re.search(r"\binternship\b|\bintern\b", haystack):
        return "internship"

    return "course"


def analyze_student(
    career_goal: str,
    certificate_files: List[Tuple[str, str]],
    github_url: Optional[str] = None,
    leetcode_username: Optional[str] = None,
    leetcode_manual_stats: Optional[Dict[str, int]] = None,
    project_count: int = 0,
    course_count: int = 0,
    hackathon_count: int = 0,
    internship_count: int = 0
):
    """
    One-shot student analysis.

    certificate_files: list of (original filename, path on disk).
    Everything is extracted from the student's profile data:
    certificates (skills, scores, type), GitHub and LeetCode.
    """

    if career_goal not in ROLE_DATABASE:
        raise ValueError(
            f"Unsupported career goal: {career_goal}"
        )

    certificates = []
    certificate_skills = []
    course_scores = []
    warnings = []

    detected = {
        "course": 0,
        "hackathon": 0,
        "internship": 0
    }

    for filename, path in certificate_files:

        try:
            result = analyze_certification(path, career_goal)

        except ValueError as error:
            warnings.append(f"Certificate '{filename}': {error}")
            continue

        kind = classify_certificate(
            result["certificate_name"],
            result["evidence_text"]
        )

        detected[kind] += 1

        certificate_skills.extend(result["skills"])

        # Only course certificates count toward the certification score
        if kind == "course":
            course_scores.append(result["relevance_score"])

        certificates.append(
            {
                "filename": filename,
                "certificate_name": result["certificate_name"],
                "issuer": result["issuer"],
                "certificate_type": kind,
                "skills": result["skills"],
                "relevance_score": result["relevance_score"],
                "relevance_level": result["relevance_level"],
                "extraction_method": result["extraction_method"]
            }
        )

    profile = analyze_profile(
        career_goal=career_goal,
        github_url=github_url,
        leetcode_username=leetcode_username,
        leetcode_manual_stats=leetcode_manual_stats,
        certification_skills=certificate_skills,
        certification_scores=course_scores,
        manual_skills=[],
        project_count=project_count,
        course_count=max(course_count, detected["course"]),
        hackathon_count=max(hackathon_count, detected["hackathon"]),
        internship_count=max(internship_count, detected["internship"])
    )

    github_summary = profile.get("github_summary") or {}

    profile["certificates"] = certificates

    profile["detected_activity"] = {
        "courses": detected["course"],
        "hackathons": detected["hackathon"],
        "internships": detected["internship"],
        "github_projects": github_summary.get(
            "repositories_analyzed", 0
        )
    }

    profile["warnings"] = warnings + profile["warnings"]

    return profile
