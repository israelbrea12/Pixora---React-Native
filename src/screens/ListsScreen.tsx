// src/screens/ListsScreen.tsx
import React, { Component } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getPhotoLists, PhotoListInfo } from '../services/DatabaseManager';
import { CompositeScreenProps } from '@react-navigation/native';
import { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';
import { ProfileTabParamList, RootStackParamList } from '../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ListsScreenProps } from '../navigation/types';
import i18n from '../i18n/LocalizationManager';

interface State {
    lists: PhotoListInfo[];
    isLoading: boolean;
}

export default class ListsScreen extends Component<ListsScreenProps, State> {
    state: State = { lists: [], isLoading: true };

    private focusListener: any;

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', this.loadLists);
    }

    componentWillUnmount() {
        if (this.focusListener) {
            this.focusListener();
        }
    }

    loadLists = async () => {
        this.setState({ isLoading: true });
        const lists = await getPhotoLists();
        this.setState({ lists, isLoading: false });
    };

    handleListPress = (list: PhotoListInfo) => {
        // Ahora la llamada a navigate es 100% correcta y segura
        this.props.navigation.navigate('PhotoListDetail', {
            listId: list.id,
            listName: list.name,
        });
    };

    render() {
        if (this.state.isLoading) {
            return <ActivityIndicator style={{ flex: 1, marginTop: 20 }} />;
        }

        return (
            <FlatList
                data={this.state.lists}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    // --- CAMBIO: Hacemos el TouchableOpacity funcional ---
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => this.handleListPress(item)}
                    >
                        <Text style={styles.itemText}>{item.name}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>{i18n.t('noListsYet')}</Text>}
            />
        );
    }
}

const styles = StyleSheet.create({
    item: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
    itemText: { fontSize: 18 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
});