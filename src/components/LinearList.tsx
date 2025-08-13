// src/components/LinearList.tsx
import React from 'react';
import { FlashList } from '@shopify/flash-list';
import { View, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import PhotoCard from './PhotoCard';
import { PhotoEntry } from '../screens/PhotoList';

// Similar a las props de PhotoList
interface LinearListProps {
    photos: ReadonlyArray<PhotoEntry>;
    onEndReached: () => void;
    onPhotoPress: (photo: any) => void;
    isLoading: boolean;
}

const LinearList = ({ photos, onEndReached, onPhotoPress, isLoading }: LinearListProps) => (
    <FlatList
        data={photos}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
            <PhotoCard
                photo={item.photo}
                onPress={() => onPhotoPress(item.photo)}
            />
        )}
        keyExtractor={item => item.key}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.8}
        ListFooterComponent={isLoading ? <ActivityIndicator style={{ margin: 20 }} /> : null}
    />
);

const styles = StyleSheet.create({
    list: {
        padding: 10,
    },
});

export default LinearList;