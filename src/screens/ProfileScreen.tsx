import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Ionicon from 'react-native-vector-icons/Ionicons';
import PlaceholderScreen from './PlaceholderScreen';

// Creamos el navegador para las pestañas superiores
const TopTab = createMaterialTopTabNavigator();

// Componente para la barra superior personalizada
const ProfileTopBar = () => (
    <View style={styles.topBarContainer}>
        <View style={styles.topBarLeft} />
        <Text style={styles.topBarTitle}>Mi Perfil</Text>
        <View style={styles.topBarActions}>
            <TouchableOpacity onPress={() => { /* TODO */ }}>
                <Ionicon name="person-circle-outline" size={30} color="#333" style={styles.actionIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { /* TODO */ }}>
                <Ionicon name="settings-outline" size={26} color="#333" style={styles.actionIcon} />
            </TouchableOpacity>
        </View>
    </View>
);

// Navegador con las 3 pestañas
const ProfileTabNavigator = () => (
    <TopTab.Navigator
        screenOptions={{
            tabBarLabelStyle: {
                textTransform: 'none', // Para que no ponga los títulos en mayúsculas
                fontWeight: '600',
            },
            tabBarIndicatorStyle: {
                backgroundColor: '#000', // La línea que indica la pestaña activa
            },
        }}
    >
        <TopTab.Screen
            name="MyPhotos"
            component={PlaceholderScreen}
            options={{ title: 'Mis Fotos' }}
            initialParams={{ title: 'Mis Fotos' }}
        />
        <TopTab.Screen
            name="Lists"
            component={PlaceholderScreen}
            options={{ title: 'Listas' }}
            initialParams={{ title: 'Listas' }}
        />
        <TopTab.Screen
            name="Favorites"
            component={PlaceholderScreen}
            options={{ title: 'Favoritos' }}
            initialParams={{ title: 'Favoritos' }}
        />
    </TopTab.Navigator>
);

// La pantalla principal que une la barra y las pestañas
export default class ProfileScreen extends Component {
    render() {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ProfileTopBar />
                <ProfileTabNavigator />
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    topBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    topBarTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    topBarActions: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
    },
    topBarLeft: {
        flex: 1,
    },
    actionIcon: {
        marginLeft: 15,
    },
});