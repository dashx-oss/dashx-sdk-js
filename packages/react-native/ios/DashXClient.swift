import Foundation
import Apollo

enum DashXClientError: Error {
    case noArgsInIdentify
}

class DashXClient {
    static let instance = DashXClient()
    private var anonymousUid: String?
    private var uid: String?
    private var deviceToken: String?
    private var accountType: String?

    private init() {
        generateAnonymousUid()
    }

    func setDeviceToken(to: String) {
        self.deviceToken = to
    }

    func setAccountType(to: String) {
        self.accountType = to
    }
    
    func setTargetEnvironment(to: String) {
        ConfigInterceptor.shared.targetEnvironment = to
    }
    
    func setTargetInstallation(to: String) {
        ConfigInterceptor.shared.targetInstallation = to
    }
    
    func setIdentityToken(to: String) {
        ConfigInterceptor.shared.identityToken = to
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
    // MARK: -- identify

    func identify(_ uid: String?, withOptions: NSDictionary?) throws {
        if uid != nil {
            self.uid = uid
            return
        }

        if withOptions == nil {
            throw DashXClientError.noArgsInIdentify
        }

        let optionsDictionary = withOptions as? [String: String]

        let identifyAccountInput = IdentifyAccountInput(
            accountType: accountType,
            uid: uid,
            anonymousUid: anonymousUid,
            email: optionsDictionary?["email"],
            phone: optionsDictionary?["phone"],
            name: optionsDictionary?["name"],
            firstName: optionsDictionary?["firstName"],
            lastName: optionsDictionary?["lastName"]
        )

        let identifyAccountMutation = IdentifyAccountMutation(input: identifyAccountInput)

        Network.shared.apollo.perform(mutation: identifyAccountMutation) { result in
          switch result {
          case .success(let graphQLResult):
            DashXLog.d(tag: #function, "Sent identify with \(String(describing: graphQLResult))")
          case .failure(let error):
            DashXLog.d(tag: #function, "Encountered an error during identify(): \(error)")
          }
        }
    }

    func reset() {
        self.uid = nil
        self.generateAnonymousUid(withRegenerate: true)
    }
    // MARK: -- track

    func track(_ event: String, withData: NSDictionary?) {
        let trackData: String?

        if withData == nil {
            trackData = nil
        } else if JSONSerialization.isValidJSONObject(withData!) {
            trackData = try? String(
                data: JSONSerialization.data(withJSONObject: withData!),
                encoding: .utf8
            )
        } else {
            DashXLog.d(tag: #function, "Encountered an error while encoding track data")
            return
        }

        let trackEventInput = TrackEventInput(
            accountType: accountType!,
            event: event,
            uid: uid,
            anonymousUid: anonymousUid,
            data: trackData
        )

        DashXLog.d(tag: #function, "Calling track with \(trackEventInput)")

        let trackEventMutation = TrackEventMutation(input: trackEventInput)

        Network.shared.apollo.perform(mutation: trackEventMutation) { result in
          switch result {
          case .success(let graphQLResult):
            DashXLog.d(tag: #function, "Sent track with \(String(describing: graphQLResult))")
          case .failure(let error):
            DashXLog.d(tag: #function, "Encountered an error during track(): \(error)")
          }
        }
    }

    func screen(_ screenName: String, withData: NSDictionary?) {
        let properties = withData as? [String: Any]

        track(Constants.INTERNAL_EVENT_APP_SCREEN_VIEWED, withData: properties?.merging([ "name": screenName], uniquingKeysWith: { (_, new) in new }) as NSDictionary?)
    }
    // MARK: -- subscribe

    func subscribe() {
        if deviceToken == nil || ConfigInterceptor.shared.identityToken == nil {
            return
        }

        let deviceKind = "IOS"

        let subscribeContactInput  = SubscribeContactInput(
            uid: uid!,
            name: deviceKind,
            kind: .ios,
            value: deviceToken!
        )

        DashXLog.d(tag: #function, "Calling subscribe with \(subscribeContactInput)")

        let subscribeContactMutation = SubscribeContactMutation(input: subscribeContactInput)

        Network.shared.apollo.perform(mutation: subscribeContactMutation) { result in
          switch result {
          case .success(let graphQLResult):
            DashXLog.d(tag: #function, "Sent subscribe with \(String(describing: graphQLResult))")
          case .failure(let error):
            DashXLog.d(tag: #function, "Encountered an error during subscribe(): \(error)")
          }
        }
    }
}
