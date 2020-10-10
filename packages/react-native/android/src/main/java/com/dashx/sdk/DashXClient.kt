package com.dashx.sdk

import android.content.SharedPreferences
import android.os.Build
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.google.firebase.messaging.RemoteMessage
import okhttp3.Call
import okhttp3.Callback
import okhttp3.Headers
import okhttp3.Response
import org.json.JSONException
import java.io.IOException
import java.util.HashMap
import java.util.UUID


class DashXClient private constructor(): HttpClient() {
    private val tag = DashXClient::class.java.simpleName
    private var contentCacheTimeout: Int? = null

    // Account variables
    private var anonymousUid: String? = null
    private var uid: String? = null
    private var deviceToken: String? = null
    private var identityToken: String? = null

    private val dashXNotificationFilter = "DASHX_PN_TYPE"

    var reactApplicationContext: ReactApplicationContext? = null

    fun setContentCacheTimeout(contentCacheTimeout: Int) {
        this.contentCacheTimeout = contentCacheTimeout
    }

    fun setDeviceToken(deviceToken: String) {
        this.deviceToken = deviceToken
        subscribe()
    }

    fun setIdentityToken(identityToken: String) {
        this.identityToken = identityToken
        subscribe()
    }

    fun generateAnonymousUid(regenerate: Boolean = false) {
        val dashXSharedPreferences: SharedPreferences = getDashXSharedPreferences(reactApplicationContext!!.applicationContext)
        val anonymousUid = dashXSharedPreferences.getString(SHARED_PREFERENCES_KEY_ANONYMOUS_UID, null)
        if (!regenerate && anonymousUid != null) {
            this.anonymousUid = anonymousUid
        } else {
            this.anonymousUid = UUID.randomUUID().toString()
            dashXSharedPreferences.edit()
                .putString(SHARED_PREFERENCES_KEY_ANONYMOUS_UID, this.anonymousUid)
                .apply()
        }
    }

    fun handleMessage(remoteMessage: RemoteMessage) {
        val notification = remoteMessage.notification
        val eventProperties: WritableMap = Arguments.createMap()
        DashXLog.d(tag, "Data: " + remoteMessage.data)

        try {
            eventProperties.putMap("data", convertToWritableMap(remoteMessage.data, listOf(dashXNotificationFilter)))
        } catch (e: Exception) {
            DashXLog.d(tag, "Encountered an error while parsing notification data")
            e.printStackTrace()
        }

        if (notification != null) {
            val notificationProperties: WritableMap = Arguments.createMap()
            notificationProperties.putString("title", notification.title)
            notificationProperties.putString("body", notification.body)
            eventProperties.putMap("notification", notificationProperties)
            DashXLog.d(tag, "onMessageReceived: " + notification.title)
        }

        sendJsEvent("messageReceived", eventProperties)
    }

    private fun sendJsEvent(eventName: String, params: WritableMap) {
        reactApplicationContext
            ?.getJSModule(RCTDeviceEventEmitter::class.java)
            ?.emit(eventName, params)
    }

