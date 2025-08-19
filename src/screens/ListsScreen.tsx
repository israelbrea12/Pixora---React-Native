import React, { Component } from 'react';
import { Text, FlatList, StyleSheet, ActivityIndicator, View } from 'react-native';
import { getPhotoListsWithPhotos, PhotoListWithPhotos } from '../services/DatabaseManager';
import { ListsScreenProps } from '../navigation/types';
import i18n from '../i18n/LocalizationManager';
import PhotoListCard from '../components/PhotoListCard';

interface State {
    lists: PhotoListWithPhotos[];
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
        const lists = await getPhotoListsWithPhotos();
        this.setState({ lists, isLoading: false });
    };

    handleListPress = (list: PhotoListWithPhotos) => {
        this.props.navigation.navigate('PhotoListDetail', {
            listId: list.id,
            listName: list.name,
        });
    };

    render() {
        if (this.state.isLoading) {
            return <ActivityIndicator style={styles.loader} />;
        }

        return (
            <View style={styles.container}>
                <FlatList
                    data={this.state.lists}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    renderItem={({ item }) => (
                        <PhotoListCard
                            list={item}
                            onPress={() => this.handleListPress(item)}
                        />
                    )}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>{i18n.t('noListsYet')}</Text>}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8'
    },
    listContainer: {
        padding: 8,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: 'gray',
    },
});