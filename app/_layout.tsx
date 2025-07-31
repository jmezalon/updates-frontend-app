import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AuthProvider>
      <Head>
        <title>Connect with your churches on Updates</title>
        <meta name="description" content="Discover church events, follow your favorite churches, and stay connected with your community." />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mychurchupdates.netlify.app/" />
        <meta property="og:title" content="Connect with your churches on Updates" />
        <meta property="og:description" content="Discover church events, follow your favorite churches, and stay connected with your community." />
        <meta property="og:image" content="https://res.cloudinary.com/dasjawxzd/image/upload/v1754001953/social-share_cmtwv4.png" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://mychurchupdates.netlify.app/" />
        <meta property="twitter:title" content="Connect with your churches on Updates" />
        <meta property="twitter:description" content="Discover church events, follow your favorite churches, and stay connected with your community." />
        <meta property="twitter:image" content="https://res.cloudinary.com/dasjawxzd/image/upload/v1754001953/social-share_cmtwv4.png" />
      </Head>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
