package com.runup.tv.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.Border
import androidx.tv.material3.ClickableSurfaceDefaults
import androidx.tv.material3.ExperimentalTvMaterial3Api
import androidx.tv.material3.Surface
import androidx.tv.material3.Text
import com.runup.tv.domain.PlacementOption
import com.runup.tv.domain.PlacementOptions
import com.runup.tv.domain.PlacementTone

private val PinShape = RoundedCornerShape(20.dp)

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun PlacementScreen(
    currentPersonaId: String?,
    currentBudgetHours: Double?,
    onSelect: (PlacementOption) -> Unit,
    onCancel: () -> Unit,
) {
    RunupVoidAtmosphere {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 32.dp, vertical = 28.dp),
        ) {
            Text(
                text = "RUNUP",
                color = RunupColors.Text,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 5.sp,
            )
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(
                    text = "COSMIC FRONT · DOOM HORIZON",
                    color = Color(0xFFD8E4EC),
                    fontSize = 11.sp,
                    letterSpacing = 3.sp,
                )
                Text(
                    modifier = Modifier.padding(top = 14.dp),
                    text = "PLACE YOURSELF",
                    color = RunupColors.Text,
                    fontSize = 34.sp,
                    fontWeight = FontWeight.Medium,
                    letterSpacing = 4.sp,
                )
                Text(
                    modifier = Modifier.padding(top = 12.dp, bottom = 24.dp),
                    text = "Two forces close in on Doomsday. Mark where you enter the Official 15 strand.",
                    color = RunupColors.Muted,
                    fontSize = 16.sp,
                    lineHeight = 24.sp,
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    PlacementOptions.all.forEach { option ->
                        val selected = currentPersonaId == option.personaId &&
                            ((option.budgetHours == null && currentBudgetHours == null) ||
                                (option.budgetHours != null && option.budgetHours == currentBudgetHours))
                        PlacementPin(
                            option = option,
                            selected = selected,
                            onClick = { onSelect(option) },
                            modifier = Modifier.weight(1f),
                        )
                    }
                }
            }
            if (currentPersonaId != null) {
                RunupPillButton(
                    text = "Back to Tonight",
                    onClick = onCancel,
                    modifier = Modifier
                        .align(Alignment.CenterHorizontally)
                        .width(240.dp),
                )
            }
        }
    }
}

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
private fun PlacementPin(
    option: PlacementOption,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val toneColor = when (option.tone) {
        PlacementTone.Amber -> RunupColors.Amber
        PlacementTone.Violet -> Color(0xFF9B7DFF)
        PlacementTone.Rust -> RunupColors.Rust
        PlacementTone.Teal -> Color(0xFF3EC4C1)
    }

    Surface(
        onClick = onClick,
        modifier = modifier.height(148.dp),
        shape = ClickableSurfaceDefaults.shape(shape = PinShape),
        colors = ClickableSurfaceDefaults.colors(
            containerColor = Color(0xCC12141C),
            contentColor = RunupColors.Text,
            focusedContainerColor = Color(0xE0181A22),
            focusedContentColor = RunupColors.Text,
        ),
        border = ClickableSurfaceDefaults.border(
            border = Border(BorderStroke(1.dp, if (selected) Color(0x73F4F1EA) else Color(0x1FF4F1EA))),
            focusedBorder = Border(BorderStroke(1.dp, Color(0x52F4F1EA))),
        ),
        glow = runupSurfaceGlow(primary = selected),
        scale = ClickableSurfaceDefaults.scale(focusedScale = 1.03f),
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(top = 8.dp, end = 8.dp)
                    .size(72.dp)
                    .background(
                        brush = Brush.radialGradient(
                            colors = listOf(toneColor.copy(alpha = 0.35f), Color.Transparent),
                        ),
                        shape = CircleShape,
                    ),
            )
            Column(modifier = Modifier.padding(16.dp)) {
                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(CircleShape)
                        .background(toneColor),
                )
                Text(
                    modifier = Modifier.padding(top = 14.dp),
                    text = option.label,
                    color = RunupColors.Text,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    lineHeight = 20.sp,
                )
                Text(
                    modifier = Modifier.padding(top = 8.dp),
                    text = option.hint,
                    color = RunupColors.Muted,
                    fontSize = 12.sp,
                    lineHeight = 18.sp,
                )
            }
        }
    }
}
