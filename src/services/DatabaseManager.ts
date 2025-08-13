// src/services/DatabaseManager.ts
import SQLite from 'react-native-sqlite-2';
import { Photo } from '../api/UnsplashApiClient';

// Abrimos la base de datos. [cite_start]Se creará si no existe. [cite: 37, 44]
const db = SQLite.openDatabase('pixora_favorites.db', '1.0', '', 1);

/**
 * Prepara la base de datos, creando la tabla de favoritos si no existe.
 * Esta función debe llamarse una vez al iniciar la app.
 */
export const initDB = (): void => {
    db.transaction(txn => { // [cite: 38]
        txn.executeSql( // [cite: 40, 46]
            `CREATE TABLE IF NOT EXISTS Favorites (
                id TEXT PRIMARY KEY NOT NULL,
                photoData TEXT NOT NULL
            )`,
            []
        );
    });
};

/**
 * Añade una foto a la tabla de favoritos.
 * @param photo El objeto de la foto a guardar.
 */
export const addFavorite = (photo: Photo): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.transaction(txn => {
            txn.executeSql(
                'INSERT OR REPLACE INTO Favorites (id, photoData) VALUES (?, ?)',
                [photo.id, JSON.stringify(photo)], // Guardamos el objeto foto como un string JSON
                () => resolve(),
                (_, error) => { reject(error); return false; }
            );
        });
    });
};

/**
 * Elimina una foto de la tabla de favoritos.
 * @param photoId El ID de la foto a eliminar.
 */
export const removeFavorite = (photoId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.transaction(txn => {
            txn.executeSql(
                'DELETE FROM Favorites WHERE id = ?',
                [photoId],
                () => resolve(),
                (_, error) => { reject(error); return false; }
            );
        });
    });
};

/**
 * Obtiene todas las fotos guardadas como favoritas.
 * @returns Una promesa que resuelve a un array de objetos Photo.
 */
export const getFavorites = (): Promise<Photo[]> => {
    return new Promise((resolve, reject) => {
        db.transaction(txn => {
            txn.executeSql(
                'SELECT photoData FROM Favorites',
                [],
                (_, { rows }) => {
                    const favorites: Photo[] = [];
                    for (let i = 0; i < rows.length; i++) {
                        // Parseamos el string JSON de vuelta a un objeto Photo
                        favorites.push(JSON.parse(rows.item(i).photoData));
                    }
                    resolve(favorites);
                },
                (_, error) => { reject(error); return false; }
            );
        });
    });
};

/**
 * Comprueba si una foto ya está en favoritos.
 * @param photoId El ID de la foto a comprobar.
 * @returns Una promesa que resuelve a `true` si es favorita, o `false` si no.
 */
export const isFavorite = (photoId: string): Promise<boolean> => {
    return new Promise((resolve) => {
        db.transaction(txn => {
            txn.executeSql(
                'SELECT id FROM Favorites WHERE id = ?',
                [photoId],
                (_, { rows }) => {
                    resolve(rows.length > 0);
                },
                () => { resolve(false); return false; }
            );
        });
    });
};