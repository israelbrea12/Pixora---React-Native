// ios/PhotoSaver.m
#import "PhotoSaver.h"
#import <Photos/Photos.h>

@implementation PhotoSaver

// Exporta el módulo. React Native lo encontrará por el nombre de la clase, "PhotoSaver". [cite: 16]
RCT_EXPORT_MODULE();

// Exporta el método a JavaScript. Le decimos que usará promesas. [cite: 18, 47]
RCT_EXPORT_METHOD(savePhoto:(NSString *)urlString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSURL *url = [NSURL URLWithString:urlString];

  // Descarga la imagen de forma asíncrona
  [[[NSURLSession sharedSession] dataTaskWithURL:url completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
    if (error || !data) {
      reject(@"download_error", @"No se pudo descargar la imagen.", error);
      return;
    }

    // Pide permiso y guarda la imagen en la galería
    [[PHPhotoLibrary sharedPhotoLibrary] performChanges:^{
      PHAssetCreationRequest *request = [PHAssetCreationRequest creationRequestForAsset];
      [request addResourceWithType:PHAssetResourceTypePhoto data:data options:nil];
    } completionHandler:^(BOOL success, NSError * _Nullable error) {
      if (error) {
        reject(@"save_error", @"No se pudo guardar la imagen en la galería.", error);
      } else {
        resolve(@"La foto se ha guardado en tu galería."); // Resuelve la promesa con éxito. [cite: 48, 78]
      }
    }];
  }] resume];
}
@end