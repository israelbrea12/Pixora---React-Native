// src/screens/SearchPhotosList.tsx

import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
// --- CAMBIO 1: Importamos también PhotoListState ---
import PhotoList, { PhotoListProps, PhotoListState } from './PhotoList';
import { Photo } from '../api/UnsplashApiClient';

// --- CAMBIO 2: Creamos un nuevo estado que extiende el del padre ---
interface SearchablePhotoListState extends PhotoListState {
    query: string;
}

// --- CAMBIO 3: Le pasamos nuestro nuevo estado a la clase padre genérica ---
export default class SearchPhotosList extends PhotoList<PhotoListProps, SearchablePhotoListState> {

    // --- CAMBIO 4: Definimos el estado inicial completo como una propiedad de clase ---
    public state: SearchablePhotoListState = {
        photos: [], // la propiedad que requiere el padre
        query: '',  // nuestra nueva propiedad
    };

    public constructor(props: PhotoListProps) {
        super(props);
        props.navigation.setOptions({
            title: 'Buscar',
        });
    }

    protected loadPage(page: number): Promise<{ photos: ReadonlyArray<Photo>, totalPages: number }> {
        return this.apiClient.searchPhotos(this.state.query, page);
    }

    private handleSearch = () => {
        this.nextPage = 1;
        this.totalPages = 1;
        this.setState({ photos: [] } as any, () => { // Usamos 'as any' aquí porque 'photos' no es el estado completo
            this.loadNextPage();
        });
    }

    protected renderHeader(): React.ReactNode {
        return (
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Busca fotos..."
                    value={this.state.query}
                    onChangeText={text => this.setState({ query: text })}
                    onSubmitEditing={this.handleSearch}
                    returnKeyType="search"
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    searchContainer: {
        padding: 10,
        backgroundColor: '#f0f0f0'
    },
    searchInput: {
        height: 40,
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#ddd'
    }
});