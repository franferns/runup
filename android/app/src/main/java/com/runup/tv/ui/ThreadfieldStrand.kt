package com.runup.tv.ui

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathMeasure
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.ExperimentalTvMaterial3Api
import androidx.tv.material3.Text
import coil.compose.AsyncImage
import com.runup.tv.domain.StrandStatus
import com.runup.tv.domain.StrandTitle
import com.runup.tv.domain.ThreadfieldLayoutEngine
import kotlin.math.roundToInt

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun ThreadfieldStrand(
    strandQueue: List<StrandTitle>,
    isDrawing: Boolean,
    completingId: String?,
    modifier: Modifier = Modifier,
) {
    if (strandQueue.isEmpty()) {
        Box(
            modifier = modifier
                .fillMaxWidth()
                .height(96.dp),
        )
        return
    }

    BoxWithConstraints(
        modifier = modifier
            .fillMaxWidth()
            .fillMaxHeight()
            .clip(RectangleShape),
    ) {
        val viewportWidthPx = constraints.maxWidth.toFloat()
        val viewportHeightPx = constraints.maxHeight.toFloat().coerceAtLeast(1f)
        val density = LocalDensity.current
        val layout = remember(strandQueue.size, viewportWidthPx, viewportHeightPx) {
            ThreadfieldLayoutEngine.getLayoutForViewport(
                count = strandQueue.size,
                viewportWidth = viewportWidthPx,
                viewportHeight = viewportHeightPx,
                scrollMode = false,
            )
        }
        val drawFromIndex = completingId?.let { id ->
            strandQueue.indexOfFirst { it.title.id == id }.takeIf { it >= 0 }
        } ?: strandQueue.indexOfFirst { it.strandStatus == StrandStatus.Tonight }
            .let { if (it >= 0) it else 0 }

        val strandPath = remember(layout.positions) {
            ThreadfieldLayoutEngine.strandPathFromPoints(layout.positions)
        }
        val segmentPath = remember(layout.positions, drawFromIndex) {
            ThreadfieldLayoutEngine.segmentPath(layout.positions, drawFromIndex)
        }
        val drawProgress by animateFloatAsState(
            targetValue = if (isDrawing) 1f else 0f,
            animationSpec = tween(durationMillis = 1500),
            label = "drawProgress",
        )

        Box(modifier = Modifier.fillMaxSize()) {
                ThreadfieldHorizonOrb()
                Canvas(modifier = Modifier.fillMaxSize()) {
                    drawPath(
                        path = strandPath,
                        color = Color(0xB3E8A54B),
                        style = Stroke(width = 3f, cap = StrokeCap.Round),
                    )
                    if (isDrawing) {
                        val measure = PathMeasure()
                        measure.setPath(segmentPath, false)
                        val animated = Path()
                        measure.getSegment(
                            0f,
                            measure.length * drawProgress,
                            animated,
                            true,
                        )
                        drawPath(
                            path = animated,
                            color = RunupColors.Amber,
                            style = Stroke(width = 3.5f, cap = StrokeCap.Round),
                        )
                    }
                    layout.positions.forEachIndexed { index, point ->
                        val item = strandQueue[index]
                        val isTonight = item.strandStatus == StrandStatus.Tonight
                        val isWatched = item.strandStatus == StrandStatus.Watched ||
                            item.title.id == completingId
                        val radius = point.beadRadius
                        val haloColor = when {
                            isWatched -> Color(0x574CAF78)
                            isTonight -> Color(0x57E8A54B)
                            else -> Color(0x29E8A54B)
                        }
                        drawCircle(
                            color = haloColor,
                            radius = radius + 8f,
                            center = Offset(point.x, point.y),
                        )
                        drawCircle(
                            color = when {
                                isWatched -> Color(0x8C4CAF78)
                                isTonight -> RunupColors.Amber
                                else -> Color(0xD1E8A54B)
                            },
                            radius = radius,
                            center = Offset(point.x, point.y),
                            style = Stroke(
                                width = if (isTonight) 2.5f else 2f,
                                cap = StrokeCap.Round,
                            ),
                        )
                        drawCircle(
                            color = when {
                                isWatched -> Color(0x8C4CAF78)
                                isTonight -> RunupColors.Amber
                                else -> Color(0xD1E8A54B)
                            },
                            radius = radius - 1f,
                            center = Offset(point.x, point.y),
                        )
                    }
                }

                layout.positions.forEachIndexed { index, point ->
                    val item = strandQueue[index]
                    val thumbSize = layout.thumbSize
                    val isTonight = item.strandStatus == StrandStatus.Tonight
                    val isWatched = item.strandStatus == StrandStatus.Watched
                    val isCompleting = item.title.id == completingId
                    val showLabel = strandQueue.size <= 8
                    val posterUrl = item.title.tmdbPosterPath?.let {
                        "https://image.tmdb.org/t/p/w342$it"
                    }

                    with(density) {
                        Box(
                            modifier = Modifier
                                .offset {
                                    IntOffset(
                                        (point.x - thumbSize.width / 2f).roundToInt(),
                                        point.thumbY.roundToInt(),
                                    )
                                }
                                .width(thumbSize.width.toDp())
                                .height(thumbSize.height.toDp())
                                .clip(RoundedCornerShape(8.dp))
                                .then(
                                    when {
                                        isTonight -> Modifier.border(
                                            1.dp,
                                            Color(0xD9F8E2B8),
                                            RoundedCornerShape(8.dp),
                                        )
                                        isWatched || isCompleting -> Modifier.border(
                                            1.dp,
                                            Color(0x734CAF78),
                                            RoundedCornerShape(8.dp),
                                        )
                                        else -> Modifier.border(
                                            1.dp,
                                            Color(0x73E8A54B),
                                            RoundedCornerShape(8.dp),
                                        )
                                    },
                                )
                                .graphicsLayer {
                                    alpha = when {
                                        isWatched || isCompleting -> 0.42f
                                        isTonight -> 1f
                                        else -> 0.55f
                                    }
                                },
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
                            if (showLabel) {
                                Box(
                                    modifier = Modifier
                                        .align(Alignment.BottomStart)
                                        .fillMaxWidth()
                                        .background(Color(0xCC0B0C10))
                                        .padding(horizontal = 8.dp, vertical = 6.dp),
                                ) {
                                    Column {
                                        Text(
                                            text = shortTitle(item.title.title),
                                            color = RunupColors.Text,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Medium,
                                            maxLines = 1,
                                        )
                                        Text(
                                            text = item.title.year.toString(),
                                            color = RunupColors.Muted,
                                            fontSize = 10.sp,
                                        )
                                    }
                                }
                            }
                            if (isWatched || isCompleting) {
                                Box(
                                    modifier = Modifier
                                        .align(Alignment.TopEnd)
                                        .offset(x = 6.dp, y = (-6).dp)
                                        .clip(RoundedCornerShape(999.dp))
                                        .background(Color(0xFF3ECF6E))
                                        .padding(horizontal = 5.dp, vertical = 3.dp),
                                ) {
                                    Text(text = "✓", color = Color(0xFF0B1A10), fontSize = 10.sp)
                                }
                            }
                        }
                    }
                }
        }
    }
}

@Composable
private fun ThreadfieldHorizonOrb() {
    Box(
        modifier = Modifier
            .fillMaxSize(),
    ) {
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .offset(x = 40.dp, y = 20.dp)
                .width(220.dp)
                .height(220.dp)
                .background(
                    brush = Brush.radialGradient(
                        colors = listOf(
                            Color(0x57C9D4E8),
                            Color(0x14C9D4E8),
                            Color.Transparent,
                        ),
                    ),
                ),
        )
    }
}

private fun shortTitle(title: String): String {
    val words = title.split(Regex("\\s+"))
    return if (words.size <= 3) title else words.take(3).joinToString(" ") + "…"
}
