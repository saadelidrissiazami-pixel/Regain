// Le SDK iOS 27 (Xcode 27) refuse de lancer une app qui n'adopte pas le cycle de vie UIScene :
// « UIScene life cycle is required for apps built with this SDK ». Le projet généré par Expo
// SDK 57 crée encore sa fenêtre dans l'AppDelegate. Ce plugin déplace la création de la fenêtre
// et le démarrage de React Native dans un SceneDelegate, en attendant le correctif officiel
// (https://github.com/expo/expo/issues/50179). À retirer lors du passage au SDK 58.
const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

const SCENE_DELEGATE = `
// Ajouté par plugins/withIosSceneDelegate.js
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate,
          let factory = appDelegate.reactNativeFactory else { return }

    let window = UIWindow(windowScene: windowScene)
    self.window = window
    appDelegate.window = window
    factory.startReactNative(withModuleName: "main", in: window, launchOptions: appDelegate.launchOptions)

    // Avec les scènes, les liens reçus au lancement arrivent ici et non plus dans l'AppDelegate.
    if let url = connectionOptions.urlContexts.first?.url {
      _ = appDelegate.application(UIApplication.shared, open: url, options: [:])
    }
    if let userActivity = connectionOptions.userActivities.first {
      _ = appDelegate.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
    }
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let url = URLContexts.first?.url,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }
    _ = appDelegate.application(UIApplication.shared, open: url, options: [:])
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }
    _ = appDelegate.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
  }
}
`;

function replaceOrThrow(contents, pattern, replacement, what) {
  if (!pattern.test(contents)) {
    throw new Error(`withIosSceneDelegate : ${what} introuvable dans AppDelegate.swift (le modèle Expo a changé ?)`);
  }
  return contents.replace(pattern, replacement);
}

function withSceneAppDelegate(config) {
  return withAppDelegate(config, (mod) => {
    if (mod.modResults.language !== 'swift') {
      throw new Error('withIosSceneDelegate ne gère que les AppDelegate en Swift.');
    }
    let contents = mod.modResults.contents;
    if (contents.includes('class SceneDelegate')) return mod;

    contents = replaceOrThrow(
      contents,
      /(var reactNativeFactory: RCTReactNativeFactory\?\n)/,
      '$1  var launchOptions: [UIApplication.LaunchOptionsKey: Any]?\n',
      'la propriété reactNativeFactory'
    );
    // Création de fenêtre et démarrage de React Native sont remplacés séparément : d'autres
    // plugins insèrent parfois du code entre les deux.
    contents = replaceOrThrow(
      contents,
      /window = UIWindow\(frame: UIScreen\.main\.bounds\)\n/,
      'self.launchOptions = launchOptions\n',
      'la création de la fenêtre'
    );
    contents = replaceOrThrow(
      contents,
      /\n\s*factory\.startReactNative\([\s\S]*?launchOptions: launchOptions\)/,
      '',
      'le démarrage de React Native'
    );

    mod.modResults.contents = `${contents.trimEnd()}\n${SCENE_DELEGATE}`;
    return mod;
  });
}

function withSceneManifest(config) {
  return withInfoPlist(config, (mod) => {
    mod.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    };
    return mod;
  });
}

module.exports = function withIosSceneDelegate(config) {
  return withSceneManifest(withSceneAppDelegate(config));
};
