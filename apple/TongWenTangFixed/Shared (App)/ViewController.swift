import SafariServices
import WebKit
#if os(iOS)
import UIKit
typealias PlatformViewController = UIViewController
#else
import AppKit
typealias PlatformViewController = NSViewController
#endif

private final class WeakMessageHandler: NSObject, WKScriptMessageHandler {
    weak var delegate: WKScriptMessageHandler?
    init(_ delegate: WKScriptMessageHandler) { self.delegate = delegate }
    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        delegate?.userContentController(controller, didReceive: message)
    }
}

final class ViewController: PlatformViewController, WKNavigationDelegate, WKScriptMessageHandler {
    @IBOutlet private var webView: WKWebView!
    private var extensionIdentifier: String { (Bundle.main.bundleIdentifier ?? "com.makcheunghei.tongwentangfixed") + ".Extension" }

    override func viewDidLoad() {
        super.viewDidLoad()
        webView.navigationDelegate = self
        webView.configuration.userContentController.add(WeakMessageHandler(self), name: "controller")
        #if os(iOS)
        webView.scrollView.isScrollEnabled = true
        webView.scrollView.contentInsetAdjustmentBehavior = .automatic
        #endif
        guard let page = Bundle.main.url(forResource: "Main", withExtension: "html"),
              let resources = Bundle.main.resourceURL else { return }
        webView.loadFileURL(page, allowingReadAccessTo: resources)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        #if os(iOS)
        if #available(iOS 26.2, *) {
            webView.evaluateJavaScript("show('ios', null, true)", completionHandler: nil)
        } else {
            webView.evaluateJavaScript("show('ios', null, false)", completionHandler: nil)
        }
        #else
        webView.evaluateJavaScript("show('mac', null, true)", completionHandler: nil)
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionIdentifier) { [weak self] state, _ in
            guard let state else { return }
            DispatchQueue.main.async {
                self?.webView.evaluateJavaScript("show('mac', \(state.isEnabled), true)", completionHandler: nil)
            }
        }
        #endif
    }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.body as? String == "open-settings" else { return }
        #if os(iOS)
        if #available(iOS 26.2, *) {
            SFSafariSettings.openExtensionsSettings(forIdentifiers: [extensionIdentifier]) { [weak self] error in
                if error != nil { self?.showSettingsError() }
            }
        }
        #else
        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionIdentifier) { [weak self] error in
            if error != nil { DispatchQueue.main.async { self?.showSettingsError() } }
        }
        #endif
    }

    private func showSettingsError() {
        webView.evaluateJavaScript("settingsFailed()", completionHandler: nil)
    }
}
