import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { getImageUrl } from '@/utils/imageUtils';
import { calculateDistance, getCityCoordinates, getZipCodeCoordinates } from '@/utils/locationUtils';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const USER_LOCATION_KEY = 'user_location';

interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  address?: string;
}

export default function ProfileScreen() {
  const { user, token, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  
  // Location state
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualLocation, setManualLocation] = useState('');

  const handleImagePicker = async () => {
    if (!token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Upload image using API service
        setLoading(true);
        try {
          const data = await apiService.uploadImage(imageUri, token);
          setAvatar(data.url);
          
          // Immediately update the backend profile with new avatar
          const updatedUser = await apiService.updateProfile({
            name: user?.name || name,
            avatar: data.url,
          }, token);
          
          // Update user context to persist the change
          updateUser(updatedUser);
          
          Alert.alert('Success', 'Profile image updated successfully');
        } catch (error) {
          console.error('Image upload error:', error);
          Alert.alert('Error', 'Failed to upload image');
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to access image library');
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    try {
      setLoading(true);
      
      // Update profile
      const updatedUser = await apiService.updateProfile({
        name: name.trim(),
        avatar: avatar,
      }, token);

      updateUser(updatedUser);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    try {
      setLoading(true);
      
      await apiService.changePassword({
        currentPassword,
        newPassword,
      }, token);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password changed successfully');
    } catch (error) {
      console.error('Password change error:', error);
      Alert.alert('Error', 'Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  // Load user location on component mount
  useEffect(() => {
    loadUserLocation();
  }, []);

  const loadUserLocation = async () => {
    try {
      const savedLocation = await AsyncStorage.getItem(USER_LOCATION_KEY);
      if (savedLocation) {
        setUserLocation(JSON.parse(savedLocation));
      }
    } catch (error) {
      console.error('Error loading user location:', error);
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
        Alert.alert('Permission Denied', 'Location permission is required to use GPS location.');
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
        city: address?.city || 'Unknown',
        state: address?.region || 'Unknown',
        address: `${address?.city || 'Unknown'}, ${address?.region || 'Unknown'}`,
      };

      await saveUserLocation(userLoc);
      setShowLocationModal(false);
      
      Alert.alert('Success', 'Location updated successfully!');
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
      
      Alert.alert('Success! 🎉', `Location updated to ${userLoc.city}, ${userLoc.state}`);
    } catch (error) {
      Alert.alert(
        'Error', 
        'Failed to update location. Please try again.',
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

  const handleDeleteAccount = () => {
    // Cross-platform confirmation
    const confirmDelete = () => {
      if (typeof window !== 'undefined') {
        // Web platform - use browser confirm
        return window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
      } else {
        // React Native - use Alert.alert
        Alert.alert(
          'Delete Account',
          'Are you sure you want to delete your account? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => performDelete(),
            },
          ]
        );
        return;
      }
    };

    const performDelete = async () => {
      if (!token) {
        if (typeof window !== 'undefined') {
          window.alert('Authentication required');
        } else {
          Alert.alert('Error', 'Authentication required');
        }
        return;
      }
      
      try {
        setLoading(true);
        await apiService.deleteAccount(token);
        logout();
        router.replace('/(tabs)' as any);
      } catch (error) {
        console.error('Account deletion error:', error);
        if (typeof window !== 'undefined') {
          window.alert('Failed to delete account');
        } else {
          Alert.alert('Error', 'Failed to delete account');
        }
      } finally {
        setLoading(false);
      }
    };

    // For web, handle confirmation and deletion directly
    if (typeof window !== 'undefined') {
      if (confirmDelete()) {
        performDelete();
      }
    } else {
      // For React Native, Alert.alert handles the confirmation
      confirmDelete();
    }
  };

  const handleLogout = async () => {
    try {  
        // Use AuthContext logout method (handles clearing stored data)
        await logout();
            
        // Navigate to login screen
        router.replace('/(tabs)' as any);
    } catch (error) {
        Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please login to view your profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={handleImagePicker} style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: getImageUrl(avatar) }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.avatarEditIcon}>
            <Ionicons name="camera" size={16} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      {/* Profile Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <TouchableOpacity
            onPress={() => {
              if (isEditing) {
                handleSaveProfile();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={loading}
          >
            <Text style={styles.editButton}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={name}
            onChangeText={setName}
            editable={isEditing}
            placeholder="Enter your name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={user.email}
            editable={false}
          />
        </View>

        {isEditing && (
          <TouchableOpacity
            onPress={() => {
              setIsEditing(false);
              setName(user.name);
              setAvatar(user.avatar || '');
            }}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Change Password */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Current Password</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            placeholder="Enter current password"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>New Password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Enter new password"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Confirm new password"
          />
        </View>

        <TouchableOpacity
          onPress={handleChangePassword}
          style={styles.primaryButton}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      {/* Location Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Settings</Text>
        
        <View style={styles.locationInfo}>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <View style={styles.locationText}>
              <Text style={styles.locationLabel}>Current Location</Text>
              <Text style={styles.locationValue}>
                {userLocation ? userLocation.address : 'Not set'}
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={() => setShowLocationModal(true)} 
          style={styles.locationButton}
        >
          <Ionicons name="location" size={20} color="#e74c3c" />
          <Text style={styles.locationButtonText}>Change Location</Text>
        </TouchableOpacity>
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#666" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDeleteAccount} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color="#e74c3c" />
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Your Location</Text>
            <Text style={styles.modalSubtitle}>
              Update your location to see nearby events in your personalized feed.
            </Text>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleUseCurrentLocation}
            >
              <Ionicons name="location" size={20} color="#fff" />
              <Text style={styles.modalButtonText}>Use Current Location</Text>
            </TouchableOpacity>
            
            <View style={styles.modalDivider}>
              <Text style={styles.modalDividerText}>OR</Text>
            </View>
            
            <TextInput
              style={styles.modalInput}
              placeholder='Enter city, state or zip code (e.g., "Atlanta, GA" or "30309")'
              value={manualLocation}
              onChangeText={setManualLocation}
              onSubmitEditing={handleManualLocation}
            />
            
            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSecondaryButton]}
                onPress={() => {
                  setShowLocationModal(false);
                  setManualLocation('');
                }}
              >
                <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { flex: 1, marginLeft: 10 }]}
                onPress={handleManualLocation}
              >
                <Text style={styles.modalButtonText}>Set Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#e74c3c',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#f8f9fa',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#666',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    color: '#e74c3c',
    fontWeight: '600',
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f8f9fa',
    color: '#666',
  },
  primaryButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#e74c3c',
    marginLeft: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  locationInfo: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 12,
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 14,
    color: '#666',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  locationButtonText: {
    fontSize: 16,
    color: '#e74c3c',
    marginLeft: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalSecondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
  },
  modalSecondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalDivider: {
    alignItems: 'center',
    marginVertical: 16,
  },
  modalDividerText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
