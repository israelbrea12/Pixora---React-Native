// src/screens/PhotoList.tsx

import React, { Component } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import UnsplashApiClient, { Photo } from '../api/UnsplashApiClient';
import PhotoGridItem from '../components/PhotoGridItem';

type PhotoEntry = {
    key: string;
    photo: Photo;
};

export interface PhotoListProps {
    navigation: any;
}

// Este es el "contrato" base del estado. Todas las clases hijas deben tener, como mínimo, 'photos'.
export interface PhotoListState {
    photos: ReadonlyArray<PhotoEntry>;
}

// Aceptará un tipo para Props (P) y un tipo para State (S).
// Forzamos a que el estado 'S' sea siempre una extensión de 'PhotoListState'.
export default abstract class PhotoList<
    P extends PhotoListProps = PhotoListProps,
    S extends PhotoListState = PhotoListState
> extends Component<P, S> {
    protected apiClient: UnsplashApiClient = new UnsplashApiClient();
    protected nextPage: number = 1;
    protected loading: boolean = false;
    protected totalPages: number = 1;

    public constructor(props: P) {
        super(props);
        // Le decimos a TypeScript: "Confía en mí, el estado inicial es compatible con S".
        this.state = { photos: [] } as unknown as S;
    }

    public componentDidMount() {
        this.loadNextPage();
    }

    public loadNextPage() {
        if (this.nextPage > this.totalPages) {
            return;
        }
        if (this.loading) {
            return;
        }

        this.loading = true;

        this.loadPage(this.nextPage)
            .then(({ photos, totalPages }) => {
                const photoEntries = photos.map(photo => ({
                    key: photo.id,
                    photo: photo,
                }));
                // Usamos un callback en setState para asegurar que el estado se concatena correctamente
                this.setState(prevState => ({
                    ...prevState,
                    photos: [...prevState.photos, ...photoEntries],
                }));
                this.nextPage++;
                this.totalPages = totalPages;
            })
            .catch(error => {
                console.error(error);
            })
            .finally(() => {
                this.loading = false;
            });
    }

    protected abstract loadPage(page: number): Promise<{ photos: ReadonlyArray<Photo>, totalPages: number }>;

    public render() {
        return (
            <View style={styles.container}>
                {this.renderHeader()}
                <FlatList
                    data={this.state.photos}
                    renderItem={this.renderGridItem.bind(this)}
                    onEndReached={() => this.loadNextPage()}
                    onEndReachedThreshold={0.5}
                    numColumns={2}
                    keyExtractor={item => item.key}
                />
            </View>
        );
    }

    protected renderHeader(): React.ReactNode | null {
        return null;
    }

    private renderGridItem(rowInfo: { item: PhotoEntry }) {
        const { photo } = rowInfo.item;

        return (
            <PhotoGridItem
                imageURI={photo.urls.small}
                imageWidth={photo.width}
                imageHeight={photo.height}
                onPress={() => this.onPhotoPressed(photo)}
            />
        );
    }

    private onPhotoPressed(photo: Photo) {
        this.props.navigation.navigate('photoDetails', { photo: photo });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});