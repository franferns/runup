package com.runup.tv.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.ExperimentalTvMaterial3Api
import androidx.tv.material3.Text
import coil.compose.AsyncImage
import com.runup.tv.domain.CatalogTitle
import com.runup.tv.domain.StrandTitle

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun ThreadfieldScreen(
    personaLabel: String?,
    budgetNote: String,
    queueCount: Int,
    strandQueue: List<StrandTitle>,
    tonight: CatalogTitle?,
    isDrawing: Boolean,
    completingId: String?,
    loading: Boolean,
    error: String?,
    queueHours: Double,
    daysLeft: Int,
    horizon: String,
    behindPace: Boolean,
    dailyHoursNeeded: Double,
    onChangePlacement: () -> Unit,
    onOpenProvider: () -> Unit,
    onAlreadySeen: () -> Unit,
    onSkip: () -> Unit,
    onFitToPace: () -> Unit,
) {
    RunupAppBackground {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(start = 32.dp, top = 24.dp, end = 32.dp, bottom = 16.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = "RUNUP",
                    color = RunupColors.Text,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 5.sp,
                )
                RunupPillButton(
                    text = "Change placement",
                    onClick = onChangePlacement,
                    compact = true,
                    modifier = Modifier.widthIn(max = 220.dp),
                )
            }

            BoxWithConstraints(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .fillMaxHeight(),
            ) {
                val density = LocalDensity.current
                val gapPx = with(density) { 16.dp.roundToPx() }
                var bottomSectionHeightPx by remember { mutableIntStateOf(0) }

                Column(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                        .onSizeChanged { bottomSectionHeightPx = it.height },
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .widthIn(max = 960.dp)
                            .align(Alignment.CenterHorizontally),
                    ) {
                        when {
                            error != null -> {
                                RunupBottomSheet(compact = true) {
                                    RunupEyebrow("Tonight")
                                    RunupTitle("Something went wrong")
                                    RunupBody(error)
                                }
                            }
                            tonight == null -> {
                                RunupBottomSheet(compact = true) {
                                    RunupEyebrow("Tonight")
                                    RunupTitle("Path complete")
                                    RunupBody(
                                        if (daysLeft > 0) {
                                            "$daysLeft days until the horizon."
                                        } else {
                                            "Nothing left on this queue. You are caught up."
                                        },
                                    )
                                }
                            }
                            else -> {
                                TonightBottomSheet(
                                    title = tonight,
                                    loading = loading,
                                    onOpenProvider = onOpenProvider,
                                    onAlreadySeen = onAlreadySeen,
                                    onSkip = onSkip,
                                )
                            }
                        }

                        if (personaLabel != null) {
                            Text(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 6.dp, bottom = 6.dp),
                                text = "$personaLabel$budgetNote · $queueCount titles",
                                color = RunupColors.Muted,
                                fontSize = 12.sp,
                                textAlign = TextAlign.Center,
                            )
                        }
                    }
                }

                val threadHeightPx = (constraints.maxHeight - bottomSectionHeightPx - gapPx).coerceAtLeast(0)
                val threadHeight = with(density) { threadHeightPx.toDp() }

                if (threadHeightPx > 0) {
                    ThreadfieldStrand(
                        strandQueue = strandQueue,
                        isDrawing = isDrawing,
                        completingId = completingId,
                        modifier = Modifier
                            .align(Alignment.TopCenter)
                            .fillMaxWidth()
                            .height(threadHeight),
                    )
                }
            }

            HorizonChrome(
                queueHours = queueHours,
                daysLeft = daysLeft,
                horizon = horizon,
                behindPace = behindPace,
                dailyHoursNeeded = dailyHoursNeeded,
                onFitToPace = onFitToPace,
            )
        }
    }
}

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
private fun TonightBottomSheet(
    title: CatalogTitle,
    loading: Boolean,
    onOpenProvider: () -> Unit,
    onAlreadySeen: () -> Unit,
    onSkip: () -> Unit,
) {
    val posterUrl = title.tmdbPosterPath?.let { "https://image.tmdb.org/t/p/w342$it" }

    RunupBottomSheet(compact = true) {
        RunupTonightBody(
            poster = {
                RunupPosterFrame(
                    modifier = Modifier
                        .width(80.dp)
                        .height(120.dp),
                ) {
                    if (posterUrl != null) {
                        AsyncImage(
                            modifier = Modifier.fillMaxSize(),
                            model = posterUrl,
                            contentDescription = null,
                            contentScale = ContentScale.Crop,
                        )
                    } else {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(
                                    brush = Brush.linearGradient(
                                        colors = listOf(
                                            RunupColors.Amber.copy(alpha = 0.95f),
                                            RunupColors.Void.copy(alpha = 0.96f),
                                        ),
                                    ),
                                ),
                        )
                    }
                }
            },
            copy = {
                RunupEyebrow("Tonight")
                Text(
                    text = title.title,
                    color = RunupColors.Text,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Medium,
                    letterSpacing = 0.8.sp,
                    lineHeight = 28.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                RunupMeta("${title.year} · ${formatRuntime(title.runtimeMin)}")
                Text(
                    text = title.spoilerSafeWhy,
                    color = RunupColors.TextSoft,
                    fontSize = 14.sp,
                    lineHeight = 21.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
            },
        )
        RunupTonightActions {
            RunupPillButton(
                text = "Already seen",
                onClick = onAlreadySeen,
                enabled = !loading,
                compact = true,
                modifier = Modifier.weight(1f),
            )
            RunupPillButton(
                text = "Open in provider",
                onClick = onOpenProvider,
                enabled = !loading,
                primary = true,
                compact = true,
                leadingIconRes = providerIconRes(title.streaming?.provider),
                modifier = Modifier.weight(1.15f),
            )
            RunupPillButton(
                text = "Skip",
                onClick = onSkip,
                enabled = !loading,
                compact = true,
                modifier = Modifier.weight(0.85f),
            )
        }
    }
}

private fun formatRuntime(runtimeMin: Int): String {
    val hours = runtimeMin / 60
    val minutes = runtimeMin % 60
    return when {
        hours == 0 -> "${minutes} min"
        minutes == 0 -> "${hours}h"
        else -> "${hours}h ${minutes}m"
    }
}
