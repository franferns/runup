package com.runup.tv.domain

enum class PlacementTone { Amber, Violet, Rust, Teal }

data class PlacementOption(
    val id: String,
    val label: String,
    val hint: String,
    val personaId: String,
    val budgetHours: Double?,
    val tone: PlacementTone,
)

object PlacementOptions {
    val all = listOf(
        PlacementOption(
            id = "after-endgame",
            label = "I stopped after Endgame",
            hint = "Infinity Saga through Endgame already watched",
            personaId = "after-endgame",
            budgetHours = null,
            tone = PlacementTone.Amber,
        ),
        PlacementOption(
            id = "x-men-lane",
            label = "I mostly know X-Men",
            hint = "Fox X-Men counted · MCU core still ahead",
            personaId = "x-men-lane",
            budgetHours = null,
            tone = PlacementTone.Violet,
        ),
        PlacementOption(
            id = "official-15",
            label = "Disney+ Official 15",
            hint = "Full spoiler-safe catch-up list",
            personaId = "official-15",
            budgetHours = null,
            tone = PlacementTone.Rust,
        ),
        PlacementOption(
            id = "eight-hours",
            label = "I have 8 hours total",
            hint = "Official 15 trimmed to an eight-hour budget",
            personaId = "official-15",
            budgetHours = 8.0,
            tone = PlacementTone.Teal,
        ),
    )

    fun matchesState(option: PlacementOption, state: RunupState): Boolean {
        val budgetMatches = when {
            option.budgetHours == null && state.budgetHours == null -> true
            option.budgetHours != null && state.budgetHours != null ->
                option.budgetHours == state.budgetHours
            else -> false
        }
        return option.personaId == state.personaId && budgetMatches
    }
}
