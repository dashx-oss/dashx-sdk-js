import Foundation

struct IdentifyRequest: Encodable {
    let firstName, lastName, email, phone, anonymousUid: String?
}

struct TrackRequest: Encodable {
    let event: String
    let anonymousUid, uid: String?
    let data: JSONValue?
}

struct SubscribeRequest: Encodable {
    let value, kind: String
    let anonymousUid, uid: String?
}

struct ContentRequest: Encodable {
    let contentType: String
    let returnType: String?
    let limit, page: Int?
    let filter, order: JSONValue?
}

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

public enum JSONValue: Decodable, Encodable {
    case bool(Bool)
    case int(Int)
    case double(Double)
    case string(String)
    case array([JSONValue])
    case object([String: JSONValue])
    case none

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Bool.self) {
            self = .bool(value)
        } else if let value = try? container.decode(Int.self) {
            self = .int(value)
        } else if let value = try? container.decode(Double.self) {
            self = .double(value)
        } else if let value = try? container.decode(String.self) {
            self = .string(value)
        } else if let value = try? container.decode([JSONValue].self) {
            self = .array(value)
        } else if let value = try? container.decode([String: JSONValue].self) {
            self = .object(value)
        } else if container.decodeNil() {
            self = .none
        } else {
            throw DecodingError.typeMismatch(JSONValue.self, DecodingError.Context(codingPath: container.codingPath, debugDescription: "Unknown value"))
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .bool(let value):
            try container.encode(value)
        case .int(let value):
            try container.encode(value)
        case .double(let value):
            try container.encode(value)
        case .string(let value):
            try container.encode(value)
        case .array(let values):
            try container.encode(values)
        case .object(let valueDictionary):
            try container.encode(valueDictionary)
        case .none:
            try container.encodeNil()
        }
    }
}
