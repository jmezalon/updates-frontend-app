import { useAuth } from '@/contexts/AuthContext';
import { clearGlobalSourceEventId, getGlobalSourceEventId } from '@/utils/navigationState';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const { user } = useAuth();

  // Check if we're on the home screen
  const isOnHome = pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/';

  const handleBackPress = () => {
    // Navigate based on current screen
    if (pathname.includes('/church/church_detail')) {
      const sourceEventId = getGlobalSourceEventId();
      
      if (sourceEventId) {
        router.push(`/(tabs)/event_details?id=${sourceEventId}` as any);
        clearGlobalSourceEventId(); // Clear the stored ID
      } else {
        // No source event, navigate to home
        router.push('/(tabs)' as any);
      }
    } else if (pathname.includes('/event_details')) {
      router.push('/(tabs)' as any);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFB800',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? 'home' : 'home-outline'} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'heart' : 'heart-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'search' : 'search-outline'} color={color} />
          ),
        }}
      />
      {user !== null ? <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => {
            
            if (user?.avatar) {
              return (
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: color,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {/* Avatar image would go here */}
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              );
            } else {
              return (
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: color,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              );
            }
          },
        }}
      /> 
      : 
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      }
      <Tabs.Screen
        name="event_details"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="church/church_detail"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
    
    {/* Floating Back Button */}
    {!isOnHome && (
      <TouchableOpacity 
        style={styles.floatingBackButton}
        onPress={handleBackPress}
        activeOpacity={0.8}
      >
        <View style={styles.backButtonInner}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </View>
      </TouchableOpacity>
    )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingBackButton: {
    position: 'absolute',
    bottom: 100, // Above the tab bar
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFB800',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  backButtonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
});
