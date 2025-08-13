// src/screens/ListsScreen.tsx
import React, { Component } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getPhotoLists, PhotoListInfo } from '../services/DatabaseManager';

interface State {
    lists: PhotoListInfo[];
    isLoading: boolean;
}

export default class ListsScreen extends Component<any, State> {
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

    render() {
        if (this.state.isLoading) {
            return <ActivityIndicator style={{ flex: 1, marginTop: 20 }} />;
        }

        return (
            <FlatList
                data={this.state.lists}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.item}>
                        <Text style={styles.itemText}>{item.name}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Aún no has creado ninguna lista.</Text>}
            />
        );
    }
}

const styles = StyleSheet.create({
    item: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
    itemText: { fontSize: 18 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
});