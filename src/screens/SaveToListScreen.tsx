// src/screens/SaveToListScreen.tsx
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SaveToListScreenProps } from '../navigation/types';
import { PhotoListInfo, getPhotoLists, createPhotoList, addPhotoToList } from '../services/DatabaseManager';
import Ionicon from 'react-native-vector-icons/Ionicons';

interface State {
    lists: PhotoListInfo[];
}

export default class SaveToListScreen extends Component<SaveToListScreenProps, State> {

    state: State = {
        lists: [],
    };

    componentDidMount() {
        // Ponemos un título al modal
        this.props.navigation.setOptions({ title: 'Guardar en...' });
        this.fetchLists();
    }

    fetchLists = async () => {
        const lists = await getPhotoLists();
        this.setState({ lists });
    };

    handleCreateList = () => {
        Alert.prompt(
            "Nueva Lista",
            "Introduce el nombre para tu nueva lista.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Crear",
                    onPress: async (name) => {
                        if (name && name.trim().length > 0) {
                            try {
                                await createPhotoList(name.trim());
                                this.fetchLists(); // Refrescamos
                            } catch (e) {
                                Alert.alert("Error", "Ya existe una lista con ese nombre.");
                            }
                        }
                    },
                },
            ],
            "plain-text"
        );
    };

    handleSelectList = async (list: PhotoListInfo) => {
        const { photo } = this.props.route.params;
        try {
            await addPhotoToList(list.id, photo);
            Alert.alert("Guardado", `La foto se ha añadido a "${list.name}".`);
            this.props.navigation.goBack();
        } catch (e) {
            Alert.alert("Error", "No se pudo guardar la foto en la lista.");
        }
    };

    render() {
        return (
            <FlatList
                data={this.state.lists}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.itemContainer} onPress={() => this.handleSelectList(item)}>
                        <Text style={styles.itemTitle}>{item.name}</Text>
                    </TouchableOpacity>
                )}
                ListHeaderComponent={
                    <TouchableOpacity style={styles.itemContainer} onPress={this.handleCreateList}>
                        <Ionicon name="add" size={24} color="#007AFF" />
                        <Text style={[styles.itemTitle, { color: '#007AFF', fontWeight: 'bold' }]}>Crear nueva lista</Text>
                    </TouchableOpacity>
                }
            />
        );
    }
}

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemTitle: {
        fontSize: 18,
        marginLeft: 10,
    },
});