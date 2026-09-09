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
    today = date.today().isoformat()

    url = "https://v1.baseball.api-sports.io/games"

    headers = {
        "x-apisports-key": API_KEY
    }

    params = {
        "date": today
    }

    response = requests.get(
        url,
        headers=headers,
        params=params
    )

    data = response.json()

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

    return {"games": games}


@app.get("/games/football")
def get_football_games(game_date: str | None = None):
    today = game_date or date.today().isoformat()

    url = "https://v1.american-football.api-sports.io/games"

    headers = {
        "x-apisports-key": API_KEY
    }

    params = {
        "date": today
    }

    response = requests.get(
        url,
        headers=headers,
        params=params
    )

    data = response.json()

    games = []

    for game in data["response"]:

        # Skip college football and other leagues
        if game["league"]["name"] != "NFL":
            continue

        games.append({
            "id": game["game"]["id"],
            "date": game["game"]["date"]["date"],
            "time": game["game"]["date"]["time"],
            "status": game["game"]["status"]["long"],
            "status_short": game["game"]["status"]["short"],
            "home_team": game["teams"]["home"]["name"],
            "away_team": game["teams"]["away"]["name"],
            "home_score": game["scores"]["home"]["total"],
            "away_score": game["scores"]["away"]["total"],
            "home_logo": game["teams"]["home"]["logo"],
            "away_logo": game["teams"]["away"]["logo"]
        })

    return {"games": games}

# Hockey
# Hockey
@app.get("/games/hockey")
def get_hockey_games(game_date: str | None = None):
    today = game_date or date.today().isoformat()

    url = "https://v1.hockey.api-sports.io/games"

    headers = {
        "x-apisports-key": API_KEY
    }

    params = {
        "date": today
    }

    response = requests.get(
        url,
        headers=headers,
        params=params
    )

    data = response.json()

    games = []

    for game in data["response"]:

        # Skip any hockey game that isn't NHL
        if game["league"]["name"] != "NHL":
            continue

        games.append({
            "id": game["id"],
            "date": game["date"],
            "time": game["time"],
            "status": game["status"]["long"],
            "status_short": game["status"]["short"],
            "home_team": game["teams"]["home"]["name"],
            "away_team": game["teams"]["away"]["name"],
            "home_score": game["scores"]["home"],
            "away_score": game["scores"]["away"],
            "home_logo": game["teams"]["home"]["logo"],
            "away_logo": game["teams"]["away"]["logo"]
        })

    return {"games": games}

# Basketball
@app.get("/games/basketball")
def get_basketball_games(game_date: str | None = None):
    today = game_date or date.today().isoformat()

    url = "https://v1.basketball.api-sports.io/games"

    headers = {
        "x-apisports-key": API_KEY
    }

    params = {
        "date": today
    }

    response = requests.get(
        url,
        headers=headers,
        params=params
    )

    data = response.json()

    games = []

    for game in data["response"]:

        # Skip any basketball game that isn't NBA
        if game["league"]["name"] != "NBA":
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

    return {"games": games}