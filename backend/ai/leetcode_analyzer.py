import re
from typing import Dict, Optional

import requests


LEETCODE_GRAPHQL = "https://leetcode.com/graphql"

PROFILE_QUERY = """
query userProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile { ranking }
    submitStatsGlobal {
      acSubmissionNum { difficulty count }
    }
    tagProblemCounts {
      advanced { tagName problemsSolved }
      intermediate { tagName problemsSolved }
      fundamental { tagName problemsSolved }
    }
  }
  userContestRanking(username: $username) {
    attendedContestsCount
    rating
  }
}
"""

HEADERS = {
    "Content-Type": "application/json",
    "Referer": "https://leetcode.com",
    "User-Agent": "Mozilla/5.0 (CAMPUSLINK-AI)"
}

# Problems solved before DSA skills are credited
MIN_PROBLEMS_FOR_DSA = 30

# "Database" tagged problems solved before SQL is credited
MIN_DATABASE_PROBLEMS_FOR_SQL = 5

# Weighted points (easy=1, medium=3, hard=5) that earn a score of 100
SCORE_TARGET_POINTS = 400

RESERVED_PATHS = {
    "problems", "contest", "explore", "discuss",
    "u", "accounts", "study-plan", "problemset"
}


def extract_leetcode_username(value: str) -> str:
    """
    Accepts a plain username or a profile URL such as
    https://leetcode.com/u/username/
    """

    value = value.strip().rstrip("/")

    match = re.search(
        r"leetcode\.com/(?:u/)?([A-Za-z0-9_\-]+)",
        value
    )

    if match:
        username = match.group(1)

    elif re.fullmatch(r"[A-Za-z0-9_\-]+", value):
        username = value

    else:
        raise ValueError(
            "Invalid LeetCode username or profile URL."
        )

    if username.lower() in RESERVED_PATHS:
        raise ValueError(
            "Invalid LeetCode profile URL."
        )

    return username


def calculate_problem_solving_score(
    easy: int,
    medium: int,
    hard: int
) -> float:

    points = easy + 3 * medium + 5 * hard

    return round(
        min(points / SCORE_TARGET_POINTS, 1) * 100,
        2
    )


def infer_skills(
    total_solved: int,
    database_solved: int
):

    skills = []

    if total_solved >= MIN_PROBLEMS_FOR_DSA:
        skills.extend(["Data Structures", "Algorithms"])

    if database_solved >= MIN_DATABASE_PROBLEMS_FOR_SQL:
        skills.append("SQL")

    return skills


def analyze_leetcode_stats(
    easy: int,
    medium: int,
    hard: int,
    username: str = "manual",
    database_solved: int = 0,
    ranking: Optional[int] = None,
    contests_attended: int = 0,
    topics: Optional[Dict[str, int]] = None
):
    """
    Builds the analysis from solved counts. Used for live data
    and for manually entered counts.
    """

    easy = max(int(easy), 0)
    medium = max(int(medium), 0)
    hard = max(int(hard), 0)

    total_solved = easy + medium + hard

    topics = topics or {}

    top_topics = [
        {"topic": name, "solved": solved}
        for name, solved in sorted(
            topics.items(),
            key=lambda item: item[1],
            reverse=True
        )[:5]
        if solved > 0
    ]

    return {
        "username": username,
        "total_solved": total_solved,
        "easy_solved": easy,
        "medium_solved": medium,
        "hard_solved": hard,
        "ranking": ranking,
        "contests_attended": contests_attended,
        "top_topics": top_topics,
        "skills": infer_skills(total_solved, database_solved),
        "problem_solving_score": calculate_problem_solving_score(
            easy, medium, hard
        )
    }


def analyze_leetcode(username_or_url: str):
    """
    Fetches a public LeetCode profile and analyses it.
    """

    username = extract_leetcode_username(username_or_url)

    try:
        response = requests.post(
            LEETCODE_GRAPHQL,
            json={
                "query": PROFILE_QUERY,
                "variables": {"username": username}
            },
            headers=HEADERS,
            timeout=15
        )

    except requests.RequestException:
        raise ValueError(
            "Could not reach LeetCode. Check the internet "
            "connection or enter solved counts manually."
        )

    if response.status_code != 200:
        raise ValueError(
            f"LeetCode returned status {response.status_code}. "
            "Enter solved counts manually instead."
        )

    try:
        payload = response.json()
    except ValueError:
        raise ValueError(
            "LeetCode returned an unreadable response."
        )

    data = (payload or {}).get("data") or {}

    user = data.get("matchedUser")

    if not user:
        raise ValueError(
            f"LeetCode user '{username}' was not found."
        )

    counts = {
        item.get("difficulty"): item.get("count", 0)
        for item in (
            (user.get("submitStatsGlobal") or {})
            .get("acSubmissionNum", [])
        )
    }

    topics = {}

    tag_counts = user.get("tagProblemCounts") or {}

    for level in ("advanced", "intermediate", "fundamental"):

        for item in tag_counts.get(level) or []:

            name = item.get("tagName")

            if name:
                topics[name] = item.get("problemsSolved", 0)

    contest = data.get("userContestRanking") or {}

    return analyze_leetcode_stats(
        easy=counts.get("Easy", 0),
        medium=counts.get("Medium", 0),
        hard=counts.get("Hard", 0),
        username=user.get("username", username),
        database_solved=topics.get("Database", 0),
        ranking=(user.get("profile") or {}).get("ranking"),
        contests_attended=contest.get("attendedContestsCount") or 0,
        topics=topics
    )
