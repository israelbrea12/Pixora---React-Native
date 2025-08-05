import React, { Component } from 'react';
import { Image, StyleSheet, TouchableHighlight, View, Dimensions } from 'react-native';

interface PhotoGridItemProps {
  imageURI: string;
  imageWidth: number;
  imageHeight: number;
  onPress?: () => void;
}

// Calculamos el tamaño de la celda basado en el ancho de la pantalla y el número de columnas.
const NUM_COLUMNS = 2;
const cellPadding = 5;
const cellWidth = Dimensions.get('window').width / NUM_COLUMNS - (cellPadding * (NUM_COLUMNS + 1));


export default class PhotoGridItem extends Component<PhotoGridItemProps> {
  render() {
    const imageAspectRatio = this.props.imageHeight / this.props.imageWidth;
    const cellHeight = cellWidth * imageAspectRatio;

    return (
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