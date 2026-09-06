package com.runup.tv.ui

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.tv.material3.ExperimentalTvMaterial3Api
import androidx.tv.material3.MaterialTheme
import androidx.tv.material3.darkColorScheme

@OptIn(ExperimentalTvMaterial3Api::class)
private val RunupDarkColors = darkColorScheme(
    background = Color(0xFF0B0C10),
    surface = Color(0xFF0B0C10),
    onBackground = Color(0xFFF4F1EA),
    onSurface = Color(0xFFF4F1EA),
    primary = Color(0xFFE8A54B),
    onPrimary = Color(0xFF0B0C10),
    error = Color(0xFFC45C3E),
    onError = Color(0xFFF4F1EA),
)

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun RunupTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = RunupDarkColors,
        content = content,
    )
}
