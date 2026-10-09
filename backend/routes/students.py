
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from database import supabase

router = APIRouter(prefix="/students", tags=["Students"])


class StudentCreate(BaseModel):
    name: str
    email: str
    branch: str
    cgpa: float = Field(ge=0, le=10)
    skills: list[str] = []
    projects: int = Field(default=0, ge=0)
    certifications: int = Field(default=0, ge=0)
    aptitude_score: int = Field(default=0, ge=0, le=100)
    interview_score: int = Field(default=0, ge=0, le=100)


@router.get("/")
def get_students():
    return supabase.table("students").select("*").execute().data


@router.get("/{student_id}")
def get_student(student_id: int):
    result = (
        supabase.table("students")
        .select("*")
        .eq("id", student_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Student not found")

    return result.data[0]


@router.post("/")
def create_student(student: StudentCreate):
    data = student.model_dump()

    result = supabase.table("students").insert(data).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Could not create student")

    return result.data[0]
