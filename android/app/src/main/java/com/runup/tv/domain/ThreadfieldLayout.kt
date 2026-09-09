package com.runup.tv.domain

import androidx.compose.ui.graphics.Path
import kotlin.math.PI
import kotlin.math.min
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
    private const val HEIGHT = 480f
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
        return buildLayout(count, scrollMode, layoutWidth = null)
    }

    fun getLayoutForViewport(
        count: Int,
        viewportWidth: Float,
        viewportHeight: Float,
        scrollMode: Boolean,
    ): ThreadfieldLayout {
        if (viewportWidth <= 0f || viewportHeight <= 0f || count == 0) {
            return getLayout(count, scrollMode)
        }

        val artboardHeight = viewportHeight.coerceAtLeast(1f)
        val thumbSize = computeThumbSizeForViewport(count, viewportWidth, artboardHeight)
        val edgePadding = TV_EDGE_PADDING
        val thumbGap = computeStretchGap(count, thumbSize.width, viewportWidth, edgePadding)

        return buildLayout(
            count = count,
            scrollMode = scrollMode,
            layoutWidth = viewportWidth,
            layoutHeight = artboardHeight,
            thumbSize = thumbSize,
            edgePadding = edgePadding,
            thumbGap = thumbGap,
        )
    }

    private const val TV_EDGE_PADDING = 8f
    private const val TV_MIN_THUMB_WIDTH = 56
    private const val TV_MAX_THUMB_WIDTH = 280
    private const val TV_MIN_THUMB_GAP = 16f

    private fun computeThumbSizeForViewport(
        count: Int,
        viewportWidth: Float,
        viewportHeight: Float,
    ): ThumbSize {
        val availableWidth = (viewportWidth - TV_EDGE_PADDING * 2).coerceAtLeast(1f)
        val beadLineY = viewportHeight * 0.9f
        val maxThumbHeight = (beadLineY - THUMB_BEAD_GAP - getBeadRadius(true) - 4f)
            .coerceAtLeast(80f)

        if (count <= 1) {
            val width = min(availableWidth, TV_MAX_THUMB_WIDTH.toFloat())
                .toInt()
                .coerceIn(TV_MIN_THUMB_WIDTH, TV_MAX_THUMB_WIDTH)
            return ThumbSize(width, maxThumbHeight.toInt())
        }

        var thumbWidth = ((availableWidth - TV_MIN_THUMB_GAP * (count - 1)) / count)
            .toInt()
            .coerceIn(TV_MIN_THUMB_WIDTH, TV_MAX_THUMB_WIDTH)

        while (thumbWidth > TV_MIN_THUMB_WIDTH) {
            val gap = computeStretchGap(count, thumbWidth, viewportWidth, TV_EDGE_PADDING)
            val span = thumbWidth * count + gap * (count - 1)
            if (span <= availableWidth) break
            thumbWidth -= 2
        }

        return ThumbSize(thumbWidth, maxThumbHeight.toInt())
    }

    private fun computeStretchGap(
        count: Int,
        thumbWidth: Int,
        viewportWidth: Float,
        edgePadding: Float,
    ): Float {
        if (count <= 1) return 0f

        val availableWidth = (viewportWidth - edgePadding * 2).coerceAtLeast(1f)
        val thumbSpan = thumbWidth * count
        val remaining = availableWidth - thumbSpan

        return maxOf(TV_MIN_THUMB_GAP, remaining / (count - 1))
    }

    private fun buildLayout(
        count: Int,
        scrollMode: Boolean,
        layoutWidth: Float?,
        layoutHeight: Float? = null,
        thumbSize: ThumbSize? = null,
        edgePadding: Float? = null,
        thumbGap: Float? = null,
    ): ThreadfieldLayout {
        val resolvedThumbSize = thumbSize ?: getThumbSize(count, scrollMode)
        val resolvedEdgePadding = edgePadding ?: if (scrollMode) SCROLL_EDGE_PADDING else EDGE_PADDING
        val resolvedThumbGap = thumbGap ?: if (scrollMode) SCROLL_THUMB_GAP else THUMB_GAP
        val resolvedHeight = layoutHeight ?: HEIGHT
        val positions = getNodePositions(
            count = count,
            thumbSize = resolvedThumbSize,
            thumbGap = resolvedThumbGap,
            edgePadding = resolvedEdgePadding,
            layoutWidth = layoutWidth,
            layoutHeight = resolvedHeight,
        )
        val width = layoutWidth ?: run {
            val thumbGap = if (scrollMode) SCROLL_THUMB_GAP else THUMB_GAP
            val step = resolvedThumbSize.width + thumbGap
            val contentWidth = if (count <= 1) {
                resolvedThumbSize.width.toFloat()
            } else {
                resolvedThumbSize.width + step * (count - 1)
            }
            resolvedEdgePadding * 2 + contentWidth
        }
        val contentTop = positions.minOf { it.thumbY }
        val contentBottom = positions.maxOf { it.y + it.beadRadius } + CONTENT_BOTTOM_PAD
        return ThreadfieldLayout(
            width = width,
            height = resolvedHeight,
            positions = positions,
            thumbSize = resolvedThumbSize,
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
        layoutWidth: Float? = null,
        layoutHeight: Float = HEIGHT,
    ): List<NodePoint> {
        if (count == 0) return emptyList()

        val contentSpan = if (count <= 1) {
            thumbSize.width.toFloat()
        } else {
            thumbSize.width + (thumbSize.width + thumbGap) * (count - 1)
        }
        val startEdge = when {
            layoutWidth != null -> (layoutWidth - contentSpan) / 2f
            else -> edgePadding
        }
        val startX = startEdge + thumbSize.width / 2f
        val step = thumbSize.width + thumbGap
        val beadLineY = layoutHeight * 0.9f
        val wave = min(28f, layoutHeight * 0.05f)
        return List(count) { index ->
            val t = if (count == 1) 0.35f else index.toFloat() / (count - 1)
            val x = startX + index * step
            val y = beadLineY - sin(t * PI.toFloat()) * wave
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
