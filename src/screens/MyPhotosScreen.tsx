import { PhotoListState } from './PhotoList';
import PhotoList from './PhotoList';
import { getUserPhotos } from '../services/DatabaseManager';
import { Photo } from '../api/UnsplashApiClient';
import { MyPhotosScreenProps } from '../navigation/types';

export default class MyPhotosScreen extends PhotoList<MyPhotosScreenProps, PhotoListState> {

    public state: PhotoListState = { photos: [] };

    private focusListener: any;

    public componentDidMount() {
        super.componentDidMount();
        this.focusListener = this.props.navigation.addListener('focus', this.reloadData);
    }

    public componentWillUnmount() {
        if (this.focusListener) {
            this.focusListener();
        }
    }

    private reloadData = () => {
        this.nextPage = 1;
        this.totalPages = 1;
        this.setState({ photos: [] }, () => {
            this.loadNextPage();
        });
    }

    protected loadPage = async (page: number): Promise<{ photos: ReadonlyArray<Photo>; totalPages: number }> => {
        if (page > 1) {
            return { photos: [], totalPages: 1 };
        }

        try {
            const userPhotos = await getUserPhotos();
            return { photos: userPhotos.reverse(), totalPages: 1 };
        } catch (error) {
            console.error("Error fetching user photos:", error);
            return { photos: [], totalPages: 1 };
        }
    }
}