import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import RNShake from 'react-native-shake';

export default function Home() {
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [error, setError] = useState(null);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [loadingSOS, setLoadingSOS] = useState(false);

  useEffect(() => {
    fetchContacts();

    // Shake detection for SOS
    const subscription = RNShake.addListener(() => {
      sendSOS();
    });

    return () => subscription.remove();
  }, []);

  // Fetch contacts from backend
  const fetchContacts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in again.');
        setLoadingContacts(false);
        return;
      }

      const response = await fetch('https://hackathon-backend-1-0wf4.onrender.com/contact/', {
        headers: { token, 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (response.ok) setContacts(data);
      else setError(data.message || 'Failed to fetch contacts');
    } catch (e) {
      setError('Network error');
    } finally {
      setLoadingContacts(false);
    }
  };

  // Add a new contact
  const addContact = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('https://hackathon-backend-1-0wf4.onrender.com/contact/', {
        method: 'POST',
        headers: { token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newContactName,
          phoneNumber: newContactPhone,
          relation: newContactRelation,
          email: newContactEmail,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Contact added successfully');
        setNewContactName('');
        setNewContactPhone('');
        setNewContactRelation('');
        setNewContactEmail('');
        fetchContacts();
      } else Alert.alert('Error', data.message || 'Failed to add contact');
    } catch (e) {
      Alert.alert('Error', e.message || 'Something went wrong');
    }
  };

  // Delete a contact
  const deleteContact = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch(`https://hackathon-backend-1-0wf4.onrender.com/contact/${id}`, {
        method: 'DELETE',
        headers: { token, 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Deleted', 'Contact deleted successfully');
        fetchContacts();
      } else Alert.alert('Error', data.message || 'Failed to delete contact');
    } catch (e) {
      Alert.alert('Error', e.message || 'Something went wrong');
    }
  };

  // Send SOS with current location
  const sendSOS = async () => {
    setLoadingSOS(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const userEmail = await AsyncStorage.getItem('userEmail'); // user email saved on login/register
      if (!token) throw new Error('No token found');

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to send SOS');
        setLoadingSOS(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const response = await fetch('https://hackathon-backend-1-0wf4.onrender.com/sos/', {
        method: 'POST',
        headers: { token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'I am in danger! Please help!',
          location: `https://www.google.com/maps?q=${latitude},${longitude}`,
          fromEmail: userEmail,
        }),
      });

      const data = await response.json();
      if (response.ok) Alert.alert('SOS Sent', data.message || 'Your alert has been sent successfully!');
      else Alert.alert('Error', data.message || 'Failed to send SOS');
    } catch (e) {
      Alert.alert('Error', e.message || 'Something went wrong while sending SOS');
    } finally {
      setLoadingSOS(false);
    }
  };

  if (loadingContacts) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007bff" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      {/* Disclaimer */}
      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerTitle}>Important Notice</Text>
        <Text style={styles.disclaimerText}>
          Please note: SMS and WhatsApp messages can only be sent to numbers registered in Twilio, because we are using its free service for this hackathon. Registering additional numbers in Twilio requires payment and is not included here. Email notifications, however, work for any valid email address freely and Shake Device for sos Auto send.
        </Text>
      </View>

      <Text style={styles.title}>Contacts</Text>

      {/* Add new contact */}
      <TextInput
        style={styles.input}
        placeholder="Enter Name"
        value={newContactName}
        onChangeText={setNewContactName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Phone Number"
        value={newContactPhone}
        onChangeText={setNewContactPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Relation"
        value={newContactRelation}
        onChangeText={setNewContactRelation}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Email"
        value={newContactEmail}
        onChangeText={setNewContactEmail}
        keyboardType="email-address"
      />
      <Button title="Add Contact" onPress={addContact} />

      {/* Contact list */}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>Phone: {item.phoneNumber}</Text>
            <Text>Relation: {item.relation}</Text>
            <Text>Email: {item.email || "N/A"}</Text>
            <Button title="Delete" color="#d9534f" onPress={() => deleteContact(item._id)} />
          </View>
        )}
      />

      {/* SOS Button */}
      {loadingSOS ? (
        <ActivityIndicator size="large" color="#ff0000" style={{ marginTop: 20 }} />
      ) : (
        <Button title="Send SOS" color="#ff0000" onPress={sendSOS} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#817d7dff' },
  disclaimerContainer: { backgroundColor: '#fff4e5', padding: 12, borderRadius: 8, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#ff9800' },
  disclaimerTitle: { fontWeight: 'bold', color: '#e65100', marginBottom: 4 },
  disclaimerText: { color: '#5d4037' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: '#f2f2f2', padding: 16, borderRadius: 8, marginBottom: 12 },
  name: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 6 },
  loading: { flex: 1, textAlign: 'center', marginTop: 50 },
  error: { color: 'red', textAlign: 'center', marginTop: 50 },
});
