import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

interface CapturePokemonProps {
    onClose: () => void;
}

const CapturePokemon: React.FC<CapturePokemonProps> = ({ onClose }) => {
    React.useEffect(() => {
        NfcManager.start();
    }, []);

    const readNdef = async () => {
        try {
            await NfcManager.requestTechnology(NfcTech.Ndef);
            const tag = await NfcManager.getTag();
            console.warn('Tag found', tag);
        } catch (ex) {
            console.warn('Oops!', ex);
        } finally {
            NfcManager.cancelTechnologyRequest();
        }
    };

    return (
        <View style={styles.capturePopup}>
            <Text style={styles.Titre}>Capturer un Pokemon</Text>
            <TouchableOpacity onPress={readNdef}>
                <Text>Scan a Tag</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
                <Text style={styles.close}>Close</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    capturePopup: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    Titre: {
        fontSize: 25,
        color: '#3b4cca',
        fontWeight: 'bold',
    },
    close: {
        backgroundColor: '#3b4cca',
        borderRadius: 5,
        padding: 10,
        color: '#ffcb05',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        verticalAlign: 'bottom',
    },
})

export default CapturePokemon;