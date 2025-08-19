import React, { Component } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { getPhotoLists, PhotoListInfo } from '../services/DatabaseManager';
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
                    <TouchableOpacity
                        style={styles.itemContainer}
                        onPress={() => this.handleListPress(item)}
                    >
                        {item.lastPhotoUrl ? (
                            <Image source={{ uri: item.lastPhotoUrl }} style={styles.thumbnail} />
                        ) : (
                            <View style={styles.placeholder} />
                        )}
                        <Text style={styles.itemTitle}>{item.name}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>{i18n.t('noListsYet')}</Text>}
            />
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
    itemTitle: {
        fontSize: 17,
        marginLeft: 16,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: 'gray',
    },
});