import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import axios from 'axios';

const PokeCard = ({ pokemon }: { pokemon: any }) => {
    const [frenchName, setFrenchName] = useState('');

    useEffect(() => {
        const fetchPokemonSpecies = async () => {
            try {
                const response = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.englishName}`);
                const frenchNameObj = response.data.names.find((name: { language: { name: string; }; }) => name.language.name === 'fr');
                if (frenchNameObj) {
                    setFrenchName(frenchNameObj.name);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération du nom français du Pokémon", error);
            }
        };

        fetchPokemonSpecies();
    }, [pokemon]);

    return (
        <View style={styles.card}>
            <Text style={styles.title}>{frenchName || pokemon.name}</Text>
            {pokemon.imageUrl && <Image source={{ uri: pokemon.imageUrl }} style={styles.image} />}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        alignItems: 'center',
        margin: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    image: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
});

export default PokeCard;