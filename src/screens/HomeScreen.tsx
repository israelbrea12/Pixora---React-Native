// src/screens/HomeScreen.tsx

import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import PhotoList, { PhotoListState } from './PhotoList';
import { Photo } from '../api/UnsplashApiClient';
// --- CAMBIO 1: Importamos el tipo de props específico para esta pantalla ---
import { HomeScreenProps } from '../navigation/types';

const CATEGORIES = ['Popular', 'Nature', 'Technology', 'Animals', 'Food'];

interface HomeState extends PhotoListState {
    selectedCategory: string;
}

// --- CAMBIO 2: Le decimos a la clase que usará HomeScreenProps ---
export default class HomeScreen extends PhotoList<HomeScreenProps, HomeState> {
    public state: HomeState = {
        photos: [],
        selectedCategory: CATEGORIES[0],
    };

    // --- CAMBIO 3: El constructor ahora espera recibir HomeScreenProps ---
    public constructor(props: HomeScreenProps) {
        super(props);
        props.navigation.setOptions({
            title: 'Pixora',
        });
    }

    protected loadPage(page: number): Promise<{ photos: ReadonlyArray<Photo>; totalPages: number }> {
        return this.apiClient.searchPhotos(this.state.selectedCategory, page);
    }

    private onCategorySelected = (category: string) => {
        if (this.state.selectedCategory === category) {
            return;
        }

        this.nextPage = 1;
        this.totalPages = 1;
        // Usamos la forma funcional de setState para actualizar el estado de forma segura
        this.setState(
            prevState => ({ ...prevState, photos: [], selectedCategory: category }),
            () => {
                this.loadNextPage();
            }
        );
    };

    protected renderHeader(): React.ReactNode {
        return (
            <View style={styles.categoriesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {CATEGORIES.map(category => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryButton,
                                this.state.selectedCategory === category && styles.categoryButtonSelected,
                            ]}
                            onPress={() => this.onCategorySelected(category)}>
                            <Text
                                style={[
                                    styles.categoryText,
                                    this.state.selectedCategory === category && styles.categoryTextSelected,
                                ]}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    categoriesContainer: {
        paddingVertical: 10,
        paddingLeft: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    categoryButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginRight: 10,
        borderRadius: 18,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryButtonSelected: {
        backgroundColor: '#000',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    categoryTextSelected: {
        color: '#fff',
    },
});