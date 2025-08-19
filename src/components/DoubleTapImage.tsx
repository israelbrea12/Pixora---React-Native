import { requireNativeComponent, StyleProp, ViewStyle } from 'react-native';

interface DoubleTapImageProps {
    imageUrl: string;
    onDoubleTap: () => void;
    style?: StyleProp<ViewStyle>;
}

export const DoubleTapImage = requireNativeComponent<DoubleTapImageProps>('DoubleTapImageView');