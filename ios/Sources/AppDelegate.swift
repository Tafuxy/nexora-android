import UIKit
import UserNotifications

@main
final class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        let window = UIWindow(frame: UIScreen.main.bounds)
        window.backgroundColor = UIColor(red: 9/255, green: 11/255, blue: 15/255, alpha: 1)
        window.rootViewController = NexoraViewController()
        window.makeKeyAndVisible()
        self.window = window

        UNUserNotificationCenter.current().delegate = self
        application.setMinimumBackgroundFetchInterval(UIApplication.backgroundFetchIntervalMinimum)
        return true
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        guard url.scheme?.lowercased() == "nexora", url.host?.lowercased() == "bank-connected" else { return false }
        let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        let handle = components?.queryItems?.first(where: { $0.name == "handle" })?.value ?? ""
        NotificationCenter.default.post(name: Notification.Name("NexoraBankReturn"), object: nil, userInfo: ["handle": handle])
        return true
    }

    func application(_ application: UIApplication, performFetchWithCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        NotificationCoordinator.shared.performBackgroundSync(completion: completionHandler)
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound])
    }
}
