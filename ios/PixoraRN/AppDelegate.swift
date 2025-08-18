import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import RNBootSplash


@main
class AppDelegate: RCTAppDelegate {
  override func application(
  _ application: UIApplication,
  didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil
) -> Bool {
  self.moduleName = "PixoraRN"
  self.dependencyProvider = RCTAppDependencyProvider()
  self.initialProps = [:]

  let didFinish = super.application(application, didFinishLaunchingWithOptions: launchOptions)

  // 👇 Esta es la línea clave. Asegúrate de que el rootView exista.
  if let rootView = self.window.rootViewController?.view {
      RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView) // Pasa el rootView aquí

      // 👇 AÑADE ESTA LÍNEA PARA IGUALAR EL COLOR DE FONDO
      // Usa el mismo color que tienes en `BootSplashBackground-ce2a66` en tu Storyboard.
      // Puedes usar UIColor(named: "nombre_del_color") si lo tienes en Assets.xcassets.
      // Si no, puedes definirlo directamente.
      rootView.backgroundColor = UIColor(named: "BootSplashBackground-ce2a66")
  }


  return didFinish
}



  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
