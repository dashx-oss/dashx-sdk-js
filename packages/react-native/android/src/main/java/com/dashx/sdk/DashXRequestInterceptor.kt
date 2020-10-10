package com.dashx.sdk

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.ConnectivityManager
import android.os.BatteryManager
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Response
import kotlin.math.pow

class DashXRequestInterceptor(
    private val exponentialBackoffScale: Double = .5,
    private val exponentialBackoffBase: Double = 2.0,
    private val retryLimit: Int = 3,
    private val jitterFactor: Double = .1
) : Interceptor {
    val context = DashXClient.instance.reactApplicationContext

    private fun shouldRetry(request: Request, response: Response): Boolean {
        val connectivityManager = context?.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val networkInfo = connectivityManager.activeNetworkInfo
        val retryableStatusCodes = listOf<Int>(408, 500, 502, 503, 504)

        return (networkInfo.isConnected && !networkInfo.isRoaming)
            && request.method == "POST"
            && retryableStatusCodes.contains(response.code)
    }

    private fun getTimeDelay(retryCount: Int): Long {
        val randomFactor = 1 + (1 - Math.random() * 2) * jitterFactor

        val batteryStatus: Intent? = IntentFilter(Intent.ACTION_BATTERY_CHANGED).let { it ->
            context?.registerReceiver(null, it)
        }
        val extraStatus = batteryStatus?.getIntExtra(BatteryManager.EXTRA_STATUS, -1)

        return if (extraStatus == BatteryManager.BATTERY_STATUS_CHARGING) {
            ((exponentialBackoffBase.pow(retryCount) * exponentialBackoffScale) * randomFactor).toLong()
        } else {
            ((exponentialBackoffBase.pow(retryCount + 1) * exponentialBackoffScale) * randomFactor).toLong()
        }
    }

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        var response = chain.proceed(request)
        var retryCount = 1

        while (retryLimit >= retryCount && shouldRetry(request, response)) {
            Thread.sleep(getTimeDelay(retryCount))
            retryCount++
            response = chain.proceed(request)
        }

        return response
    }
}
