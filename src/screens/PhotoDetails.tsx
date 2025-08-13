import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    SafeAreaView,
    Dimensions
} from 'react-native';
import UnsplashApiClient, { Photo } from '../api/UnsplashApiClient';
import { PhotoDetailsScreenProps } from '../navigation/types';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { addFavorite, removeFavorite, isFavorite } from '../services/DatabaseManager';

// Estado local para la vista, incluyendo el estado de la UI
interface PhotoDetailsState {
    photo: Photo;
    isLoading: boolean;
    isFavorite: boolean; // Para simular si es favorito
    isSaved: boolean;    // Para simular si está guardado
}

export default class PhotoDetails extends Component<PhotoDetailsScreenProps, PhotoDetailsState> {
    private apiClient: UnsplashApiClient = new UnsplashApiClient();
    private photoID: string;

    public constructor(props: PhotoDetailsScreenProps) {
        super(props);
        const { photo } = props.route.params;
        this.photoID = photo.id;

        this.state = {
            photo: photo,
            isLoading: true,
            isFavorite: false, // Valor inicial para la demo
            isSaved: false,    // Valor inicial para la demo
        };

        // Ya no necesitamos setOptions para el título porque el header está oculto
    }

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
        isFavorite(this.photoID).then(isFav => {
            this.setState({ isFavorite: isFav });
        });
    }

    // --- Funciones para simular interacciones ---
    private toggleFavorite = async () => {
        const { isFavorite, photo } = this.state;
        const newIsFavorite = !isFavorite;

        try {
            if (newIsFavorite) {
                // Si no era favorita, la añadimos
                await addFavorite(photo);
            } else {
                // Si ya era favorita, la eliminamos
                await removeFavorite(photo.id);
            }
            // Actualizamos el estado de la UI solo si la operación en la BD fue exitosa
            this.setState({ isFavorite: newIsFavorite });
        } catch (error) {
            console.error("Failed to toggle favorite status:", error);
        }
    };

    private toggleSaved = () => {
        this.setState(prevState => ({ isSaved: !prevState.isSaved }));
    };

    // --- Sub-componentes de renderizado ---

    private renderInteractionBar(photo: Photo) {
        const { isFavorite, isSaved } = this.state;
        return (
            <View style={styles.interactionBar}>
                {/* Sección de "Me gusta" */}
                <View style={styles.likesContainer}>
                    <TouchableOpacity onPress={this.toggleFavorite}>
                        <Ionicon
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            size={28}
                            color={isFavorite ? '#E91E63' : '#333'}
                        />
                    </TouchableOpacity>
                    <Text style={styles.likesText}>{photo.likes.toLocaleString()}</Text>
                </View>

                {/* Botón de Guardar */}
                <TouchableOpacity
                    onPress={this.toggleSaved}
                    style={[styles.saveButton, isSaved && styles.saveButtonSaved]}
                >
                    <Text style={styles.saveButtonText}>{isSaved ? 'Guardado' : 'Guardar'}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    private renderUserInfo(photo: Photo) {
        return (
            <View style={styles.userInfoContainer}>
                <Image
                    style={styles.photographerImage}
                    source={{ uri: photo.user.profile_image.medium }}
                />
                <View style={styles.photographerTextContainer}>
                    <Text style={styles.photographerName}>{photo.user.name}</Text>
                    <Text style={styles.photographerUsername}>@{photo.user.username}</Text>
                </View>
            </View>
        );
    }

    private renderDescription(photo: Photo) {
        const description = photo.description || photo.alt_description;
        if (!description) return null;

        return (
            <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>{description}</Text>
                <View style={styles.divider} />
            </View>
        );
    }

    public render() {
        if (this.state.isLoading && !this.state.photo.urls.regular) {
            return <ActivityIndicator size="large" style={styles.loader} />;
        }

        const { photo } = this.state;
        const imageWidth = Dimensions.get('window').width;
        const imageHeight = (imageWidth * photo.height) / photo.width;

        return (
            // El SafeAreaView sigue siendo el contenedor principal
            <SafeAreaView style={styles.safeArea}>
                {/* --- CAMBIO: Añadimos un View contenedor --- */}
                {/* Este View ocupará todo el espacio DENTRO del área segura */}
                <View style={styles.wrapper}>
                    <ScrollView>
                        <View style={styles.container}>
                            <Image
                                style={[styles.image, { height: imageHeight }]}
                                source={{ uri: photo.urls.regular }}
                            />
                            {this.renderInteractionBar(photo)}
                            {this.renderUserInfo(photo)}
                            {this.renderDescription(photo)}
                        </View>
                    </ScrollView>

                    {/* El botón ahora es hijo del View wrapper, no del SafeAreaView */}
                    <TouchableOpacity
                        onPress={() => this.props.navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicon name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
}


// --- NUEVOS ESTILOS ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    wrapper: {
        flex: 1,
        position: 'relative', // Necesario para que 'absolute' funcione correctamente dentro
    },
    container: {
        paddingBottom: 40,
    },
    image: {
        width: '100%',
        backgroundColor: '#e1e4e8',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    interactionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    likesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    likesText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    saveButton: {
        backgroundColor: '#007AFF', // Azul primario
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    saveButtonSaved: {
        backgroundColor: '#797979ff', // Verde para "guardado"
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    photographerImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    photographerTextContainer: {
        marginLeft: 12,
    },
    photographerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    photographerUsername: {
        fontSize: 14,
        color: 'gray',
    },
    descriptionContainer: {
        paddingHorizontal: 20,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginTop: 20,
    },
});