import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import PhotoList, { PhotoListState } from './PhotoList';
import { Photo } from '../api/UnsplashApiClient';
import { HomeScreenProps } from '../navigation/types';
import i18n from '../i18n/LocalizationManager';

const CATEGORIES = [
    { key: 'Popular', title: 'popular' },
    { key: 'Nature', title: 'nature' },
    { key: 'Technology', title: 'technology' },
    { key: 'Animals', title: 'animals' },
    { key: 'Food', title: 'food' }
];

interface HomeState extends PhotoListState {
    selectedCategory: string;
}

export default class HomeScreen extends PhotoList<HomeScreenProps, HomeState> {

    protected listLayout: 'list' | 'grid' = 'grid';

    public state: HomeState = {
        photos: [],
        selectedCategory: CATEGORIES[0].key,
    };

    public constructor(props: HomeScreenProps) {
        super(props);
        props.navigation.setOptions({
            title: i18n.t('pixora'),
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
                            key={category.key}
                            style={[
                                styles.categoryButton,
                                this.state.selectedCategory === category.key && styles.categoryButtonSelected,
                            ]}
                            onPress={() => this.onCategorySelected(category.key)}>
                            <Text
                                style={[
                                    styles.categoryText,
                                    this.state.selectedCategory === category.key && styles.categoryTextSelected,
                                ]}>
                                {i18n.t(category.title)}
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