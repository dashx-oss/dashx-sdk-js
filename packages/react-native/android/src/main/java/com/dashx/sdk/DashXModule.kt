package com.dashx.sdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class DashXModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var dashXClient: DashXClient? = null

    override fun getName(): String {
        return "DashX"
    }

    @ReactMethod
    fun setLogLevel(logLevel: Int) {
        DashXLog.setLogLevel(logLevel)
    }

    @ReactMethod
    fun setup(options: ReadableMap) {
        dashXClient?.setPublicKey(options.getString("publicKey")!!)
        if (options.hasKey("baseUri")) dashXClient?.setBaseURI(options.getString("baseUri")!!)
    }

    @ReactMethod
    fun identify(uid: String?, options: ReadableMap?) {
        dashXClient?.identify(uid, options)
    }

    init {
        dashXClient = DashXClient.instance
        dashXClient?.setReactApplicationContext(reactContext)
        dashXClient?.generateAnonymousUid()
    }
}
