import SafariServices
import WebKit
import SwiftUI
import Combine
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
    private let activationState = ActivationState()
    private var extensionIdentifier: String { (Bundle.main.bundleIdentifier ?? "com.makcheunghei.tongwentangfixed") + ".Extension" }

    override func viewDidLoad() {
        super.viewDidLoad()
        if #available(iOS 26.0, macOS 26.0, *) {
            showNativeWelcome()
            return
        }
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
        openSafariSettings()
    }

    private func openSafariSettings() {
        #if os(iOS)
        if #available(iOS 26.2, *) {
            SFSafariSettings.openExtensionsSettings(forIdentifiers: [extensionIdentifier]) { [weak self] error in
                if error != nil { DispatchQueue.main.async { self?.showSettingsError() } }
            }
        }
        #else
        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionIdentifier) { [weak self] error in
            if error != nil { DispatchQueue.main.async { self?.showSettingsError() } }
        }
        #endif
    }

    @available(iOS 26.0, macOS 26.0, *)
    private func showNativeWelcome() {
        webView.isHidden = true
        let welcome = WelcomeScreen(state: activationState, openSettings: { [weak self] in
            self?.openSafariSettings()
        })
        #if os(iOS)
        let host = UIHostingController(rootView: welcome)
        addChild(host)
        view.addSubview(host.view)
        host.view.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            host.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            host.view.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            host.view.topAnchor.constraint(equalTo: view.topAnchor),
            host.view.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
        host.didMove(toParent: self)
        #else
        let host = NSHostingController(rootView: welcome)
        addChild(host)
        view.addSubview(host.view)
        host.view.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            host.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            host.view.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            host.view.topAnchor.constraint(equalTo: view.topAnchor),
            host.view.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionIdentifier) { [weak self] state, _ in
            DispatchQueue.main.async { self?.activationState.enabled = state?.isEnabled }
        }
        #endif
    }

    private func showSettingsError() {
        activationState.errorMessage = "未能直接開啟。請到 Safari 設定的「延伸功能」啟用新同文堂。"
        webView.evaluateJavaScript("settingsFailed()", completionHandler: nil)
    }
}

private final class ActivationState: ObservableObject {
    @Published var enabled: Bool?
    @Published var errorMessage: String?
}

@available(iOS 26.0, macOS 26.0, *)
private struct WelcomeScreen: View {
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @ScaledMetric(relativeTo: .body) private var stepNumberSize = 28.0
    @ObservedObject var state: ActivationState
    let openSettings: () -> Void

    private var settingsAvailable: Bool {
        #if os(iOS)
        if #available(iOS 26.2, *) { return true }
        return false
        #else
        return true
        #endif
    }

    private var canvas: Color {
        #if os(iOS)
        Color(uiColor: .systemGroupedBackground)
        #else
        Color(nsColor: .windowBackgroundColor)
        #endif
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 28) {
                    VStack(alignment: .leading, spacing: 14) {
                        Image(systemName: "character.bubble.fill")
                            .font(.system(size: 42, weight: .medium))
                            .foregroundStyle(.tint)
                            .accessibilityHidden(true)
                        Text("在 Safari 使用新同文堂")
                            .font(.largeTitle.bold())
                            .fixedSize(horizontal: false, vertical: true)
                        Text("先啟用延伸功能，即可在網頁切換繁簡中文。")
                            .font(.body)
                            .foregroundStyle(Color.primary.opacity(0.75))
                    }
                    .padding(.top, 12)

                    VStack(alignment: .leading, spacing: 0) {
                        #if os(iOS)
                        step("1", title: "啟用延伸功能", detail: "設定 → App → Safari → 延伸功能，開啟新同文堂。")
                        Divider().padding(.leading, 44)
                        step("2", title: "允許網站存取", detail: "只允許你需要轉換的網站，或依閱讀需要調整權限。")
                        Divider().padding(.leading, 44)
                        step("3", title: "返回 Safari 開始閱讀", detail: "從網頁選單開啟新同文堂，選擇轉換方向。")
                        #else
                        step("1", title: "啟用延伸功能", detail: "在 Safari 設定的「延伸功能」勾選新同文堂。")
                        Divider().padding(.leading, 44)
                        step("2", title: "選擇允許的網站", detail: "允許需要轉換的網站，再從 Safari 工具列開啟新同文堂。")
                        #endif
                    }
                    .padding(.horizontal, 18)
                    .background(.background, in: .rect(cornerRadius: 20))

                    if let enabled = state.enabled {
                        Label(enabled ? "延伸功能已啟用" : "延伸功能尚未啟用", systemImage: enabled ? "checkmark.circle" : "info.circle")
                            .font(.callout)
                            .accessibilityElement(children: .combine)
                    }
                    Text("自動轉換預設關閉。你可以在 Safari 面板的「設定與詞庫」管理網站規則及個人詞組。所有轉換都在裝置上處理。")
                        .font(.footnote)
                        .foregroundStyle(Color.primary.opacity(0.75))
                    if let message = state.errorMessage {
                        Text(message).font(.callout).accessibilityAddTraits(.updatesFrequently)
                    }
                    if settingsAvailable && dynamicTypeSize.isAccessibilitySize {
                        settingsButton
                    }
                }
                .frame(maxWidth: 560, alignment: .leading)
                .padding(24)
                .frame(maxWidth: .infinity)
            }
            .background(canvas)
            .navigationTitle("新同文堂")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Link(destination: URL(string: "https://github.com/makcheunghei/new-tongwentang-fixed")!) {
                        Label("專案與支援", systemImage: "questionmark.circle")
                    }
                    .foregroundStyle(.primary)
                }
            }
            .safeAreaInset(edge: .bottom, spacing: 0) {
                if settingsAvailable && !dynamicTypeSize.isAccessibilitySize {
                    settingsButton
                        .padding(.horizontal, 24)
                        .padding(.vertical, 16)
                }
            }
        }
    }

    private var settingsButton: some View {
        Button(action: openSettings) {
            Group {
                if dynamicTypeSize.isAccessibilitySize {
                    Text("Safari 設定")
                } else {
                    Label("開啟 Safari 設定", systemImage: "safari")
                }
            }
            .font(.body.weight(.semibold))
            .foregroundStyle(.white)
            .frame(maxWidth: 480, minHeight: 44)
            .padding(.horizontal, 12)
        }
        .accessibilityLabel("開啟 Safari 延伸功能設定")
        .buttonStyle(.glassProminent)
        .tint(Color.accentColor)
        .controlSize(.large)
    }

    private func step(_ number: String, title: String, detail: String) -> some View {
        HStack(alignment: .top, spacing: 14) {
            Text(number)
                .font(.body.weight(.semibold))
                .frame(width: stepNumberSize, height: stepNumberSize)
                .background(canvas, in: .circle)
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 5) {
                Text(title).font(.body.weight(.semibold))
                Text(detail).font(.callout).foregroundStyle(Color.primary.opacity(0.75))
            }
            .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.vertical, 18)
        .accessibilityElement(children: .combine)
    }
}
