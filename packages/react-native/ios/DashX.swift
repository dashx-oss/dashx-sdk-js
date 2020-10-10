import Foundation
import FirebaseInstanceID

@objc(DashX)
class DashX: NSObject {
    private var dashXClient = DashXClient.instance

    @objc
    func setLogLevel(_ logLevel: Int) {
        DashXLog.setLogLevel(to: logLevel)
    }

    @objc
    func setup(_ options: NSDictionary?) {
        dashXClient.setPublicKey(to: options?.value(forKey: "publicKey") as! String)
        
        if let baseUri = options?.value(forKey: "baseUri") {
            dashXClient.setBaseUri(to: baseUri as! String)
        }
        
        if let trackAppLifecycleEvents = options?.value(forKey: "trackAppLifecycleEvents"), trackAppLifecycleEvents as! Bool {
            DashXApplicationLifecycleCallbacks.instance.enable()
        }
        
        if let trackScreenViews = options?.value(forKey: "trackScreenViews"), trackScreenViews as! Bool {
            UIViewController.swizzle()
        }
        
        if let contentCacheTimeout = options?.value(forKey: "contentCache") {
            dashXClient.setContentCacheTimeout(to: contentCacheTimeout as? Int)
        }

        InstanceID.instanceID().instanceID { (result, error) in
            if let error = error {
                DashXLog.d(tag: #function, "Error fetching remote instance ID: \(error)")
            } else if let result = result {
                DashXLog.d(tag:  #function, "Firebase initialised with: \(result.token)")
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
    
    @objc(content:options:)
    func content(_ contentType: String, _ options: NSDictionary) {
        dashXClient.content(contentType, withOptions: options)
    }
}
