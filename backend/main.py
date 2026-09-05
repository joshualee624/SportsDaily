from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import requests
import os
from datetime import date

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("API_SPORTS_KEY")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/games/baseball")
def get_baseball_games():
    # Get today's date
    today = date.today().isoformat()

    # API-Sports Baseball endpoint
    url = "https://v1.baseball.api-sports.io/games"

    headers = {
        "x-apisports-key": API_KEY
    }

    params = {
        "date": today
    }

    # Ask API-Sports for today's games
    response = requests.get(
        url,
        headers=headers,
        params=params
    )

    # Convert API response into Python data
    data = response.json()

    # Create our own clean list of games
    games = []

    for game in data["response"]:

        # Skip any game that isn't MLB
        if game["league"]["name"] != "MLB":
            continue

        games.append({
            "id": game["id"],
            "date": game["date"],
            "time": game["time"],
            "status": game["status"]["long"],
            "status_short": game["status"]["short"],
            "home_team": game["teams"]["home"]["name"],
            "away_team": game["teams"]["away"]["name"],
            "home_score": game["scores"]["home"]["total"],
            "away_score": game["scores"]["away"]["total"],
            "home_logo": game["teams"]["home"]["logo"],
            "away_logo": game["teams"]["away"]["logo"]
        })

    return {
        "games": games
    }