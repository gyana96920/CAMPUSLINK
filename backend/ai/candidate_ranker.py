from typing import Dict, List, Optional

from ai.role_database import ROLE_DATABASE
from ai.skill_fit import compute_skill_fit


# fit_score = SKILL_WEIGHT * skill match + READINESS_WEIGHT * readiness
SKILL_WEIGHT = 0.65
READINESS_WEIGHT = 0.35


def verdict_for(score: float) -> str:

    if score >= 75:
        return "Strong match"

    if score >= 55:
        return "Good match"

    if score >= 35:
        return "Partial match"

    return "Weak match"


def build_explanation(
    fit: Dict,
    readiness: float
) -> str:

    parts = []

    required_total = len(fit["required_skills"])

    if required_total:

        text = (
            f"Matches {len(fit['matched_required'])}/"
            f"{required_total} required skills"
        )

        if fit["matched_required"]:
            text += f" ({', '.join(fit['matched_required'][:5])})"

        parts.append(text)

    if fit["missing_required"]:
        parts.append(
            "missing " + ", ".join(fit["missing_required"][:4])
        )

    important_total = len(fit["important_skills"])

    if important_total:
        parts.append(
            f"{len(fit['matched_important'])}/{important_total} "
            "preferred skills"
        )

    parts.append(f"readiness {round(readiness)}/100")

    return "; ".join(parts) + "."


def rank_candidates(
    candidates: List[Dict],
    role: Optional[str] = None,
    required_skills: Optional[List[str]] = None,
    important_skills: Optional[List[str]] = None,
    min_readiness: float = 0.0,
    min_cgpa: Optional[float] = None,
    top_k: int = 10
):
    """
    Ranks students for a job with explainable fit scores.

    The job is either a known role (from roles.json) or a
    custom list of required / important skills.
    """

    required = list(required_skills or [])
    important = list(important_skills or [])

    if role:

        if role not in ROLE_DATABASE:
            raise ValueError(f"Unsupported role: {role}")

        if not required:
            required = list(ROLE_DATABASE[role]["required_skills"])

        if not important:
            important = list(
                ROLE_DATABASE[role].get("important_skills", [])
            )

    if not required and not important:
        raise ValueError(
            "Provide a role or at least one required skill."
        )

    ranked = []
    excluded = []
    job_summary = None

    for candidate in candidates:

        readiness = float(candidate.get("readiness_score") or 0)

        cgpa = candidate.get("cgpa")

        reasons = []

        if readiness < min_readiness:
            reasons.append(
                f"Readiness {round(readiness)} is below the "
                f"minimum {round(min_readiness)}"
            )

        if min_cgpa is not None:

            if cgpa is None:
                reasons.append("CGPA not provided")

            elif cgpa < min_cgpa:
                reasons.append(
                    f"CGPA {cgpa} is below the minimum {min_cgpa}"
                )

        if reasons:
            excluded.append(
                {
                    "student_id": candidate["student_id"],
                    "name": candidate["name"],
                    "reason": "; ".join(reasons)
                }
            )
            continue

        fit = compute_skill_fit(
            candidate.get("skills", []),
            required,
            important
        )

        job_summary = {
            "role": role,
            "required_skills": fit["required_skills"],
            "important_skills": fit["important_skills"]
        }

        clamped_readiness = max(0.0, min(readiness, 100.0))

        fit_score = round(
            SKILL_WEIGHT * fit["skill_match_score"]
            + READINESS_WEIGHT * clamped_readiness,
            2
        )

        ranked.append(
            {
                "student_id": candidate["student_id"],
                "name": candidate["name"],
                "branch": candidate.get("branch"),
                "cgpa": cgpa,
                "fit_score": fit_score,
                "skill_match_score": fit["skill_match_score"],
                "readiness_score": round(readiness, 2),
                "verdict": verdict_for(fit_score),
                "matched_required": fit["matched_required"],
                "missing_required": fit["missing_required"],
                "matched_important": fit["matched_important"],
                "missing_important": fit["missing_important"],
                "explanation": build_explanation(fit, readiness)
            }
        )

    ranked.sort(
        key=lambda item: (
            -item["fit_score"],
            -item["readiness_score"]
        )
    )

    for position, item in enumerate(ranked, start=1):
        item["rank"] = position

    if job_summary is None:
        job_summary = {
            "role": role,
            "required_skills": required,
            "important_skills": important
        }

    return {
        "job": job_summary,
        "total_candidates": len(candidates),
        "eligible_candidates": len(ranked),
        "shortlisted": ranked[:max(top_k, 1)],
        "excluded": excluded
    }
