import UIKit

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        let window = UIWindow(frame: UIScreen.main.bounds)
        window.backgroundColor = UIColor(red: 9/255, green: 11/255, blue: 15/255, alpha: 1)
        window.rootViewController = NexoraViewController()
        window.makeKeyAndVisible()
        self.window = window
        return true
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        guard url.scheme?.lowercased() == "nexora", url.host?.lowercased() == "bank-connected" else { return false }
        let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        let handle = components?.queryItems?.first(where: { $0.name == "handle" })?.value ?? ""
        NotificationCenter.default.post(name: Notification.Name("NexoraBankReturn"), object: nil, userInfo: ["handle": handle])
        return true
    }
}
