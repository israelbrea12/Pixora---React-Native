// src/screens/PhotoList.tsx

import React, { Component } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import UnsplashApiClient, { Photo } from '../api/UnsplashApiClient';
import PhotoGridItem from '../components/PhotoGridItem';
import { HomeScreenProps, SearchScreenProps } from '../navigation/types';

type PhotoEntry = {
    key: string;
    photo: Photo;
};

type PhotoListNavProps = HomeScreenProps | SearchScreenProps;

export interface PhotoListState {
    photos: ReadonlyArray<PhotoEntry>;
}


export default abstract class PhotoList<
    P extends PhotoListNavProps = PhotoListNavProps,
    S extends PhotoListState = PhotoListState
> extends Component<P, S> {
    protected apiClient: UnsplashApiClient = new UnsplashApiClient();
    protected nextPage: number = 1;
    protected loading: boolean = false;
    protected totalPages: number = 1;

    public constructor(props: P) {
        super(props);
        this.state = { photos: [] } as unknown as S;
    }

    // ... el resto del fichero se queda igual ...

    public componentDidMount() {
        if (this.state.photos.length === 0) {
            this.loadNextPage();
        }
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