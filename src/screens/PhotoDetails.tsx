import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, ActivityIndicator, TouchableOpacity, SafeAreaView, Dimensions, Animated, NativeModules, Alert, PermissionsAndroid, Platform, Linking } from 'react-native';
import UnsplashApiClient, { Photo } from '../api/UnsplashApiClient';
import { PhotoDetailsScreenProps } from '../navigation/types';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { isPhotoSaved } from '../services/DatabaseManager';
import { addFavorite, removeFavorite, isFavorite } from '../services/DatabaseManager';


const AnimatedIonicon = Animated.createAnimatedComponent(Ionicon);

interface PhotoSaverInterface {
    savePhoto(url: string): Promise<string>;
}

const PhotoSaver = NativeModules.PhotoSaver as PhotoSaverInterface;

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
    private focusListener: any;
    private imageOpacity = new Animated.Value(0);
    private imageScale = new Animated.Value(0.9);
    private heartScale = new Animated.Value(1); // Escala para el corazón
    private saveButtonScale = new Animated.Value(1); // Escala para el botón de guardar

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
        isPhotoSaved(this.photoID).then(isSaved => {
            this.setState({ isSaved: isSaved });
        });
        this.checkStatus();
        this.focusListener = this.props.navigation.addListener('focus', this.checkStatus);
        Animated.parallel([
            // Animación de timing para la opacidad (de 0 a 1) [cite: 28, 35]
            Animated.timing(this.imageOpacity, {
                toValue: 1,
                duration: 600, // 600 milisegundos
                useNativeDriver: true,
            }),
            // Animación de spring para la escala (de 0.9 a 1 con rebote) [cite: 43, 52]
            Animated.spring(this.imageScale, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
            }),
        ]).start(); // Iniciamos la animación [cite: 70, 71]
    }

    public componentWillUnmount() {
        // Limpiamos el listener para evitar memory leaks al cerrar la pantalla
        if (this.focusListener) {
            this.props.navigation.removeListener('focus', this.checkStatus);
        }
    }

    componentDidUpdate(prevProps: PhotoDetailsScreenProps, prevState: PhotoDetailsState) {
        // Si el estado de 'isSaved' ha cambiado...
        if (prevState.isSaved !== this.state.isSaved) {
            this.saveButtonScale.setValue(0.9); // Lo hacemos un poco más pequeño
            Animated.timing(this.saveButtonScale, { // Usamos timing para un efecto más suave
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }

    // --- Funciones para simular interacciones ---
    private toggleFavorite = () => {
        // Animación de rebote para el corazón
        this.heartScale.setValue(0.8); // Lo hacemos un poco más pequeño
        Animated.spring(this.heartScale, {
            toValue: 1,
            friction: 3, // Controla la fuerza del "muelle"
            useNativeDriver: true,
        }).start();

        const { isFavorite, photo } = this.state;
        const newIsFavorite = !isFavorite;

        // La lógica de la base de datos se ejecuta de forma asíncrona
        const dbOperation = newIsFavorite ? addFavorite(photo) : removeFavorite(photo.id);
        dbOperation
            .then(() => {
                this.setState({ isFavorite: newIsFavorite });
            })
            .catch(error => {
                console.error("Failed to toggle favorite status:", error);
            });
    };

    private checkStatus = () => {
        isFavorite(this.photoID).then(isFav => {
            this.setState({ isFavorite: isFav });
        });
        isPhotoSaved(this.photoID).then(isSaved => {
            this.setState({ isSaved: isSaved });
        });
    }

    private openSaveToListScreen = () => {
        const { photo } = this.state;
        this.props.navigation.navigate('SaveToList', { photo });
    };

    private handleSavePhoto = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: "Permiso para guardar fotos",
                        message: "Esta app necesita acceso a tu almacenamiento para descargar la imagen.",
                        buttonPositive: "Aceptar",
                        buttonNegative: "Cancelar"
                    }
                );

                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    // Si el permiso fue otorgado, no hacemos nada aquí y dejamos que el código de abajo se ejecute.
                    console.log("Permiso de almacenamiento concedido.");
                } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                    // El usuario denegó el permiso y marcó "No volver a preguntar".
                    Alert.alert(
                        "Permiso denegado permanentemente",
                        "Has denegado el permiso para guardar fotos. Por favor, ve a los ajustes de la app para habilitarlo.",
                        [
                            { text: "Cancelar", style: "cancel" },
                            { text: "Abrir Ajustes", onPress: () => Linking.openSettings() } // Abre los ajustes de la app
                        ]
                    );
                    return; // Detenemos la ejecución
                } else {
                    // El usuario simplemente denegó el permiso esta vez.
                    Alert.alert("Permiso denegado", "No puedes guardar la foto sin aceptar el permiso.");
                    return; // Detenemos la ejecución
                }
            } catch (err) {
                console.warn(err);
                return;
            }
        }

        // El resto de la lógica (llamar a PhotoSaver.savePhoto) solo se ejecuta si los permisos están OK
        try {
            const result = await PhotoSaver.savePhoto(this.state.photo.urls.raw);
            Alert.alert("Éxito", result);
        } catch (error: any) {
            Alert.alert("Error al guardar", error.message);
        }
    };
    // --- Sub-componentes de renderizado ---

    private renderInteractionBar(photo: Photo) {
        const { isFavorite, isSaved } = this.state;

        // --- CAMBIO 5: Aplicamos los estilos de transformación animados ---
        const animatedHeartStyle = {
            transform: [{ scale: this.heartScale }],
        };
        const animatedSaveButtonStyle = {
            transform: [{ scale: this.saveButtonScale }],
        };

        return (
            <View style={styles.interactionBar}>
                <View style={styles.likesContainer}>
                    <TouchableOpacity onPress={this.toggleFavorite}>
                        {/* Usamos nuestro AnimatedIonicon y le aplicamos el estilo */}
                        <AnimatedIonicon
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            size={28}
                            color={isFavorite ? '#E91E63' : '#333'}
                            style={animatedHeartStyle}
                        />
                    </TouchableOpacity>
                    <Text style={styles.likesText}>{photo.likes.toLocaleString()}</Text>
                </View>

                <TouchableOpacity onPress={this.handleSavePhoto}>
                    <Ionicon name="download-outline" size={28} color="#333" />
                </TouchableOpacity>

                {/* Envolvemos el botón en un Animated.View para poder animarlo */}
                <Animated.View style={animatedSaveButtonStyle}>
                    <TouchableOpacity
                        onPress={this.openSaveToListScreen}
                        style={[styles.saveButton, isSaved && styles.saveButtonSaved]}
                    >
                        <Text style={styles.saveButtonText}>{isSaved ? 'Guardado' : 'Guardar'}</Text>
                    </TouchableOpacity>
                </Animated.View>
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
                            <Animated.Image
                                style={[
                                    styles.image,
                                    {
                                        height: imageHeight,
                                        opacity: this.imageOpacity, // Aplicamos la opacidad animada [cite: 18]
                                        transform: [{ scale: this.imageScale }] // Aplicamos la escala animada
                                    }
                                ]}
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