// Definimos el tipo para una foto de Unsplash, basándonos en tu entidad de Kotlin.
export type Photo = {
    id: string;
    description: string | null;
    alt_description: string | null;
    likes: number;
    width: number;
    height: number;
    urls: {
        raw: string;
        full: string;
        regular: string;
        small: string;
        thumb: string;
    };
    user: {
        id: string;
        username: string;
        name: string;
        profile_image: {
            small: string;
            medium: string;
            large: string;
        };
    };
};

// El resultado de una búsqueda es un poco diferente
export type SearchPhotosResult = {
    total: number;
    total_pages: number;
    results: ReadonlyArray<Photo>;
};

// Resultado para una lista de fotos paginada
export type PaginatedPhotosResult = {
    photos: ReadonlyArray<Photo>;
    totalPages: number;
};

export default class UnsplashApiClient {
    // Usamos la clave pública que definiste en tu proyecto de Android.
    // La API de Unsplash la usa como `client_id`.
    static API_KEY = 'jCMRYFHqydKyMnk9dUigbZjfsPH-Mbl7dJLSix5t9Wo';
    static BASE_URL = 'https://api.unsplash.com';
    static PER_PAGE = 20;

    /**
     * Obtiene las fotos más recientes de Unsplash.
     */
    public async getLatestPhotos(page: number): Promise<PaginatedPhotosResult> {
        const url = `${UnsplashApiClient.BASE_URL}/photos?page=${page}&per_page=${UnsplashApiClient.PER_PAGE}&client_id=${UnsplashApiClient.API_KEY}`;
        console.log(url);
        return fetch(url)
            .then(response => {
                // Unsplash nos da el número total de páginas en las cabeceras.
                const totalPages = parseInt(response.headers.get('x-total') || '1', 10) / UnsplashApiClient.PER_PAGE;
                return response.json().then(photos => ({
                    photos: photos,
                    totalPages: Math.ceil(totalPages),
                }));
            });
    }

    /**
     * Busca fotos en Unsplash.
     */
    public async searchPhotos(query: string, page: number): Promise<PaginatedPhotosResult> {
        if (!query) {
            return Promise.resolve({ photos: [], totalPages: 0 });
        }
        const url = `${UnsplashApiClient.BASE_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${UnsplashApiClient.PER_PAGE}&client_id=${UnsplashApiClient.API_KEY}`;
        console.log(url);
        return fetch(url)
            .then(response => response.json())
            .then((responseJSON: SearchPhotosResult) => ({
                photos: responseJSON.results,
                totalPages: responseJSON.total_pages,
            }));
    }

    /**
     * Obtiene los detalles de una foto específica.
     */
    public async getPhotoDetails(photoID: string): Promise<Photo> {
        const url = `${UnsplashApiClient.BASE_URL}/photos/${photoID}?client_id=${UnsplashApiClient.API_KEY}`;
        console.log(url);
        return fetch(url).then(response => response.json());
    }
}