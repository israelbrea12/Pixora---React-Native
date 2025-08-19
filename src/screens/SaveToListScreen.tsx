import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Image } from 'react-native';
import { SaveToListScreenProps } from '../navigation/types';
import { PhotoListInfo, getPhotoLists, createPhotoList, addPhotoToList } from '../services/DatabaseManager';
import Ionicon from 'react-native-vector-icons/Ionicons';
import PromptModal from '../components/PromptModal';
import i18n from '../i18n/LocalizationManager';

interface State {
    lists: PhotoListInfo[];
    isPromptVisible: boolean;
}

export default class SaveToListScreen extends Component<SaveToListScreenProps, State> {

    state: State = {
        lists: [],
        isPromptVisible: false,
    };

    componentDidMount() {
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
        this.setState({ isPromptVisible: false });
        if (name && name.trim().length > 0) {
            try {
                await createPhotoList(name.trim());
                this.fetchLists();
            } catch (e) {
                Alert.alert(i18n.t('error'), i18n.t('listExistsError'));
            }
        }
    };

    handleSelectList = async (list: PhotoListInfo) => {
        const { photo } = this.props.route.params;
        try {
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
                            {item.lastPhotoUrl ? (
                                <Image source={{ uri: item.lastPhotoUrl }} style={styles.thumbnail} />
                            ) : (
                                <View style={styles.placeholder} />
                            )}
                            <Text style={styles.itemTitle}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                    ListHeaderComponent={
                        <TouchableOpacity style={styles.itemContainer} onPress={this.handleCreateList}>
                            <View style={[styles.placeholder, styles.addIconContainer]}>
                                <Ionicon name="add" size={28} color="#007AFF" />
                            </View>
                            <Text style={[styles.itemTitle, { color: '#007AFF' }]}>{i18n.t('createNewList')}</Text>
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
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#e1e4e8',
    },
    placeholder: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#e1e4e8',
    },
    addIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: '#007AFF',
        borderStyle: 'dashed',
    },
    itemTitle: {
        fontSize: 17,
        marginLeft: 16,
        flex: 1,
    },
});