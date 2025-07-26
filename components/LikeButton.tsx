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
import { likeEvent, unlikeEvent, checkLikeStatus } from '@/services/favoritesApi';

interface LikeButtonProps {
  eventId: number;
  eventTitle: string;
  style?: any;
  onLikeChange?: (isLiked: boolean) => void;
  variant?: 'button' | 'icon'; // button shows text, icon shows only heart
}

export default function LikeButton({ 
  eventId, 
  eventTitle, 
  style,
  onLikeChange,
  variant = 'button'
}: LikeButtonProps) {
  const { isAuthenticated, token, user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token && user?.role === 'user') {
      checkStatus();
    } else {
      setCheckingStatus(false);
    }
  }, [isAuthenticated, token, eventId]);

  const checkStatus = async () => {
    if (!token) return;

    setCheckingStatus(true);
    try {
      const result = await checkLikeStatus(eventId, token);
      if (!result.error) {
        setIsLiked(result.isLiked);
        onLikeChange?.(result.isLiked);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handlePress = async () => {
    console.log('🔍 LikeButton Debug - Authentication State:');
    console.log('  isAuthenticated:', isAuthenticated);
    console.log('  token exists:', !!token);
    console.log('  token length:', token?.length || 0);
    console.log('  user exists:', !!user);
    console.log('  user data:', user);
    
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, showing sign in alert');
      Alert.alert(
        'Sign In Required',
        'Please sign in to like events.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!token) {
      console.log('❌ No token available');
      return;
    }

    // Don't allow admins to like events
    if (user?.role !== 'user') {
      console.log('❌ User role is not "user":', user?.role);
      Alert.alert(
        'Feature Not Available',
        'This feature is only available for regular users.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    console.log('✅ All authentication checks passed, proceeding with like action...');

    setLoading(true);
    try {
      let result;
      if (isLiked) {
        result = await unlikeEvent(eventId, token);
        if (result.success) {
          setIsLiked(false);
          onLikeChange?.(false);
        }
      } else {
        result = await likeEvent(eventId, token);
        if (result.success) {
          setIsLiked(true);
          onLikeChange?.(true);
        }
      }

      if (!result.success && result.error) {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
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
      <TouchableOpacity 
        style={[
          variant === 'icon' ? styles.iconButton : styles.button, 
          styles.loadingButton, 
          style
        ]} 
        disabled
      >
        <ActivityIndicator size="small" color="#666" />
      </TouchableOpacity>
    );
  }

  if (variant === 'icon') {
    return (
      <TouchableOpacity
        style={[styles.iconButton, style]}
        onPress={handlePress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ff4757" />
        ) : (
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={isLiked ? '#ff4757' : '#666'}
          />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isLiked ? styles.likedButton : styles.likeButton,
        style,
      ]}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={isLiked ? '#ff4757' : '#fff'} 
        />
      ) : (
        <>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={16}
            color={isLiked ? '#ff4757' : '#fff'}
            style={styles.icon}
          />
          <Text
            style={[
              styles.buttonText,
              isLiked ? styles.likedText : styles.likeText,
            ]}
          >
            {isLiked ? 'Liked' : 'Like'}
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
    minWidth: 90,
    justifyContent: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeButton: {
    backgroundColor: '#ff4757',
  },
  likedButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff4757',
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
  likeText: {
    color: '#fff',
  },
  likedText: {
    color: '#ff4757',
  },
});
