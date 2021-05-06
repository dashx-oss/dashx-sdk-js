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

        let identifyAccountInput = DashXGql.IdentifyAccountInput(
            accountType: accountType,
            uid: uid,
            anonymousUid: anonymousUid,
            email: optionsDictionary?["email"],
            phone: optionsDictionary?["phone"],
            name: optionsDictionary?["name"],
            firstName: optionsDictionary?["firstName"],
            lastName: optionsDictionary?["lastName"]
        )

        let identifyAccountMutation = DashXGql.IdentifyAccountMutation(input: identifyAccountInput)

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

        let trackEventInput = DashXGql.TrackEventInput(
            accountType: accountType!,
            event: event,
            uid: uid,
            anonymousUid: anonymousUid,
            data: trackData
        )

        DashXLog.d(tag: #function, "Calling track with \(trackEventInput)")

        let trackEventMutation = DashXGql.TrackEventMutation(input: trackEventInput)

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

        let subscribeContactInput  = DashXGql.SubscribeContactInput(
            uid: uid!,
            name: deviceKind,
            kind: .ios,
            value: deviceToken!
        )

        DashXLog.d(tag: #function, "Calling subscribe with \(subscribeContactInput)")

        let subscribeContactMutation = DashXGql.SubscribeContactMutation(input: subscribeContactInput)

        Network.shared.apollo.perform(mutation: subscribeContactMutation) { result in
          switch result {
          case .success(let graphQLResult):
            DashXLog.d(tag: #function, "Sent subscribe with \(String(describing: graphQLResult))")
          case .failure(let error):
            DashXLog.d(tag: #function, "Encountered an error during subscribe(): \(error)")
          }
        }
    }
    // MARK: -- content

    func findContent(_ contentType: String, _ content: String, _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
        let findContentInput  = DashXGql.FindContentInput(
            contentType: contentType,
            content: content
        )

        DashXLog.d(tag: #function, "Calling findContent with \(findContentInput)")

        let findContentQuery = DashXGql.FindContentQuery(input: findContentInput)

        Network.shared.apollo.fetch(query: findContentQuery) { result in
          switch result {
          case .success(let graphQLResult):
            DashXLog.d(tag: #function, "Sent findContent with \(String(describing: graphQLResult))")
            let content = graphQLResult.data?.findContent
            let json = [ "position": content?.position, "data": content?.data.serialize(), "id": content?.id ]
            resolve(json)
          case .failure(let error):
            DashXLog.d(tag: #function, "Encountered an error during findContent(): \(error)")
            reject("", error.localizedDescription, error)
          }
        }
    }

    func searchContent(_ contentType: String, _ returnType: String, _ filter: NSDictionary?, _ order: NSDictionary?, _ limit: Int?, _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
        let filterJson: String?
        let orderJson: String?

        if filter == nil {
            filterJson = nil
        } else if JSONSerialization.isValidJSONObject(filter!) {
            filterJson = try? String(
                data: JSONSerialization.data(withJSONObject: filter!),
                encoding: .utf8
            )
        } else {
            DashXLog.d(tag: #function, "Encountered an error while encoding filter")
            return
        }

        if order == nil {
            orderJson = nil
        } else if JSONSerialization.isValidJSONObject(order!) {
            orderJson = try? String(
                data: JSONSerialization.data(withJSONObject: order!),
                encoding: .utf8
            )
        } else {
            DashXLog.d(tag: #function, "Encountered an error while encoding order")
            return
        }


        let searchContentsInput  = DashXGql.SearchContentsInput(
            contentType: contentType,
            returnType: returnType,
            filter: filterJson,
            order: orderJson,
            limit: limit
        )

        DashXLog.d(tag: #function, "Calling searchContent with \(searchContentsInput)")

        let searchContentQuery = DashXGql.SearchContentsQuery(input: searchContentsInput)

        Network.shared.apollo.fetch(query: searchContentQuery) { result in
          switch result {
          case .success(let graphQLResult):
            DashXLog.d(tag: #function, "Sent searchContents with \(String(describing: graphQLResult.data?.searchContents.contents))")
            let json = graphQLResult.data?.searchContents.contents.map({ content in
                ["position": content.position, "data": content.data.serialize(), "id": content.id ]
            })
            resolve(json)
          case .failure(let error):
            DashXLog.d(tag: #function, "Encountered an error during searchContent(): \(error)")
            reject("", error.localizedDescription, error)
          }
        }
    }

    func addContent(_ contentType: String, _ content: String, _ data: NSDictionary?, _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
        let dataJson: String?

        if data == nil {
            dataJson = nil
        } else if JSONSerialization.isValidJSONObject(data!) {
            dataJson = try? String(
                data: JSONSerialization.data(withJSONObject: data!),
                encoding: .utf8
            )
        } else {
            DashXLog.d(tag: #function, "Encountered an error while encoding data")
            return
        }


        let addContentInput  = DashXGql.AddContentInput(
            contentType: contentType,
            content: content,
            data: dataJson ?? ""
        )

        DashXLog.d(tag: #function, "Calling addContent with \(addContentInput)")

        let addContentMutation = DashXGql.AddContentMutation(input: addContentInput)

        Network.shared.apollo.perform(mutation: addContentMutation) { result in
          switch result {
          case .success(let graphQLResult):
            DashXLog.d(tag: #function, "Sent addContent with \(String(describing: graphQLResult))")
            let content = graphQLResult.data?.addContent
            let json = [ "position": content?.position, "data": content?.data.serialize(), "id": content?.id ]
            resolve(json)
          case .failure(let error):
            DashXLog.d(tag: #function, "Encountered an error during addContent(): \(error)")
            reject("", error.localizedDescription, error)
          }
        }
    }

    func editContent(_ contentType: String, _ content: String, _ data: NSDictionary?, _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
        let dataJson: String?

        if data == nil {
            dataJson = nil
        } else if JSONSerialization.isValidJSONObject(data!) {
            dataJson = try? String(
                data: JSONSerialization.data(withJSONObject: data!),
                encoding: .utf8
            )
        } else {
            DashXLog.d(tag: #function, "Encountered an error while encoding data")
            return
        }

        let editContentInput  = DashXGql.EditContentInput(
            contentType: contentType,
            content: content,
            data: dataJson ?? ""
        )

        DashXLog.d(tag: #function, "Calling editContent with \(editContentInput)")

        let editContentMutation = DashXGql.EditContentMutation(input: editContentInput)

        Network.shared.apollo.perform(mutation: editContentMutation) { result in
          switch result {
          case .success(let graphQLResult):
            DashXLog.d(tag: #function, "Sent editContent with \(String(describing: graphQLResult))")
            let content = graphQLResult.data?.editContent
            let json = [ "position": content?.position, "data": content?.data.serialize(), "id": content?.id ]
            resolve(json)
          case .failure(let error):
            DashXLog.d(tag: #function, "Encountered an error during editContent(): \(error)")
            reject("", error.localizedDescription, error)
          }
        }
    }
}
