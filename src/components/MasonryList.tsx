import React from 'react';
import { FlashList } from "@shopify/flash-list";
import { ActivityIndicator } from 'react-native';
import PhotoGridItem from './PhotoGridItem';
import { PhotoEntry } from '../screens/PhotoList';

interface MasonryListProps {
    photos: ReadonlyArray<PhotoEntry>;
    onEndReached: () => void;
    onPhotoPress: (photo: any) => void;
    isLoading: boolean;
}

const MasonryList = ({ photos, onEndReached, onPhotoPress, isLoading }: MasonryListProps) => (
    <FlashList
        data={photos}
        masonry
        renderItem={({ item }) => (
            <PhotoGridItem
                imageURI={item.photo.urls.small}
                imageWidth={item.photo.width}
                imageHeight={item.photo.height}
                onPress={() => onPhotoPress(item.photo)}
            />
        )}
        numColumns={2}
        keyExtractor={item => item.key}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.8}
        ListFooterComponent={isLoading ? <ActivityIndicator style={{ margin: 20 }} /> : null}
    />
);

export default MasonryList;