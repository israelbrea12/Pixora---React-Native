import React, { useState } from 'react';
import { Text, TextInput, Image, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { AddPhotoScreenProps } from '../navigation/types';
import i18n from '../i18n/LocalizationManager';
import { addUserPhoto } from '../services/DatabaseManager';
import { Photo } from '../api/UnsplashApiClient';

const AddPhotoScreen = ({ navigation, route }: AddPhotoScreenProps) => {
    const { imageUri } = route.params;
    const [username, setUsername] = useState('MiUsuario');
    const [description, setDescription] = useState('');

    const handleUpload = async () => {
        if (!username.trim() || !description.trim()) {
            Alert.alert(i18n.t('error'), i18n.t('fillAllFields'));
            return;
        }

        const newPhoto: Photo = {
            id: `user_${Date.now()}`,
            description: description,
            alt_description: description,
            likes: 0,
            width: 1080,
            height: 1920,
            urls: {
                raw: imageUri,
                full: imageUri,
                regular: imageUri,
                small: imageUri,
                thumb: imageUri,
            },
            user: {
                id: 'local_user',
                username: username,
                name: username,
                profile_image: {
                    small: 'https://via.placeholder.com/32',
                    medium: 'https://via.placeholder.com/64',
                    large: 'https://via.placeholder.com/128',
                },
            },
        };

        try {
            await addUserPhoto(newPhoto);
            Alert.alert(i18n.t('success'), i18n.t('photoUploaded'));
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [
                        {
                            name: 'MainTabs',
                            state: {
                                routes: [{ name: 'SettingsTab' }],
                            },
                        },
                    ],
                })
            );
        } catch (error) {
            console.error(error);
            Alert.alert(i18n.t('error'), i18n.t('photoUploadError'));
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.container}>
                    <Image source={{ uri: imageUri }} style={styles.image} />

                    <Text style={styles.label}>{i18n.t('username')}</Text>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        placeholder={i18n.t('enterUsername')}
                    />

                    <Text style={styles.label}>{i18n.t('description')}</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder={i18n.t('enterDescription')}
                        multiline
                    />

                    <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
                        <Text style={styles.uploadButtonText}>{i18n.t('uploadPhoto')}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: {
        padding: 20,
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        marginBottom: 20,
        backgroundColor: '#f0f0f0',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    uploadButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default AddPhotoScreen;