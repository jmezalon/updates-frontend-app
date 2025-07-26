import { Stack } from 'expo-router';
import React from 'react';

export default function EventLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide header to remove back button
        presentation: 'card',
      }}
    />
  );
}
