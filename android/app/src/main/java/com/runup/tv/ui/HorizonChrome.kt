package com.runup.tv.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.ExperimentalTvMaterial3Api
import androidx.tv.material3.Text

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun HorizonChrome(
    queueHours: Double,
    daysLeft: Int,
    horizon: String,
    behindPace: Boolean,
    dailyHoursNeeded: Double,
    onFitToPace: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(RunupColors.Void.copy(alpha = 0.92f))
            .padding(horizontal = 20.dp, vertical = 8.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Column {
                Text(
                    text = "~${queueHours}h",
                    color = RunupColors.Text,
                    fontSize = 18.sp,
                    letterSpacing = 1.sp,
                )
                Text(
                    text = "IN QUEUE",
                    color = RunupColors.Muted,
                    fontSize = 11.sp,
                    letterSpacing = 1.sp,
                )
            }
            Column(horizontalAlignment = androidx.compose.ui.Alignment.End) {
                Text(
                    text = com.runup.tv.domain.Horizon.formatDaysLeft(daysLeft),
                    color = RunupColors.Text,
                    fontSize = 18.sp,
                    letterSpacing = 1.sp,
                )
                Text(
                    text = "TO DOOMSDAY · $horizon",
                    color = RunupColors.Muted,
                    fontSize = 11.sp,
                    letterSpacing = 1.sp,
                )
            }
        }
        if (behindPace) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
            ) {
                Text(
                    modifier = Modifier.weight(1f),
                    text = "At ~${"%.1f".format(dailyHoursNeeded)}h per day, this path is heavier than a steady ~2h/day pace.",
                    color = RunupColors.Muted,
                    fontSize = 13.sp,
                    lineHeight = 20.sp,
                )
                RunupPillButton(
                    text = "Fit to pace",
                    onClick = onFitToPace,
                    modifier = Modifier.padding(start = 12.dp),
                    compact = true,
                )
            }
        }
    }
}
