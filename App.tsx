import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PokeList from './components/PokeList';

function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pokedex</Text>
      <PokeList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  header: {
    marginTop: 40,
    fontSize: 24,
    marginBottom: 20,
  },
});

export default App;
