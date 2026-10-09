from typing import List

from ai.skill_matcher import match_skills
from ai.skill_normalizer import normalize_skills


# Required skills count for 70%, important skills for 30%
REQUIRED_WEIGHT = 0.7
IMPORTANT_WEIGHT = 0.3


def compute_skill_fit(
    student_skills: List[str],
    required_skills: List[str],
    important_skills: List[str]
):
    """
    Shared skill-fit calculation used by both the student
    profile analysis and the recruiter candidate ranking.
    """

    required = normalize_skills(required_skills)
    important = normalize_skills(important_skills)

    required_result = match_skills(student_skills, required)
    important_result = match_skills(student_skills, important)

    if required and important:
        score = (
            REQUIRED_WEIGHT * required_result["match_score"]
            + IMPORTANT_WEIGHT * important_result["match_score"]
        )
    elif required:
        score = required_result["match_score"]
    elif important:
        score = important_result["match_score"]
    else:
        score = 0

    return {
        "skill_match_score": round(score, 2),
        "required_match_score": required_result["match_score"],
        "important_match_score": important_result["match_score"],
        "matched_required": required_result["matched_skills"],
        "missing_required": required_result["missing_skills"],
        "matched_important": important_result["matched_skills"],
        "missing_important": important_result["missing_skills"],
        "required_skills": required,
        "important_skills": important
    }
