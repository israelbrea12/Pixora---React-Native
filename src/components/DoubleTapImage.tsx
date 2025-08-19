// 1. Importa StyleProp y ViewStyle
import { requireNativeComponent, StyleProp, ViewStyle } from 'react-native';

interface DoubleTapImageProps {
    imageUrl: string;
    onDoubleTap: () => void;
    // 2. Cambia el tipo de 'style' para que acepte un objeto o un array de estilos
    style?: StyleProp<ViewStyle>;
}

// El nombre 'DoubleTapImageView' debe coincidir EXACTAMENTE
// con el que definimos en los managers nativos.
export const DoubleTapImage = requireNativeComponent<DoubleTapImageProps>('DoubleTapImageView');