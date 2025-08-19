import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import i18n from '../i18n/LocalizationManager';


interface PlaceholderProps {
    route?: {
        params?: {
            title?: string;
        }
    }
}

const PlaceholderScreen = (props: PlaceholderProps) => {

    const title = props.route?.params?.title || i18n.t('screen');

    return (
        <View style={styles.container}>
            <Text style={styles.text}>{title}</Text>
            <Text style={styles.subtitle}>{i18n.t('underConstruction')}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        color: 'gray',
        marginTop: 8
    }
});

export default PlaceholderScreen;