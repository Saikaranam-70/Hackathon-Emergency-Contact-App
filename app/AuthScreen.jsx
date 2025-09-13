import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../components/AuthContext';
import SignIn from '../components/SignIn';
import SignUp from '../components/SignUp';

export default function AuthScreen() {
  const [showSignUp, setShowSignUp] = useState(false);
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) return null;

  return (
    <LinearGradient
      colors={['#6a11cb', '#2575fc']}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.cardContainer}>
          {showSignUp ? <SignUp /> : <SignIn />}
          <TouchableOpacity
            onPress={() => setShowSignUp(s => !s)}
            style={styles.linkContainer}
            activeOpacity={0.75}
          >
            <Text style={styles.linkText}>
              {showSignUp ? 'Back to Login' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  cardContainer: {
    backgroundColor: 'rgba(26,19,48,0.96)',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
});


// Responsive fix for very small screens can be handled by wrapping maxWidth logic in JS or using Dimensions.
// For extra animation, use Animated API for TouchableOpacity transform on press-in/press-out if desired.
