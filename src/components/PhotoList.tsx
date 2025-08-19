import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UnsplashApiClient, { Photo } from '../api/UnsplashApiClient';
import { RootStackParamList } from '../navigation/types';
import { LayoutContext } from '../context/LayoutContext';
import MasonryList from './MasonryList';
import LinearList from './LinearList';

export type PhotoEntry = {
    key: string;
    photo: Photo;
};

type PhotoListNavProps = {
    navigation: {
        navigate<RouteName extends keyof RootStackParamList>(
            ...args: undefined extends RootStackParamList[RouteName]
                ? [RouteName] | [RouteName, RootStackParamList[RouteName]]
                : [RouteName, RootStackParamList[RouteName]]
        ): void;
        addListener: (type: 'focus', callback: () => void) => () => void;
        removeListener: (type: 'focus', callback: () => void) => void;
    };
    route: any;
};

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
    protected listLayout: 'list' | 'grid' = 'list';

    public render() {
        return (
            <SafeAreaView style={styles.safeArea}>
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
                                    layout={this.listLayout}
                                />
                            )}
                        </View>
                    )}
                </LayoutContext.Consumer>
            </SafeAreaView>
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
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});