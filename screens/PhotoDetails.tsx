// src/screens/PhotoDetails.tsx

import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, ActivityIndicator } from 'react-native';
import UnsplashApiClient, { Photo } from '../api/UnsplashApiClient';
// --- CAMBIO: Importamos el tipo de props desde nuestro nuevo fichero ---
import { PhotoDetailsScreenProps } from '../navigation/types';

// La interfaz 'PhotoDetailsProps' ya no es necesaria, la reemplazamos por PhotoDetailsScreenProps.

interface PhotoDetailsState {
    photo: Photo;
    isLoading: boolean;
}

// --- CAMBIO: Usamos el nuevo tipo de props ---
export default class PhotoDetails extends Component<PhotoDetailsScreenProps, PhotoDetailsState> {
    private apiClient: UnsplashApiClient = new UnsplashApiClient();
    private photoID: string;

    public constructor(props: PhotoDetailsScreenProps) {
        super(props);
        // Ahora 'route.params' está fuertemente tipado. ¡No más 'any'!
        const { photo } = props.route.params;
        this.photoID = photo.id;

        this.state = {
            photo: photo,
            isLoading: true,
        };

        props.navigation.setOptions({
            title: photo.alt_description || 'Detalle de la foto',
        });
    }

    // ...el resto del componente no cambia...
    public componentDidMount() {
        this.apiClient
            .getPhotoDetails(this.photoID)
            .then(fullPhotoDetails => {
                this.setState({ photo: fullPhotoDetails, isLoading: false });
            })
            .catch(error => {
                console.error(error);
                this.setState({ isLoading: false });
            });
    }

    public render() {
        if (this.state.isLoading && !this.state.photo.urls.regular) {
            return <ActivityIndicator size="large" style={styles.loader} />
        }

        const { photo } = this.state;
        const imageAspectRatio = photo.height / photo.width;

        return (
            <ScrollView contentContainerStyle={styles.container}>
                <Image
                    style={[styles.image, { aspectRatio: imageAspectRatio }]}
                    source={{ uri: photo.urls.regular }}
                    resizeMode="contain"
                />
                {this.renderPhotographerInfo(photo)}
                {this.renderDescription(photo)}
                {this.renderStats(photo)}
            </ScrollView>
        );
    }

    private renderPhotographerInfo(photo: Photo) {
        return (
            <View style={styles.photographerContainer}>
                <Image
                    style={styles.photographerImage}
                    source={{ uri: photo.user.profile_image.medium }}
                />
                <View style={styles.photographerText}>
                    <Text style={styles.photographerName}>{photo.user.name}</Text>
                    <Text style={styles.photographerUsername}>@{photo.user.username}</Text>
                </View>
            </View>
        );
    }

    private renderDescription(photo: Photo) {
        const description = photo.description || photo.alt_description;
        if (!description) return null;
        return <Text style={styles.description}>{description}</Text>;
    }

    private renderStats(photo: Photo) {
        return (
            <View style={styles.statsContainer}>
                <Text style={styles.statsText}>❤️ {photo.likes} Me gusta</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 20,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    image: {
        width: '100%',
        backgroundColor: '#e1e4e8',
    },
    photographerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    photographerImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    photographerText: {
        marginLeft: 10,
    },
    photographerName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    photographerUsername: {
        color: 'gray',
    },
    description: {
        paddingHorizontal: 15,
        fontSize: 15,
        lineHeight: 22,
    },
    statsContainer: {
        paddingHorizontal: 15,
        marginTop: 10
    },
    statsText: {
        fontWeight: 'bold',
        color: '#333'
    }
});