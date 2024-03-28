import { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import axios, { all } from 'axios';
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
    allPokemons: Pokemon[];
}


const EvolutionPopup: React.FC<EvolutionPopupProps> = ({ pokemonDetails, onClose, onAddToTeam, team, allPokemons }) => {
    const [evolutionDetails, setEvolutionDetails] = useState<EvolutionDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [comparisonModalVisible, setComparisonModalVisible] = useState(false);
    const [comparisonPokemon, setComparisonPokemon] = useState<Pokemon | null>(null);
    const [comparisonScreen, setComparisonScreen] = useState(false);

    const openComparisonModal = () => {
        setComparisonModalVisible(true);
    };

    const selectComparisonPokemon = async (pokemon: Pokemon) => {
        try {
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.englishName}`);
            const stats = response.data.stats.reduce((acc: any, stat: any) => {
            acc[stat.stat.name] = stat.base_stat;
            return acc;
            }, {});
            setComparisonPokemon({ ...pokemon, stats });
            setComparisonScreen(true);
        } catch (error) {
            console.error("Error fetching pokemon details:", error);
        }
    };
    
    const closeComparisonModal = () => {
        setComparisonModalVisible(false);
        setComparisonScreen(false);
    };

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
            <View style={styles.popup}>
                <ScrollView>
                    <Text style={styles.header}>Détails du Pokémon</Text>
                    <View style={styles.pokemonId}>
                        <Image source={{ uri: pokemonDetails.imageUrl }} style={styles.image} />
                        <Text>Types: {pokemonDetails.types.join(', ')}</Text>
                        <TouchableOpacity onPress={openComparisonModal} style={styles.button}>
                            <Text>Comparer</Text>
                        </TouchableOpacity>
                        { team.includes(pokemonDetails.name) ? (
                            <Text style={styles.texteEquipe}>Ce Pokémon est déjà dans votre équipe</Text>
                        ) : (
                            <TouchableOpacity onPress={() => onAddToTeam(pokemonDetails.name)} style={styles.button}>
                                <Text>Ajouter à l'équipe</Text>
                            </TouchableOpacity>
                        
                        )}
                        <Modal visible={comparisonModalVisible} onRequestClose={closeComparisonModal} style={styles.modal}>
                            <ScrollView>
                                {comparisonScreen ? (
                                    comparisonPokemon && (
                                        <View style={styles.comparisonContainer}>
                                            <View style={styles.comparisonItem}>
                                                <Image source={{ uri: pokemonDetails.imageUrl }} style={styles.image} />
                                                <Text>{pokemonDetails.name}</Text>
                                                <View style={styles.statsContent}>
                                                {Object.entries(pokemonDetails.stats || {}).map(([statName, statValue]) => (
                                                    <View style={styles.statsPokemonCompare} key={statName}>
                                                        <Text style={styles.statText}>{statName}: {statValue}</Text>
                                                        <View style={styles.statBar}>
                                                            <View style={[styles.statBarFill, { width: `${(statValue / 150) * 100}%` }]} />
                                                        </View>
                                                    </View>
                                                ))}
                                                </View>
                                            </View>
                                            <View style={styles.comparisonItem}>
                                                <Image source={{ uri: comparisonPokemon.imageUrl }} style={styles.image} />
                                                <Text>{comparisonPokemon.name}</Text>
                                                <View style={styles.statsContent}>
                                                {Object.entries(comparisonPokemon.stats || {}).map(([statName, statValue]) => (
                                                    <View style={styles.statsPokemonCompare} key={statName}>
                                                        <Text style={styles.statText}>{statName}: {statValue}</Text>
                                                        <View style={styles.statBar}>
                                                            <View style={[styles.statBarFill, { width: `${(statValue / 150) * 100}%` }]} />
                                                        </View>
                                                    </View>
                                                ))}
                                                </View>
                                            </View>
                                        </View>
                                    )
                                ) : (
                                    <ScrollView>
                                        {allPokemons && allPokemons.filter((p: Pokemon) => p.name !== pokemonDetails.name).map((pokemon: Pokemon) => (
                                        <TouchableOpacity key={pokemon.name} onPress={() => selectComparisonPokemon(pokemon)} style={styles.pokemonItem}>
                                            <Image source={{ uri: pokemon.imageUrl }} style={styles.image} />
                                            <Text>{pokemon.name}</Text>
                                        </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}
                            </ScrollView>
                        </Modal>
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
    statsPokemonCompare: {
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
    },
    statText: {
        width: '50%',
        textAlign: 'right',
    },
    statBar: {
        width: 130,
        height: 20,
        backgroundColor: '#ffcb05',
        borderRadius: 20,
    },
    statBarFill: {
        height: '100%',
        backgroundColor: '#007BFF',
        borderRadius: 20,
    },
    modal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    pokemonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    popup: {
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
    comparisonContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    comparisonItem: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
});

export default EvolutionPopup;