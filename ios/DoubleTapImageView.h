//
//  DoubleTapImageView.h
//  PixoraRN
//
//  Created by Israel Brea Piñero on 19/8/25.
//

#import <UIKit/UIKit.h>
#import <React/RCTViewManager.h>

// Heredamos de UIImageView para manejar imágenes
@interface DoubleTapImageView : UIImageView

// Propiedad para el evento que se enviará a JS
@property (nonatomic, copy) RCTBubblingEventBlock onDoubleTap;

@end
