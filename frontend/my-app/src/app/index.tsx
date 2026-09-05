import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Game = {
  id: number;
  date: string;
  time: string;
  status: string;
  status_short: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  home_logo: string;
  away_logo: string;
};

export default function HomeScreen() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadGames() {
      try {
        const response = await fetch(
          'http://127.0.0.1:8000/games/baseball'
        );

        if (!response.ok) {
          throw new Error('Could not load baseball games');
        }

        const data = await response.json();

        setGames(data.games);
      } catch (err) {
        setError('Could not connect to the SportsDaily backend.');
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, []);

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
      <Text style={styles.sectionTitle}>MLB Games</Text>

      {games.map((game) => (
        <View key={game.id} style={styles.gameCard}>
          <Text style={styles.status}>
            {game.status_short === 'NS'
            ? `${game.time} - Upcoming`
            : game.status}
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
      ))}
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
});