// src/screens/PlaceholderScreen.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 1. Hacemos que las props sean opcionales usando el signo '?'
interface PlaceholderProps {
    route?: {
        params?: {
            title?: string;
        }
    }
}

const PlaceholderScreen = (props: PlaceholderProps) => {
    // 2. Usamos "encadenamiento opcional" (?.) para acceder al título de forma segura
    // y le damos un valor por defecto por si no viniera nada.
    const title = props.route?.params?.title || 'Pantalla';

    return (
        <View style={styles.container}>
            <Text style={styles.text}>{title}</Text>
            <Text style={styles.subtitle}>En construcción 🏗️</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        color: 'gray',
        marginTop: 8
    }
});

export default PlaceholderScreen;