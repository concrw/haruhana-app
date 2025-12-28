import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌸 하루하나</Text>
      <Text style={styles.subtitle}>매일 작은 의식으로 건강한 하루를</Text>
      <Link href="/(tabs)" style={styles.link}>
        <Text style={styles.linkText}>시작하기 →</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#909090',
    marginBottom: 40,
  },
  link: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
});
