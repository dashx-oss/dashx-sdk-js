package com.dashx.sdk

import com.google.gson.FieldNamingPolicy
import com.google.gson.GsonBuilder
import okhttp3.CacheControl
import okhttp3.Callback
import okhttp3.Headers
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

open class HttpClient() {
    private lateinit var baseUri: String
    private lateinit var publicKey: String
    private var cacheControl: CacheControl? = null
    private var extraHeaders: Headers? = null

    fun create(): HttpClient {
        return HttpClient().setBaseUri(baseUri).setPublicKey(publicKey)
    }

    fun setBaseUri(baseUri: String) = apply {
        this.baseUri = baseUri
    }

    fun setPublicKey(publicKey: String) = apply {
        this.publicKey = publicKey
    }

    fun setCacheTimeout(timeout: Int?) = apply {
        timeout?.let {
            this.cacheControl = CacheControl.Builder()
                .maxAge(it, TimeUnit.SECONDS)
                .build()
        }
    }

    fun setExtraHeaders(extraHeaders: Headers) = apply {
        this.extraHeaders = extraHeaders
    }

    fun makeRequest(uri: String, body: Any, callback: Callback) {
        val headerBuilder = Headers.Builder().add("X-Public-Key", publicKey)
        extraHeaders?.let { it -> headerBuilder.addAll(it) }

        val json = "application/json; charset=utf-8".toMediaType()

        val gson = GsonBuilder()
            .setFieldNamingPolicy(FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
            .create()

        val request: Request = Request.Builder()
            .cacheControl(cacheControl ?: CacheControl.FORCE_NETWORK)
            .url(baseUri + uri)
            .headers(headerBuilder.build())
            .post(gson.toJson(body).toString().toRequestBody(json))
            .build()

        OkHttpClient().newCall(request).enqueue(callback)
    }
}
