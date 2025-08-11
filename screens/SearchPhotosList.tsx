// src/screens/SearchPhotosList.tsx

import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import PhotoList, { PhotoListState } from './PhotoList';
import { Photo } from '../api/UnsplashApiClient';
// --- CAMBIO 1: Importamos el tipo de props específico para esta pantalla ---
import { SearchScreenProps } from '../navigation/types';

interface SearchablePhotoListState extends PhotoListState {
    query: string;
}

// --- CAMBIO 2: Le decimos a la clase que usará SearchScreenProps ---
export default class SearchPhotosList extends PhotoList<SearchScreenProps, SearchablePhotoListState> {
    public state: SearchablePhotoListState = {
        photos: [],
        query: '',
    };

    // --- CAMBIO 3: El constructor ahora espera recibir SearchScreenProps ---
    public constructor(props: SearchScreenProps) {
        super(props);
        // Ya no es necesario setOptions aquí si lo pones en App.tsx, pero lo dejamos por si acaso.
        props.navigation.setOptions({
            title: 'Buscar',
        });
    }

    protected loadPage(page: number): Promise<{ photos: ReadonlyArray<Photo>; totalPages: number }> {
        return this.apiClient.searchPhotos(this.state.query, page);
    }

    private handleSearch = () => {
        this.nextPage = 1;
        this.totalPages = 1;
        // --- CAMBIO 4: Usamos la forma funcional y segura de setState, eliminando 'as any' ---
        this.setState(
            prevState => ({ ...prevState, photos: [] }), // Solo limpiamos las fotos, mantenemos la query actual
            () => {
                this.loadNextPage();
            }
        );
    };

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
        );
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