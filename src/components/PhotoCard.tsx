// src/components/PhotoCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { Photo } from '../api/UnsplashApiClient';

interface PhotoCardProps {
    photo: Photo;
    onPress: () => void;
}

const PhotoCard = ({ photo, onPress }: PhotoCardProps) => (
    <TouchableOpacity onPress={onPress} style={styles.card}>
        <Image source={{ uri: photo.urls.regular }} style={styles.image} />
        <View style={styles.infoContainer}>
            <Image
                source={{ uri: photo.user.profile_image.medium }}
                style={styles.avatar}
            />
            <Text style={styles.username} numberOfLines={1}>{photo.user.name}</Text>
            <View style={styles.likesContainer}>
                <Ionicon name="heart" size={14} color="#666" />
                <Text style={styles.likesText}>{photo.likes}</Text>
            </View>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    card: {
        marginBottom: 10,
        marginTop: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    image: {
        width: '100%',
        height: 200,
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
});

export default PhotoCard;