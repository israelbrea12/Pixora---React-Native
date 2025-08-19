//
//  DoubleTapImageView.m
//  PixoraRN
//
//  Created by Israel Brea Piñero on 19/8/25.
//

#import "DoubleTapImageView.h"
#import <SDWebImage/UIImageView+WebCache.h> // Librería para cargar imágenes desde URL

@implementation DoubleTapImageView

- (instancetype)initWithFrame:(CGRect)frame
{
  self = [super initWithFrame:frame];
  if (self) {
    // Habilitamos la interacción para que reconozca los toques
    self.userInteractionEnabled = YES;
    self.contentMode = UIViewContentModeScaleAspectFit; // Ajustamos el modo de contenido

    // Creamos el reconocedor de gestos de doble toque
    UITapGestureRecognizer *doubleTapRecognizer = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleDoubleTap:)];
    doubleTapRecognizer.numberOfTapsRequired = 2;
    [self addGestureRecognizer:doubleTapRecognizer];
  }
  return self;
}

// Método que se llama al detectar el doble toque
- (void)handleDoubleTap:(UITapGestureRecognizer *)recognizer
{
  if (self.onDoubleTap) {
    self.onDoubleTap(@{}); // Enviamos el evento vacío a JS
  }
}

@end

// --- El Manager para React Native ---

@interface DoubleTapImageViewManager : RCTViewManager
@end

@implementation DoubleTapImageViewManager

RCT_EXPORT_MODULE(DoubleTapImageView) // Nombre que usaremos en JS

- (UIView *)view
{
  return [[DoubleTapImageView alloc] init];
}

// Exportamos la prop para la URL de la imagen
RCT_CUSTOM_VIEW_PROPERTY(imageUrl, NSString, DoubleTapImageView)
{
  NSURL *url = [NSURL URLWithString:json ? [RCTConvert NSString:json] : @""];
  [view sd_setImageWithURL:url];
}

// Exportamos el evento onDoubleTap
RCT_EXPORT_VIEW_PROPERTY(onDoubleTap, RCTBubblingEventBlock)

@end
