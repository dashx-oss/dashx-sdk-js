import Foundation
import Alamofire

class DashXRequestInterceptor: RequestInterceptor {
    private let retryLimit: Int = 3
    private let exponentialBackoffScale: Double = 0.5
    private let jitterFactor: Double = 0.1
    private let exponentialBackoffBase: Int = 2
    
    private func getTimeDelay(for retryCount: Int) -> TimeInterval {
        let randomFactor: Double = 1 + (1 - Double.random(in: 0..<1) * 2) * jitterFactor
        var batteryState: UIDevice.BatteryState { UIDevice.current.batteryState }
        switch batteryState {
        case .charging:
            return (pow(Double(exponentialBackoffBase), Double(retryCount)) * exponentialBackoffScale) * randomFactor
        default:
            return (pow(Double(exponentialBackoffBase), Double(retryCount + 1)) * exponentialBackoffScale) * randomFactor
        }
    }
    
    private func checkStatusCode(_ request: Request) -> Bool {
        let retryableStatusCodes = [408, 500, 502, 503, 504]
        if let statusCode = request.response?.statusCode,
            retryableStatusCodes.contains(statusCode) {
            return true
        } else {
            return false
        }
    }
    
    private func checkMethod(_ request: Request) -> Bool {
        if let httpMethod = request.request?.method,
            httpMethod == .post {
            return true
        } else {
            return false
        }
    }
    
    func retry(_ request: Request, for session: Session, dueTo error: Error, completion: @escaping (RetryResult) -> Void) {
        if request.retryCount < retryLimit,
            checkMethod(request),
            checkStatusCode(request) {
            let timeDelay = getTimeDelay(for: request.retryCount)
            completion(.retryWithDelay(timeDelay))
        } else {
            completion(.doNotRetry)
        }
    }
}
