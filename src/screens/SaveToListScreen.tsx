// src/screens/SaveToListScreen.tsx
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SaveToListScreenProps } from '../navigation/types';
import { PhotoListInfo, getPhotoLists, createPhotoList, addPhotoToList } from '../services/DatabaseManager';
import Ionicon from 'react-native-vector-icons/Ionicons';
import PromptModal from '../components/PromptModal';
import i18n from '../i18n';

interface State {
    lists: PhotoListInfo[];
    isPromptVisible: boolean; // Estado para controlar nuestro modal
}

export default class SaveToListScreen extends Component<SaveToListScreenProps, State> {

    state: State = {
        lists: [],
        isPromptVisible: false, // Inicialmente oculto
    };

    componentDidMount() {
        // Ponemos un título al modal
        this.props.navigation.setOptions({ title: i18n.t('saveTo') });
        this.fetchLists();
    }

    fetchLists = async () => {
        const lists = await getPhotoLists();
        this.setState({ lists });
    };

    handleCreateList = () => {
        this.setState({ isPromptVisible: true });
    };

    submitNewList = async (name: string) => {
        this.setState({ isPromptVisible: false }); // Cerramos el modal
        if (name && name.trim().length > 0) {
            try {
                await createPhotoList(name.trim());
                this.fetchLists(); // Refrescamos la lista
            } catch (e) {
                Alert.alert(i18n.t('error'), i18n.t('listExistsError'));
            }
        }
    };

    handleSelectList = async (list: PhotoListInfo) => {
        const { photo } = this.props.route.params;
        try {
            // --- CAMBIO: Pasamos el nombre de la lista a la función ---
            await addPhotoToList(list.id, photo, list.name);
            Alert.alert(i18n.t('saved'), i18n.t('photoSavedToList', { listName: list.name }));
            this.props.navigation.goBack();
        } catch (e) {
            Alert.alert(i18n.t('error'), i18n.t('photoSaveError'));
        }
    };

    render() {
        return (
            <View style={{ flex: 1 }}>
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
                            <Text style={[styles.itemTitle, { color: '#007AFF', fontWeight: 'bold' }]}>{i18n.t('createNewList')}</Text>
                        </TouchableOpacity>
                    }
                />
                <PromptModal
                    visible={this.state.isPromptVisible}
                    title={i18n.t('newList')}
                    message={i18n.t('newListMessage')}
                    onCancel={() => this.setState({ isPromptVisible: false })}
                    onSubmit={this.submitNewList}
                />
            </View>
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