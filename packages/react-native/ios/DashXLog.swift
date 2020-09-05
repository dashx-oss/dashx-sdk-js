import Foundation
import os.log

class DashXLog {
    enum LogLevel: Int {
        case info = 1
        case debug = 0
        case off = -1
                
        static func <= (lhs: Self, rhs: Self) -> Bool {
            return lhs.rawValue <= rhs.rawValue
        }
        
        func on () -> Bool {
            return self.rawValue > LogLevel.off.rawValue
        }
    }
    
    private var logLevel: LogLevel = .off
    
    func setLogLevel(to: Int) {
        self.logLevel = LogLevel(rawValue: to) ?? .off
    }
    
    func d(tag: String, data: String) {
        if (logLevel.on() && logLevel <= .debug) {
            if #available(iOS 10.0, *) {
                os_log("%@: %@", type: .debug, tag, data)
            } else {
                print("%@: %@", tag, data)
            }
        }
    }
    
    func i(tag: String, data: String) {
        if (logLevel.on() && logLevel <= .info) {
            if #available(iOS 10.0, *) {
                os_log("%@: %@", type: .info, tag, data)
            } else {
                print("%@: %@", tag, data)
            }
        }
    }
}

let Logger = DashXLog()