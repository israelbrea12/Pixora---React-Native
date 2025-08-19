import { PhotoListState } from '../components/PhotoList';
import PhotoList from '../components/PhotoList';
import { getFavorites } from '../services/DatabaseManager';
import { Photo } from '../api/UnsplashApiClient';
import { FavoritesScreenProps } from '../navigation/types';

export default class FavoritesScreen extends PhotoList<FavoritesScreenProps, PhotoListState> {

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
            const favoritePhotos = await getFavorites();
            return { photos: favoritePhotos.reverse(), totalPages: 1 };
        } catch (error) {
            console.error("Error fetching favorites:", error);
            return { photos: [], totalPages: 1 };
        }
    }
}