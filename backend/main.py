from fastapi import FastAPI, Depends, HTTPException

app = FastAPI()


@app.get("/health")
def health():
    return {"status": "ok"}