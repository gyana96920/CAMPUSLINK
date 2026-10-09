import os
from functools import lru_cache
from typing import List

import numpy as np
from fastembed import TextEmbedding

from ai.skill_normalizer import normalize_skills


# Load the embedding model once when the application starts.
model = TextEmbedding(
    model_name="BAAI/bge-small-en-v1.5"
)

# Minimum cosine similarity for two different skills to count as a match.
# BGE embeddings give fairly high similarity even for unrelated short
# words, so this is higher than 0.65. Override with the
# SEMANTIC_THRESHOLD environment variable after testing.
SEMANTIC_THRESHOLD = float(
    os.getenv("SEMANTIC_THRESHOLD", "0.80")
)


@lru_cache(maxsize=4096)
def embed_skill(skill: str):
    """
    Embeds a single skill name (cached).
    """

    return np.array(
        next(iter(model.embed([skill])))
    )


def cosine_similarity(vector_a, vector_b) -> float:
    """
    Calculates cosine similarity between two vectors.
    """

    a = np.array(vector_a)
    b = np.array(vector_b)

    denominator = (
        np.linalg.norm(a) * np.linalg.norm(b)
    )

    if denominator == 0:
        return 0.0

    return float(
        np.dot(a, b) / denominator
    )


def match_skills(
    student_skills: List[str],
    required_skills: List[str]
):
    """
    Matches student skills against required job skills
    using:

    1. Skill normalization
    2. Exact matching
    3. Semantic matching
    """

    if not required_skills:

        return {
            "match_score": 0,
            "matched_skills": [],
            "missing_skills": []
        }

    # STEP 1: Normalize skills
    normalized_student_skills = normalize_skills(
        student_skills
    )

    normalized_required_skills = normalize_skills(
        required_skills
    )

    # STEP 2: Exact matching
    student_skill_set = set(
        normalized_student_skills
    )

    matched_skills = []
    missing_skills = []

    for required_skill in normalized_required_skills:

        if required_skill in student_skill_set:
            matched_skills.append(required_skill)
        else:
            missing_skills.append(required_skill)

    # STEP 3: Semantic matching
    if missing_skills and normalized_student_skills:

        student_embeddings = [
            embed_skill(skill)
            for skill in normalized_student_skills
        ]

        semantically_matched = []
        still_missing = []

        for required_skill in missing_skills:

            required_embedding = embed_skill(required_skill)

            best_similarity = max(
                cosine_similarity(
                    required_embedding,
                    student_embedding
                )
                for student_embedding in student_embeddings
            )

            if best_similarity >= SEMANTIC_THRESHOLD:
                semantically_matched.append(required_skill)
            else:
                still_missing.append(required_skill)

        matched_skills.extend(semantically_matched)

        missing_skills = still_missing

    # STEP 4: Calculate score
    score = (
        len(matched_skills)
        / len(normalized_required_skills)
    ) * 100

    return {
        "match_score": round(score, 2),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    }
