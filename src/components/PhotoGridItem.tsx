import React, { Component } from 'react';
import { Image, StyleSheet, TouchableHighlight, Dimensions, Animated } from 'react-native';

interface PhotoGridItemProps {
  imageURI: string;
  imageWidth: number;
  imageHeight: number;
  onPress?: () => void;
}

const cellPadding = 5;
const cellWidth = Dimensions.get('window').width / 2 - (cellPadding * 2);


export default class PhotoGridItem extends Component<PhotoGridItemProps> {
  private scaleValue = new Animated.Value(0.8);

  componentDidMount() {
    Animated.spring(this.scaleValue, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }

  render() {
    const imageAspectRatio = this.props.imageHeight / this.props.imageWidth;
    const cellHeight = cellWidth * imageAspectRatio;
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