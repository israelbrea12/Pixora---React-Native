// src/screens/FavoritesScreen.tsx
import { PhotoListState } from './PhotoList';
import PhotoList from './PhotoList';
import { getFavorites } from '../services/DatabaseManager';
import { Photo } from '../api/UnsplashApiClient';
import { AppState } from 'react-native';
import { FavoritesScreenProps } from '../navigation/types';

// La pantalla de Favoritos hereda de PhotoList para reutilizar la UI
export default class FavoritesScreen extends PhotoList<FavoritesScreenProps, PhotoListState> {

    public state: PhotoListState = { photos: [] };

    // Nos suscribimos a los eventos de foco para recargar la lista
    private focusListener: any;

    public componentDidMount() {
        super.componentDidMount();
        // Cuando la pantalla obtiene el foco (se vuelve visible), recargamos los datos.
        this.focusListener = this.props.navigation.addListener('focus', this.reloadData);
    }

    public componentWillUnmount() {
        // Limpiamos el listener al desmontar el componente
        if (this.focusListener) {
            this.focusListener();
        }
    }

    // Función para limpiar la lista y volver a cargarla
    private reloadData = () => {
        this.nextPage = 1;
        this.totalPages = 1;
        this.setState({ photos: [] }, () => {
            this.loadNextPage();
        });
    }

    // Sobrescribimos loadPage para que obtenga las fotos de la base de datos
    protected loadPage = async (page: number): Promise<{ photos: ReadonlyArray<Photo>; totalPages: number }> => {
        // Como los favoritos no están paginados, solo cargamos datos la primera vez.
        if (page > 1) {
            return { photos: [], totalPages: 1 };
        }

        try {
            const favoritePhotos = await getFavorites();
            // Invertimos el array para mostrar los más recientes primero
            return { photos: favoritePhotos.reverse(), totalPages: 1 };
        } catch (error) {
            console.error("Error fetching favorites:", error);
            return { photos: [], totalPages: 1 };
        }
    }
}