//
//  PhotoSaver.m
//  PixoraRN
//
//  Created by Israel Brea Piñero on 14/8/25.
//

#import "PhotoSaver.h"
#import <Photos/Photos.h>

@implementation PhotoSaver

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(savePhoto:(NSString *)urlString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSURL *url = [NSURL URLWithString:urlString];

  [[[NSURLSession sharedSession] dataTaskWithURL:url completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
    if (error || !data) {
      reject(@"download_error", @"No se pudo descargar la imagen.", error);
      return;
    }

    [[PHPhotoLibrary sharedPhotoLibrary] performChanges:^{
      PHAssetCreationRequest *request = [PHAssetCreationRequest creationRequestForAsset];
      [request addResourceWithType:PHAssetResourceTypePhoto data:data options:nil];
    } completionHandler:^(BOOL success, NSError * _Nullable error) {
      if (error) {
        reject(@"save_error", @"No se pudo guardar la imagen en la galería.", error);
      } else {
        resolve(@"La foto se ha guardado en tu galería."); 
      }
    }];
  }] resume];
}
@end
