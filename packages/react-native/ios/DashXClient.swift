import Foundation

enum DashXClientError: Error {
    case noArgsInIdentify
}

class DashXClient: HttpClient {
    static let instance = DashXClient()
    private var anonymousUid: String?
    private var uid: String?
    private var deviceToken: String?
    private var identityToken: String?
    private var contentCacheTimeout: Int?

    private init() {
        super.init("https://api.dashx.com/v1")
        generateAnonymousUid()
    }
    
    func setContentCacheTimeout(to: Int?) {
        self.contentCacheTimeout = to
    }

    func setDeviceToken(to: String) {
        self.deviceToken = to
    }

    func setIdentityToken(to: String) {
        self.identityToken = to
    }

    private func generateAnonymousUid(withRegenerate: Bool = false) {
        let preferences = UserDefaults.standard
        let anonymousUidKey = Constants.USER_PREFERENCES_KEY_ANONYMOUS_UID

        if !withRegenerate && preferences.object(forKey: anonymousUidKey) != nil {
            self.anonymousUid = preferences.string(forKey: anonymousUidKey) ?? nil
        } else {
            self.anonymousUid = UUID().uuidString
            preferences.set(self.anonymousUid, forKey: anonymousUidKey)
        }
    }

    func identify(_ uid: String?, withOptions: NSDictionary?) throws {
        if uid != nil {
            self.uid = uid
            return
        }

        if withOptions == nil {
            throw DashXClientError.noArgsInIdentify
        }

        let optionsDictionary = withOptions as? Dictionary<String, String>

        let identifyRequest = IdentifyRequest(
            firstName: optionsDictionary?["firstName"],
            lastName: optionsDictionary?["lastName"],
            email: optionsDictionary?["email"],
            phone: optionsDictionary?["phone"],
            anonymousUid: self.anonymousUid
        )

        DashXLog.d(tag: #function, "Calling Identify with \(identifyRequest)")

        self.create().makeRequest(uri: "/identify", identifyRequest,
            { response in DashXLog.d(tag: #function, "Sent identify with \(String(describing: response))") },
            { error in DashXLog.d(tag: #function, "Encountered an error during identify(): \(error)") }
        )
    }

    func reset() {
        self.uid = nil
        self.generateAnonymousUid(withRegenerate: true)
    }

    func track(_ event: String, withData: NSDictionary?) {
        let trackData: JSONValue?

        if withData == nil {
            trackData = nil
        } else if JSONSerialization.isValidJSONObject(withData!) {
            trackData = try? JSONDecoder().decode(JSONValue.self, from: JSONSerialization.data(withJSONObject: withData!))
        } else {
            DashXLog.d(tag: #function, "Encountered an error while encoding track data")
            return
        }

        let trackRequest = TrackRequest(event: event, anonymousUid: self.anonymousUid, uid: self.uid, data: trackData)

        DashXLog.d(tag: #function, "Calling track with \(trackRequest)")

        self.create().makeRequest(uri: "/track", trackRequest,
            { response in DashXLog.d(tag: #function, "Sent track with \(String(describing: response))") },
            { error in DashXLog.d(tag: #function, "Encountered an error during track(): \(error)") }
        )
    }

    func subscribe() {
        if deviceToken == nil || identityToken == nil {
            return
        }

        let deviceKind = "IOS"
        let subscribeRequest = SubscribeRequest(
            value: deviceToken!, kind:deviceKind, anonymousUid: anonymousUid, uid: uid
        )

        DashXLog.d(tag: #function, "Calling subscribe with \(subscribeRequest)")

        let headers = [ "X-Identity-Token": identityToken! ]

        self.create().withHeaders(headers).makeRequest(uri: "/subscribe", subscribeRequest,
            { response in DashXLog.d(tag: #function, "Subscribed with \(String(describing: response))") },
            { error in DashXLog.d(tag: #function, "Encountered an error during subscribe(): \(error)") }
        )
    }
    
    func screen(_ screenName: String, withData: NSDictionary?) {
        let properties = withData as? Dictionary<String, Any>
        
       track(Constants.INTERNAL_EVENT_APP_SCREEN_VIEWED, withData: properties?.merging([ "name": screenName], uniquingKeysWith: { (_, new) in new }) as NSDictionary?)
    }
    
    func content(_ contentType: String, withOptions: NSDictionary) {
        var filterByVal: JSONValue?
        var orderByVal: JSONValue?
        
        let optionsDictionary = withOptions as! Dictionary<String, Any>
        
        if let filterBy = optionsDictionary["filter"], JSONSerialization.isValidJSONObject(filterBy) {
            filterByVal = try? JSONDecoder().decode(JSONValue.self, from: JSONSerialization.data(withJSONObject: filterBy))
        }
        
        if let orderBy = optionsDictionary["order"], JSONSerialization.isValidJSONObject(orderBy) {
            orderByVal = try? JSONDecoder().decode(JSONValue.self, from: JSONSerialization.data(withJSONObject: orderBy))
        }
        
        let cacheTimeout = withOptions["cache"] as? Int ?? contentCacheTimeout
        
        let contentRequest = ContentRequest(
            contentType: contentType,
            returnType: optionsDictionary["returnType"] as? String,
            limit: optionsDictionary["limit"] as? Int,
            page: optionsDictionary["page"] as? Int,
            filter: filterByVal,
            order: orderByVal
        )

        DashXLog.d(tag: #function, "Calling subscribe with \(contentRequest)")

        self.create().withCache(timeout: cacheTimeout).makeRequest(uri: "/content", contentRequest,
            { response in DashXLog.d(tag: #function, "Called content with \(String(describing: response))") },
            { error in DashXLog.d(tag: #function, "Encountered an error during content(): \(error)") }
        )
    }
}
