from fastapi import FastAPI
from routes.students import router as students_router
from routes.jobs import router as jobs_router
from routes.matches import router as matches_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CAMPUSLINK API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "CAMPUSLINK Backend is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


app.include_router(students_router)
app.include_router(jobs_router)
app.include_router(matches_router)