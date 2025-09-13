import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../components/AuthContext';
import LetteredAvatar from '../../components/LetteredAvatar';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await fetch('https://hackathon-backend-1-0wf4.onrender.com/user/getUser', {
          headers: {
            'token': token,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUser(data);
        } else {
          Alert.alert('Error', data.message || 'Failed to fetch user');
        }
      } catch (e) {
        Alert.alert('Error', e.message || 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    logout();
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007bff" />;
  }

  return (
    <View style={styles.main}>
      <View style={styles.card}>
        <LetteredAvatar name={user.name} />
        <Text style={styles.name}>
          {user?.name || 'John Doe'}
        </Text>
        <Text style={styles.info}>Email: {user?.email || 'johndoe@example.com'}</Text>
        <Text style={styles.info}>Phone: {user?.phoneNumber || '+91 12345 67890'}</Text>
        <View style={styles.buttonWrapper}>
          <Button
            title="Logout"
            onPress={handleLogout}
            color="#d9534f"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#f3f4fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 32,
    width: 340,
    alignItems: 'center',
    shadowColor: '#222',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10, // Android
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#ececec',
    backgroundColor: '#e0d6f7', // Fallback color
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2a194c',
    marginBottom: 12,
  },
  info: {
    fontSize: 17,
    color: '#483d64',
    marginBottom: 9,
    fontWeight: '500',
  },
  buttonWrapper: {
    marginTop: 25,
    alignSelf: 'stretch',
  },
});
