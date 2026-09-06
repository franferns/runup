package com.runup.tv.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.tv.material3.ExperimentalTvMaterial3Api
import coil.compose.AsyncImage
import com.runup.tv.domain.CatalogTitle

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun TonightScreen(
    title: CatalogTitle?,
    daysLeft: Int?,
    loading: Boolean,
    error: String?,
    onOpenProvider: () -> Unit,
    onAlreadySeen: () -> Unit,
    onSkip: () -> Unit,
) {
    when {
        error != null -> {
            RunupBottomSheet {
                RunupEyebrow("Tonight")
                RunupTitle("Something went wrong")
                RunupBody(error)
            }
        }

        title == null -> {
            RunupBottomSheet {
                RunupEyebrow("Tonight")
                RunupTitle("Path complete")
                RunupBody(
                    if (daysLeft != null && daysLeft > 0) {
                        "$daysLeft days until the horizon."
                    } else {
                        "Nothing left on this queue. You are caught up."
                    },
                )
            }
        }

        else -> {
            val posterUrl = title.tmdbPosterPath?.let { "https://image.tmdb.org/t/p/w342$it" }

            RunupBottomSheet {
                RunupTonightBody(
                    poster = {
                        RunupPosterFrame(
                            modifier = Modifier
                                .width(132.dp)
                                .aspectRatio(2f / 3f),
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
                                                    RunupColors.Amber.copy(alpha = 0.55f),
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
                        RunupTitle(title.title)
                        RunupMeta("${title.year} · ${formatRuntime(title.runtimeMin)}")
                        RunupBody(title.spoilerSafeWhy)
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
