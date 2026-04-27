from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import traceback

try:
    from presentation.routes import router
    from presentation.other_routes import router as other_router
    print("Successfully imported presentation.routes")
except Exception as e:
    print("FAILED to import presentation.routes")
    traceback.print_exc()
    sys.exit(1)

app = FastAPI(title="Agenda Quick API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(other_router)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Backend is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
