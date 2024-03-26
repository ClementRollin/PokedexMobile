import { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';
import { Pokemon } from './PokeList';
import React from 'react';

interface EvolutionNode {
    species: {
        name: string;
        url: string;
    };
    evolves_to: EvolutionNode[];
}

interface EvolutionDetail {
    name: string;
    imageUrl: string;
    types: string[];
}

interface EvolutionPopupProps {
    pokemonDetails: Pokemon;
    onClose: () => void;
    onAddToTeam: (pokemonName: string) => void;
    pokemonId: string;
    team: string[];
}

const EvolutionPopup: React.FC<EvolutionPopupProps> = ({ pokemonDetails, onClose, onAddToTeam, team }) => {
    const [evolutionDetails, setEvolutionDetails] = useState<EvolutionDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvolutionChain = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`https://pokeapi.co/api/v2/evolution-chain/${pokemonDetails.evolutionChainId}/`);
                await processEvolutionChain(response.data.chain);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching evolution chain:", error);
                setIsLoading(false);
            }
        };

        const processEvolutionChain = async (evolutionNode: EvolutionNode) => {
            let evolutions: EvolutionDetail[] = [];
            let currentEvolution: EvolutionNode | null = evolutionNode;
        
            while (currentEvolution) {
                const speciesUrl = currentEvolution.species.url;
                const speciesResponse = await axios.get(speciesUrl);
                const speciesData = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${speciesResponse.data.name}`);
        
                const frenchNameObj = speciesData.data.names.find((name: { language: { name: string; }; }) => name.language.name === 'fr');
                const frenchName = frenchNameObj ? frenchNameObj.name : speciesResponse.data.name;
        
                const pokemonData = await axios.get(`https://pokeapi.co/api/v2/pokemon/${speciesResponse.data.name}`);
        
                const types = await Promise.all(pokemonData.data.types.map(async (type: { type: { url: string; name: any; }; }) => {
                    const typeResponse = await axios.get(type.type.url);
                    const frenchTypeObj = typeResponse.data.names.find((name: { language: { name: string; }; }) => name.language.name === 'fr');
                    return frenchTypeObj ? frenchTypeObj.name : type.type.name;
                }));
        
                evolutions.push({
                    name: frenchName,
                    imageUrl: pokemonData.data.sprites.front_default || 'default-image-url.png',
                    types,
                });
        
                currentEvolution = currentEvolution.evolves_to[0];
            }
        
            setEvolutionDetails(evolutions);
        };

        fetchEvolutionChain();
    }, [pokemonDetails]);

    return (
        <View style={styles.backdrop}>
            <View style={styles.evolutionPopup}>
                <ScrollView>
                    <Text style={styles.header}>Détails du Pokémon</Text>
                    <View style={styles.pokemonId}>
                        <Image source={{ uri: pokemonDetails.imageUrl }} style={styles.image} />
                        <Text>Types: {pokemonDetails.types.join(', ')}</Text>
                        {team.includes(pokemonDetails.name) ? (
                            <Text style={styles.texteEquipe}>Ce Pokémon fait déjà partie de votre équipe.</Text>
                        ) : (
                            <TouchableOpacity style={styles.button} onPress={() => onAddToTeam(pokemonDetails.name)}>
                                <Text>Ajouter à mon équipe</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View>
                        <Text style={styles.header}>Statistiques</Text>
                        <View style={styles.statsContent}>
                            {Object.entries(pokemonDetails.stats || {}).map(([statName, statValue]) => (
                                <View style={styles.statsPokemon} key={statName}>
                                    <Text style={styles.statText}>{statName}: {statValue}</Text>
                                    <View style={styles.statBar}>
                                        <View style={[styles.statBarFill, { width: `${(statValue / 150) * 100}%` }]} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                    <ScrollView horizontal={true} contentContainerStyle={styles.evolutionContainer}>
                        {isLoading ? (
                            <Text>Chargement des évolutions...</Text>
                        ) : (
                            evolutionDetails.map((evolution, index) => (
                                <View key={index} style={styles.evolutionItem}>
                                    <Image source={{ uri: evolution.imageUrl }} style={styles.image} />
                                    <Text>{evolution.name}</Text>
                                </View>
                            ))
                        )}
                    </ScrollView>
                    <TouchableOpacity onPress={onClose} style={styles.button}>
                        <Text>Fermer</Text>
                    </TouchableOpacity>
                </ScrollView>
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
    evolutionPopup: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 20,
        alignItems: 'center',
        elevation: 4, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    evolutionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        color: '#3b4cca',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    pokemonId: {
        alignItems: 'center',
        marginVertical: 20,
    },
    image: {
        width: 120,
        height: 120,
    },
    button: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#ffcb05',
        borderRadius: 5,
    },
    evolutionItem: {
        alignItems: 'center',
        marginVertical: 10,
    },
    texteEquipe: {
        color: 'red',
        marginTop: 10,
    },
    statsContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statsPokemon: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
    },
    statText: {
        width: '45%',
        textAlign: 'right',
    },
    statBar: {
        width: 150,
        height: 20,
        backgroundColor: '#ffcb05',
        borderRadius: 20,
    },
    statBarFill: {
        height: '100%',
        backgroundColor: '#007BFF',
        borderRadius: 20,
    },
});

export default EvolutionPopup;