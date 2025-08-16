import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';
import i18n from '../i18n/LocalizationManager';

interface Props {
    isVisible: boolean;
    onClose: () => void;
    onLaunchCamera: () => void;
    onLaunchGallery: () => void;
}

const AddPhotoBottomSheet = ({ isVisible, onClose, onLaunchCamera, onLaunchGallery }: Props) => {
    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.container}>
                        <Text style={styles.title}>{i18n.t('addPhoto')}</Text>

                        <TouchableOpacity style={styles.optionButton} onPress={onLaunchGallery}>
                            <Ionicon name="images" size={24} color="#007AFF" />
                            <Text style={styles.optionText}>{i18n.t('fromGallery')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionButton} onPress={onLaunchCamera}>
                            <Ionicon name="camera" size={24} color="#007AFF" />
                            <Text style={styles.optionText}>{i18n.t('fromCamera')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>{i18n.t('cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    safeArea: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    container: {
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        marginBottom: 10,
    },
    optionText: {
        marginLeft: 15,
        fontSize: 18,
        color: '#007AFF',
    },
    cancelButton: {
        marginTop: 10,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#EFEFF4',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FF3B30',
    },
});

export default AddPhotoBottomSheet;