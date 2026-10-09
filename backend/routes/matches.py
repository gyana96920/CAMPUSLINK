
from fastapi import APIRouter, HTTPException
from database import supabase

router = APIRouter(tags=["AI Matching"])


def calculate_readiness(student):
    cgpa_score = (float(student.get("cgpa") or 0) / 10) * 20
    skills_score = min(len(student.get("skills") or []) / 5, 1) * 25
    projects_score = min(student.get("projects") or 0, 4) / 4 * 15
    cert_score = min(student.get("certifications") or 0, 3) / 3 * 10
    aptitude_score = (student.get("aptitude_score") or 0) * 0.15
    interview_score = (student.get("interview_score") or 0) * 0.15

    score = round(
        cgpa_score + skills_score + projects_score
        + cert_score + aptitude_score + interview_score
    )

    if score >= 80:
        level = "Highly Employable"
    elif score >= 65:
        level = "Ready"
    elif score >= 45:
        level = "Developing"
    else:
        level = "Not Ready"

    return {"score": score, "level": level}


def calculate_match(student, job):
    student_skills = {
        skill.strip().lower()
        for skill in (student.get("skills") or [])
    }
    required_skills = {
        skill.strip().lower()
        for skill in (job.get("required_skills") or [])
    }

    matched = sorted(student_skills & required_skills)
    gaps = sorted(required_skills - student_skills)

    skill_score = (
        len(matched) / len(required_skills) * 70
        if required_skills else 70
    )

    cgpa_ok = float(student.get("cgpa") or 0) >= float(job.get("min_cgpa") or 0)
    eligibility_score = 30 if cgpa_ok else 0
    score = round(skill_score + eligibility_score)

    explanation = []
    explanation.append(
        "CGPA requirement satisfied" if cgpa_ok
        else "CGPA is below the job requirement"
    )
    explanation.append(
        f"{len(matched)} of {len(required_skills)} required skills matched"
    )
    if gaps:
        explanation.append("Missing skills: " + ", ".join(gaps))

    return {
        "match_score": score,
        "status": "Eligible" if cgpa_ok else "Not Eligible",
        "matched_skills": matched,
        "skill_gaps": gaps,
        "explanation": explanation
    }


@router.post("/readiness/{student_id}")
def get_readiness(student_id: int):
    result = (
        supabase.table("students")
        .select("*")
        .eq("id", student_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Student not found")

    student = result.data[0]
    readiness = calculate_readiness(student)

    supabase.table("students").update({
        "readiness_score": readiness["score"],
        "readiness_level": readiness["level"]
    }).eq("id", student_id).execute()

    return {
        "student_id": student_id,
        **readiness
    }


@router.post("/match/{student_id}/{job_id}")
def match_student_to_job(student_id: int, job_id: int):
    student_result = (
        supabase.table("students")
        .select("*").eq("id", student_id).execute()
    )
    job_result = (
        supabase.table("jobs")
        .select("*").eq("id", job_id).execute()
    )

    if not student_result.data:
        raise HTTPException(status_code=404, detail="Student not found")
    if not job_result.data:
        raise HTTPException(status_code=404, detail="Job not found")

    student = student_result.data[0]
    job = job_result.data[0]
    match = calculate_match(student, job)

    saved = {
        "student_id": student_id,
        "job_id": job_id,
        **match,
        "skill_gaps": match["skill_gaps"],
        "explanation": "; ".join(match["explanation"])
    }

    # Store only columns that exist in the matches table.
    saved["status"] = match["status"]
    saved.pop("explanation", None)
    saved["explanation"] = "; ".join(match["explanation"])

    supabase.table("matches").insert(saved).execute()

    return {
        "student_id": student_id,
        "job_id": job_id,
        **match
    }
