import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import PhotoList, { PhotoListState } from './PhotoList';
import { Photo } from '../api/UnsplashApiClient';
import { SearchScreenProps } from '../navigation/types';
import i18n from '../i18n/LocalizationManager';

interface SearchablePhotoListState extends PhotoListState {
    query: string;
}

export default class SearchPhotosList extends PhotoList<SearchScreenProps, SearchablePhotoListState> {
    public state: SearchablePhotoListState = {
        photos: [],
        query: '',
    };

    // Propiedad para guardar el temporizador del debounce
    private debounceTimer: NodeJS.Timeout | null = null;

    public constructor(props: SearchScreenProps) {
        super(props);
        props.navigation.setOptions({
            title: i18n.t('search'),
        });
    }

    /**
     * Al destruir el componente, limpiamos cualquier temporizador que haya quedado pendiente
     * para evitar memory leaks.
     */
    public componentWillUnmount() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
    }

    protected loadPage(page: number): Promise<{ photos: ReadonlyArray<Photo>; totalPages: number }> {
        // Si el query está vacío, buscamos "popular" por defecto.
        const queryToSearch = this.state.query.trim() === '' ? 'popular' : this.state.query;
        return this.apiClient.searchPhotos(queryToSearch, page);
    }

    /**
     * Este método se llama en cada cambio del TextInput.
     * Implementa la lógica de "debounce".
     */
    private onQueryChanged = (text: string) => {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.setState({ query: text });

        this.debounceTimer = setTimeout(() => {
            this.handleSearch();
        }, 500); // Espera 500ms antes de buscar
    };

    /**
     * Inicia una nueva búsqueda, reseteando la paginación y la lista de fotos.
     */
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