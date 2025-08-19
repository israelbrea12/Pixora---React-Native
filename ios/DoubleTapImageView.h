//
//  DoubleTapImageView.h
//  PixoraRN
//
//  Created by Israel Brea Piñero on 19/8/25.
//

#import <UIKit/UIKit.h>
#import <React/RCTViewManager.h>

@interface DoubleTapImageView : UIImageView

@property (nonatomic, copy) RCTBubblingEventBlock onDoubleTap;

@end
