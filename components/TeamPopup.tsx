import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Pokemon } from './PokeList';

interface TeamPopupProps {
    team: string[];
    pokemons: Pokemon[];
    onClose: () => void;
}

const TeamPopup: React.FC<TeamPopupProps> = ({ team, pokemons, onClose }) => {
    return (
        <View style={styles.backdrop}>
            <View style={styles.teamPopup}>
                <Text style={styles.header}>Mon équipe</Text>
                <View style={styles.teamGrid}>
                    {team.map(pokemonName => {
                        const pokemon = pokemons.find(p => p.name === pokemonName);
                        return pokemon ? (
                            <View key={pokemonName} style={styles.pokemonItem}>
                                <Image source={{ uri: pokemon.imageUrl }} style={styles.image} />
                                <Text style={styles.pokemonName}>{pokemonName}</Text>
                            </View>
                        ) : null;
                    })}
                </View>
                <TouchableOpacity onPress={onClose} style={styles.button}>
                    <Text style={styles.buttonText}>Fermer</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    teamPopup: {
        width: '80%',
        maxHeight: '80%',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 4,
    },
    header: {
        color: '#3b4cca',
        fontSize: 22,
        marginBottom: 20,
    },
    teamGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pokemonItem: {
        alignItems: 'center',
        margin: 10,
    },
    image: {
        width: 90,
        height: 90,
        resizeMode: 'contain',
    },
    pokemonName: {
        marginTop: 10,
        color: '#3b4cca',
    },
    button: {
        backgroundColor: '#3b4cca',
        borderRadius: 5,
        padding: 10,
    },
    buttonText: {
        color: '#fff',
    },
});

export default TeamPopup;