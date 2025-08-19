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
    layout?: LayoutType;
}

const LinearList = ({ photos, onEndReached, onPhotoPress, isLoading, layout = 'list' }: LinearListProps) => (
    <FlatList
        data={photos}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
            <PhotoCard
                photo={item.photo}
                onPress={() => onPhotoPress(item.photo)}
                layout={layout}
            />
        )}
        keyExtractor={item => item.key}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.8}
        ListFooterComponent={isLoading ? <ActivityIndicator style={{ margin: 20 }} /> : null}
        numColumns={layout === 'grid' ? 2 : 1}
        key={layout}
    />
);

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 10,
        paddingTop: 10,
    },
});
export default LinearList;