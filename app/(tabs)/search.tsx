import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { apiService, Church } from '@/services/api';

const RECENT_SEARCHES_KEY = 'recent_church_searches';
const MAX_RECENT_SEARCHES = 5;

export default function SearchScreen() {
  const router = useRouter();
  const searchInputRef = useRef<TextInput>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [churches, setChurches] = useState<Church[]>([]);
  const [filteredChurches, setFilteredChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState<Church[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  useEffect(() => {
    loadChurches();
    loadRecentSearches();
  }, []);

  useEffect(() => {
    filterChurches();
  }, [searchQuery, churches]);

  // Auto-focus search input when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Small delay to ensure the screen is fully rendered
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    }, [])
  );

  const loadChurches = async () => {
    try {
      const churchesData = await apiService.getChurches();
      setChurches(churchesData);
    } catch (error) {
      console.error('Error loading churches:', error);
      Alert.alert('Error', 'Failed to load churches');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentSearches = async () => {
    try {
      const recentSearchesData = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (recentSearchesData) {
        const parsedRecentSearches = JSON.parse(recentSearchesData);
        setRecentSearches(parsedRecentSearches);
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = async (church: Church) => {
    try {
      // Remove the church if it already exists in recent searches
      const updatedRecentSearches = recentSearches.filter(item => item.id !== church.id);
      
      // Add the church to the beginning of the array
      updatedRecentSearches.unshift(church);
      
      // Keep only the most recent searches (up to MAX_RECENT_SEARCHES)
      const limitedRecentSearches = updatedRecentSearches.slice(0, MAX_RECENT_SEARCHES);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(limitedRecentSearches));
      setRecentSearches(limitedRecentSearches);
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  const filterChurches = () => {
    if (!searchQuery.trim()) {
      setFilteredChurches([]);
      return;
    }

    const filtered = churches.filter((church) =>
      church.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      church.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      church.state?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredChurches(filtered);
  };

  const handleChurchPress = (churchId: number) => {
    // Find the church object to save to recent searches
    const selectedChurch = churches.find(church => church.id === churchId) || 
                          recentSearches.find(church => church.id === churchId);
    
    if (selectedChurch) {
      saveRecentSearch(selectedChurch);
    }
    
    // Clear the search field when navigating to church
    setSearchQuery('');
    setShowRecentSearches(false);
    router.push(`/(tabs)/church/church_detail?id=${churchId}`);
  };

  const renderChurchItem = ({ item }: { item: Church }) => (
    <TouchableOpacity
      style={styles.churchItem}
      onPress={() => handleChurchPress(item.id)}
    >
      <View style={styles.churchItemContent}>
        {item.logo_url && (
          <Image source={{ uri: item.logo_url }} style={styles.churchLogo} />
        )}
        <View style={styles.churchInfo}>
          <Text style={styles.churchName}>{item.name}</Text>
          <Text style={styles.churchLocation}>
            {[item.city, item.state].filter(Boolean).join(', ')}
          </Text>
          {item.senior_pastor && (
            <Text style={styles.churchPastor}>Pastor: {item.senior_pastor}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search for churches..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setShowRecentSearches(text.trim() === '' && recentSearches.length > 0);
          }}
          onFocus={() => {
            if (searchQuery.trim() === '' && recentSearches.length > 0) {
              setShowRecentSearches(true);
            }
          }}
          onBlur={() => {
            // Delay hiding recent searches to allow for item selection
            setTimeout(() => setShowRecentSearches(false), 150);
          }}
          placeholderTextColor="#999"
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading churches...</Text>
        </View>
      ) : showRecentSearches ? (
        <View style={styles.recentSearchesContainer}>
          <View style={styles.recentSearchesHeader}>
            <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
            {recentSearches.length > 0 && (
              <TouchableOpacity onPress={clearRecentSearches}>
                <Text style={styles.clearButton}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={recentSearches}
            renderItem={renderChurchItem}
            keyExtractor={(item) => `recent-${item.id.toString()}`}
            style={styles.resultsList}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      ) : searchQuery.trim() === '' ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Search for Churches</Text>
          <Text style={styles.emptyDescription}>
            Type in the search box above to find churches by name or location.
          </Text>
          {recentSearches.length > 0 && (
            <TouchableOpacity 
              style={styles.showRecentButton}
              onPress={() => setShowRecentSearches(true)}
            >
              <Text style={styles.showRecentButtonText}>Show Recent Searches</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : filteredChurches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptyDescription}>
            No churches found matching "{searchQuery}". Try a different search term.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredChurches}
          renderItem={renderChurchItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.resultsList}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  resultsList: {
    flex: 1,
  },
  churchItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  churchItemContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  churchLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  churchInfo: {
    flex: 1,
  },
  churchName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  churchLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  churchPastor: {
    fontSize: 14,
    color: '#888',
  },
  recentSearchesContainer: {
    flex: 1,
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recentSearchesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '500',
  },
  showRecentButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  showRecentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
