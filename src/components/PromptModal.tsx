// src/components/PromptModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import i18n from '../i18n';

interface PromptModalProps {
    visible: boolean;
    title: string;
    message: string;
    onCancel: () => void;
    onSubmit: (text: string) => void;
}

const PromptModal = ({ visible, title, message, onCancel, onSubmit }: PromptModalProps) => {
    const [inputText, setInputText] = useState('');

    const handleSubmit = () => {
        onSubmit(inputText);
        setInputText(''); // Reseteamos el input
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={setInputText}
                        value={inputText}
                        placeholder={i18n.t('listNamePlaceholder')}
                        autoFocus={true}
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={onCancel}>
                            <Text style={styles.buttonText}>{i18n.t('cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSubmit}>
                            <Text style={[styles.buttonText, { fontWeight: 'bold' }]}>{i18n.t('create')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 14,
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 15,
        color: '#333',
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        padding: 10,
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    buttonText: {
        color: '#007AFF',
        fontSize: 18,
    },
});

export default PromptModal;