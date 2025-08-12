import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from "@shopify/flash-list";
import UnsplashApiClient, { Photo } from '../api/UnsplashApiClient';
import PhotoGridItem from '../components/PhotoGridItem';
import { HomeScreenProps, SearchScreenProps } from '../navigation/types';
import { LayoutContext } from '../context/LayoutContext'; // Importamos el contexto
import MasonryList from '../components/MasonryList'; // Importamos las nuevas listas
import LinearList from '../components/LinearList';

export type PhotoEntry = {
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
    //declare context: React.ContextType<typeof LayoutContext>;
    //static contextType = LayoutContext;
    protected apiClient: UnsplashApiClient = new UnsplashApiClient();
    protected nextPage: number = 1;
    protected loading: boolean = false;
    protected totalPages: number = 1;

    public constructor(props: P) {
        super(props);
        this.state = { photos: [] } as unknown as S;
    }

    public componentDidMount() {
        if (this.state.photos.length === 0) {
            this.loadNextPage();
        }
    }

    public loadNextPage = () => {
        if (this.nextPage > this.totalPages || this.loading) {
            return;
        }

        this.loading = true;
        this.forceUpdate();

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
                this.forceUpdate();
            });
    }

    protected abstract loadPage(page: number): Promise<{ photos: ReadonlyArray<Photo>, totalPages: number }>;

    public render() {
        return (
            <LayoutContext.Consumer>
                {({ layoutMode }) => (
                    <View style={styles.container}>
                        {this.renderHeader()}
                        {layoutMode === 'masonry' ? (
                            <MasonryList
                                photos={this.state.photos}
                                onEndReached={this.loadNextPage}
                                onPhotoPress={this.onPhotoPressed}
                                isLoading={this.loading}
                            />
                        ) : (
                            <LinearList
                                photos={this.state.photos}
                                onEndReached={this.loadNextPage}
                                onPhotoPress={this.onPhotoPressed}
                                isLoading={this.loading}
                            />
                        )}
                    </View>
                )}
            </LayoutContext.Consumer>
        );
    }

    protected renderHeader(): React.ReactNode | null {
        return null;
    }

    private onPhotoPressed = (photo: Photo) => {
        this.props.navigation.navigate('photoDetails', { photo: photo });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});