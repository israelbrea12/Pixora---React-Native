import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { Photo } from '../api/UnsplashApiClient';

type LayoutType = 'list' | 'grid';

interface PhotoCardProps {
    photo: Photo;
    onPress: () => void;
    layout?: LayoutType;
}

const PhotoCard = ({ photo, onPress, layout = 'list' }: PhotoCardProps) => (
    <TouchableOpacity onPress={onPress} style={[
        styles.card,
        layout === 'grid' && styles.gridCard
    ]}>
        <Image
            source={{ uri: photo.urls.regular }}
            style={[
                styles.image,
                layout === 'grid' && styles.gridImage
            ]}
        />
        <View style={styles.infoContainer}>
            <Image
                source={{ uri: photo.user.profile_image.medium }}
                style={styles.avatar}
            />
            <Text style={styles.username} numberOfLines={1}>{photo.user.name}</Text>

            { }
            {layout === 'list' && (
                <View style={styles.likesContainer}>
                    <Ionicon name="heart" size={14} color="#666" />
                    <Text style={styles.likesText}>{photo.likes}</Text>
                </View>
            )}
        </View>
    </TouchableOpacity>
);

const gridItemWidth = Dimensions.get('window').width / 2 - 15;

const styles = StyleSheet.create({
    card: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    image: {
        width: '100%',
        height: 250,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    username: {
        flex: 1,
        marginLeft: 10,
        fontWeight: '600',
        fontSize: 15,
    },
    likesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    likesText: {
        marginLeft: 4,
        fontSize: 14,
        color: '#666',
    },
    gridCard: {
        width: gridItemWidth,
        marginHorizontal: 5,
    },
    gridImage: {
        height: 180,
    },
});

export default PhotoCard;