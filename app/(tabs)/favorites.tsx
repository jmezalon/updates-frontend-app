import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCallback } from 'react';

const API_BASE_URL = 'http://localhost:3000/api';

interface Church {
  id: number;
  name: string;
  senior_pastor: string;
  logo_url?: string;
  city?: string;
  state?: string;
  followed_at: string;
}

interface Event {
  id: number;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  location?: string;
  image_url?: string;
  church_name: string;
  church_logo?: string;
  liked_at: string;
}

interface FavoritesData {
  followedChurches: Church[];
  likedEvents: Event[];
  counts: {
    followedChurches: number;
    likedEvents: number;
  };
}

export default function FavoritesScreen() {
  return (
    <ProtectedRoute fallbackMessage="Sign in to view your favorite churches and events">
      <FavoritesContent />
    </ProtectedRoute>
  );
}

function FavoritesContent() {
  const { token, logout } = useAuth();
  const [favorites, setFavorites] = useState<FavoritesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/favorites/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      } else {
        console.error('Failed to fetch favorites');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [token]);

  // Auto-refresh favorites when tab comes into focus
  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchFavorites();
      }
    }, [token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  const navigateToChurch = (churchId: number) => {
    router.push(`/(tabs)/church/church_detail?id=${churchId}` as any);
  };

  const navigateToEvent = (eventId: number) => {
    router.push(`/(tabs)/event_details?id=${eventId}` as any);
  };

  const handleLogout = async () => {
    try {
      
      // Use AuthContext logout method (handles clearing stored data)
      await logout();
            
      // Navigate to login screen
      router.replace('/auth/login' as any);
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your favorites...</Text>
      </View>
    );
  }

  const hasNoFavorites = !favorites || 
    (favorites.followedChurches.length === 0 && favorites.likedEvents.length === 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Favorites</Text>
            {favorites && (
              <Text style={styles.subtitle}>
                {favorites.counts.followedChurches} churches • {favorites.counts.likedEvents} events
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#ff3b30" />
          </TouchableOpacity>
        </View>
      </View>

      {hasNoFavorites ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptyMessage}>
            Follow churches and like events to see them here.
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push('/(tabs)' as any)}
          >
            <Text style={styles.exploreButtonText}>Explore Churches</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Followed Churches Section */}
          {favorites && favorites.followedChurches.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Followed Churches</Text>
              {favorites.followedChurches.map((church) => (
                <TouchableOpacity
                  key={church.id}
                  style={styles.churchCard}
                  onPress={() => navigateToChurch(church.id)}
                >
                  <View style={styles.churchImageContainer}>
                    {church.logo_url ? (
                      <Image source={{ uri: church.logo_url }} style={styles.churchLogo} />
                    ) : (
                      <View style={styles.placeholderLogo}>
                        <Ionicons name="business" size={24} color="#666" />
                      </View>
                    )}
                  </View>
                  <View style={styles.churchInfo}>
                    <Text style={styles.churchName}>{church.name}</Text>
                    <Text style={styles.churchPastor}>Pastor {church.senior_pastor}</Text>
                    {church.city && church.state && (
                      <Text style={styles.churchLocation}>
                        {church.city}, {church.state}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Liked Events Section */}
          {favorites && favorites.likedEvents.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Liked Events</Text>
              {favorites.likedEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => navigateToEvent(event.id)}
                >
                  <View style={styles.eventImageContainer}>
                    {event.image_url ? (
                      <Image source={{ uri: event.image_url }} style={styles.eventImage} />
                    ) : (
                      <View style={styles.placeholderImage}>
                        <Ionicons name="calendar" size={24} color="#666" />
                      </View>
                    )}
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventChurch}>{event.church_name}</Text>
                    <Text style={styles.eventDate}>
                      {new Date(event.event_date).toLocaleDateString()}
                      {event.event_time && ` • ${event.event_time}`}
                    </Text>
                    {event.location && (
                      <Text style={styles.eventLocation}>{event.location}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    marginLeft: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  churchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
  },
  churchImageContainer: {
    marginRight: 16,
  },
  churchLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  placeholderLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  churchInfo: {
    flex: 1,
  },
  churchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  churchPastor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  churchLocation: {
    fontSize: 14,
    color: '#888',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
  },
  eventImageContainer: {
    marginRight: 16,
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eventChurch: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 14,
    color: '#888',
  },
});
