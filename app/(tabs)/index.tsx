import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiService, Event } from '@/services/api';
import { getCityCoordinates, calculateDistance, getZipCodeCoordinates } from '../../utils/locationUtils';

const USER_LOCATION_KEY = 'user_location';
const FOLLOWED_CHURCHES_KEY = 'followed_churches';

interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  address?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [followedChurches, setFollowedChurches] = useState<number[]>([]);
  const [personalizedEvents, setPersonalizedEvents] = useState<Event[]>([]);

  const loadEvents = async () => {
    try {
      const data = await apiService.getAllEvents();
      setEvents(data);
      // After loading events, create personalized feed
      await createPersonalizedFeed(data);
    } catch (error) {
      console.error('Error loading announcements:', error);
      Alert.alert('Error', 'Failed to load updates. Please check if the backend server is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadUserLocation = async () => {
    try {
      const savedLocation = await AsyncStorage.getItem(USER_LOCATION_KEY);
      if (savedLocation) {
        setUserLocation(JSON.parse(savedLocation));
      } else {
        // Show location setup modal for first-time users
        setShowLocationModal(true);
      }
    } catch (error) {
      console.error('Error loading user location:', error);
      setShowLocationModal(true);
    }
  };

  const loadFollowedChurches = async () => {
    try {
      const savedFollowed = await AsyncStorage.getItem(FOLLOWED_CHURCHES_KEY);
      if (savedFollowed) {
        setFollowedChurches(JSON.parse(savedFollowed));
      }
    } catch (error) {
      console.error('Error loading followed churches:', error);
    }
  };



  const saveUserLocation = async (location: UserLocation) => {
    try {
      await AsyncStorage.setItem(USER_LOCATION_KEY, JSON.stringify(location));
      setUserLocation(location);
    } catch (error) {
      console.error('Error saving user location:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is needed to show nearby events.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      
      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = reverseGeocode[0];
      const userLoc: UserLocation = {
        latitude,
        longitude,
        city: address?.city || undefined,
        state: address?.region || undefined,
        address: `${address?.city || 'Unknown'}, ${address?.region || 'Unknown'}`,
      };

      await saveUserLocation(userLoc);
      setShowLocationModal(false);
      
      // Recreate personalized feed with new location
      await createPersonalizedFeed(events);
      
      Alert.alert('Success', 'Location set successfully!');
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get current location. Please try manual entry.');
    }
  };

  const handleManualLocationInput = async (locationString: string) => {
    try {
      const trimmed = locationString.trim();
      let userLoc: UserLocation;
      
      // Check if it's a zip code (5 digits or 5+4 format)
      if (/^\d{5}(-\d{4})?$/.test(trimmed)) {
        const zipData = getZipCodeCoordinates(trimmed);
        if (!zipData) {
          Alert.alert(
            'Zip Code Not Found',
            'This zip code is not in our database. Please try a major city zip code or use "City, State" format instead.',
            [
              { text: 'Try Again' },
              { text: 'Use GPS', onPress: handleUseCurrentLocation }
            ]
          );
          setShowLocationModal(false);
          setManualLocation('');
          return;
        }
        
        userLoc = {
          latitude: zipData.latitude,
          longitude: zipData.longitude,
          city: zipData.city,
          state: zipData.state,
          address: `${zipData.city}, ${zipData.state} ${trimmed}`,
        };
      } else {
        // Parse as "City, State" format
        const parts = trimmed.split(',').map(part => part.trim());
        if (parts.length < 2) {
          // Check for common abbreviations or incomplete entries
          const suggestions = [];
          if (trimmed.toLowerCase() === 'ny') {
            suggestions.push('"New York, NY"', '"10001" (NYC zip code)');
          } else if (trimmed.toLowerCase() === 'ca') {
            suggestions.push('"Los Angeles, CA"', '"90210" (LA zip code)');
          } else if (trimmed.toLowerCase() === 'ga') {
            suggestions.push('"Atlanta, GA"', '"30309" (Atlanta zip code)');
          } else if (trimmed.toLowerCase() === 'tx') {
            suggestions.push('"Houston, TX"', '"Dallas, TX"');
          }
          
          let message = 'Please enter location as:\n• "City, State" (e.g., "Atlanta, GA")\n• "City, Country" (e.g., "London, UK")\n• Zip code (e.g., "30309")';
          
          if (suggestions.length > 0) {
            message += `\n\nDid you mean:\n• ${suggestions.join('\n• ')}`;
          }
          

          
          Alert.alert(
            'Invalid Format', 
            message,
            [{ text: 'OK' }]
          );
          return;
        }
        
        const city = parts[0];
        const state = parts[1];
        
        // Use coordinate lookup for major cities worldwide
        const cityCoordinates = getCityCoordinates(city, state);
      
      if (!cityCoordinates) {
        Alert.alert(
          'Location Not Found', 
          `Location "${city}, ${state}" not found. Please try:\n• A major city (e.g., "Atlanta, GA", "London, UK")\n• A zip code (e.g., "30309")\n• Use GPS location instead`,
          [
            { text: 'Try Again' },
            { text: 'Use GPS', onPress: handleUseCurrentLocation }
          ]
        );
        setShowLocationModal(false);
        setManualLocation('');
        return;
      }
        
        userLoc = {
          latitude: cityCoordinates.latitude,
          longitude: cityCoordinates.longitude,
          city: city,
          state: state,
          address: `${city}, ${state}`,
        };
      }
      
      await saveUserLocation(userLoc);
      
      // Close modal and clear input
      setShowLocationModal(false);
      setManualLocation('');
      
      // Reload events with new location
      await loadEvents();
      Alert.alert('Success! 🎉', `Location set to ${userLoc.city}, ${userLoc.state}`);
    } catch (error) {
      Alert.alert(
        'Error', 
        'Failed to set location. Please try again.',
        [
          { text: 'Try Again' },
          { text: 'Use GPS', onPress: handleUseCurrentLocation }
        ]
      );
    }
  };

  const handleUseCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (hasPermission) {
      await getCurrentLocation();
      setShowLocationModal(false);
    }
  };

  const handleManualLocation = async () => {
    if (manualLocation.trim()) {
      await handleManualLocationInput(manualLocation.trim());
    }
  };



  // Priority queue algorithm for personalized feed
  const createPersonalizedFeed = async (allEvents: Event[]) => {
    if (!allEvents || allEvents.length === 0) {
      setPersonalizedEvents([]);
      return;
    }

    const eventsWithPriority = allEvents.map(event => {
      let priority = 0;
      let reasons: string[] = [];

      // Priority 1: Location proximity (highest priority)
      if (userLocation && event.latitude && event.longitude) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          event.latitude,
          event.longitude
        );
        
        // Closer events get higher priority (inverse relationship)
        if (distance <= 5) {
          priority += 1000; // Very close (within 5 miles)
          reasons.push('Very close to you');
        } else if (distance <= 15) {
          priority += 500; // Close (within 15 miles)
          reasons.push('Close to you');
        } else if (distance <= 50) {
          priority += 100; // Nearby (within 50 miles)
          reasons.push('Nearby');
        }
      }

      // Priority 2: Followed churches
      if (followedChurches.includes(event.church_id)) {
        priority += 750;
        reasons.push('From a church you follow');
      }

      // Priority 3: Popular events (likes/favorites)
      const likeCount = event.like_count || 0;
      priority += Math.min(likeCount * 10, 200); // Cap at 200 points for likes
      if (likeCount > 10) {
        reasons.push('Popular event');
      }

      // Priority 4: Recent events (boost newer events slightly)
      const eventDate = new Date(event.start_datetime);
      const now = new Date();
      const daysUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysUntilEvent >= 0 && daysUntilEvent <= 7) {
        priority += 50; // Events in the next week
        reasons.push('Coming soon');
      } else if (daysUntilEvent > 7 && daysUntilEvent <= 30) {
        priority += 25; // Events in the next month
      }

      return {
        ...event,
        priority,
        reasons,
      };
    });

    // Sort by priority (highest first)
    const sortedEvents = eventsWithPriority
      .sort((a, b) => b.priority - a.priority)
      .map(({ priority, reasons, ...event }) => event); // Remove priority and reasons from final result

    setPersonalizedEvents(sortedEvents);
  };

  useEffect(() => {
    loadEvents();
    loadUserLocation();
    loadFollowedChurches();
  }, []);

  // Auto-refresh events when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleEventPress = (eventId: number) => {
    router.push({ pathname: '/(tabs)/event_details', params: { id: eventId.toString() } });
  };

  const renderEventCard = (event: Event) => (
    <View key={event.id} style={styles.card}>
      {event.image_url && (
        <TouchableOpacity onPress={() => handleEventPress(event.id)}>
          <Image
            source={{ uri: event.image_url }}
            style={styles.cardImage}
          />
        </TouchableOpacity>
      )}
      <View style={styles.cardContent}>
        <TouchableOpacity onPress={() => handleEventPress(event.id)}>
          <Text style={styles.cardTitle}>{event.title}</Text>
        </TouchableOpacity>
        {event.start_datetime && (
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity onPress={() => router.push(`/(tabs)/church/church_detail?id=${event.church_id}`)}>
              {event.church_logo && (
                <Image
                source={{ uri: event.church_logo }}
                style={styles.churchLogoCircle}
                />
              )}
            </TouchableOpacity>
            <View style={styles.dateTextContainer}>
              <Text style={styles.dateText}>
                {formatDate(event.start_datetime)} @ {formatTime(event.start_datetime)}
              </Text>
            </View>
          </View>
        )}
        {event.church_name && (
          <View style={styles.churchContainer}>
            <TouchableOpacity onPress={() => router.push(`/(tabs)/church/church_detail?id=${event.church_id}`)}>
              <Text style={styles.churchName}>{event.church_name}</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.likeContainer}>
          <Ionicons name="heart" size={16} color="#ff4757" />
          <Text style={styles.likeCount}>{(event.like_count || 0)} likes</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading updates...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Updates</Text>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events available</Text>
            <Text style={styles.emptySubtext}>
              Make sure your backend server is running on localhost:3000
            </Text>
          </View>
        ) : (
          personalizedEvents.length > 0 ? personalizedEvents.map(renderEventCard) : events.map(renderEventCard)
        )}
      </ScrollView>
      
      {/* Location Setup Modal */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Your Location</Text>
            <Text style={styles.modalSubtitle}>
              We'll use your location to show nearby events first in your personalized feed.
            </Text>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleUseCurrentLocation}
            >
              <Ionicons name="location" size={20} color="#fff" />
              <Text style={styles.modalButtonText}>Use Current Location</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalOrText}>OR</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter city, state (e.g., Atlanta, GA)"
              value={manualLocation}
              onChangeText={setManualLocation}
            />
            
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={handleManualLocation}
              disabled={!manualLocation.trim()}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>
                Set Manual Location
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalSkipButton}
              onPress={() => setShowLocationModal(false)}
            >
              <Text style={styles.modalSkipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FFB800',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  churchLogoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  dateTextContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  churchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  churchName: {
    fontSize: 12,
    color: '#FFB800',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  locationContainer: {
    marginTop: 8,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  likeCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#FFB800',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalButtonSecondary: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalButtonTextSecondary: {
    color: '#333',
  },
  modalOrText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    marginVertical: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  modalSkipButton: {
    marginTop: 8,
    padding: 12,
  },
  modalSkipText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
  },
});
