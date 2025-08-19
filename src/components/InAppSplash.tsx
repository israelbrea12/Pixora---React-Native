import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StatusBar, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import BootSplash from 'react-native-bootsplash';

interface Props {
    onFinished: () => void;
}

export default function InAppSplash({ onFinished }: Props) {
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        BootSplash.hide({ fade: true });

        const TOTAL_SPLASH_DURATION = 2000;

        const hideTimer = setTimeout(() => {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 400,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start(() => {
                onFinished();
            });
        }, TOTAL_SPLASH_DURATION);

        return () => clearTimeout(hideTimer);

    }, [opacity, onFinished]);

    return (
        <Animated.View style={[styles.container, { opacity }]}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
            <LottieView
                source={require('../../assets/lottie/splash.json')}
                autoPlay
                loop={false}
                resizeMode="contain"
                speed={3}
                style={styles.lottie}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
    lottie: {
        width: '70%',
        aspectRatio: 1,
    },
});