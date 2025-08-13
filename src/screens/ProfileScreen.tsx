// src/screens/ProfileScreen.tsx

import React, { Component } from 'react';
// --- CAMBIO 1: Importamos 'Alert' para usar las alertas nativas ---
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Ionicon from 'react-native-vector-icons/Ionicons';
import PlaceholderScreen from './PlaceholderScreen';
import FavoritesScreen from './FavoritesScreen';
import { LayoutContext } from '../context/LayoutContext';
import { LayoutMode } from '../services/PreferencesManager';
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';
import { ProfileTabParamList } from '../navigation/types';

const TopTab = createMaterialTopTabNavigator<ProfileTabParamList>();

// --- Definimos los estados posibles del menú ---
type MenuState = 'hidden' | 'main' | 'layout';

// --- CAMBIO 2: Unificamos la definición del estado del componente ---
interface ProfileScreenState {
    menuState: MenuState;
}

// (El componente ProfileTabNavigator no cambia)
const ProfileTabNavigator = () => (
    <TopTab.Navigator
        screenOptions={{
            tabBarLabelStyle: { textTransform: 'none', fontWeight: '600' },
            tabBarIndicatorStyle: { backgroundColor: '#000' },
        }}
    >
        <TopTab.Screen name="MyPhotos" component={PlaceholderScreen} options={{ title: 'Mis Fotos' }} initialParams={{ title: 'Mis Fotos' }} />
        <TopTab.Screen name="Lists" component={PlaceholderScreen} options={{ title: 'Listas' }} initialParams={{ title: 'Listas' }} />
        <TopTab.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{ title: 'Favoritos' }}
        />
    </TopTab.Navigator>
);

export default class ProfileScreen extends Component<{}, ProfileScreenState> {
    // --- CAMBIO 3: Eliminamos 'declare context' y 'static contextType' para evitar el error de Babel ---

    // El estado ahora coincide con nuestra interfaz unificada
    state: ProfileScreenState = {
        menuState: 'hidden',
    };

    openMenu = () => this.setState({ menuState: 'main' });
    closeMenu = () => this.setState({ menuState: 'hidden' });
    showLayoutMenu = () => this.setState({ menuState: 'layout' });

    render() {
        return (
            // --- CAMBIO 4: Usamos LayoutContext.Consumer para acceder al contexto de forma segura ---
            <LayoutContext.Consumer>
                {({ layoutMode, setLayoutMode }) => {
                    const handleSelectLayoutMode = (mode: LayoutMode) => {
                        setLayoutMode(mode);
                        this.closeMenu();
                    };

                    return (
                        <SafeAreaView style={styles.safeArea}>
                            <View style={styles.topBarContainer}>
                                <View style={styles.topBarLeft} />
                                <Text style={styles.topBarTitle}>Mi Perfil</Text>
                                <View style={styles.topBarActions}>
                                    <TouchableOpacity onPress={() => { /* TODO */ }}>
                                        <Ionicon name="person-circle-outline" size={30} color="#333" style={styles.actionIcon} />
                                    </TouchableOpacity>
                                    <Menu opened={this.state.menuState !== 'hidden'} onBackdropPress={this.closeMenu}>
                                        <MenuTrigger onPress={this.openMenu}>
                                            <Ionicon name="settings-outline" size={26} color="#333" style={styles.actionIcon} />
                                        </MenuTrigger>
                                        <MenuOptions customStyles={menuOptionsStyles}>
                                            {this.state.menuState === 'main' && (
                                                <>
                                                    <MenuOption onSelect={this.showLayoutMenu}>
                                                        <View style={styles.menuItem}>
                                                            <Ionicon name="grid-outline" size={22} color="#333" />
                                                            <Text style={styles.menuItemText}>Modo de visualización</Text>
                                                        </View>
                                                    </MenuOption>
                                                    {/* --- CAMBIO 5: Usamos Alert.alert --- */}
                                                    <MenuOption onSelect={() => Alert.alert('Próximamente')}>
                                                        <View style={styles.menuItem}>
                                                            <Ionicon name="language-outline" size={22} color="#333" />
                                                            <Text style={styles.menuItemText}>Idioma</Text>
                                                        </View>
                                                    </MenuOption>
                                                </>
                                            )}
                                            {this.state.menuState === 'layout' && (
                                                <>
                                                    <MenuOption onSelect={this.openMenu}>
                                                        <View style={styles.menuItem}>
                                                            <Ionicon name="arrow-back" size={22} color="#333" />
                                                            <Text style={[styles.menuItemText, { fontWeight: 'bold' }]}>Modo de visualización</Text>
                                                        </View>
                                                    </MenuOption>
                                                    <View style={styles.divider} />
                                                    <MenuOption onSelect={() => handleSelectLayoutMode('masonry')}>
                                                        <View style={styles.menuItem}>
                                                            <Text style={styles.menuItemText}>Mosaico</Text>
                                                            {layoutMode === 'masonry' && <Ionicon name="checkmark" size={22} color="#007AFF" />}
                                                        </View>
                                                    </MenuOption>
                                                    <MenuOption onSelect={() => handleSelectLayoutMode('list')}>
                                                        <View style={styles.menuItem}>
                                                            <Text style={styles.menuItemText}>Lista</Text>
                                                            {layoutMode === 'list' && <Ionicon name="checkmark" size={22} color="#007AFF" />}
                                                        </View>
                                                    </MenuOption>
                                                </>
                                            )}
                                        </MenuOptions>
                                    </Menu>
                                </View>
                            </View>
                            <ProfileTabNavigator />
                        </SafeAreaView>
                    );
                }}
            </LayoutContext.Consumer>
        );
    }
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    topBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    topBarTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
    topBarActions: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
    topBarLeft: { flex: 1 },
    actionIcon: { marginLeft: 15 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15 },
    menuItemText: { marginLeft: 15, fontSize: 16, flex: 1 },
    divider: { height: 1, backgroundColor: '#eee' },
});

const menuOptionsStyles = {
    optionsContainer: {
        borderRadius: 12,
        paddingVertical: 5,
        marginTop: 40,
        width: 250, // Damos un ancho fijo para que se vea mejor
    },
};