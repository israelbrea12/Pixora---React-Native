import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicon from 'react-native-vector-icons/Ionicons';
import FavoritesScreen from './FavoritesScreen';
import ListsScreen from './ListsScreen';
import MyPhotosScreen from './MyPhotosScreen';
import { LayoutContext } from '../context/LayoutContext';
import { LayoutMode, Language } from '../services/PreferencesManager';
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';
import { ProfileTabParamList, ProfileScreenProps } from '../navigation/types';
import { setLanguage } from '../i18n/LocalizationManager';
import i18n from '../i18n/LocalizationManager';

const TopTab = createMaterialTopTabNavigator<ProfileTabParamList>();

type MenuState = 'hidden' | 'main' | 'layout' | 'language';

interface ProfileScreenState {
    menuState: MenuState;
}

const ProfileTabNavigator = () => (
    <TopTab.Navigator
        screenOptions={{
            tabBarLabelStyle: { textTransform: 'none', fontWeight: '600' },
            tabBarIndicatorStyle: { backgroundColor: '#000' },
        }}
    >
        <TopTab.Screen
            name="MyPhotos"
            component={MyPhotosScreen}
            options={{ title: i18n.t('myPhotos') }} />
        <TopTab.Screen
            name="Lists"
            component={ListsScreen}
            options={{ title: i18n.t('lists') }}
        />
        <TopTab.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{ title: i18n.t('favorites') }}
        />
    </TopTab.Navigator>
);

export default class ProfileScreen extends Component<ProfileScreenProps, ProfileScreenState> {
    state: ProfileScreenState = {
        menuState: 'hidden',
    };

    openMenu = () => this.setState({ menuState: 'main' });
    closeMenu = () => this.setState({ menuState: 'hidden' });
    showLayoutMenu = () => this.setState({ menuState: 'layout' });
    showLanguageMenu = () => this.setState({ menuState: 'language' });

    render() {
        return (
            <LayoutContext.Consumer>
                {({ layoutMode, setLayoutMode }) => {
                    const handleSelectLayoutMode = (mode: LayoutMode) => {
                        setLayoutMode(mode);
                        this.closeMenu();
                    };
                    const handleSelectLanguage = (lang: Language) => {
                        setLanguage(lang);
                        this.closeMenu();
                    };

                    return (
                        <SafeAreaView style={styles.safeArea}>
                            <View style={styles.topBarContainer}>
                                <View style={styles.topBarLeft} />
                                <Text style={styles.topBarTitle}>{i18n.t('myProfile')}</Text>
                                <View style={styles.topBarActions}>
                                    <TouchableOpacity onPress={() => { }}>
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
                                                            <Text style={styles.menuItemText}>{i18n.t('viewMode')}</Text>
                                                        </View>
                                                    </MenuOption>
                                                    { }
                                                    <MenuOption onSelect={this.showLanguageMenu}>
                                                        <View style={styles.menuItem}>
                                                            <Ionicon name="language-outline" size={22} color="#333" />
                                                            <Text style={styles.menuItemText}>{i18n.t('language')}</Text>
                                                        </View>
                                                    </MenuOption>
                                                </>
                                            )}
                                            {this.state.menuState === 'layout' && (
                                                <>
                                                    <MenuOption onSelect={this.openMenu}>
                                                        <View style={styles.menuItem}>
                                                            <Ionicon name="arrow-back" size={22} color="#333" />
                                                            <Text style={styles.menuItemText}>{i18n.t('viewMode')}</Text>
                                                        </View>
                                                    </MenuOption>
                                                    <View style={styles.divider} />
                                                    <MenuOption onSelect={() => handleSelectLayoutMode('masonry')}>
                                                        <View style={styles.menuItem}>
                                                            <Text style={styles.menuItemText}>{i18n.t('mosaic')}</Text>
                                                            {layoutMode === 'masonry' && <Ionicon name="checkmark" size={22} color="#007AFF" />}
                                                        </View>
                                                    </MenuOption>
                                                    <MenuOption onSelect={() => handleSelectLayoutMode('list')}>
                                                        <View style={styles.menuItem}>
                                                            <Text style={styles.menuItemText}>{i18n.t('list')}</Text>
                                                            {layoutMode === 'list' && <Ionicon name="checkmark" size={22} color="#007AFF" />}
                                                        </View>
                                                    </MenuOption>
                                                </>
                                            )}
                                            {this.state.menuState === 'language' && (
                                                <>
                                                    <MenuOption onSelect={this.openMenu}>
                                                        <View style={styles.menuItem}>
                                                            <Ionicon name="arrow-back" size={22} color="#333" />
                                                            <Text style={[styles.menuItemText, { fontWeight: 'bold' }]}>{i18n.t('language')}</Text>
                                                        </View>
                                                    </MenuOption>
                                                    <View style={styles.divider} />
                                                    <MenuOption onSelect={() => handleSelectLanguage('es')}>
                                                        <View style={styles.menuItem}>
                                                            <Text style={styles.menuItemText}>Español</Text>
                                                            {i18n.locale === 'es' && <Ionicon name="checkmark" size={22} color="#007AFF" />}
                                                        </View>
                                                    </MenuOption>
                                                    <MenuOption onSelect={() => handleSelectLanguage('en')}>
                                                        <View style={styles.menuItem}>
                                                            <Text style={styles.menuItemText}>English</Text>
                                                            {i18n.locale === 'en' && <Ionicon name="checkmark" size={22} color="#007AFF" />}
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
        width: 250,
    },
};