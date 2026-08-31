import UIKit
import WebKit
import LocalAuthentication

final class NexoraViewController: UIViewController, WKNavigationDelegate, WKScriptMessageHandler {
    private enum Key {
        static let setupComplete = "setup_complete"
    }

    private var webView: WKWebView!
    private var pageReady = false
    private var authPending = false
    private var authenticationInProgress = false
    private var authenticatedForForeground = false
    private var bankReturnPending = false
    private var bankReturnHandle = ""
    private let prefs = UserDefaults.standard

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 9/255, green: 11/255, blue: 15/255, alpha: 1)
        configureWebView()
        observeAppState()
        loadApp()
        if isSetupComplete() { lockForPrivacy() }
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        unlockIfNeeded()
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    private func observeAppState() {
        NotificationCenter.default.addObserver(self, selector: #selector(appWillResignActive), name: UIApplication.willResignActiveNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(appDidBecomeActive), name: UIApplication.didBecomeActiveNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(bankReturnReceived(_:)), name: Notification.Name("NexoraBankReturn"), object: nil)
    }

    @objc private func appWillResignActive() {
        // Hide personal/bank data before iOS creates the app-switcher snapshot.
        guard isSetupComplete(), !authenticationInProgress else { return }
        authenticatedForForeground = false
        lockForPrivacy()
    }

    @objc private func appDidBecomeActive() {
        unlockIfNeeded()
    }

    @objc private func bankReturnReceived(_ notification: Notification) {
        bankReturnHandle = notification.userInfo?["handle"] as? String ?? ""
        bankReturnPending = true
        authenticatedForForeground = false
        lockForPrivacy()
        unlockIfNeeded()
    }

    private func isSetupComplete() -> Bool {
        prefs.bool(forKey: Key.setupComplete)
    }

    private func configureWebView() {
        let controller = WKUserContentController()
        controller.add(self, name: "nexora")
        controller.addUserScript(WKUserScript(source: Self.bridgeScript, injectionTime: .atDocumentStart, forMainFrameOnly: true))

        let config = WKWebViewConfiguration()
        config.userContentController = controller
        config.websiteDataStore = .default()
        config.allowsInlineMediaPlayback = true

        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = view.backgroundColor
        webView.scrollView.backgroundColor = view.backgroundColor
        webView.scrollView.bounces = false
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)

        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor),
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor)
        ])
    }

    private func loadApp() {
        guard let www = Bundle.main.url(forResource: "www", withExtension: nil),
              let index = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") else {
            showFatal("Nexora resources could not be loaded.")
            return
        }
        webView.loadFileURL(index, allowingReadAccessTo: www)
    }

    private func unlockIfNeeded() {
        guard isSetupComplete(), !authenticatedForForeground, !authenticationInProgress, view.window != nil else { return }
        authenticateForForeground()
    }

    private func lockForPrivacy() {
        authPending = true
        webView?.isHidden = true
        emitNativeState()
    }

    private func biometricAvailable() -> Bool {
        let context = LAContext()
        var error: NSError?
        return context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
    }

    private func deviceSecure() -> Bool {
        let context = LAContext()
        var error: NSError?
        return context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error)
    }

    private func authenticateForForeground() {
        lockForPrivacy()
        authenticationInProgress = true

        let context = LAContext()
        context.localizedCancelTitle = localizedCancel()
        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) else {
            authenticationInProgress = false
            showSecurityRequired()
            return
        }

        // iOS automatically prefers Face ID / Touch ID and falls back to the iPhone passcode.
        context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: localizedUnlockReason()) { [weak self] success, _ in
            DispatchQueue.main.async {
                guard let self else { return }
                self.authenticationInProgress = false
                if success {
                    self.authenticatedForForeground = true
                    self.authPending = false
                    self.webView.isHidden = false
                    self.emitNativeState()
                    if self.bankReturnPending {
                        self.bankReturnPending = false
                        let handle = self.bankReturnHandle
                        self.bankReturnHandle = ""
                        self.webView.evaluateJavaScript("window.NexoraApp && window.NexoraApp.onBankReturn && window.NexoraApp.onBankReturn(\(self.javascriptString(handle)));")
                    }
                } else {
                    self.lockForPrivacy()
                    self.showUnlockRetry()
                }
            }
        }
    }

    private func javascriptString(_ value: String) -> String {
        guard let data = try? JSONSerialization.data(withJSONObject: [value], options: []),
              var text = String(data: data, encoding: .utf8), text.count >= 2 else { return "\"\"" }
        text.removeFirst()
        text.removeLast()
        return text
    }

    private func localizedUnlockReason() -> String {
        Locale.preferredLanguages.first?.lowercased().hasPrefix("et") == true ? "Ava Nexora Face ID, Touch ID või iPhone’i koodiga" : "Unlock Nexora with Face ID, Touch ID or your iPhone passcode"
    }

    private func localizedCancel() -> String {
        Locale.preferredLanguages.first?.lowercased().hasPrefix("et") == true ? "Tühista" : "Cancel"
    }

    private func showSecurityRequired() {
        lockForPrivacy()
        let isET = Locale.preferredLanguages.first?.lowercased().hasPrefix("et") == true
        let alert = UIAlertController(
            title: "Nexora",
            message: isET ? "Nexora vajab Face ID, Touch ID või iPhone’i pääsukoodi, et kaitsta sinu finantsandmeid." : "Nexora requires Face ID, Touch ID or an iPhone passcode to protect your financial data.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }

    private func showUnlockRetry() {
        let isET = Locale.preferredLanguages.first?.lowercased().hasPrefix("et") == true
        let alert = UIAlertController(
            title: "Nexora",
            message: isET ? "Nexora on lukustatud. Finantsandmeid ei kuvata enne tuvastamist." : "Nexora is locked. Financial data stays hidden until you authenticate.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: isET ? "Proovi uuesti" : "Try again", style: .default) { [weak self] _ in
            self?.unlockIfNeeded()
        })
        present(alert, animated: true)
    }

    private func showFatal(_ message: String) {
        let label = UILabel()
        label.text = message
        label.textColor = .white
        label.textAlignment = .center
        label.numberOfLines = 0
        label.frame = view.bounds.insetBy(dx: 24, dy: 24)
        view.addSubview(label)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        pageReady = true
        emitNativeState()
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if let url = navigationAction.request.url, !url.isFileURL,
           let scheme = url.scheme?.lowercased(), ["http", "https", "mailto", "tel", "nexora"].contains(scheme) {
            if scheme != "nexora" { UIApplication.shared.open(url) }
            decisionHandler(.cancel)
            return
        }
        decisionHandler(.allow)
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "nexora", let body = message.body as? [String: Any], let action = body["action"] as? String else { return }
        switch action {
        case "setSetupComplete":
            let complete = (body["value"] as? Bool) ?? false
            prefs.set(complete, forKey: Key.setupComplete)
            if !complete {
                authenticatedForForeground = false
                authPending = false
                webView.isHidden = false
            }
            emitNativeState()
        case "enableBiometric", "disableBiometric", "setRequireAuth":
            // Kept for compatibility with the shared UI. App lock is mandatory and cannot be disabled.
            emitNativeState()
        case "openExternal":
            if let raw = body["url"] as? String, let url = URL(string: raw), ["http", "https"].contains(url.scheme?.lowercased() ?? "") {
                UIApplication.shared.open(url)
            }
        case "updateNotificationConfig":
            if let json = body["json"] as? String {
                NotificationCoordinator.shared.updateConfig(json: json)
            }
        case "requestNotificationPermission":
            NotificationCoordinator.shared.requestPermission()
        default:
            break
        }
    }

    private func emitNativeState() {
        guard pageReady else { return }
        let payload: [String: Any] = [
            "authPending": authPending,
            "biometricAvailable": biometricAvailable(),
            "biometricEnabled": biometricAvailable(),
            "requireAuth": true,
            "setupComplete": isSetupComplete(),
            "deviceSecure": deviceSecure()
        ]
        sendToJS(function: "onNativeState", payload: payload)
    }

    private func sendToJS(function: String, payload: [String: Any]) {
        guard pageReady, JSONSerialization.isValidJSONObject(payload),
              let data = try? JSONSerialization.data(withJSONObject: payload),
              let json = String(data: data, encoding: .utf8) else { return }
        webView.evaluateJavaScript("window.NexoraApp && window.NexoraApp.\(function)(\(json));")
    }

    private static let bridgeScript = """
    window.NexoraNative = {
      enableBiometric: function(){ window.webkit.messageHandlers.nexora.postMessage({action:'enableBiometric'}); },
      disableBiometric: function(){ window.webkit.messageHandlers.nexora.postMessage({action:'disableBiometric'}); },
      setRequireAuth: function(v){ window.webkit.messageHandlers.nexora.postMessage({action:'setRequireAuth', value:!!v}); },
      setSetupComplete: function(v){ window.webkit.messageHandlers.nexora.postMessage({action:'setSetupComplete', value:!!v}); },
      openExternal: function(url){ window.webkit.messageHandlers.nexora.postMessage({action:'openExternal', url:String(url||'')}); },
      updateNotificationConfig: function(json){ window.webkit.messageHandlers.nexora.postMessage({action:'updateNotificationConfig', json:String(json||'{}')}); },
      requestNotificationPermission: function(){ window.webkit.messageHandlers.nexora.postMessage({action:'requestNotificationPermission'}); }
    };
    """
}
