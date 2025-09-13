import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '../components/AuthContext';
import SignIn from '../components/SignIn';
import SignUp from '../components/SignUp';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthOrTabsOrAuthUI />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

function AuthOrTabsOrAuthUI() {
  const { isLoggedIn } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  if (!isLoggedIn) {
    return (
      <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              {showSignUp ? <SignUp /> : <SignIn />}

              <TouchableOpacity onPress={() => setShowSignUp(!showSignUp)}>
                <Text style={styles.link}>
                  {showSignUp ? 'Back to Login' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    padding: 28,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 15,
    elevation: 12,
    alignItems: 'center',
  },
  link: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textDecorationLine: 'underline',
    fontWeight: '600',
    textAlign: 'center',
  },
});
