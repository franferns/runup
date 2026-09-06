package com.runup.tv.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.ExperimentalTvMaterial3Api
import androidx.tv.material3.Text

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun RunupShell(
    modifier: Modifier = Modifier,
    disclaimer: String = "Unofficial fan project. Not affiliated with Marvel Entertainment or The Walt Disney Company.",
    content: @Composable () -> Unit,
) {
    RunupVoidAtmosphere(modifier = modifier) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(start = 32.dp, top = 28.dp, end = 32.dp, bottom = 40.dp),
        ) {
            Text(
                text = "RUNUP",
                color = RunupColors.Text,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 5.sp,
            )
            Text(
                modifier = Modifier.padding(top = 6.dp),
                text = disclaimer,
                color = RunupColors.Muted,
                fontSize = 11.sp,
                letterSpacing = 0.4.sp,
                lineHeight = 15.sp,
                maxLines = 2,
            )

            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .widthIn(max = 960.dp)
                    .align(Alignment.CenterHorizontally),
                contentAlignment = Alignment.Center,
            ) {
                content()
            }
        }
    }
}
