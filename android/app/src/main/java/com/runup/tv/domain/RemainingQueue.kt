package com.runup.tv.domain

import org.json.JSONArray
import org.json.JSONObject

data class CatalogTitle(
    val id: String,
    val title: String,
    val year: Int,
    val runtimeMin: Int,
    val order: Int,
    val spoilerSafeWhy: String,
    val tmdbPosterPath: String?,
    val streaming: StreamingInfo?,
)

data class StreamingInfo(
    val provider: String,
    val contentId: String?,
    val searchQuery: String,
    val contentType: String = "movie",
)

data class Catalog(
    val catalogVersion: Int,
    val horizon: String,
    val titles: List<CatalogTitle>,
)

data class Persona(
    val id: String,
    val label: String,
    val treatAsWatched: List<String>,
)

data class RunupState(
    val personaId: String?,
    val budgetHours: Double?,
    val watchedIds: List<String>,
    val skippedIds: List<String>,
    val progressEpoch: Int = 0,
)

object RemainingQueue {
    fun fromCatalogJson(json: JSONObject): Catalog {
        val titles = json.getJSONArray("titles").toTitleList()
        return Catalog(
            catalogVersion = json.optInt("catalogVersion", 1),
            horizon = json.getString("horizon"),
            titles = titles,
        )
    }

    fun fromPersonasJson(json: JSONArray): List<Persona> {
        return (0 until json.length()).map { index ->
            val item = json.getJSONObject(index)
            Persona(
                id = item.getString("id"),
                label = item.optString("label", item.getString("id")),
                treatAsWatched = item.optJSONArray("treatAsWatched").toStringList(),
            )
        }
    }

    fun remainingQueue(
        catalog: Catalog,
        persona: Persona?,
        watchedIds: List<String>,
        skippedIds: List<String>,
        budgetHours: Double?,
    ): List<CatalogTitle> {
        val excluded = buildSet {
            persona?.treatAsWatched?.forEach { add(it) }
            watchedIds.forEach { add(it) }
            skippedIds.forEach { add(it) }
        }

        var queue = catalog.titles
            .sortedBy { it.order }
            .filter { it.id !in excluded }

        if (budgetHours != null && budgetHours > 0) {
            val budgetMin = budgetHours * 60
            var totalMin = 0.0
            val kept = mutableListOf<CatalogTitle>()
            for (title in queue) {
                if (totalMin + title.runtimeMin > budgetMin) break
                totalMin += title.runtimeMin
                kept += title
            }
            queue = kept
        }

        return queue
    }

    fun threadfieldQueue(
        catalog: Catalog,
        persona: Persona?,
        watchedIds: List<String>,
        skippedIds: List<String>,
        budgetHours: Double?,
    ): List<StrandTitle> {
        val excluded = buildSet {
            persona?.treatAsWatched?.forEach { add(it) }
            skippedIds.forEach { add(it) }
        }
        val watchedSet = watchedIds.toSet()
        val ordered = catalog.titles
            .sortedBy { it.order }
            .filter { it.id !in excluded }
        val remaining = remainingQueue(
            catalog = catalog,
            persona = persona,
            watchedIds = watchedIds,
            skippedIds = skippedIds,
            budgetHours = budgetHours,
        )
        val visibleIds = buildSet {
            watchedIds.filter { id -> ordered.any { it.id == id } }.forEach { add(it) }
            remaining.forEach { add(it.id) }
        }
        val tonightId = remaining.firstOrNull()?.id
        return ordered
            .filter { it.id in visibleIds }
            .map { title ->
                StrandTitle(
                    title = title,
                    strandStatus = when {
                        title.id in watchedSet -> StrandStatus.Watched
                        title.id == tonightId -> StrandStatus.Tonight
                        else -> StrandStatus.Upcoming
                    },
                )
            }
    }

    private fun JSONArray.toTitleList(): List<CatalogTitle> {
        return (0 until length()).map { index ->
            val item = getJSONObject(index)
            val streamingJson = item.optJSONObject("streaming")
            CatalogTitle(
                id = item.getString("id"),
                title = item.getString("title"),
                year = item.getInt("year"),
                runtimeMin = item.getInt("runtimeMin"),
                order = item.getInt("order"),
                spoilerSafeWhy = item.getString("spoilerSafeWhy"),
                tmdbPosterPath = item.optString("tmdbPosterPath").ifBlank { null },
                streaming = streamingJson?.let {
                    StreamingInfo(
                        provider = it.getString("provider"),
                        contentId = if (it.isNull("contentId")) null else it.getString("contentId"),
                        searchQuery = it.getString("searchQuery"),
                        contentType = it.optString("contentType", "movie"),
                    )
                },
            )
        }
    }

    private fun JSONArray?.toStringList(): List<String> {
        if (this == null) return emptyList()
        return (0 until length()).map { getString(it) }
    }
}
