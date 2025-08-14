// src/components/PhotoGridItem.tsx
import React, { Component } from 'react';
// --- CAMBIO 1: Importamos Animated ---
import { Image, StyleSheet, TouchableHighlight, View, Dimensions, Animated } from 'react-native';

interface PhotoGridItemProps {
  imageURI: string;
  imageWidth: number;
  imageHeight: number;
  onPress?: () => void;
}

const cellPadding = 5;
const cellWidth = Dimensions.get('window').width / 2 - (cellPadding * 2);


export default class PhotoGridItem extends Component<PhotoGridItemProps> {
  // --- CAMBIO 2: Creamos un Animated.Value para la escala ---
  private scaleValue = new Animated.Value(0.8); // Empieza un poco más pequeño

  componentDidMount() {
    // --- CAMBIO 3: Iniciamos la animación cuando el componente se monta ---
    Animated.spring(this.scaleValue, {
      toValue: 1, // Anima la escala a su tamaño normal (100%)
      friction: 6, // Controla el "rebote"
      useNativeDriver: true, // Mejora el rendimiento
    }).start();
  }

  render() {
    const imageAspectRatio = this.props.imageHeight / this.props.imageWidth;
    const cellHeight = cellWidth * imageAspectRatio;

    // --- CAMBIO 4: Envolvemos el item en un Animated.View ---
    return (
      <Animated.View style={{ transform: [{ scale: this.scaleValue }] }}>
        <TouchableHighlight
          onPress={this.props.onPress}
          underlayColor="lightgray"
          style={styles.touchable}
        >
          <Image
            style={[styles.image, { height: cellHeight }]}
            resizeMode="cover"
            source={{ uri: this.props.imageURI }}
          />
        </TouchableHighlight>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  touchable: {
    width: cellWidth,
    margin: cellPadding,
  },
  image: {
    width: '100%',
    borderRadius: 8,
  },
});