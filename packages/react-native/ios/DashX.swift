import Foundation
import FirebaseInstanceID

@objc(DashX)
class DashX: RCTEventEmitter {
    private var dashXClient = DashXClient.instance

    override init() {
        super.init()
        DashXEventEmitter.instance.registerEventEmitter(eventEmitter: self)
    }

    @objc
    func setLogLevel(_ logLevel: Int) {
        DashXLog.setLogLevel(to: logLevel)
    }

    override func supportedEvents() -> [String] {
        return ["messageReceived"]
    }

    @objc
    func setup(_ options: NSDictionary?) {
        ConfigInterceptor.shared.publicKey = options?.value(forKey: "publicKey") as? String
        dashXClient.setAccountType(to: options?.value(forKey: "accountType") as! String)

        DashXAppDelegate.swizzleDidReceiveRemoteNotification()

        if let baseUri = options?.value(forKey: "baseUri") {
            Network.shared.setBaseUri(to: baseUri as! String)
        }

        if let targetInstallation = options?.value(forKey: "targetInstallation") {
            dashXClient.setTargetInstallation(to: targetInstallation as! String)
        }

        if let targetEnvironment = options?.value(forKey: "targetEnvironment") {
            dashXClient.setTargetInstallation(to: targetEnvironment as! String)
        }

        if let trackAppLifecycleEvents = options?.value(forKey: "trackAppLifecycleEvents"), trackAppLifecycleEvents as! Bool {
            DashXApplicationLifecycleCallbacks.instance.enable()
        }

        if let trackScreenViews = options?.value(forKey: "trackScreenViews"), trackScreenViews as! Bool {
            UIViewController.swizzle()
        }

        InstanceID.instanceID().instanceID { (result, error) in
            if let error = error {
                DashXLog.d(tag: #function, "Error fetching remote instance ID: \(error)")
            } else if let result = result {
                DashXLog.d(tag: #function, "Firebase initialised with: \(result.token)")
                self.dashXClient.setDeviceToken(to: result.token)
            }
        }
    }

    @objc(identify:options:)
    func identify(_ uid: String?, _ options: NSDictionary?) {
        try? dashXClient.identify(uid, withOptions: options)
    }

    @objc
    func setIdentityToken(_ identityToken: String) {
        dashXClient.setIdentityToken(to: identityToken)
    }

    @objc
    func reset() {
        dashXClient.reset()
    }

    @objc(track:data:)
    func track(_ event: String, _ data: NSDictionary?) {
        dashXClient.track(event, withData: data)
    }

    @objc(screen:data:)
    func screen(_ screenName: String, _ data: NSDictionary?) {
        dashXClient.screen(screenName, withData: data)
    }
}
