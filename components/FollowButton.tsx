import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { followChurch, unfollowChurch, checkFollowStatus } from '@/services/favoritesApi';

interface FollowButtonProps {
  churchId: number;
  churchName: string;
  style?: any;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({ 
  churchId, 
  churchName, 
  style,
  onFollowChange 
}: FollowButtonProps) {
  const { isAuthenticated, token, user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token && user?.role === 'user') {
      checkStatus();
    } else {
      setCheckingStatus(false);
    }
  }, [isAuthenticated, token, churchId]);

  const checkStatus = async () => {
    if (!token) return;

    setCheckingStatus(true);
    try {
      const result = await checkFollowStatus(churchId, token);
      if (!result.error) {
        setIsFollowing(result.isFollowing);
        onFollowChange?.(result.isFollowing);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handlePress = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to follow churches.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!token) return;

    // Don't allow admins to follow churches
    if (user?.role !== 'user') {
      Alert.alert(
        'Feature Not Available',
        'This feature is only available for regular users.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isFollowing) {
        result = await unfollowChurch(churchId, token);
        if (result.success) {
          setIsFollowing(false);
          onFollowChange?.(false);
        }
      } else {
        result = await followChurch(churchId, token);
        if (result.success) {
          setIsFollowing(true);
          onFollowChange?.(true);
        }
      }

      if (!result.success && result.error) {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't show button for non-authenticated users or admins
  if (!isAuthenticated || user?.role !== 'user') {
    return null;
  }

  if (checkingStatus) {
    return (
      <TouchableOpacity style={[styles.button, styles.loadingButton, style]} disabled>
        <ActivityIndicator size="small" color="#666" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isFollowing ? styles.followingButton : styles.followButton,
        style,
      ]}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={isFollowing ? '#007AFF' : '#fff'} 
        />
      ) : (
        <>
          <Ionicons
            name={isFollowing ? 'checkmark' : 'add'}
            size={16}
            color={isFollowing ? '#007AFF' : '#fff'}
            style={styles.icon}
          />
          <Text
            style={[
              styles.buttonText,
              isFollowing ? styles.followingText : styles.followText,
            ]}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    justifyContent: 'center',
  },
  followButton: {
    backgroundColor: '#007AFF',
  },
  followingButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  loadingButton: {
    backgroundColor: '#f0f0f0',
  },
  icon: {
    marginRight: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  followText: {
    color: '#fff',
  },
  followingText: {
    color: '#007AFF',
  },
});
