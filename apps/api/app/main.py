from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes_search import router as tripzy_router

app = FastAPI(
    title="Tripzy API",
    version="0.1.0",
    description="Backend API for Tripzy"
)


# Configure CORS
origins = [
    "http://localhost:3000",  # React
    "http://localhost:3001",  # Next dev
    "http://localhost:5173",  # Vite
    # Add your production frontend URLs here
    # "https://tripzy.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Welcome to Tripzy API",
        "version": "0.1.0"
    }


@app.get("/health")
async def health():
    return {
        "status": "ok"
    }


app.include_router(tripzy_router)

