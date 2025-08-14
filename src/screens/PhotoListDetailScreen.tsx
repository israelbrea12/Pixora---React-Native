// src/screens/PhotoListDetailScreen.tsx
import PhotoList, { PhotoListState } from './PhotoList';
import { getPhotosInList } from '../services/DatabaseManager';
import { Photo } from '../api/UnsplashApiClient';
import { PhotoListDetailScreenProps } from '../navigation/types';

export default class PhotoListDetailScreen extends PhotoList<PhotoListDetailScreenProps, PhotoListState> {

    public state: PhotoListState = { photos: [] };

    private listId: number;
    private listName: string;

    constructor(props: PhotoListDetailScreenProps) {
        super(props);
        // El tipo 'PhotoListDetailScreenProps' asegura que route.params existe y tiene la forma correcta
        const { listId, listName } = props.route.params;
        this.listId = listId;
        this.listName = listName;
    }

    componentDidMount() {
        this.props.navigation.setOptions({ title: this.listName });
        super.componentDidMount();
    }

    // --- CORRECCIÓN: La firma de la función debe coincidir con la de la clase padre ---
    protected loadPage = async (page: number): Promise<{ photos: ReadonlyArray<Photo>, totalPages: number }> => {
        if (page > 1) {
            return { photos: [], totalPages: 1 };
        }

        try {
            const photosInList = await getPhotosInList(this.listId);
            return { photos: photosInList.reverse(), totalPages: 1 };
        } catch (error) {
            console.error(`Error fetching photos for list ${this.listId}:`, error);
            return { photos: [], totalPages: 1 };
        }
    }
}