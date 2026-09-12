from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import requests
import os
from datetime import date
import time

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

CACHE_DURATION = 5 * 60  # 5 minutes


cache = {}


def get_cached_games(sport, game_date):
    cache_key = f"{sport}:{game_date}"

    cached = cache.get(cache_key)

    if cached is None:
        return None

    age = time.time() - cached["timestamp"]

    if age < CACHE_DURATION:
        return cached["data"]

    # Remove expired data
    del cache[cache_key]
    return None


def save_games_to_cache(sport, game_date, data):
    cache_key = f"{sport}:{game_date}"

    cache[cache_key] = {
        "data": data,
        "timestamp": time.time()
    }



@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/games/baseball")
def get_baseball_games(game_date: str | None = None):
    today = game_date or date.today().isoformat()

    cached_games = get_cached_games("baseball", today)

    if cached_games is not None:
        return cached_games
    
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

    result = {"games": games}
    save_games_to_cache("baseball", today, result)
    return result


@app.get("/games/football")
def get_football_games(game_date: str | None = None):
    today = game_date or date.today().isoformat()

    cached_games = get_cached_games("football", today)

    if cached_games is not None:
        return cached_games

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

    result = {"games": games}
    save_games_to_cache("football", today, result)
    return result

# Hockey
@app.get("/games/hockey")
def get_hockey_games(game_date: str | None = None):

    today = game_date or date.today().isoformat()
    cached_games = get_cached_games("hockey", today)
    
    if cached_games is not None:
            return cached_games


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

    result = {"games": games}
    save_games_to_cache("hockey", today, result)
    return result

# Basketball
@app.get("/games/basketball")
def get_basketball_games(game_date: str | None = None):

    today = game_date or date.today().isoformat()
    cached_games = get_cached_games("basketball", today)
    
    if cached_games is not None:
        return cached_games
    

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

    result = {"games": games}
    save_games_to_cache("basketball", today, result)
    return result