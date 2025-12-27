import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';

export default function SplashScreen() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Kreels</Text>
      <ActivityIndicator size="large" color="#FF3B5C" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF3B5C',
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
});