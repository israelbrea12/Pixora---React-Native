import SQLite from 'react-native-sqlite-2';
import { Photo } from '../api/UnsplashApiClient';

const db = SQLite.openDatabase('pixora.db', '1.0', '', 1);

export type PhotoListInfo = {
    id: number;
    name: string;
    lastPhotoUrl?: string;
}

export type UserActivityType = 'LIKE' | 'ADD_TO_LIST';


export interface UserActivity {
    id: number;
    type: UserActivityType;
    timestamp: number;
    photo: Photo;
    listName?: string;
}

export const initDB = (): void => {
    db.transaction(txn => {
        txn.executeSql(
            `CREATE TABLE IF NOT EXISTS Favorites (id TEXT PRIMARY KEY NOT NULL, photoData TEXT NOT NULL)`,
            []
        );
        txn.executeSql(
            `CREATE TABLE IF NOT EXISTS PhotoLists (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE)`,
            []
        );
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
        txn.executeSql(
            `CREATE TABLE IF NOT EXISTS UserActivity (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                photoData TEXT NOT NULL,
                listName TEXT
            )`,
            []
        );

        txn.executeSql(
            `CREATE TABLE IF NOT EXISTS UserPhotos (id TEXT PRIMARY KEY NOT NULL, photoData TEXT NOT NULL)`,
            []
        );
    });
};


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
            const sqlQuery = `
                SELECT
                    pl.id,
                    pl.name,
                    (SELECT le.photoData
                     FROM ListEntries le
                     WHERE le.listId = pl.id
                     ORDER BY le.ROWID DESC
                     LIMIT 1) AS lastPhotoData
                FROM PhotoLists pl
            `;

            txn.executeSql(sqlQuery, [], (_, { rows }) => {
                const lists: PhotoListInfo[] = [];
                for (let i = 0; i < rows.length; i++) {
                    const item = rows.item(i);
                    let lastPhotoUrl: string | undefined = undefined;

                    if (item.lastPhotoData) {
                        try {
                            const photo: Photo = JSON.parse(item.lastPhotoData);
                            lastPhotoUrl = photo.urls.thumb;
                        } catch (e) {
                            console.error("Error parsing last photo data:", e);
                        }
                    }

                    lists.push({
                        id: item.id,
                        name: item.name,
                        lastPhotoUrl: lastPhotoUrl,
                    });
                }
                resolve(lists);
            }, (_, err) => { reject(err); return false; });
        });
    });
};


export const addPhotoToList = (listId: number, photo: Photo, listName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.transaction(txn => {
            txn.executeSql('INSERT OR IGNORE INTO ListEntries (listId, photoId, photoData) VALUES (?, ?, ?)',
                [listId, photo.id, JSON.stringify(photo)],
                async () => {
                    await logActivity('ADD_TO_LIST', photo, listName);
                    resolve();
                },
                (_, err) => { reject(err); return false; });
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

export const addFavorite = (photo: Photo): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.transaction(txn => {
            txn.executeSql('INSERT OR REPLACE INTO Favorites (id, photoData) VALUES (?, ?)',
                [photo.id, JSON.stringify(photo)],
                async () => {
                    await logActivity('LIKE', photo);
                    resolve();
                },
                (_, error) => { reject(error); return false; });
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

const logActivity = (type: UserActivityType, photo: Photo, listName?: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.transaction(txn => {
            txn.executeSql(
                'INSERT INTO UserActivity (type, timestamp, photoData, listName) VALUES (?, ?, ?, ?)',
                [type, Date.now(), JSON.stringify(photo), listName || null],
                () => resolve(),
                (_, err) => { reject(err); return false; }
            );
        });
    });
};

export const getActivities = (): Promise<UserActivity[]> => {
    return new Promise((resolve, reject) => {
        db.transaction(txn => {
            txn.executeSql(
                'SELECT id, type, timestamp, photoData, listName FROM UserActivity ORDER BY timestamp DESC',
                [],
                (_, { rows }) => {
                    const activities: UserActivity[] = [];
                    for (let i = 0; i < rows.length; i++) {
                        const item = rows.item(i);
                        activities.push({
                            id: item.id,
                            type: item.type,
                            timestamp: item.timestamp,
                            photo: JSON.parse(item.photoData),
                            listName: item.listName,
                        });
                    }
                    resolve(activities);
                },
                (_, err) => { reject(err); return false; }
            );
        });
    });
};

export const addUserPhoto = (photo: Photo): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.transaction(txn => {
            txn.executeSql('INSERT INTO UserPhotos (id, photoData) VALUES (?, ?)',
                [photo.id, JSON.stringify(photo)],
                () => resolve(),
                (_, error) => { reject(error); return false; });
        });
    });
};

export const getUserPhotos = (): Promise<Photo[]> => {
    return new Promise((resolve, reject) => {
        db.transaction(txn => {
            txn.executeSql('SELECT photoData FROM UserPhotos', [], (_, { rows }) => {
                const userPhotos: Photo[] = [];
                for (let i = 0; i < rows.length; i++) {
                    userPhotos.push(JSON.parse(rows.item(i).photoData));
                }
                resolve(userPhotos);
            }, (_, error) => { reject(error); return false; });
        });
    });
};
