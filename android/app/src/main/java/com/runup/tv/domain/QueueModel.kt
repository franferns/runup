package com.runup.tv.domain

enum class StrandStatus { Watched, Tonight, Upcoming }

data class StrandTitle(
    val title: CatalogTitle,
    val strandStatus: StrandStatus,
)

data class QueueModel(
    val catalog: Catalog,
    val persona: Persona,
    val queue: List<CatalogTitle>,
    val strandQueue: List<StrandTitle>,
    val tonight: CatalogTitle?,
    val queueHours: Double,
    val budgetNote: String,
)

object QueueModelBuilder {
    fun build(
        catalog: Catalog,
        personas: List<Persona>,
        state: RunupState,
    ): QueueModel? {
        val persona = personas.find { it.id == state.personaId } ?: return null
        val queue = RemainingQueue.remainingQueue(
            catalog = catalog,
            persona = persona,
            watchedIds = state.watchedIds,
            skippedIds = state.skippedIds,
            budgetHours = state.budgetHours,
        )
        val strandQueue = RemainingQueue.threadfieldQueue(
            catalog = catalog,
            persona = persona,
            watchedIds = state.watchedIds,
            skippedIds = state.skippedIds,
            budgetHours = state.budgetHours,
        )
        val budgetNote = if (state.budgetHours != null) " · ${state.budgetHours.toInt()}h budget" else ""
        return QueueModel(
            catalog = catalog,
            persona = persona,
            queue = queue,
            strandQueue = strandQueue,
            tonight = queue.firstOrNull(),
            queueHours = Horizon.queueHours(queue),
            budgetNote = budgetNote,
        )
    }
}
