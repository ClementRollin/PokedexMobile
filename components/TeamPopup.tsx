import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Pokemon } from './PokeList';
import CapturePokemon from './CapturePokemon';

interface TeamPopupProps {
    team: string[];
    pokemons: Pokemon[];
    onClose: () => void;
}

const TeamPopup: React.FC<TeamPopupProps> = ({ team, pokemons, onClose }) => {
    const [isCapturePopupOpen, setIsCapturePopupOpen] = useState(false);

    const openCapturePopup = () => {
        setIsCapturePopupOpen(true);
    };

    const closeCapturePopup = () => {
        setIsCapturePopupOpen(false);
    };

    return (
        <View style={styles.backdrop}>
            <View style={styles.teamPopup}>
                <View style={styles.headerContainer}>
                    <Text style={styles.header}>Mon équipe</Text>
                    <TouchableOpacity style={styles.captureButton} onPress={openCapturePopup}>
                        <Text style={styles.captureButtonText}>Capturer</Text>
                    </TouchableOpacity>
                </View>
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
            {isCapturePopupOpen && <CapturePokemon onClose={closeCapturePopup} />}
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
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      },
      captureButton: {
        backgroundColor: '#ffcb05',
        padding: 10,
        borderRadius: 5,
      },
      captureButtonText: {
        color: 'black',
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
        marginTop: 10,
        backgroundColor: '#3b4cca',
        borderRadius: 5,
        padding: 10,
    },
    buttonText: {
        color: '#fff',
    },
});

export default TeamPopup;