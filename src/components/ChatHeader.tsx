import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChatHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Chatbot</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 64,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
    letterSpacing: 1,
  },
});
