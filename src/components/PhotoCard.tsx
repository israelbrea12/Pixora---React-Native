import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { Photo } from '../api/UnsplashApiClient';

// Definimos los tipos de layout que aceptará nuestra tarjeta
type LayoutType = 'list' | 'grid';

interface PhotoCardProps {
    photo: Photo;
    onPress: () => void;
    layout?: LayoutType; // La nueva prop para definir el layout
}

// Hacemos que 'layout' sea 'list' por defecto si no se especifica
const PhotoCard = ({ photo, onPress, layout = 'list' }: PhotoCardProps) => (
    <TouchableOpacity onPress={onPress} style={[
        styles.card,
        layout === 'grid' && styles.gridCard // Aplicamos estilo extra si es grid
    ]}>
        <Image
            source={{ uri: photo.urls.regular }}
            style={[
                styles.image,
                layout === 'grid' && styles.gridImage // Aplicamos estilo extra si es grid
            ]}
        />
        <View style={styles.infoContainer}>
            <Image
                source={{ uri: photo.user.profile_image.medium }}
                style={styles.avatar}
            />
            <Text style={styles.username} numberOfLines={1}>{photo.user.name}</Text>

            {/* --- LÓGICA CONDICIONAL: Mostramos los likes solo en el layout de lista --- */}
            {layout === 'list' && (
                <View style={styles.likesContainer}>
                    <Ionicon name="heart" size={14} color="#666" />
                    <Text style={styles.likesText}>{photo.likes}</Text>
                </View>
            )}
        </View>
    </TouchableOpacity>
);

const gridItemWidth = Dimensions.get('window').width / 2 - 15; // Calculamos el ancho para el grid

const styles = StyleSheet.create({
    // Estilo base de la tarjeta (mejorado para iOS)
    card: {
        marginBottom: 20, // Aumentamos el margen para dar más aire
        backgroundColor: '#fff',
        borderRadius: 12,
        // Sombra mejorada para iOS y mantenemos la elevación para Android
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
    // --- NUEVOS ESTILOS PARA EL LAYOUT GRID ---
    gridCard: {
        width: gridItemWidth,
        marginHorizontal: 5,
    },
    gridImage: {
        height: 180, // Hacemos la imagen un poco más pequeña para el grid
    },
});

export default PhotoCard;