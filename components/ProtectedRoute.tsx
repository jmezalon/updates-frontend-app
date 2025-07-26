import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

export default function ProtectedRoute({ 
  children, 
  fallbackMessage = "Please sign in to access this feature" 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.authPromptContainer}>
        <View style={styles.authPromptContent}>
          <Text style={styles.authPromptTitle}>Sign In Required</Text>
          <Text style={styles.authPromptMessage}>{fallbackMessage}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => router.push('/auth/login' as any)}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={() => router.push('/auth/register' as any)}
            >
              <Text style={styles.signUpButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Only show content to regular users (not admins)
  if (user?.role === 'church_admin' || user?.role === 'superuser') {
    return (
      <View style={styles.authPromptContainer}>
        <View style={styles.authPromptContent}>
          <Text style={styles.authPromptTitle}>Admin Account</Text>
          <Text style={styles.authPromptMessage}>
            Admin accounts should use the web portal. Please visit the admin portal in your browser.
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => router.replace('/(tabs)' as any)}
            >
              <Text style={styles.signInButtonText}>Back to Home</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={() => router.push('/auth/login' as any)}
            >
              <Text style={styles.signUpButtonText}>Sign In as Different User</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  authPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  authPromptContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  authPromptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  authPromptMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  signInButton: {
    backgroundColor: 'rgba(255,184,0,1)',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
