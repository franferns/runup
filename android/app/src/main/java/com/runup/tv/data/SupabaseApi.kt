package com.runup.tv.data

import com.runup.tv.BuildConfig
import com.runup.tv.domain.RunupState
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

class SupabaseApi(
    private val client: OkHttpClient = OkHttpClient(),
) {
    private val baseUrl = BuildConfig.SUPABASE_URL.trimEnd('/')
    private val anonKey = BuildConfig.SUPABASE_ANON_KEY

    private fun functionsUrl(path: String) = "$baseUrl/functions/v1/$path"

    private fun authHeaders(sessionId: String? = null, deviceToken: String? = null): Map<String, String> {
        return buildMap {
            put("apikey", anonKey)
            put("Authorization", "Bearer $anonKey")
            put("Content-Type", "application/json")
            sessionId?.let { put("X-Session-Id", it) }
            deviceToken?.let { put("X-Device-Token", it) }
        }
    }

    fun pair(code: String, deviceLabel: String?): PairResult {
        val body = JSONObject()
            .put("code", code)
            .put("deviceLabel", deviceLabel)
            .toString()
            .toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url(functionsUrl("pair"))
            .post(body)
            .headers(authHeaders().toHeaders())
            .build()

        val response = client.newCall(request).execute()
        val json = JSONObject(response.body?.string().orEmpty())
        if (!response.isSuccessful) {
            throw ApiException(json.optString("error", "Pairing failed"))
        }

        return PairResult(
            sessionId = json.getString("sessionId"),
            deviceToken = json.getString("deviceToken"),
        )
    }

    fun fetchState(sessionId: String, deviceToken: String): RunupState {
        val request = Request.Builder()
            .url(functionsUrl("state"))
            .get()
            .headers(authHeaders(sessionId, deviceToken).toHeaders())
            .build()

        val response = client.newCall(request).execute()
        val json = JSONObject(response.body?.string().orEmpty())
        if (!response.isSuccessful) {
            throw ApiException(json.optString("error", "State fetch failed"), response.code)
        }

        return parseState(json.getJSONObject("state"))
    }

    fun patchState(sessionId: String, deviceToken: String, patch: JSONObject): RunupState {
        val request = Request.Builder()
            .url(functionsUrl("state"))
            .patch(patch.toString().toRequestBody("application/json".toMediaType()))
            .headers(authHeaders(sessionId, deviceToken).toHeaders())
            .build()

        val response = client.newCall(request).execute()
        val json = JSONObject(response.body?.string().orEmpty())
        if (!response.isSuccessful) {
            throw ApiException(json.optString("error", "State patch failed"), response.code)
        }

        return parseState(json.getJSONObject("state"))
    }

    fun fetchCatalogRemote(): String? {
        val request = Request.Builder().url(BuildConfig.CATALOG_URL).get().build()
        val response = client.newCall(request).execute()
        return if (response.isSuccessful) response.body?.string() else null
    }

    private fun parseState(json: JSONObject): RunupState {
        return RunupState(
            personaId = json.opt("personaId")?.let { if (it == JSONObject.NULL) null else it.toString() },
            budgetHours = json.optDouble("budgetHours").let { if (it.isNaN()) null else it },
            watchedIds = json.optJSONArray("watchedIds").toIds(),
            skippedIds = json.optJSONArray("skippedIds").toIds(),
            progressEpoch = json.optInt("progressEpoch", 0),
        )
    }

    private fun org.json.JSONArray?.toIds(): List<String> {
        if (this == null) return emptyList()
        return (0 until length()).map { getString(it) }
    }

    private fun Map<String, String>.toHeaders(): okhttp3.Headers {
        val builder = okhttp3.Headers.Builder()
        forEach { (key, value) -> builder.add(key, value) }
        return builder.build()
    }

    data class PairResult(val sessionId: String, val deviceToken: String)

    class ApiException(message: String, val code: Int = 0) : Exception(message)
}
