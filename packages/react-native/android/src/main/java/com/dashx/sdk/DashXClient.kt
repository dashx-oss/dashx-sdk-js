package com.dashx.sdk

import android.content.SharedPreferences
import android.os.Build
import com.apollographql.apollo.ApolloCall
import com.apollographql.apollo.ApolloClient
import com.apollographql.apollo.api.Input
import com.apollographql.apollo.exception.ApolloException
import com.dashx.IdentifyAccountMutation
import com.dashx.SubscribeContactMutation
import com.dashx.TrackEventMutation
import com.dashx.type.ContactKind
import com.dashx.type.IdentifyAccountInput
import com.dashx.type.SubscribeContactInput
import com.dashx.type.TrackEventInput
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.google.firebase.messaging.RemoteMessage
import okhttp3.*
import java.util.UUID


class DashXClient private constructor() {
    private val tag = DashXClient::class.java.simpleName

    // Setup variables
    private var baseURI: String = "https://api.dashx.com/graphql"
    private var publicKey: String? = null
    private var targetEnvironment: String? = null
    private var targetInstallation: String? = null

    // Account variables
    private var anonymousUid: String? = null
    private var uid: String? = null
    private var deviceToken: String? = null
    private var identityToken: String? = null
    private var accountType: String? = null

    private val dashXNotificationFilter = "DASHX_PN_TYPE"

    private var apolloClient = getApolloClient()

    var reactApplicationContext: ReactApplicationContext? = null

    fun setBaseURI(baseURI: String) {
        this.baseURI = baseURI
    }

    fun createApolloClient() {
        apolloClient = getApolloClient()
    }

    fun setTargetEnvironment(targetEnvironment: String) {
        this.targetEnvironment = targetEnvironment
    }

    fun setTargetInstallation(targetInstallation: String) {
        this.targetEnvironment = targetInstallation
    }

    fun setAccountType(accountType: String) {
        this.accountType = accountType
    }

    fun setPublicKey(publicKey: String) {
        this.publicKey = publicKey
    }

    fun setDeviceToken(deviceToken: String) {
        this.deviceToken = deviceToken
        subscribe()
    }

    fun setIdentityToken(identityToken: String) {
        this.identityToken = identityToken
        createApolloClient()
        subscribe()
    }

    private fun getApolloClient(): ApolloClient {
        return ApolloClient.builder()
            .serverUrl(baseURI)
            .okHttpClient(OkHttpClient.Builder()
                .addInterceptor {
                    val requestBuilder = it.request().newBuilder()
                        .addHeader("X-Public-Key", publicKey!!)

                    if (targetEnvironment != null) {
                        requestBuilder.addHeader("X-Target-Environment", targetEnvironment!!)
                    }

                    if (targetInstallation != null) {
                        requestBuilder.addHeader("X-Target-Installation", targetInstallation!!)
                    }

                    if (identityToken != null) {
                        requestBuilder.addHeader("X-Identity-Token", identityToken!!)
                    }

                    return@addInterceptor it.proceed(requestBuilder.build())
                }
                .build())
            .build()
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

        val identifyAccountInput = IdentifyAccountInput("environment Id",
            Input.fromNullable(accountType),
            Input.fromNullable(uid),
            Input.fromNullable(anonymousUid),
            Input.fromNullable(options.getString("email")),
            Input.fromNullable(options.getString("phone")),
            Input.fromNullable(options.getString("name")),
            Input.fromNullable(options.getString("firstName")),
            Input.fromNullable(options.getString("lastName"))
        )
        val identifyAccountMutation = IdentifyAccountMutation(identifyAccountInput)

        Network.instance.client
            .mutate(identifyAccountMutation)
            .enqueue(object : ApolloCall.Callback<IdentifyAccountMutation.Data>() {
                override fun onFailure(e: ApolloException) {
                    DashXLog.d(tag, "Could not identify with: $uid $options")
                    e.printStackTrace()
                }

                override fun onResponse(response: com.apollographql.apollo.api.Response<IdentifyAccountMutation.Data>) {
                    val identifyResponse = response.data?.identifyAccount
                    DashXLog.d(tag, "Sent identify: $identifyResponse")
                }
            })
    }

    fun reset() {
        uid = null
        generateAnonymousUid(regenerate = true)
    }

    fun track(event: String, data: ReadableMap?) {
        val jsonData = try {
            convertMapToJson(data)
        } catch (e: Exception) {
            DashXLog.d(tag, "Encountered an error while parsing data")
            e.printStackTrace()
            return
        }

        if (accountType == null) {
            DashXLog.d(tag, "Account type not set. Aborting request")
            return
        }

        val trackEventInput = TrackEventInput(accountType!!, event, Input.fromNullable(uid), Input.fromNullable(anonymousUid), Input.fromNullable(jsonData));
        val trackEventMutation = TrackEventMutation(trackEventInput)

        Network.instance.client
            .mutate(trackEventMutation)
            .enqueue(object : ApolloCall.Callback<TrackEventMutation.Data>() {
                override fun onFailure(e: ApolloException) {
                    DashXLog.d(tag, "Could not track: $event $data")
                    e.printStackTrace()
                }

                override fun onResponse(response: com.apollographql.apollo.api.Response<TrackEventMutation.Data>) {
                    val trackResponse = response.data?.trackEvent
                    DashXLog.d(tag, "Sent event: $event, $trackResponse")
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

    private fun subscribe() {
        if (deviceToken == null || identityToken == null) {
            DashXLog.d(tag,
                "Subscribe called with deviceToken: $deviceToken and identityToken: $identityToken")
            return
        }

        val subscribeContactInput = SubscribeContactInput(
            "environmentId",
            uid!!,
            Input.fromNullable("Android"),
            ContactKind.ANDROID,
            deviceToken!!
        )
        val subscribeContactMutation = SubscribeContactMutation(subscribeContactInput)

        Network.instance.client
            .mutate(subscribeContactMutation)
            .enqueue(object : ApolloCall.Callback<SubscribeContactMutation.Data>() {
                override fun onFailure(e: ApolloException) {
                    DashXLog.d(tag, "Could not subscribe: $deviceToken")
                    e.printStackTrace()
                }

                override fun onResponse(response: com.apollographql.apollo.api.Response<SubscribeContactMutation.Data>) {
                    val subscribeContactResponse = response.data?.subscribeContact
                    DashXLog.d(tag, "Subscribed: $deviceToken, $subscribeContactResponse")
                }
            })
    }

    companion object {
        val instance: DashXClient by lazy {
            DashXClient()
        }
    }
}
