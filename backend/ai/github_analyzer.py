import base64
import os
import re
import time
from datetime import datetime, timedelta, timezone
from typing import List

import requests

from ai.role_database import ROLE_DATABASE
from ai.skill_extractor import extract_skills
from ai.skill_normalizer import (
    SKILL_DATABASE,
    normalize_skill,
    normalize_skills
)


GITHUB_API = "https://api.github.com"

# Cache GitHub responses for 10 minutes (protects the rate limit)
CACHE_TTL_SECONDS = 600
_CACHE = {}
_README_CACHE = {}

KNOWN_SKILLS = {
    data["canonical"]
    for data in SKILL_DATABASE.values()
}


# --------------------------------------------------
# GitHub username extraction
# --------------------------------------------------

def extract_username(github_url: str) -> str:

    github_url = github_url.strip().rstrip("/")

    pattern = (
        r"https?://"
        r"(?:www\.)?"
        r"github\.com/"
        r"([^/]+)"
    )

    match = re.match(pattern, github_url)

    if not match:
        raise ValueError(
            "Invalid GitHub URL. Please provide a URL like "
            "https://github.com/username"
        )

    username = match.group(1)

    if username in ["login", "signup", "settings", "explore"]:
        raise ValueError("Invalid GitHub profile URL.")

    return username


# --------------------------------------------------
# GitHub API request (token + cache)
# --------------------------------------------------

def github_request(url: str):

    cached = _CACHE.get(url)

    if cached and time.time() - cached[0] < CACHE_TTL_SECONDS:
        return cached[1]

    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "CAMPUSLINK-AI"
    }

    token = os.getenv("GITHUB_TOKEN")

    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        response = requests.get(url, headers=headers, timeout=10)

    except requests.RequestException:
        raise ValueError(
            "Could not reach GitHub. Check the internet connection."
        )

    if response.status_code == 404:
        raise ValueError(
            "GitHub user or repository was not found."
        )

    if response.status_code == 401:
        raise ValueError(
            "The GITHUB_TOKEN is invalid or expired."
        )

    if response.status_code == 403:
        raise ValueError(
            "GitHub API rate limit reached. Set a GITHUB_TOKEN "
            "or try again later."
        )

    response.raise_for_status()

    data = response.json()

    _CACHE[url] = (time.time(), data)

    return data


# --------------------------------------------------
# README extraction
# --------------------------------------------------

def get_readme(owner: str, repository: str) -> str:

    url = f"{GITHUB_API}/repos/{owner}/{repository}/readme"

    cached = _README_CACHE.get(url)

    if cached and time.time() - cached[0] < CACHE_TTL_SECONDS:
        return cached[1]

    try:
        data = github_request(url)

        if "content" in data:
            content = base64.b64decode(
                data["content"]
            ).decode("utf-8", errors="ignore")
        else:
            content = ""

    except Exception:
        content = ""

    _README_CACHE[url] = (time.time(), content)

    return content


# --------------------------------------------------
# Helpers
# --------------------------------------------------

def is_recent(updated_at: str, days: int = 365) -> bool:

    try:
        updated = datetime.fromisoformat(
            updated_at.replace("Z", "+00:00")
        )
    except ValueError:
        return False

    return (
        datetime.now(timezone.utc) - updated
        <= timedelta(days=days)
    )


# --------------------------------------------------
# Practical GitHub score
# --------------------------------------------------

def calculate_practical_score(
    repository_count: int,
    skill_count: int,
    active_repositories: int
) -> float:

    repository_component = min(repository_count / 10, 1) * 40

    skill_component = min(skill_count / 10, 1) * 40

    activity_component = min(active_repositories / 5, 1) * 20

    score = (
        repository_component
        + skill_component
        + activity_component
    )

    return round(min(score, 100), 2)


# --------------------------------------------------
# Role relevance score
# --------------------------------------------------

