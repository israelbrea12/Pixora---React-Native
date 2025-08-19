import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Photo } from '../api/UnsplashApiClient';
import { PhotoListWithPhotos } from '../services/DatabaseManager';

interface Props {
    list: PhotoListWithPhotos;
    onPress: () => void;
}

const CardImage = ({ photo }: { photo?: Photo }) => {
    if (photo && photo.urls.thumb) {
        return <Image source={{ uri: photo.urls.thumb }} style={styles.image} />;
    }
    return <View style={[styles.image, styles.placeholder]} />;
};

const PhotoListCard = ({ list, onPress }: Props) => {
    const { name, photos } = list;

    return (
        <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
            { }
            <View style={styles.imagesWrapper}>
                { }
                <View style={{ flex: 0.55 }}>
                    <CardImage photo={photos[0]} />
                </View>

                { }
                <View style={{ flex: 0.45, flexDirection: 'column', gap: 4 }}>
                    <CardImage photo={photos[1]} />
                    <CardImage photo={photos[2]} />
                </View>
            </View>

            { }
            <View style={styles.infoContainer}>
                <Text style={styles.listName} numberOfLines={1}>{name}</Text>
                <Text style={styles.photoCount}>{`${photos.length} fotos`}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        margin: 8,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    imagesWrapper: {
        flexDirection: 'row',
        gap: 4,
        aspectRatio: 1.7,
    },
    image: {
        flex: 1,
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    placeholder: {
        backgroundColor: '#e1e4e8',
    },
    infoContainer: {
        padding: 12,
    },
    listName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    photoCount: {
        fontSize: 14,
        color: 'gray',
        marginTop: 2,
    },
});

export default PhotoListCard;