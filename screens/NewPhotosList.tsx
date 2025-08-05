import PhotoList, { PhotoListProps, PhotoListState } from './PhotoList';
import { Photo } from '../api/UnsplashApiClient';

// Indicamos explícitamente que esta clase usa los tipos por defecto de Props y State
export default class NewPhotosList extends PhotoList<PhotoListProps, PhotoListState> {
    public constructor(props: PhotoListProps) {
        super(props);
        props.navigation.setOptions({
            title: 'Novedades',
        });
    }

    protected loadPage(page: number): Promise<{ photos: ReadonlyArray<Photo>, totalPages: number }> {
        return this.apiClient.getLatestPhotos(page);
    }
}