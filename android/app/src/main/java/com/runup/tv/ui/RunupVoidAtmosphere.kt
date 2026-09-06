package com.runup.tv.ui

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import coil.request.ImageRequest

@Composable
fun RunupVoidAtmosphere(
    modifier: Modifier = Modifier,
    content: @Composable BoxScope.() -> Unit,
) {
    val cosmicAlpha by rememberInfiniteTransition(label = "cosmic").animateFloat(
        initialValue = 0.5f,
        targetValue = 0.85f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 12000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "cosmicAlpha",
    )
    val cosmicScale by rememberInfiniteTransition(label = "cosmicScale").animateFloat(
        initialValue = 1f,
        targetValue = 1.03f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 12000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "cosmicScale",
    )
    val doomAlpha by rememberInfiniteTransition(label = "doom").animateFloat(
        initialValue = 0.55f,
        targetValue = 0.9f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 13000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "doomAlpha",
    )
    val doomScale by rememberInfiniteTransition(label = "doomScale").animateFloat(
        initialValue = 1.02f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 13000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "doomScale",
    )

    BoxWithConstraints(modifier = modifier.fillMaxSize()) {
        val widthPx = constraints.maxWidth.toFloat()
        val heightPx = constraints.maxHeight.toFloat()

        VoidBackdropImage()

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0x0D040608),
                            Color(0x6B04080A),
                            Color(0xEB030506),
                        ),
                    ),
                ),
        )
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.radialGradient(
                        colors = listOf(Color(0x24FF8C3C), Color.Transparent),
                        center = Offset(widthPx * 0.2f, heightPx * 0.3f),
                        radius = widthPx * 0.42f,
                    ),
                ),
        )
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.radialGradient(
                        colors = listOf(Color(0x3022A85C), Color.Transparent),
                        center = Offset(widthPx * 0.8f, heightPx * 0.28f),
                        radius = widthPx * 0.44f,
                    ),
                ),
        )
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.radialGradient(
                        colors = listOf(Color(0x33020405), Color(0xE6020405)),
                        center = Offset(widthPx * 0.5f, heightPx * 1.05f),
                        radius = heightPx * 0.72f,
                    ),
                ),
        )
        Box(
            modifier = Modifier
                .fillMaxSize()
                .graphicsLayer {
                    alpha = cosmicAlpha
                    scaleX = cosmicScale
                    scaleY = cosmicScale
                }
                .background(
                    Brush.radialGradient(
                        colors = listOf(
                            Color(0x24FFC460),
                            Color(0x14A8A8FF),
                            Color.Transparent,
                        ),
                        center = Offset(widthPx * 0.2f, heightPx * 0.3f),
                        radius = widthPx * 0.58f,
                    ),
                ),
        )
        Box(
            modifier = Modifier
                .fillMaxSize()
                .graphicsLayer {
                    alpha = doomAlpha
                    scaleX = doomScale
                    scaleY = doomScale
                }
                .background(
                    Brush.radialGradient(
                        colors = listOf(
                            Color(0x2958DC8C),
                            Color(0x1422A85C),
                            Color.Transparent,
                        ),
                        center = Offset(widthPx * 0.8f, heightPx * 0.28f),
                        radius = widthPx * 0.56f,
                    ),
                ),
        )
        VoidStrand(widthPx = widthPx, heightPx = heightPx)
        VoidStars(widthPx = widthPx, heightPx = heightPx)
        content()
    }
}

@Composable
private fun VoidBackdropImage() {
    val context = LocalContext.current
    AsyncImage(
        modifier = Modifier
            .fillMaxSize()
            .graphicsLayer {
                scaleX = 1.04f
                scaleY = 1.04f
            },
        model = ImageRequest.Builder(context)
            .data("file:///android_asset/backgrounds/void-atmosphere-sm.jpg")
            .crossfade(true)
            .build(),
        contentDescription = null,
        contentScale = ContentScale.Crop,
        alignment = androidx.compose.ui.Alignment.TopCenter,
    )
}

@Composable
private fun VoidStrand(widthPx: Float, heightPx: Float) {
    Canvas(
        modifier = Modifier
            .fillMaxSize()
            .graphicsLayer { alpha = 0.22f },
    ) {
        val bottom = heightPx * 0.72f

        val main = Path().apply {
            moveTo(0f, bottom - 20f)
            quadraticTo(widthPx * 0.23f, bottom - 60f, widthPx * 0.43f, bottom - 44f)
            quadraticTo(widthPx * 0.62f, bottom - 28f, widthPx * 0.82f, bottom - 92f)
            quadraticTo(widthPx * 0.92f, bottom - 112f, widthPx, bottom - 132f)
        }
        drawPath(
            path = main,
            color = Color(0x4722A85C),
            style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round),
        )

        val dim = Path().apply {
            moveTo(0f, bottom)
            quadraticTo(widthPx * 0.27f, bottom - 30f, widthPx * 0.5f, bottom - 18f)
            quadraticTo(widthPx * 0.75f, bottom - 6f, widthPx * 0.92f, bottom - 62f)
        }
        drawPath(
            path = dim,
            color = Color(0x2E946C3A),
            style = Stroke(width = 1.5.dp.toPx(), cap = StrokeCap.Round),
        )
    }
}

@Composable
private fun VoidStars(widthPx: Float, heightPx: Float) {
    val stars = listOf(
        Triple(0.12f, 0.22f, 0.14f),
        Triple(0.78f, 0.18f, 0.10f),
        Triple(0.44f, 0.12f, 0.08f),
        Triple(0.88f, 0.42f, 0.10f),
        Triple(0.24f, 0.58f, 0.07f),
    )
    Canvas(
        modifier = Modifier
            .fillMaxSize()
            .graphicsLayer { alpha = 0.35f },
    ) {
        stars.forEach { (x, y, alpha) ->
            drawCircle(
                color = Color(0xFFF4F1EA).copy(alpha = alpha),
                radius = 1.dp.toPx(),
                center = Offset(widthPx * x, heightPx * y),
            )
        }
    }
}
