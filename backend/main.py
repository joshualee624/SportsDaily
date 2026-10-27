from fastapi import FastAPI, HTTPException
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

def fetch_api_data(url, game_date, sport):
    headers = {
        "x-apisports-key": API_KEY
    }

    params = {
        "date": game_date
    }

    try:
        response = requests.get(
            url,
            headers=headers,
            params=params,
            timeout=10
        )

        response.raise_for_status()

        data = response.json()

        if not isinstance(data, dict) or not isinstance(data.get("response"), list):
            raise ValueError("Unexpected API response format")

        return data

    except (requests.exceptions.RequestException, ValueError) as error:
        print(f"{sport} API request failed: {error}")

        raise HTTPException(
            status_code=502,
            detail=f"Could not retrieve {sport} games from API-Sports."
        )

LIVE_CACHE_DURATION = 5 * 60       # 5 minutes
PAST_CACHE_DURATION = 24 * 60 * 60 # 24 hours
FUTURE_CACHE_DURATION = 60 * 60    # 1 hour


cache = {}


def get_cached_games(sport, game_date):
    cache_key = f"{sport}:{game_date}"

    cached = cache.get(cache_key)

    if cached is None:
        return None

    today = date.today().isoformat()

    if game_date < today:
        duration = PAST_CACHE_DURATION
    elif game_date > today:
        duration = FUTURE_CACHE_DURATION
    else:
        duration = LIVE_CACHE_DURATION

    age = time.time() - cached["timestamp"]

    if age < duration:
        return cached["data"]

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

    data = fetch_api_data(url, today, "MLB")
    
    games = []

    for game in data["response"]:

        # Skip any game that isn't MLB
        if game["league"]["name"] != "MLB":
            continue

        games.append({
            "id": game["id"],
            "date": game["date"],
            "time": game["time"],
            "timestamp": game["timestamp"],
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

    data = fetch_api_data(url, today, "NFL")

    games = []

    for game in data["response"]:

        # Skip college football and other leagues
        if game["league"]["name"] != "NFL":
            continue

        games.append({
            "id": game["game"]["id"],
            "date": game["game"]["date"]["date"],
            "time": game["game"]["date"]["time"],
            "timestamp": game["game"]["date"]["timestamp"],
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

    data = fetch_api_data(url, today, "NHL")

    games = []

    for game in data["response"]:

        # Skip any hockey game that isn't NHL
        if game["league"]["name"] != "NHL":
            continue

        games.append({
            "id": game["id"],
            "date": game["date"],
            "time": game["time"],
            "timestamp": game["timestamp"],
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

    data = fetch_api_data(url, today, "NBA")

    games = []

    for game in data["response"]:

        # Skip any basketball game that isn't NBA
        if game["league"]["name"] != "NBA":
            continue

        games.append({
            "id": game["id"],
            "date": game["date"],
            "time": game["time"],
            "timestamp": game["timestamp"],
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