    fun identify(uid: String?, options: ReadableMap?) {
        if (uid != null) {
            this.uid = uid
            DashXLog.d(tag, "Set Uid: $uid")
            return
        }

        if (options == null) {
            throw Exception("Cannot be called with null, either pass uid: string or options: object")
        }

        val identifyRequest = try {
            val optionsHashMap = options.toHashMap() as? HashMap<String, String?>
            IdentifyRequest(
                optionsHashMap?.get("firstName"),
                optionsHashMap?.get("lastName"),
                optionsHashMap?.get("email"),
                optionsHashMap?.get("phone"),
                anonymousUid
            )
        } catch (e: Exception) {
            DashXLog.d(tag, "Encountered an error while parsing data")
            e.printStackTrace()
            return
        }

        create().makeRequest(
            uri = "/identify", body = identifyRequest, callback = object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                DashXLog.d(tag, "Could not identify with: $uid $options")
                e.printStackTrace()
            }

            @Throws(IOException::class)
            override fun onResponse(call: Call, response: Response) {
                if (!response.isSuccessful) {
                    DashXLog.d(tag, "Encountered an error during identify(): " + response.body?.string())
                    return
                }

                DashXLog.d(tag, "Sent identify: $identifyRequest")
            }
        })
    }

    fun reset() {
        uid = null
        generateAnonymousUid(regenerate = true)
    }

    fun track(event: String, data: ReadableMap?) {
        val trackRequest = try {
            TrackRequest(event, convertMapToJson(data), uid, anonymousUid)
        } catch (e: Exception) {
            DashXLog.d(tag, "Encountered an error while parsing data")
            e.printStackTrace()
            return
        }

        create().makeRequest(
            uri = "/track", body = trackRequest, callback = object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                DashXLog.d(tag, "Could not track: $event $data")
                e.printStackTrace()
            }

            @Throws(IOException::class)
            override fun onResponse(call: Call, response: Response) {
                if (!response.isSuccessful) {
                    DashXLog.d(tag, "Encountered an error during track():" + response.body?.string())
                    return
                }

                val trackResponse = response.body?.string()

                DashXLog.d(tag, "Sent event: $trackRequest, $trackResponse")
            }
        })
    }

    fun trackAppStarted(fromBackground: Boolean = false) {
        val context = reactApplicationContext?.applicationContext ?: return

        val packageInfo = getPackageInfo(context)
        val currentBuild = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            packageInfo.longVersionCode
        } else {
            packageInfo.versionCode.toLong()
        }

        fun saveBuildInPreferences() {
            val editor: SharedPreferences.Editor = getDashXSharedPreferences(context).edit()
            editor.putLong(SHARED_PREFERENCES_KEY_BUILD, currentBuild)
            editor.apply()
        }

        val eventProperties = Arguments.createMap()
        eventProperties.putString("version", packageInfo.versionName)
        eventProperties.putString("build", currentBuild.toString())
        if (fromBackground) eventProperties.putBoolean("from_background", true)

        when {
            getDashXSharedPreferences(context).getLong(SHARED_PREFERENCES_KEY_BUILD, Long.MIN_VALUE) == Long.MIN_VALUE
            -> {
                track(INTERNAL_EVENT_APP_INSTALLED, eventProperties)
                saveBuildInPreferences()
            }
            getDashXSharedPreferences(context).getLong(SHARED_PREFERENCES_KEY_BUILD, Long.MIN_VALUE) < currentBuild
            -> {
                track(INTERNAL_EVENT_APP_UPDATED, eventProperties)
                saveBuildInPreferences()
            }
            else -> track(INTERNAL_EVENT_APP_OPENED, eventProperties)
        }
    }

    fun trackAppSession(elapsedTime: Double) {
        val elapsedTimeRounded = elapsedTime / 1000
        val eventProperties = Arguments.createMap()
        eventProperties.putString("session_length", elapsedTimeRounded.toString())
        track(INTERNAL_EVENT_APP_BACKGROUNDED, eventProperties)
    }

    fun trackAppCrashed(exception: Throwable?) {
        val message = exception?.message
        val eventProperties = Arguments.createMap()
        eventProperties.putString("exception", message)
        track(INTERNAL_EVENT_APP_CRASHED, eventProperties)
    }

    fun screen(screenName: String, properties: ReadableMap?) {
        val data = Arguments.createMap()
        data.putString("name", screenName)
        properties?.let { it -> data.merge(it) }
        track(INTERNAL_EVENT_APP_SCREEN_VIEWED, data)
    }

    fun content(contentType: String, options: ReadableMap) {
        val contentRequest = try {
            ContentRequest(
                contentType,
                options.getStringIfPresent("returnType"),
                convertMapToJson(options.getMapIfPresent("filter")),
                convertMapToJson(options.getMapIfPresent("order")),
                options.getIntIfPresent("limit"),
                options.getIntIfPresent("page")
            )
        } catch (e: Exception) {
            DashXLog.d(tag, "Encountered an error while parsing data")
            e.printStackTrace()
            return
        }

        val cacheTimeout = options.getIntIfPresent("cache") ?: contentCacheTimeout

        create().setCacheTimeout(cacheTimeout).makeRequest(
            uri = "/content", body = contentRequest, callback = object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                DashXLog.d(tag, "Could not identify with: $uid $options")
                e.printStackTrace()
            }

            @Throws(IOException::class)
            override fun onResponse(call: Call, response: Response) {
                if (!response.isSuccessful) {
                    DashXLog.d(tag, "Encountered an error during content(): " + response.body?.string())
                    return
                }

                DashXLog.d(tag, "Sent content: $contentRequest")
            }
        })
    }

    private fun subscribe() {
        if (deviceToken == null || identityToken == null) {
            DashXLog.d(tag,
                "Subscribe called with deviceToken: $deviceToken and identityToken: $identityToken")
            return
        }

        val deviceKind = "ANDROID"

        val subscribeRequest = try {
            SubscribeRequest(deviceToken!!, deviceKind, uid, anonymousUid)
        } catch (e: JSONException) {
            DashXLog.d(tag, "Encountered an error while parsing data")
            e.printStackTrace()
            return
        }

        val headers = Headers.Builder().add("X-Identity-Token", identityToken!!).build()

        create().setExtraHeaders(headers).makeRequest(
            "/subscribe", subscribeRequest, object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                DashXLog.d(tag, "Could not subscribe: $deviceToken")
                e.printStackTrace()
            }

            @Throws(IOException::class)
            override fun onResponse(call: Call, response: Response) {
                if (!response.isSuccessful) {
                    DashXLog.d(tag, "Encountered an error during subscribe():" + response.body?.string())
                    return
                }

                val subscribeResponse = response.body?.string()

                DashXLog.d(tag, "Subscribed: $deviceToken, $subscribeResponse")
            }
        })
    }

    init {
        this.setBaseUri("https://api.dashx.com/v1")
    }

    companion object {
        val instance: DashXClient by lazy {
            DashXClient()
        }
    }
}
