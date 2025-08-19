import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, ActivityIndicator, TouchableOpacity, SafeAreaView, Dimensions, Animated, NativeModules, Alert, PermissionsAndroid, Platform, Linking } from 'react-native';
import UnsplashApiClient, { Photo } from '../api/UnsplashApiClient';
import { PhotoDetailsScreenProps } from '../navigation/types';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { isPhotoSaved } from '../services/DatabaseManager';
import { addFavorite, removeFavorite, isFavorite } from '../services/DatabaseManager';
import i18n from '../i18n/LocalizationManager';
import { DoubleTapImage } from '../components/DoubleTapImage';


const AnimatedIonicon = Animated.createAnimatedComponent(Ionicon);

interface PhotoSaverInterface {
    savePhoto(url: string): Promise<string>;
}

const PhotoSaver = NativeModules.PhotoSaver as PhotoSaverInterface;

interface PhotoDetailsState {
    photo: Photo;
    isLoading: boolean;
    isFavorite: boolean;
    isSaved: boolean;
    isDownloading: boolean;
}

export default class PhotoDetails extends Component<PhotoDetailsScreenProps, PhotoDetailsState> {
    private apiClient: UnsplashApiClient = new UnsplashApiClient();
    private photoID: string;
    private focusListener: any;
    private imageOpacity = new Animated.Value(0);
    private imageScale = new Animated.Value(0.9);
    private heartScale = new Animated.Value(1);
    private saveButtonScale = new Animated.Value(1);

    public constructor(props: PhotoDetailsScreenProps) {
        super(props);
        const { photo } = props.route.params;
        this.photoID = photo.id;

        this.state = {
            photo: photo,
            isLoading: true,
            isFavorite: false,
            isSaved: false,
            isDownloading: false,
        };
    }

    public componentDidMount() {
        if (this.photoID.startsWith('user_')) {
            this.setState({ isLoading: false });
        } else {
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
        isFavorite(this.photoID).then(isFav => {
            this.setState({ isFavorite: isFav });
        });
        isPhotoSaved(this.photoID).then(isSaved => {
            this.setState({ isSaved: isSaved });
        });
        this.checkStatus();
        this.focusListener = this.props.navigation.addListener('focus', this.checkStatus);
        Animated.parallel([
            Animated.timing(this.imageOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(this.imageScale, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
            }),
        ]).start();
    }

    public componentWillUnmount() {
        if (this.focusListener) {
            this.props.navigation.removeListener('focus', this.checkStatus);
        }
    }

    componentDidUpdate(prevProps: PhotoDetailsScreenProps, prevState: PhotoDetailsState) {
        if (prevState.isSaved !== this.state.isSaved) {
            this.saveButtonScale.setValue(0.9);
            Animated.timing(this.saveButtonScale, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }

    private toggleFavorite = () => {
        this.heartScale.setValue(0.8);
        Animated.spring(this.heartScale, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();

        const { isFavorite, photo } = this.state;
        const newIsFavorite = !isFavorite;

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

        if (this.state.isDownloading) return;
        this.setState({ isDownloading: true });

        if (Platform.OS === 'android') {
            try {
                const isAndroid13OrUp = Platform.Version >= 33;
                const permission = isAndroid13OrUp
                    ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                    : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

                const granted = await PermissionsAndroid.request(permission, {
                    title: i18n.t('savePermissionTitle'),
                    message: i18n.t('savePermissionMessage'),
                    buttonPositive: i18n.t('accept'),
                    buttonNegative: i18n.t('cancel'),
                });

                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert(i18n.t('permissionDenied'), i18n.t('permissionDeniedMessage'));
                    if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                        Alert.alert(
                            i18n.t('permissionPermanentlyDenied'),
                            i18n.t('permissionPermanentlyDeniedMessage'),
                            [
                                { text: i18n.t('cancel'), style: "cancel" },
                                { text: i18n.t('openSettings'), onPress: () => Linking.openSettings() }
                            ]
                        );
                    }
                    this.setState({ isDownloading: false });
                    return;
                }
            } catch (err) {
                console.warn(err);
                this.setState({ isDownloading: false });
                return;
            }
        }

        try {
            const result = await PhotoSaver.savePhoto(this.state.photo.urls.raw);
            Alert.alert(i18n.t('success'), result);
        } catch (error: any) {
            Alert.alert(i18n.t('saveError'), error.message);
        } finally {
            this.setState({ isDownloading: false });
        }
    };

    private renderInteractionBar(photo: Photo) {
        const { isFavorite, isSaved, isDownloading } = this.state;

        const animatedHeartStyle = {
            transform: [{ scale: this.heartScale }],
        };
        const animatedSaveButtonStyle = {
            transform: [{ scale: this.saveButtonScale }],
        };

        return (
            <View style={styles.interactionBar}>
                <View style={styles.leftActions}>
                    {/* Likes */}
                    <TouchableOpacity onPress={this.toggleFavorite} style={styles.actionButton}>
                        <AnimatedIonicon
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            size={28}
                            color={isFavorite ? '#E91E63' : '#333'}
                            style={animatedHeartStyle}
                        />
                    </TouchableOpacity>
                    <Text style={styles.likesText}>{photo.likes.toLocaleString()}</Text>

                    {/* Descargar */}
                    <TouchableOpacity onPress={this.handleSavePhoto} style={styles.actionButton} disabled={isDownloading}>
                        {isDownloading ? (
                            <ActivityIndicator size="small" color="#333" />
                        ) : (
                            <Ionicon name="download-outline" size={28} color="#333" />
                        )}
                    </TouchableOpacity>
                </View>

                { }
                <Animated.View style={animatedSaveButtonStyle}>
                    <TouchableOpacity
                        onPress={this.openSaveToListScreen}
                        style={[styles.saveButton, isSaved && styles.saveButtonSaved]}
                    >
                        <Text style={styles.saveButtonText}>{isSaved ? i18n.t('saved') : i18n.t('save')}</Text>
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
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.wrapper}>
                    <ScrollView>
                        <View style={styles.container}>
                            { }
                            <DoubleTapImage
                                imageUrl={photo.urls.regular}
                                onDoubleTap={this.toggleFavorite}
                                style={[styles.image, { height: imageHeight }]}
                            />

                            {this.renderInteractionBar(photo)}
                            {this.renderUserInfo(photo)}
                            {this.renderDescription(photo)}
                        </View>
                    </ScrollView>
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
        position: 'relative',
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
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginRight: 20,
    },
    leftActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        marginRight: 15,
    },
    saveButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    saveButtonSaved: {
        backgroundColor: '#797979ff',
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