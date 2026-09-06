package com.runup.tv.data

import android.content.Context

class SessionRepository(context: Context) {
    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun getSessionId(): String? = prefs.getString(KEY_SESSION_ID, null)

    fun getDeviceToken(): String? = prefs.getString(KEY_DEVICE_TOKEN, null)

    fun isPaired(): Boolean = getSessionId() != null && getDeviceToken() != null

    fun savePairing(sessionId: String, deviceToken: String) {
        prefs.edit()
            .putString(KEY_SESSION_ID, sessionId)
            .putString(KEY_DEVICE_TOKEN, deviceToken)
            .apply()
    }

    fun clear() {
        prefs.edit().clear().apply()
    }

    companion object {
        private const val PREFS_NAME = "runup_tv"
        private const val KEY_SESSION_ID = "session_id"
        private const val KEY_DEVICE_TOKEN = "device_token"
    }
}
