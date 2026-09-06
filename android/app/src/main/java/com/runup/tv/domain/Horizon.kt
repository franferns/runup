package com.runup.tv.domain

import java.time.LocalDate
import java.time.temporal.ChronoUnit
import kotlin.math.ceil
import kotlin.math.round

object Horizon {
    const val PACE_HOURS_PER_DAY = 2.0

    fun daysUntilHorizon(horizonIso: String): Int {
        val horizon = LocalDate.parse(horizonIso)
        return ChronoUnit.DAYS.between(LocalDate.now(), horizon).toInt()
    }

    fun queueHours(queue: List<CatalogTitle>): Double {
        val totalMin = queue.sumOf { it.runtimeMin }
        return round(totalMin / 60.0 * 10.0) / 10.0
    }

    fun hoursPerDayNeeded(queueHours: Double, daysLeft: Int): Double {
        if (queueHours <= 0) return 0.0
        if (daysLeft <= 0) return queueHours
        return queueHours / daysLeft
    }

    fun needsPaceWarning(queueHours: Double, daysLeft: Int): Boolean {
        if (queueHours <= 0) return false
        return hoursPerDayNeeded(queueHours, daysLeft) > PACE_HOURS_PER_DAY
    }

    fun fitToPaceBudgetHours(daysLeft: Int): Double {
        if (daysLeft <= 0) return PACE_HOURS_PER_DAY
        return daysLeft * PACE_HOURS_PER_DAY
    }

    fun formatDaysLeft(daysLeft: Int): String = when {
        daysLeft < 0 -> "Horizon passed"
        daysLeft == 0 -> "Today"
        daysLeft == 1 -> "1 day left"
        else -> "$daysLeft days left"
    }
}
