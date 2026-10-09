from typing import Dict, List, Optional

from ai.github_analyzer import analyze_github
from ai.leetcode_analyzer import (
    analyze_leetcode,
    analyze_leetcode_stats
)
from ai.readiness import calculate_readiness
from ai.role_database import ROLE_DATABASE
from ai.skill_fit import compute_skill_fit
from ai.skill_normalizer import normalize_skill


# --------------------------------------------------
# Helpers
# --------------------------------------------------

def add_skills(skill_sources: Dict[str, List[str]], skills, source: str):
    """
    Records each skill together with where it came from.
    """

    for skill in skills:

        canonical = normalize_skill(skill)

        if not canonical:
            continue

        sources = skill_sources.setdefault(canonical, [])

        if source not in sources:
            sources.append(source)


def count_score(count: int, target: int) -> float:
    """
    Converts a count to 0-100, reaching 100 at `target`.
    """

    return round(min(max(count, 0) / target, 1) * 100, 2)


def calculate_certification_score(scores: List[float]) -> float:
    """
    Average of the best 3 certificate relevance scores,
    scaled down when fewer than 3 certificates exist.
    """

    if not scores:
        return 0.0

    top = sorted(scores, reverse=True)[:3]

    average = sum(top) / len(top)

    return round(average * min(len(scores), 3) / 3, 2)


def readiness_level(score: float) -> str:

    if score >= 75:
        return "Placement Ready"

    if score >= 55:
        return "Almost Ready"

    if score >= 35:
        return "Developing"

    return "Early Stage"


# --------------------------------------------------
# Main profile analysis
# --------------------------------------------------

