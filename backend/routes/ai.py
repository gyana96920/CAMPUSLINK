
import os
import tempfile
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool

from ai.student_pipeline import analyze_student

router = APIRouter(prefix="/ai", tags=["AI Engine"])


@router.post("/analyze-student")
async def analyze_student_endpoint(
    career_goal: str = Form(...),
    github_url: Optional[str] = Form(None),
    leetcode_username: Optional[str] = Form(None),
    leetcode_easy: int = Form(0),
    leetcode_medium: int = Form(0),
    leetcode_hard: int = Form(0),
    project_count: int = Form(0),
    course_count: int = Form(0),
    hackathon_count: int = Form(0),
    internship_count: int = Form(0),
    certificates: Optional[list[UploadFile]] = File(None),
):
    career_goal = career_goal.strip()
    if not career_goal:
        raise HTTPException(status_code=400, detail="Career goal is required.")

    manual_stats = None
    if leetcode_easy or leetcode_medium or leetcode_hard:
        manual_stats = {
            "easy": leetcode_easy,
            "medium": leetcode_medium,
            "hard": leetcode_hard,
        }

    temporary_paths = []
    certificate_files = []

    try:
        for upload in certificates or []:
            if not upload.filename:
                continue

            if not upload.filename.lower().endswith(".pdf"):
                raise HTTPException(
                    status_code=400,
                    detail=f"'{upload.filename}' is not a PDF. Only PDF certificates are supported.",
                )

            file_bytes = await upload.read()
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp:
                temp.write(file_bytes)
                temporary_paths.append(temp.name)

            certificate_files.append((upload.filename, temp.name))

        return await run_in_threadpool(
            analyze_student,
            career_goal=career_goal,
            certificate_files=certificate_files,
            github_url=(github_url or "").strip() or None,
            leetcode_username=(leetcode_username or "").strip() or None,
            leetcode_manual_stats=manual_stats,
            project_count=project_count,
            course_count=course_count,
            hackathon_count=hackathon_count,
            internship_count=internship_count,
        )

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    finally:
        for path in temporary_paths:
            if os.path.exists(path):
                os.remove(path)
