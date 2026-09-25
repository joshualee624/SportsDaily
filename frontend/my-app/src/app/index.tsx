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

//const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes use either for testing
const REFRESH_INTERVAL = 10 * 1000; // 10 seconds 

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

function isToday(dateString: string) {
  return dateString === formatDateForApi(new Date());
}

type GameSectionProps = {
  title: string;
  games: Game[];
  emptyMessage: string;
};

function GameSection({
  title,
  games,
  emptyMessage,
}: GameSectionProps) {
  return (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>

      {games.length === 0 ? (
        <Text style={styles.noGames}>
          {emptyMessage}
        </Text>
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
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    formatDateForApi(new Date())
  );

  function changeDate(days: number) {
    const date = new Date(`${selectedDate}T12:00:00`);

    date.setDate(date.getDate() + days);

    setSelectedDate(formatDateForApi(date));
  }

  useEffect(() => {
    async function fetchGames(endpoint: string) {
    const response = await fetch(
      `http://127.0.0.1:8000${endpoint}?game_date=${selectedDate}`
    );

    if (!response.ok) {
      throw new Error(`Could not load ${endpoint}`);
    }

    const data = await response.json();
    return data.games;
  }

  async function loadGames() {
  try {
    const [
      baseball,
      football,
      hockey,
      basketball,
    ] = await Promise.all([
      fetchGames('/games/baseball'),
      fetchGames('/games/football'),
      fetchGames('/games/hockey'),
      fetchGames('/games/basketball'),
    ]);

    setBaseballGames(baseball);
    setFootballGames(football);
    setHockeyGames(hockey);
    setBasketballGames(basketball);
  } catch (err) {
    setError('Could not connect to the SportsDaily backend.');
  } finally {
    setLoading(false);
  }
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

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
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
      emptyMessage="No MLB games today."
    />

    <GameSection
      title="NFL Games"
      games={footballGames}
      emptyMessage="No NFL games today."
    />

    <GameSection
      title="NHL Games"
      games={hockeyGames}
      emptyMessage="No NHL games today."
    />

    <GameSection
      title="NBA Games"
      games={basketballGames}
      emptyMessage="No NBA games today."
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