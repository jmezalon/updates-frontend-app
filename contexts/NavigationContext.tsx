import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'expo-router';

interface NavigationContextType {
  navigationHistory: string[];
  pushToHistory: (route: string) => void;
  goBackInHistory: () => boolean;
  clearHistory: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const router = useRouter();

  const pushToHistory = (route: string) => {
    setNavigationHistory(prev => [...prev, route]);
  };

  const goBackInHistory = (): boolean => {
    if (navigationHistory.length === 0) {
      // No history, go to home
      router.replace('/(tabs)' as any);
      return false;
    }

    // Remove the current route and go to the previous one
    const newHistory = [...navigationHistory];
    const previousRoute = newHistory.pop();
    setNavigationHistory(newHistory);

    if (previousRoute) {
      router.replace(previousRoute as any);
      return true;
    } else {
      // No previous route, go to home
      router.replace('/(tabs)' as any);
      return false;
    }
  };

  const clearHistory = () => {
    setNavigationHistory([]);
  };

  return (
    <NavigationContext.Provider value={{
      navigationHistory,
      pushToHistory,
      goBackInHistory,
      clearHistory
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationHistory() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigationHistory must be used within a NavigationProvider');
  }
  return context;
}
