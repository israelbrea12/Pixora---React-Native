import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import PhotoList, { PhotoListState } from '../components/PhotoList';
import { Photo } from '../api/UnsplashApiClient';
import { SearchScreenProps } from '../navigation/types';
import i18n from '../i18n/LocalizationManager';

interface SearchablePhotoListState extends PhotoListState {
    query: string;
}

export default class SearchScreen extends PhotoList<SearchScreenProps, SearchablePhotoListState> {

    protected listLayout: 'list' | 'grid' = 'grid';

    public state: SearchablePhotoListState = {
        photos: [],
        query: '',
    };

    private debounceTimer: NodeJS.Timeout | null = null;

    public constructor(props: SearchScreenProps) {
        super(props);
        props.navigation.setOptions({
            title: i18n.t('search'),
        });
    }

    public componentWillUnmount() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
    }

    protected loadPage(page: number): Promise<{ photos: ReadonlyArray<Photo>; totalPages: number }> {
        const queryToSearch = this.state.query.trim() === '' ? 'popular' : this.state.query;
        return this.apiClient.searchPhotos(queryToSearch, page);
    }

    private onQueryChanged = (text: string) => {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.setState({ query: text });

        this.debounceTimer = setTimeout(() => {
            this.handleSearch();
        }, 500);
    };

    private handleSearch = () => {
        this.nextPage = 1;
        this.totalPages = 1;
        this.setState({ photos: [] }, () => {
            this.loadNextPage();
        });
    };

    protected renderHeader(): React.ReactNode {
        return (
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder={i18n.t('searchPhotosPlaceholder')}
                    value={this.state.query}
                    onChangeText={this.onQueryChanged}
                    onSubmitEditing={this.handleSearch}
                    returnKeyType="search"
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    searchContainer: {
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchInput: {
        height: 40,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 15,
    },
});