def analyze_profile(
    career_goal: str,
    github_url: Optional[str] = None,
    leetcode_username: Optional[str] = None,
    leetcode_manual_stats: Optional[Dict[str, int]] = None,
    certification_skills: Optional[List[str]] = None,
    certification_scores: Optional[List[float]] = None,
    manual_skills: Optional[List[str]] = None,
    project_count: int = 0,
    course_count: int = 0,
    hackathon_count: int = 0,
    internship_count: int = 0
):

    if career_goal not in ROLE_DATABASE:
        raise ValueError(
            f"Unsupported career goal: {career_goal}"
        )

    role = ROLE_DATABASE[career_goal]

    certification_skills = certification_skills or []
    certification_scores = certification_scores or []
    manual_skills = manual_skills or []

    skill_sources: Dict[str, List[str]] = {}
    warnings: List[str] = []

    # ------------------------------------------
    # 1. GitHub
    # ------------------------------------------

    github_result = None

    if github_url:

        try:
            github_result = analyze_github(github_url, career_goal)

            add_skills(
                skill_sources,
                github_result["skills"],
                "GitHub"
            )

        except ValueError as error:
            warnings.append(f"GitHub: {error}")

        except Exception:
            warnings.append(
                "GitHub: could not be analysed right now."
            )

    # ------------------------------------------
    # 2. LeetCode (live, with manual fallback)
    # ------------------------------------------

    leetcode_result = None
    leetcode_source = None

    if leetcode_username:

        try:
            leetcode_result = analyze_leetcode(leetcode_username)
            leetcode_source = "live"

        except ValueError as error:
            warnings.append(f"LeetCode: {error}")

        except Exception:
            warnings.append(
                "LeetCode: could not be reached right now."
            )

    if leetcode_result is None and leetcode_manual_stats:

        leetcode_result = analyze_leetcode_stats(
            easy=leetcode_manual_stats.get("easy", 0),
            medium=leetcode_manual_stats.get("medium", 0),
            hard=leetcode_manual_stats.get("hard", 0)
        )

        leetcode_source = "manual"

    if leetcode_result:
        add_skills(
            skill_sources,
            leetcode_result["skills"],
            "LeetCode"
        )

    # ------------------------------------------
    # 3. Certificates and self-declared skills
    # ------------------------------------------

    add_skills(skill_sources, certification_skills, "Certification")

    add_skills(skill_sources, manual_skills, "Self-declared")

    all_skills = list(skill_sources.keys())

    # ------------------------------------------
    # 4. Skill gap analysis
    # ------------------------------------------

    fit = compute_skill_fit(
        all_skills,
        role["required_skills"],
        role.get("important_skills", [])
    )

    # ------------------------------------------
    # 5. Component scores
    # ------------------------------------------

    coding_scores = []

    if github_result:
        coding_scores.append(github_result["github_score"])

    if leetcode_result:
        coding_scores.append(leetcode_result["problem_solving_score"])

    coding_activity_score = (
        round(sum(coding_scores) / len(coding_scores), 2)
        if coding_scores else 0.0
    )

    github_projects = (
        github_result["projects"] if github_result else 0
    )

    project_score = count_score(
        max(project_count, github_projects), 5
    )

    certification_score = calculate_certification_score(
        certification_scores
    )

    course_score = count_score(course_count, 5)

    hackathon_score = count_score(hackathon_count, 3)

    experience_score = count_score(internship_count, 2)

    skill_match_score = fit["skill_match_score"]

    readiness_score = calculate_readiness(
        skill_match_score=skill_match_score,
        project_score=project_score,
        certification_score=certification_score,
        course_score=course_score,
        hackathon_score=hackathon_score,
        experience_score=experience_score,
        github_score=coding_activity_score
    )

    # ------------------------------------------
    # 6. Explainable breakdown
    # ------------------------------------------

    components = [
        ("Skill match", skill_match_score, 0.40),
        ("Projects", project_score, 0.15),
        ("Certifications", certification_score, 0.10),
        ("Courses", course_score, 0.10),
        ("Hackathons", hackathon_score, 0.10),
        ("Experience", experience_score, 0.10),
        ("Coding profiles (GitHub / LeetCode)",
         coding_activity_score, 0.05),
    ]

    score_breakdown = [
        {
            "component": name,
            "score": score,
            "weight": weight,
            "contribution": round(score * weight, 2)
        }
        for name, score, weight in components
    ]

    # ------------------------------------------
    # 7. Recommendations
    # ------------------------------------------

    recommendations = []

    for skill in fit["missing_required"][:5]:
        recommendations.append(
            f"Learn {skill}: it is a required skill for "
            f"{career_goal}."
        )

    for skill in fit["missing_important"][:2]:
        recommendations.append(
            f"Add {skill} to stand out for {career_goal}."
        )

    if not github_result:
        recommendations.append(
            "Link a GitHub profile with projects so your "
            "practical work can be verified."
        )

    if not leetcode_result:
        recommendations.append(
            "Add your LeetCode profile to show "
            "problem-solving practice."
        )

    if not certification_scores:
        recommendations.append(
            "Add a certification relevant to "
            f"{career_goal}."
        )

    if hackathon_count == 0:
        recommendations.append(
            "Participate in a hackathon to show teamwork "
            "and delivery."
        )

    # ------------------------------------------
    # 8. Result
    # ------------------------------------------

    github_summary = None

    if github_result:
        github_summary = {
            "username": github_result["username"],
            "public_repositories": github_result["public_repositories"],
            "repositories_analyzed": github_result["repositories_analyzed"],
            "practical_score": github_result["practical_score"],
            "role_match_score": github_result["role_match_score"],
            "github_score": github_result["github_score"]
        }

    leetcode_summary = None

    if leetcode_result:
        leetcode_summary = {
            "username": leetcode_result["username"],
            "source": leetcode_source,
            "total_solved": leetcode_result["total_solved"],
            "easy_solved": leetcode_result["easy_solved"],
            "medium_solved": leetcode_result["medium_solved"],
            "hard_solved": leetcode_result["hard_solved"],
            "problem_solving_score": leetcode_result["problem_solving_score"]
        }

    return {
        "career_goal": career_goal,
        "readiness_score": readiness_score,
        "readiness_level": readiness_level(readiness_score),
        "skill_match_score": skill_match_score,
        "required_skill_match_score": fit["required_match_score"],
        "important_skill_match_score": fit["important_match_score"],
        "skills": sorted(all_skills),
        "skill_sources": skill_sources,
        "matched_required": fit["matched_required"],
        "missing_required": fit["missing_required"],
        "matched_important": fit["matched_important"],
        "missing_important": fit["missing_important"],
        "score_breakdown": score_breakdown,
        "recommendations": recommendations,
        "github_summary": github_summary,
        "leetcode_summary": leetcode_summary,
        "warnings": warnings
    }
