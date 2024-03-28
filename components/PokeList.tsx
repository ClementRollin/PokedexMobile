import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import EvolutionPopup from './EvolutionPopup';
import TeamPopup from './TeamPopup';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Pokemon {
    image: string | undefined;
    evolutionChainId: any;
    englishName?: string;
    name: string;
    url: string;
    imageUrl?: string;
    types: string[];
    stats?: { [key: string]: number };
    allPokemons: Pokemon[];
}

const ITEMS_PER_PAGE = 6;

const PokeList = () => {
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
    const [showEvolutionPopup, setShowEvolutionPopup] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<string | null>(null);
    const [team, setTeam] = useState<string[]>([]);
    const [showTeamPopup, setShowTeamPopup] = useState(false);

    const pokemonTypes = ['feu', 'eau', 'plante', 'vol', 'insecte', 'poison', 'normal', 'électrik', 'sol', 'fée', 'combat', 'psy', 'roche', 'acier', 'glace', 'spectre'];

    const pokemonTypeMapping: { [key: string]: string } = {
        'feu': 'fire',
        'eau': 'water',
        'plante': 'grass',
        'vol': 'flying',
        'insecte': 'bug',
        'poison': 'poison',
        'normal': 'normal',
        'électrik': 'electric',
        'sol': 'ground',
        'fée': 'fairy',
        'combat': 'fighting',
        'psy': 'psychic',
        'roche': 'rock',
        'acier': 'steel',
        'glace': 'ice',
        'spectre': 'ghost'
    };

    const [allDataLoaded, setAllDataLoaded] = useState(false);

    useEffect(() => {
        const fetchPokemons = async () => {
            setIsLoading(true);
            const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=100');
            const pokemonsWithImages = await Promise.all(response.data.results.map(async (pokemon: Pokemon) => {
                const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
                const types = pokemonResponse.data.types.map((type: any) => type.type.name);
                const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.name}`);
                const frenchNameObj = speciesResponse.data.names.find((name: { language: { name: string; }; }) => name.language.name === 'fr');
                const frenchName = frenchNameObj ? frenchNameObj.name : pokemon.name;
                const evolutionChainResponse = await axios.get(speciesResponse.data.evolution_chain.url);
                let evolutionStage = 1;
                let currentEvolution = evolutionChainResponse.data.chain;
                while (currentEvolution && currentEvolution.species.name !== pokemon.name) {
                    currentEvolution = currentEvolution.evolves_to[0];
                    evolutionStage++;
                }
                return {
                    ...pokemon,
                    imageUrl: pokemonResponse.data.sprites.front_default,
                    types: types,
                    name: frenchName,
                    englishName: pokemon.name,
                    evolutionStage: evolutionStage
                };
            }));
        
            setPokemons(pokemonsWithImages);
            setIsLoading(false);
            setAllDataLoaded(true);
        };

        if (!allDataLoaded) {
            fetchPokemons();
        }
    }, [allDataLoaded]);

    useEffect(() => {
        setCurrentPage(1);
    }, [typeFilter, sortOrder]);

    const filteredPokemons = pokemons
    .filter(pokemon => typeFilter ? pokemon.types.includes(pokemonTypeMapping[typeFilter]) : true)
    .filter(pokemon => pokemon.name.toLowerCase().startsWith(searchTerm.toLowerCase()));

    const sortedPokemons = [...filteredPokemons].sort((a, b) => {
        if (sortOrder === 'asc') {
            return a.name.localeCompare(b.name);
        } else if (sortOrder === 'desc') {
            return b.name.localeCompare(a.name);
        } else {
            return 0;
        }
    });

    const totalPages = Math.ceil(sortedPokemons.length / ITEMS_PER_PAGE);

    const currentPokemons = sortedPokemons.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const goToPreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleViewEvolutions = async (pokemon: Pokemon) => {
        try {
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.englishName}`);
            const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.englishName}`);
            const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
            const evolutionChainId = evolutionChainUrl.split('/')[6];

            const types = await Promise.all(response.data.types.map(async (type: any) => {
                const typeResponse = await axios.get(type.type.url);
                const frenchTypeObj = typeResponse.data.names.find((name: { language: { name: string; }; }) => name.language.name === 'fr');
                return frenchTypeObj ? frenchTypeObj.name : type.type.name;
            }));

            const stats = response.data.stats.reduce((acc: { [x: string]: any; }, stat: { stat: { name: any; }; base_stat: any; }) => {
                acc[stat.stat.name] = stat.base_stat;
                return acc;
            }, {});

            const pokemonDetails = {
                ...pokemon,
                imageUrl: response.data.sprites.front_default || 'default-image-url.png',
                types: types || [],
                evolutionChainId: evolutionChainId,
                stats: stats
            };

            setSelectedPokemon(pokemonDetails);
            setShowEvolutionPopup(true);
        } catch (error) {
            console.error("Erreur lors de la récupération des détails du Pokémon:", error);
        } finally {
            setShowEvolutionPopup(true);
        }
    };

    const generateRandomTeam = async () => {
        const randomTeam = [];
        let pokemonsCopy = [...pokemons];
        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * pokemonsCopy.length);
            randomTeam.push(pokemonsCopy[randomIndex].name);
            pokemonsCopy = pokemonsCopy.filter((_, index) => index !== randomIndex);
        }
        setTeam(randomTeam);
        try {
            await AsyncStorage.setItem('team', JSON.stringify(randomTeam));
        } catch (error) {
            console.error("Error saving team", error);
        }
    };
    
    const handleAddToTeam = async (pokemonName: string) => {
        if (team.length < 6 && !team.includes(pokemonName)) {
            const newTeam = [...team, pokemonName];
            setTeam(newTeam);
            try {
                await AsyncStorage.setItem('team', JSON.stringify(newTeam));
            } catch (e) {
                console.error("Error updating team", e);
            }
        } else if (team.includes(pokemonName)) {
            console.log(pokemonName + ' est déjà dans votre équipe.');
        } else {
            console.log('Votre équipe est déjà complète.');
        }
    };
    
    const removeLastPokemon = async () => {
        const newTeam = [...team];
        const removedPokemon = newTeam.pop();
        setTeam(newTeam);
        try {
            await AsyncStorage.setItem('team', JSON.stringify(newTeam));
            alert(`${removedPokemon} a été supprimé de votre équipe, il vous reste ${newTeam.length} Pokémon.`);
        } catch (e) {
            console.error("Error removing the last pokemon", e);
        }
    };
    
    const clearTeam = async () => {
        setTeam([]);
        try {
            await AsyncStorage.removeItem('team');
        } catch (e) {
            console.error("Error clearing the team", e);
        }
    };
    
    useEffect(() => {
        const loadTeam = async () => {
            try {
                const storedTeam = await AsyncStorage.getItem('team');
                if (storedTeam) {
                    setTeam(JSON.parse(storedTeam));
                }
            } catch (e) {
                console.error("Error loading the team", e);
            }
        };
    
        loadTeam();
    }, []);
    
    useEffect(() => {
        if (team.length > 0) {
            console.clear();
            const teamString = 'Votre équipe est :\n' + team.map(pokemonName => '- ' + pokemonName).join('\n');
            console.log(teamString);
        } else {
            console.clear();
            console.log('Compose ton équipe maintenant !');
        }
    }, [team]);

    const handleClosePopup = () => {
        setShowEvolutionPopup(false);
        setSelectedPokemon(null);
    };

    const handleShowTeam = () => {
        setShowTeamPopup(true);
    };

    return (
        <View style={styles.container}>
            {isLoading ? (
                <Text>Chargement des pokemons...</Text>
            ) : (
                <>
                    <View style={styles.searchBar}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Rechercher un Pokémon..."
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                        {searchTerm !== '' && (
                            <ScrollView style={styles.searchResults}>
                                {pokemons
                                .filter(pokemon => pokemon.name.toLowerCase().startsWith(searchTerm.toLowerCase()))
                                .map(pokemon => (
                                    <TouchableOpacity key={pokemon.name} onPress={() => handleViewEvolutions(pokemon)}>
                                    <Text>{pokemon.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                    <View style={styles.filterBar}>
                        <Picker selectedValue={typeFilter} onValueChange={(itemValue) => setTypeFilter(itemValue)} style={styles.picker}>
                            <Picker.Item label="Types" value="" />
                            {pokemonTypes.map(type => (
                                <Picker.Item key={type} label={type} value={type} />
                            ))}
                        </Picker>
                        <Picker selectedValue={sortOrder} onValueChange={(itemValue) => setSortOrder(itemValue)} style={styles.picker}>
                            <Picker.Item label="Trier par..." value="" />
                            <Picker.Item label="Ordre alphabétique (A-Z)" value="asc" />
                            <Picker.Item label="Ordre alphabétique inversé (Z-A)" value="desc" />
                        </Picker>
                        {team.length === 0 ? (
                            <TouchableOpacity onPress={generateRandomTeam} style={styles.button}>
                                <Text>Générer une équipe aléatoire</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.pokeTeam}>
                                <TouchableOpacity onPress={handleShowTeam} style={styles.button}>
                                    <Text>Mon équipe</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={removeLastPokemon} style={styles.button}>
                                    <Text>Supprimer</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={clearTeam} style={styles.button}>
                                    <Text>Vider</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                    {filteredPokemons.length === 0 ? (
                        <Text>Désolé, aucun Pokémon ne correspond à votre recherche.</Text>
                    ) : (
                        <ScrollView horizontal={false} contentContainerStyle={styles.pokemonList}>
                            {currentPokemons.map(pokemon => (
                                <View key={pokemon.name} style={styles.pokemonName}>
                                    <TouchableOpacity onPress={() => handleViewEvolutions(pokemon)}>
                                        {pokemon.imageUrl && (
                                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                                <Image source={{ uri: pokemon.imageUrl }} style={{ width: 100, height: 100 }} />
                                                <Text style={styles.pokemonNameText}>{pokemon.name}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.buttonCara} onPress={() => handleViewEvolutions(pokemon)}>
                                        <Text style={styles.buttonText}>Caractéristiques</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                    <View style={styles.pagination}>
                        {currentPage !== 1 && (
                            <TouchableOpacity onPress={goToPreviousPage} style={styles.pageButton}>
                                <Text>Précédent</Text>
                            </TouchableOpacity>
                        )}
                        <Text style={styles.nombrePage}>Page {currentPage} sur {totalPages}</Text>
                        {currentPage !== totalPages && (
                            <TouchableOpacity onPress={goToNextPage} style={styles.pageButton}>
                                <Text>Suivant</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {showEvolutionPopup && selectedPokemon && (
                        <EvolutionPopup
                            pokemonId={selectedPokemon.url}
                            pokemonDetails={selectedPokemon}
                            onClose={handleClosePopup}
                            onAddToTeam={handleAddToTeam}
                            team={team}
                            allPokemons={pokemons}
                        />
                    )}
                    {showTeamPopup && (
                        <TeamPopup
                            team={team}
                            pokemons={pokemons}
                            onClose={() => setShowTeamPopup(false)}
                        />
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    searchBar: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    searchInput: {
        width: '80%',
        padding: '2%',
        borderWidth: 2,
        borderColor: '#ffcb05',
        borderRadius: 5,
        fontSize: 12,
    },
    searchResults: {
        maxHeight: 85,
        width: '80%',
        backgroundColor: '#f8f8f8',
        position: 'absolute',
        zIndex: 5,
        top: 46,
        padding: '3%',
    },
    filterBar: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        width: '75%',
        height: 200,
        marginTop: '20%',
        marginBottom: '5%',
    },
    picker: {
        width: '100%',
        backgroundColor: '#3b4cca',
        color: '#ffffff',
        fontSize: 12,
        marginVertical: '5%',
    },
    pokeTeam: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
    },
    button: {
        marginVertical: '2%',
        padding: '3%',
        backgroundColor: '#ffcb05',
        borderRadius: 5,
    },
    buttonCara: {
        marginVertical: '5%',
        padding: '3%',
        backgroundColor: '#ffcb05',
        borderRadius: 5,
    },
    buttonText: {
        color: 'black',
        fontWeight: 'bold',
    },
    pokemonList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    pokemonName: {
        minWidth: '40%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: '2%',
        margin: '2%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderColor: '#3b4cca',
        borderWidth: 1,
    },
    pokemonNameText: {
        marginBottom: '5%',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#3b4cca',
        paddingBottom: '2%',
        paddingTop: '2%',
        paddingLeft: '5%',
        paddingRight: '5%',
    },
    pageButton: {
        backgroundColor: '#ffcb05', 
        padding: '3%',
        borderRadius: 5, 
    },
    nombrePage: {
        flexGrow: 1,
        textAlign: 'center',
        color: '#fff', 
        fontWeight: 'bold', 
    },
});

export default PokeList;