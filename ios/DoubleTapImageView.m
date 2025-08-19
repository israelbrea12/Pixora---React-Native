//
//  DoubleTapImageView.m
//  PixoraRN
//
//  Created by Israel Brea Piñero on 19/8/25.
//

#import "DoubleTapImageView.h"
#import <SDWebImage/UIImageView+WebCache.h> 

@implementation DoubleTapImageView

- (instancetype)initWithFrame:(CGRect)frame
{
  self = [super initWithFrame:frame];
  if (self) {
    self.userInteractionEnabled = YES;
    self.contentMode = UIViewContentModeScaleAspectFit; 

    UITapGestureRecognizer *doubleTapRecognizer = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleDoubleTap:)];
    doubleTapRecognizer.numberOfTapsRequired = 2;
    [self addGestureRecognizer:doubleTapRecognizer];
  }
  return self;
}

- (void)handleDoubleTap:(UITapGestureRecognizer *)recognizer
{
  if (self.onDoubleTap) {
    self.onDoubleTap(@{}); 
  }
}

@end

@interface DoubleTapImageViewManager : RCTViewManager
@end

@implementation DoubleTapImageViewManager

RCT_EXPORT_MODULE(DoubleTapImageView) 

- (UIView *)view
{
  return [[DoubleTapImageView alloc] init];
}

RCT_CUSTOM_VIEW_PROPERTY(imageUrl, NSString, DoubleTapImageView)
{
  NSURL *url = [NSURL URLWithString:json ? [RCTConvert NSString:json] : @""];
  [view sd_setImageWithURL:url];
}

RCT_EXPORT_VIEW_PROPERTY(onDoubleTap, RCTBubblingEventBlock)

@end
