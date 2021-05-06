import Foundation
import Apollo

struct FirebaseRemoteMessage: Decodable {
    let aps: APS

    struct APS: Decodable {
        let alert: Alert

        struct Alert: Decodable {
            let title: String
            let body: String
        }
    }

    init(decoding userInfo: [AnyHashable: Any]) throws {
        let data = try JSONSerialization.data(withJSONObject: userInfo, options: .prettyPrinted)
        self = try JSONDecoder().decode(FirebaseRemoteMessage.self, from: data)
    }
}

public extension DashXGql {
    typealias JSON = String
    typealias UUID = String
    
    enum Json {
      case dictionary([String: Any])
      case array([Any])
    }
}

extension DashXGql.Json: JSONDecodable {
  public init(jsonValue value: JSONValue) throws {
    if let dict = value as? [String: Any] {
      self = .dictionary(dict)
    } else if let array = value as? [Any] {
      self = .array(array)
    } else {
      throw JSONDecodingError.couldNotConvert(value: value, to: DashXGql.Json.self)
    }
  }
    
    public func serialize() -> JSONValue {
        switch self {
        case .dictionary(let value):
            return value.jsonObject
        case .array(let value):
            return value.jsonValue
        }
    }
}
