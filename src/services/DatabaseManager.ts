// src/services/DatabaseManager.ts
import SQLite from 'react-native-sqlite-2';
import { Photo } from '../api/UnsplashApiClient';

const db = SQLite.openDatabase('pixora.db', '1.0', '', 1);

// --- NUEVO TIPO: Para la información de una lista de fotos ---
export type PhotoListInfo = {
    id: number;
    name: string;
}

export const initDB = (): void => {
    db.transaction(txn => {
        txn.executeSql(
            `CREATE TABLE IF NOT EXISTS Favorites (id TEXT PRIMARY KEY NOT NULL, photoData TEXT NOT NULL)`,
            []
        );
        // --- NUEVA TABLA: Para guardar los nombres de las listas ---
        txn.executeSql(
            `CREATE TABLE IF NOT EXISTS PhotoLists (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE)`,
            []
        );
        // --- NUEVA TABLA: Para relacionar fotos y listas (relación muchos a muchos) ---
        txn.executeSql(
            `CREATE TABLE IF NOT EXISTS ListEntries (
                listId INTEGER NOT NULL,
                photoId TEXT NOT NULL,
                photoData TEXT NOT NULL,
                PRIMARY KEY (listId, photoId),
                FOREIGN KEY (listId) REFERENCES PhotoLists(id) ON DELETE CASCADE
            )`,
            []
        );
    });
};

// --- Funciones para Listas (NUEVAS) ---

export const createPhotoList = (name: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.transaction(txn => {
            txn.executeSql('INSERT INTO PhotoLists (name) VALUES (?)', [name], () => resolve(), (_, err) => { reject(err); return false; });
        });
    });
};

export const getPhotoLists = (): Promise<PhotoListInfo[]> => {
    return new Promise((resolve, reject) => {
        db.transaction(txn => {
            txn.executeSql('SELECT id, name FROM PhotoLists', [], (_, { rows }) => {
                const lists: PhotoListInfo[] = [];
                for (let i = 0; i < rows.length; i++) {
                    lists.push(rows.item(i));
                }
                resolve(lists);
            }, (_, err) => { reject(err); return false; });
        });
    });
};

export const addPhotoToList = (listId: number, photo: Photo): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.transaction(txn => {
            txn.executeSql(
                'INSERT OR IGNORE INTO ListEntries (listId, photoId, photoData) VALUES (?, ?, ?)',
                [listId, photo.id, JSON.stringify(photo)],
                () => resolve(),
                (_, err) => { reject(err); return false; }
            );
        });
    });
};

export const isPhotoSaved = (photoId: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        db.transaction(txn => {
            txn.executeSql('SELECT listId FROM ListEntries WHERE photoId = ? LIMIT 1', [photoId], (_, { rows }) => {
                resolve(rows.length > 0);
            }, (_, err) => { reject(err); return false; });
        });
    });
};

/**
 * Obtiene todas las fotos que pertenecen a una lista específica.
 * @param listId El ID de la lista.
 * @returns Una promesa que resuelve a un array de objetos Photo.
 */
export const getPhotosInList = (listId: number): Promise<Photo[]> => {
    return new Promise((resolve, reject) => {
        db.transaction(txn => {
            txn.executeSql(
                'SELECT photoData FROM ListEntries WHERE listId = ?',
                [listId],
                (_, { rows }) => {
                    const photos: Photo[] = [];
                    for (let i = 0; i < rows.length; i++) {
                        photos.push(JSON.parse(rows.item(i).photoData));
                    }
                    resolve(photos);
                },
                (_, err) => { reject(err); return false; }
            );
        });
    });
};


// --- Funciones de Favoritos (sin cambios) ---

export const addFavorite = (photo: Photo): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.transaction(txn => {
            txn.executeSql('INSERT OR REPLACE INTO Favorites (id, photoData) VALUES (?, ?)', [photo.id, JSON.stringify(photo)], () => resolve(), (_, error) => { reject(error); return false; });
        });
    });
};

export const removeFavorite = (photoId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.transaction(txn => {
            txn.executeSql('DELETE FROM Favorites WHERE id = ?', [photoId], () => resolve(), (_, error) => { reject(error); return false; });
        });
    });
};

export const getFavorites = (): Promise<Photo[]> => {
    return new Promise((resolve, reject) => {
        db.transaction(txn => {
            txn.executeSql('SELECT photoData FROM Favorites', [], (_, { rows }) => {
                const favorites: Photo[] = [];
                for (let i = 0; i < rows.length; i++) {
                    favorites.push(JSON.parse(rows.item(i).photoData));
                }
                resolve(favorites);
            }, (_, error) => { reject(error); return false; });
        });
    });
};

export const isFavorite = (photoId: string): Promise<boolean> => {
    return new Promise((resolve) => {
        db.transaction(txn => {
            txn.executeSql('SELECT id FROM Favorites WHERE id = ?', [photoId], (_, { rows }) => {
                resolve(rows.length > 0);
            }, () => { resolve(false); return false; });
        });
    });
};