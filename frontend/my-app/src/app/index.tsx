import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes use either for testing
//const REFRESH_INTERVAL = 10 * 1000; // 10 seconds 

type Game = {
  id: number;
  date: string;
  time: string;
  timestamp: number;
  status: string;
  status_short: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  home_logo: string;
  away_logo: string;
};

function formatSelectedDate(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function formatGameTime(timestamp: number) {
  const gameDate = new Date(timestamp * 1000);

  return gameDate.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatGameStatus(game: Game) {
  if (game.status_short === 'NS') {
    return formatGameTime(game.timestamp);
  }

  if (game.status_short === 'FT') {
    return 'FINAL';
  }

  return game.status;
}

function formatDateForApi(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function isGameOnSelectedDate(
  game: Game,
  selectedDate: string
): boolean {
  const gameDate = new Date(game.timestamp * 1000);

  return formatDateForApi(gameDate) === selectedDate;
}

function isToday(dateString: string) {
  return dateString === formatDateForApi(new Date());
}

type GameSectionProps = {
  title: string;
  games: Game[];
  emptyMessage: string;
  error?: string;
};

function GameSection({
  title,
  games,
  emptyMessage,
  error,
}: GameSectionProps) {
  return (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : games.length === 0 ? (
        <Text style={styles.noGames}>{emptyMessage}</Text>
      ) : (
        games.map((game) => (
          <View key={game.id} style={styles.gameCard}>
            <Text style={styles.status}>
              {formatGameStatus(game)}
            </Text>

            <View style={styles.teamRow}>
              <View style={styles.team}>
                <Image
                  source={{ uri: game.away_logo }}
                  style={styles.logo}
                />
                <Text style={styles.teamName}>
                  {game.away_team}
                </Text>
              </View>

              <Text style={styles.score}>
                {game.away_score ?? '-'}
              </Text>
            </View>

            <View style={styles.teamRow}>
              <View style={styles.team}>
                <Image
                  source={{ uri: game.home_logo }}
                  style={styles.logo}
                />
                <Text style={styles.teamName}>
                  {game.home_team}
                </Text>
              </View>

              <Text style={styles.score}>
                {game.home_score ?? '-'}
              </Text>
            </View>
          </View>
        ))
      )}
    </>
  );
}

export default function HomeScreen() {
  const [baseballGames, setBaseballGames] = useState<Game[]>([]);
  const [footballGames, setFootballGames] = useState<Game[]>([]);
  const [hockeyGames, setHockeyGames] = useState<Game[]>([]);
  const [basketballGames, setBasketballGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [baseballError, setBaseballError] = useState('');
  const [footballError, setFootballError] = useState('');
  const [hockeyError, setHockeyError] = useState('');
  const [basketballError, setBasketballError] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    formatDateForApi(new Date())
  );

  function changeDate(days: number) {
    const date = new Date(`${selectedDate}T12:00:00`);

    date.setDate(date.getDate() + days);

    setSelectedDate(formatDateForApi(date));
  }

  useEffect(() => {
    async function fetchGames(
      endpoint: string,
      gameDate: string = selectedDate
    ): Promise<Game[]> {
      const response = await fetch(
        `http://127.0.0.1:8000${endpoint}?game_date=${gameDate}`
      );

      if (!response.ok) {
        throw new Error(`Could not load ${endpoint}`);
      }

      const data = await response.json();
      return data.games;
    }

    async function fetchGamesForLocalDate(
      endpoint: string
    ): Promise<Game[]> {
      // Start with the date selected by the user
      const nextDate = new Date(`${selectedDate}T12:00:00`);
      nextDate.setDate(nextDate.getDate() + 1);

      const nextDateString = formatDateForApi(nextDate);

      // Fetch both API dates
      const [todayGames, nextDayGames] = await Promise.all([
        fetchGames(endpoint, selectedDate),
        fetchGames(endpoint, nextDateString),
      ]);

      // Combine the games
      const combinedGames = [...todayGames, ...nextDayGames];

      // Remove duplicate games
      const uniqueGames = Array.from(
        new Map(combinedGames.map((game) => [game.id, game])).values()
      );

      // Keep only games on the selected local date
      return uniqueGames
        .filter((game) => isGameOnSelectedDate(game, selectedDate))
        .sort((a, b) => a.timestamp - b.timestamp);
    }

  
  
  async function loadGames() {
    const results = await Promise.allSettled([
      fetchGamesForLocalDate('/games/baseball'),
      fetchGamesForLocalDate('/games/football'),
      fetchGamesForLocalDate('/games/hockey'),
      fetchGamesForLocalDate('/games/basketball'),
    ]);

    const [baseball, football, hockey, basketball] = results;

    if (baseball.status === 'fulfilled') {
      setBaseballGames(baseball.value);
      setBaseballError('');
    } else {
      setBaseballGames([]);
      setBaseballError('Could not load MLB games.');
    }

    if (football.status === 'fulfilled') {
      setFootballGames(football.value);
      setFootballError('');
    } else {
      setFootballGames([]);
      setFootballError('Could not load NFL games.');
    }

    if (hockey.status === 'fulfilled') {
      setHockeyGames(hockey.value);
      setHockeyError('');
    } else {
      setHockeyGames([]);
      setHockeyError('Could not load NHL games.');
    }

    if (basketball.status === 'fulfilled') {
      setBasketballGames(basketball.value);
      setBasketballError('');
    } else {
      setBasketballGames([]);
      setBasketballError('Could not load NBA games.');
    }

    setLoading(false);
  }


    loadGames();

    if (!isToday(selectedDate)) {
      return;
    }

    const refreshTimer = setInterval(() => {
      loadGames();
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(refreshTimer);
    };
  }, [selectedDate]);


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading games...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>TODAY SPORTS</Text>

    <View style={styles.dateNavigation}>
      <Pressable
        style={styles.dateButton}
        onPress={() => changeDate(-1)}
      >
        <Text style={styles.dateButtonText}>←</Text>
      </Pressable>

      <Text style={styles.selectedDate}>
        {formatSelectedDate(selectedDate)}
      </Text>

      <Pressable
        style={styles.dateButton}
        onPress={() => changeDate(1)}
      >
        <Text style={styles.dateButtonText}>→</Text>
      </Pressable>
    </View>

    <GameSection
      title="MLB Games"
      games={baseballGames}
      emptyMessage="No MLB games."
      error={baseballError}
    />

    <GameSection
      title="NFL Games"
      games={footballGames}
      emptyMessage="No NFL games."
      error={footballError}
    />

    <GameSection
      title="NHL Games"
      games={hockeyGames}
      emptyMessage="No NHL games."
      error={hockeyError}
    />

    <GameSection
      title="NBA Games"
      games={basketballGames}
      emptyMessage="No NBA games."
      error={basketballError}
    />
  </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f5f5f5',
    minHeight: '100%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  errorText: {
    fontSize: 18,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  gameCard: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 12,
    marginBottom: 14,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  team: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  teamName: {
    fontSize: 18,
  },
  score: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  noGames: {
    fontSize: 18,
    marginBottom: 24,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 20,
  },

  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 8,
  },

  dateButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  selectedDate: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 180,
    textAlign: 'center',
  },
});