import re
from typing import List

from ai.skill_normalizer import SKILL_DATABASE


def extract_skills(text: str) -> List[str]:
    """
    Extract known skills from text using the skill knowledge base.

    Uses word-boundary matching to reduce false positives.
    """

    if not text:
        return []

    text_lower = text.lower()

    detected_skills = []

    for skill_data in SKILL_DATABASE.values():

        canonical_skill = skill_data["canonical"]

        for alias in skill_data["aliases"]:

            alias_lower = alias.lower()

            pattern = r"(?<!\w)" + re.escape(alias_lower) + r"(?!\w)"

            if re.search(pattern, text_lower):

                if canonical_skill not in detected_skills:
                    detected_skills.append(canonical_skill)

                break

    return detected_skills
