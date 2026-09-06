package com.runup.tv.data

import android.content.Context
import com.runup.tv.domain.Catalog
import com.runup.tv.domain.Persona
import com.runup.tv.domain.RemainingQueue
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

class CatalogRepository(private val context: Context) {
    private val cacheFile = File(context.filesDir, "official-15.json")

    fun loadCatalog(): Catalog {
        val json = readCatalogJson()
        return RemainingQueue.fromCatalogJson(json)
    }

    fun loadPersonas(): List<Persona> {
        val raw = context.assets.open("personas.json").bufferedReader().use { it.readText() }
        return RemainingQueue.fromPersonasJson(JSONArray(raw))
    }

    fun refreshIfNeeded() {
        val bundled = readBundledCatalog()
        val bundledVersion = bundled.optInt("catalogVersion", 1)
        val cached = cacheFile.takeIf { it.exists() }?.readText()?.let { JSONObject(it) }
        val cachedVersion = cached?.optInt("catalogVersion", 0) ?: 0

        try {
            val remoteRaw = SupabaseApi().fetchCatalogRemote() ?: return
            val remote = JSONObject(remoteRaw)
            val remoteVersion = remote.optInt("catalogVersion", 1)
            if (remoteVersion > maxOf(bundledVersion, cachedVersion)) {
                cacheFile.writeText(remoteRaw)
            }
        } catch (_: Exception) {
            // Offline — keep bundled or cached catalog.
        }
    }

    private fun readCatalogJson(): JSONObject {
        refreshIfNeeded()
        if (cacheFile.exists()) {
            return JSONObject(cacheFile.readText())
        }
        return readBundledCatalog()
    }

    private fun readBundledCatalog(): JSONObject {
        val raw = context.assets.open("official-15.json").bufferedReader().use { it.readText() }
        return JSONObject(raw)
    }
}
