package com.dashx.sdk

import android.content.SharedPreferences
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.google.gson.Gson
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONException
import java.io.IOException
import java.util.*


class DashXClient {
    private var reactApplicationContext: ReactApplicationContext? = null
    private var anonymousUid: String? = null
    private var baseURI: String = "https://api.dashx.com/v1"
    private var publicKey: String? = null

    private val httpClient = OkHttpClient()
    private val gson = Gson()

    fun setBaseURI(baseURI: String) {
        this.baseURI = baseURI
    }

    fun setPublicKey(publicKey: String) {
        this.publicKey = publicKey
    }

    fun setReactApplicationContext(reactApplicationContext: ReactApplicationContext?) {
        this.reactApplicationContext = reactApplicationContext
    }

    fun getReactApplicationContext(): ReactApplicationContext? {
        return reactApplicationContext
    }

    fun generateAnonymousUid() {
        val dashXSharedPreferences: SharedPreferences = getDashXSharedPreferences(reactApplicationContext!!.applicationContext)
        val anonymousUid = dashXSharedPreferences.getString(SHARED_PREFERENCES_KEY_ANONYMOUS_UID, null)
        if (anonymousUid != null) {
            this.anonymousUid = anonymousUid
        } else {
            this.anonymousUid = UUID.randomUUID().toString()
            dashXSharedPreferences.edit()
                .putString(SHARED_PREFERENCES_KEY_ANONYMOUS_UID, this.anonymousUid)
                .apply()
        }
    }

    fun identify(uid: String?, options: ReadableMap?) {
        val identifyRequest = try {
            if (options != null) {
                val optionsHashMap = options.toHashMap() as HashMap<String, String?>
                IdentifyRequest(
                    optionsHashMap["firstName"],
                    optionsHashMap["lastName"],
                    optionsHashMap["email"],
                    optionsHashMap["phone"],
                    uid,
                    if (uid != null) null else anonymousUid
                )
            } else {
                IdentifyRequest(
                    null, null, null, null, uid, if (uid != null) null else anonymousUid
                )
            }
        } catch (e: JSONException) {
            DashXLog.d(TAG, "Encountered an error while parsing data")
            e.printStackTrace()
            return
        }

        val request: Request = Request.Builder()
            .url("$baseURI/identify")
            .addHeader("X-Public-Key", publicKey!!)
            .post(gson.toJson(identifyRequest).toString().toRequestBody(JSON))
            .build()

        httpClient.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                DashXLog.d(TAG, "Could not identify with: $uid $options")
                e.printStackTrace()
            }

            @Throws(IOException::class)
            override fun onResponse(call: Call, response: Response) {
                if (!response.isSuccessful) {
                    DashXLog.d(TAG, "Encountered an error during identify(): " + response.body!!.string())
                    return
                }

                val identifyResponse: IdentifyResponse? = gson.fromJson(response.body!!.string(), IdentifyResponse::class.java)

                DashXLog.d(TAG, "Sent identify: $identifyResponse")
            }
        })
    }

    companion object {
        private val TAG = DashXClient::class.java.simpleName
        var instance: DashXClient? = null
            get() {
                if (field == null) {
                    field = DashXClient()
                }
                return field
            }
            private set
        private val JSON = "application/json; charset=utf-8".toMediaType()
    }
}
