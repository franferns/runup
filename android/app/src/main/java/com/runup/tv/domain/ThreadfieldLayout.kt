package com.runup.tv.domain

import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Path
import kotlin.math.PI
import kotlin.math.sin

data class ThumbSize(val width: Int, val height: Int)

data class NodePoint(
    val x: Float,
    val y: Float,
    val t: Float,
    val beadRadius: Float,
    val thumbY: Float,
)

data class ThreadfieldLayout(
    val width: Float,
    val height: Float,
    val positions: List<NodePoint>,
    val thumbSize: ThumbSize,
    val scrollMode: Boolean,
    val contentTop: Float,
    val contentBottom: Float,
) {
    val contentHeight: Float
        get() = (contentBottom - contentTop).coerceAtLeast(1f)
}

object ThreadfieldLayoutEngine {
    private const val HEIGHT = 400f
    private const val THUMB_GAP = 32f
    private const val SCROLL_THUMB_GAP = 28f
    private const val EDGE_PADDING = 72f
    private const val SCROLL_EDGE_PADDING = 48f
    private const val THUMB_BEAD_GAP = 10f
    private const val CONTENT_BOTTOM_PAD = 16f

    const val SCROLL_MODE_BREAKPOINT = 900

    fun getThumbSize(count: Int, scrollMode: Boolean): ThumbSize {
        return when {
            scrollMode && count > 12 -> ThumbSize(92, 138)
            scrollMode && count > 8 -> ThumbSize(104, 156)
            scrollMode -> ThumbSize(118, 177)
            count > 12 -> ThumbSize(112, 168)
            count > 8 -> ThumbSize(128, 192)
            else -> ThumbSize(148, 222)
        }
    }

    fun getBeadRadius(isTonight: Boolean) = if (isTonight) 14f else 11f

    fun getLayout(count: Int, scrollMode: Boolean): ThreadfieldLayout {
        val thumbSize = getThumbSize(count, scrollMode)
        val thumbGap = if (scrollMode) SCROLL_THUMB_GAP else THUMB_GAP
        val edgePadding = if (scrollMode) SCROLL_EDGE_PADDING else EDGE_PADDING
        val step = thumbSize.width + thumbGap
        val contentWidth = if (count <= 1) thumbSize.width.toFloat() else thumbSize.width + step * (count - 1)
        val width = edgePadding * 2 + contentWidth
        val positions = getNodePositions(count, thumbSize, thumbGap, edgePadding)
        val contentTop = positions.minOf { it.thumbY }
        val contentBottom = positions.maxOf { it.y + it.beadRadius } + CONTENT_BOTTOM_PAD
        return ThreadfieldLayout(
            width = width,
            height = HEIGHT,
            positions = positions,
            thumbSize = thumbSize,
            scrollMode = scrollMode,
            contentTop = contentTop,
            contentBottom = contentBottom,
        )
    }

    private fun getNodePositions(
        count: Int,
        thumbSize: ThumbSize,
        thumbGap: Float,
        edgePadding: Float,
    ): List<NodePoint> {
        if (count == 0) return emptyList()
        val startX = edgePadding + thumbSize.width / 2f
        val step = thumbSize.width + thumbGap
        return List(count) { index ->
            val t = if (count == 1) 0.35f else index.toFloat() / (count - 1)
            val x = startX + index * step
            val y = HEIGHT * 0.8f - sin(t * PI.toFloat()) * 36f
            val isTonight = index == 0
            val beadRadius = getBeadRadius(isTonight)
            NodePoint(
                x = x,
                y = y,
                t = t,
                beadRadius = beadRadius,
                thumbY = y - beadRadius - THUMB_BEAD_GAP - thumbSize.height,
            )
        }
    }

    fun strandPathFromPoints(points: List<NodePoint>): Path {
        val path = Path()
        if (points.isEmpty()) return path
        if (points.size == 1) {
            val point = points[0]
            path.moveTo(point.x, point.y)
            path.lineTo(point.x + 120f, point.y - 28f)
            return path
        }
        path.moveTo(points[0].x, points[0].y)
        for (index in 1 until points.size) {
            val previous = points[index - 1]
            val current = points[index]
            val controlX = (previous.x + current.x) / 2f
            path.quadraticTo(controlX, previous.y, current.x, current.y)
        }
        return path
    }

    fun segmentPath(points: List<NodePoint>, fromIndex: Int): Path {
        val path = Path()
        if (points.isEmpty()) return path
        val start = points[fromIndex]
        val end = points.getOrNull(fromIndex + 1)
        path.moveTo(start.x, start.y)
        if (end == null) {
            path.lineTo(start.x + 110f, start.y - 24f)
        } else {
            path.lineTo(end.x, end.y)
        }
        return path
    }

    fun getCenteredPanOffset(
        focusX: Float,
        viewportWidth: Float,
        contentWidth: Float,
        scale: Float = 1f,
    ): Float {
        if (viewportWidth <= 0f) return 0f
        val scaledFocus = focusX * scale
        val scaledWidth = contentWidth * scale
        val ideal = viewportWidth / 2f - scaledFocus
        val minOffset = minOf(0f, viewportWidth - scaledWidth)
        return minOf(0f, maxOf(minOffset, ideal))
    }
}
