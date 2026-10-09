
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from database import supabase

router = APIRouter(prefix="/jobs", tags=["Jobs"])


class JobCreate(BaseModel):
    title: str
    recruiter_id: int | None = None
    min_cgpa: float = Field(default=0, ge=0, le=10)
    required_skills: list[str] = []
    description: str = ""


@router.get("/")
def get_jobs():
    return supabase.table("jobs").select("*").execute().data


@router.get("/{job_id}")
def get_job(job_id: int):
    result = (
        supabase.table("jobs")
        .select("*")
        .eq("id", job_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")

    return result.data[0]


@router.post("/")
def create_job(job: JobCreate):
    data = job.model_dump()

    result = supabase.table("jobs").insert(data).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Could not create job")

    return result.data[0]