def calculate_role_match(
    detected_skills: List[str],
    career_goal: str
):

    if career_goal not in ROLE_DATABASE:

        return {
            "role_match_score": 0,
            "relevant_skills": [],
            "skill_gaps": []
        }

    role = ROLE_DATABASE[career_goal]

    required_skills = normalize_skills(role["required_skills"])

    important_skills = normalize_skills(
        role.get("important_skills", [])
    )

    student_skills = set(normalize_skills(detected_skills))

    matched_required = [
        skill for skill in required_skills
        if skill in student_skills
    ]

    matched_important = [
        skill for skill in important_skills
        if skill in student_skills
    ]

    missing_required = [
        skill for skill in required_skills
        if skill not in student_skills
    ]

    if required_skills:
        required_score = (
            len(matched_required) / len(required_skills)
        ) * 70
    else:
        required_score = 0

    if important_skills:
        important_score = (
            len(matched_important) / len(important_skills)
        ) * 30
    else:
        important_score = 0

    return {
        "role_match_score": round(
            required_score + important_score, 2
        ),
        "relevant_skills": matched_required + matched_important,
        "skill_gaps": missing_required
    }


# --------------------------------------------------
# Main GitHub analyzer
# --------------------------------------------------

def analyze_github(github_url: str, career_goal: str):

    username = extract_username(github_url)

    if career_goal not in ROLE_DATABASE:
        raise ValueError(
            f"Unsupported career goal: {career_goal}"
        )

    profile = github_request(
        f"{GITHUB_API}/users/{username}"
    )

    all_repositories = github_request(
        f"{GITHUB_API}/users/{username}/repos"
        "?per_page=100&sort=updated"
    )

    # Forks are not the student's own work
    repositories = [
        repository for repository in all_repositories
        if not repository.get("fork")
    ][:10]

    detected_skills = set()

    repository_evidence = []

    active_repositories = 0

    for repository in repositories:

        repo_name = repository.get("name", "")

        description = repository.get("description", "") or ""

        language = repository.get("language", "") or ""

        topics = repository.get("topics", []) or []

        stars = repository.get("stargazers_count", 0)

        updated_at = repository.get("updated_at", "") or ""

        # The main language is evidence (recognised skills only)
        if language:

            canonical = normalize_skill(language)

            if canonical in KNOWN_SKILLS:
                detected_skills.add(canonical)

        repository_text = " ".join(
            [repo_name, description, " ".join(topics)]
        )

        for skill in extract_skills(repository_text):
            detected_skills.add(skill)

        readme = get_readme(username, repo_name)

        if readme:
            for skill in extract_skills(readme[:15000]):
                detected_skills.add(skill)

        if is_recent(updated_at):
            active_repositories += 1

        repository_evidence.append(
            {
                "name": repo_name,
                "description": description,
                "language": language,
                "topics": topics,
                "stars": stars,
                "updated_at": updated_at
            }
        )

    practical_score = calculate_practical_score(
        repository_count=len(repositories),
        skill_count=len(detected_skills),
        active_repositories=active_repositories
    )

    role_analysis = calculate_role_match(
        detected_skills=list(detected_skills),
        career_goal=career_goal
    )

    github_score = (
        practical_score * 0.40
        + role_analysis["role_match_score"] * 0.60
    )

    return {
        "username": profile.get("login", username),
        "name": profile.get("name"),
        "career_goal": career_goal,
        "public_repositories": profile.get("public_repos", 0),
        "repositories_analyzed": len(repositories),
        "skills": sorted(detected_skills),
        "relevant_skills": sorted(role_analysis["relevant_skills"]),
        "skill_gaps": sorted(role_analysis["skill_gaps"]),
        "projects": len(repositories),
        "practical_score": practical_score,
        "role_match_score": role_analysis["role_match_score"],
        "github_score": round(github_score, 2),
        "repository_evidence": repository_evidence
    }
