import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/colors';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.backgroundCream },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth/login"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="auth/register"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="auth/onboarding"
            options={{
              presentation: 'fullScreenModal',
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="ritual/[id]"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="ritual/perform"
            options={{
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="ritual/complete"
            options={{
              presentation: 'fullScreenModal',
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="game/index"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="game/go-nogo"
            options={{
              presentation: 'fullScreenModal',
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="game/nback"
            options={{
              presentation: 'fullScreenModal',
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="game/task-switch"
            options={{
              presentation: 'fullScreenModal',
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="game/result"
            options={{
              presentation: 'fullScreenModal',
              animation: 'fade',
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
