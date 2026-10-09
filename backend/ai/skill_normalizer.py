import json
from pathlib import Path


# Find the skills.json file
DATA_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "skills.json"
)


def load_skill_database():
    """
    Loads the skill knowledge base from skills.json.
    """

    with open(DATA_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


SKILL_DATABASE = load_skill_database()


def normalize_skill(skill: str) -> str:
    """
    Converts a skill name into its canonical name.

    Example:

    ML â†’ Machine Learning
    React.js â†’ React
    Postgres â†’ PostgreSQL
    """

    cleaned_skill = skill.strip().lower()

    for skill_data in SKILL_DATABASE.values():

        aliases = [
            alias.lower()
            for alias in skill_data["aliases"]
        ]

        if cleaned_skill in aliases:
            return skill_data["canonical"]

    # If the skill is unknown,
    # preserve the original formatting.
    return skill.strip()


def normalize_skills(skills: list[str]) -> list[str]:
    """
    Normalizes a list of skills and removes duplicates.
    """

    normalized = []

    for skill in skills:

        canonical_skill = normalize_skill(skill)

        if canonical_skill not in normalized:
            normalized.append(canonical_skill)

    return normalized
