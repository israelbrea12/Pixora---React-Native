import React from 'react';
import { FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import PhotoCard from './PhotoCard';
import { PhotoEntry } from '../screens/PhotoList';

type LayoutType = 'list' | 'grid';

interface LinearListProps {
    photos: ReadonlyArray<PhotoEntry>;
    onEndReached: () => void;
    onPhotoPress: (photo: any) => void;
    isLoading: boolean;
    layout?: LayoutType; // Recibimos la prop de layout
}

const LinearList = ({ photos, onEndReached, onPhotoPress, isLoading, layout = 'list' }: LinearListProps) => (
    <FlatList
        data={photos}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
            <PhotoCard
                photo={item.photo}
                onPress={() => onPhotoPress(item.photo)}
                layout={layout} // Pasamos la prop de layout a cada tarjeta
            />
        )}
        keyExtractor={item => item.key}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.8}
        ListFooterComponent={isLoading ? <ActivityIndicator style={{ margin: 20 }} /> : null}
        // --- LÓGICA CONDICIONAL PARA LAS COLUMNAS ---
        numColumns={layout === 'grid' ? 2 : 1}
        key={layout} // IMPORTANTE: Cambiar la key fuerza el re-renderizado al cambiar de layout
    />
);

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 10,
        // --- AÑADE ESTA LÍNEA ---
        paddingTop: 10, // Esto crea el espacio en la parte superior de la lista
    },
});
export default LinearList;