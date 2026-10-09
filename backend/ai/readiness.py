def calculate_readiness(
    skill_match_score: float,
    project_score: float,
    certification_score: float,
    course_score: float,
    hackathon_score: float,
    experience_score: float,
    github_score: float
):
    """
    Calculates the overall student career readiness score.

    Weight distribution:
    Skill Match       = 40%
    Projects          = 15%
    Certifications   = 10%
    Courses           = 10%
    Hackathons        = 10%
    Experience        = 10%
    GitHub Activity   = 5%
    """

    readiness_score = (
        skill_match_score * 0.40
        + project_score * 0.15
        + certification_score * 0.10
        + course_score * 0.10
        + hackathon_score * 0.10
        + experience_score * 0.10
        + github_score * 0.05
    )

    return round(readiness_score, 2)
