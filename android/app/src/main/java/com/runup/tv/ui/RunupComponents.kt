package com.runup.tv.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.annotation.DrawableRes
import androidx.compose.foundation.Image
import androidx.compose.ui.res.painterResource
import androidx.activity.compose.BackHandler
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.PlatformTextStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.LineHeightStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.Border
import androidx.tv.material3.ClickableSurfaceDefaults
import androidx.tv.material3.ExperimentalTvMaterial3Api
import androidx.tv.material3.Glow
import androidx.tv.material3.Surface
import androidx.tv.material3.Text

private val SheetShape = RoundedCornerShape(24.dp)
private val PillShape = RoundedCornerShape(999.dp)
private val KeyShape = RoundedCornerShape(16.dp)
private val DigitShape = RoundedCornerShape(14.dp)

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
private fun runupSurfaceColors(primary: Boolean) = ClickableSurfaceDefaults.colors(
    containerColor = if (primary) Color(0x1FE8A54B) else Color(0x08FFFFFF),
    contentColor = RunupColors.Text,
    focusedContainerColor = if (primary) Color(0x38E8A54B) else Color(0x14FFFFFF),
    focusedContentColor = RunupColors.Text,
    pressedContainerColor = if (primary) Color(0x47E8A54B) else Color(0x18FFFFFF),
    pressedContentColor = RunupColors.Text,
    disabledContainerColor = if (primary) Color(0x1FE8A54B).copy(alpha = 0.45f) else Color(0x08FFFFFF).copy(alpha = 0.45f),
    disabledContentColor = RunupColors.Text.copy(alpha = 0.45f),
)

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
private fun runupSurfaceBorder(primary: Boolean) = ClickableSurfaceDefaults.border(
    border = Border(BorderStroke(1.dp, if (primary) Color(0x73E8A54B) else Color(0x24F4F1EA))),
    focusedBorder = Border(BorderStroke(1.dp, if (primary) Color(0xB3E8A54B) else Color(0x52F4F1EA))),
    pressedBorder = Border(BorderStroke(1.dp, if (primary) Color(0xB3E8A54B) else Color(0x52F4F1EA))),
    disabledBorder = Border(BorderStroke(1.dp, if (primary) Color(0x40E8A54B) else Color(0x18F4F1EA))),
)

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
internal fun runupSurfaceGlow(primary: Boolean) = ClickableSurfaceDefaults.glow(
    focusedGlow = Glow(
        elevationColor = RunupColors.Amber.copy(alpha = if (primary) 0.28f else 0.12f),
        elevation = if (primary) 10.dp else 4.dp,
    ),
    pressedGlow = Glow(
        elevationColor = RunupColors.Amber.copy(alpha = if (primary) 0.22f else 0.10f),
        elevation = if (primary) 6.dp else 2.dp,
    ),
)

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun RunupBottomSheet(
    modifier: Modifier = Modifier,
    compact: Boolean = false,
    content: @Composable ColumnScope.() -> Unit,
) {
    val horizontalPadding = if (compact) 24.dp else 40.dp
    val verticalPadding = if (compact) 16.dp else 28.dp
    val spacing = if (compact) 8.dp else 12.dp

    Box(modifier = modifier.fillMaxWidth()) {
        Box(
            modifier = Modifier
                .matchParentSize()
                .padding(bottom = 12.dp)
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            Color.Transparent,
                            Color(0x59000000),
                        ),
                    ),
                ),
        )
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(SheetShape)
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            Color(0x14E8A54B),
                            Color(0x05FFFFFF),
                        ),
                    ),
                )
                .border(1.dp, Color(0x1AF4F1EA), SheetShape)
                .padding(horizontal = horizontalPadding, vertical = verticalPadding),
            verticalArrangement = Arrangement.spacedBy(spacing),
            content = content,
        )
    }
}

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun RunupEyebrow(text: String) {
    Text(
        text = text.uppercase(),
        color = RunupColors.Amber,
        fontSize = 12.sp,
        fontWeight = FontWeight.SemiBold,
        letterSpacing = 3.5.sp,
    )
}

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun RunupTitle(text: String, compact: Boolean = false) {
    Text(
        text = text,
        color = RunupColors.Text,
        fontSize = if (compact) 28.sp else 40.sp,
        fontWeight = FontWeight.Medium,
        letterSpacing = if (compact) 1.sp else 1.5.sp,
        lineHeight = if (compact) 32.sp else 44.sp,
    )
}

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun RunupMeta(text: String) {
    Text(
        text = text,
        color = RunupColors.Muted,
        fontSize = 14.sp,
        letterSpacing = 0.8.sp,
    )
}

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun RunupBody(text: String) {
    Text(
        text = text,
        color = RunupColors.TextSoft,
        fontSize = 16.sp,
        lineHeight = 25.sp,
    )
}

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun RunupMuted(text: String, modifier: Modifier = Modifier) {
    Text(
        modifier = modifier,
        text = text,
        color = RunupColors.Muted,
        fontSize = 14.sp,
        lineHeight = 22.sp,
        textAlign = TextAlign.Center,
    )
}

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun RunupError(text: String, modifier: Modifier = Modifier) {
    Text(
        modifier = modifier,
        text = text,
        color = RunupColors.Rust,
        fontSize = 14.sp,
        lineHeight = 21.sp,
        textAlign = TextAlign.Center,
    )
}

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun RunupConfirmDialog(
    title: String,
    message: String,
    confirmText: String,
    dismissText: String,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
    loading: Boolean = false,
    error: String? = null,
) {
    val confirmFocus = remember { FocusRequester() }

    BackHandler(onBack = onDismiss)

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false),
    ) {
        LaunchedEffect(Unit) {
            confirmFocus.requestFocus()
        }

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0x99000000)),
            contentAlignment = Alignment.Center,
        ) {
            Column(
                modifier = Modifier
                    .width(480.dp)
                    .clip(SheetShape)
                    .background(Color(0xFF12141C))
                    .border(1.dp, Color(0x1AF4F1EA), SheetShape)
                    .padding(horizontal = 32.dp, vertical = 28.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                Text(
                    text = title,
                    color = RunupColors.Text,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Medium,
                    letterSpacing = 0.5.sp,
                    textAlign = TextAlign.Center,
                )
                Text(
                    text = message,
                    color = RunupColors.Muted,
                    fontSize = 15.sp,
                    lineHeight = 22.sp,
                    textAlign = TextAlign.Center,
                )
                if (error != null) {
                    RunupError(text = error)
                }
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    RunupPillButton(
                        text = dismissText,
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f),
                        enabled = !loading,
                    )
                    RunupPillButton(
                        text = if (loading) "Saving…" else confirmText,
                        onClick = onConfirm,
                        modifier = Modifier
                            .weight(1f)
                            .focusRequester(confirmFocus),
                        enabled = !loading,
                        primary = true,
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun RunupCodeDisplay(code: String, compact: Boolean = false) {
    val boxWidth = if (compact) 44.dp else 54.dp
    val boxHeight = if (compact) 54.dp else 68.dp
    val gap = if (compact) 8.dp else 10.dp
    val filledFontSize = if (compact) 22.sp else 28.sp
    val emptyFontSize = if (compact) 20.sp else 24.sp

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(gap, Alignment.CenterHorizontally),
    ) {
        repeat(6) { index ->
            val filled = index < code.length
            val char = if (filled) code[index].toString() else "·"
            Box(
                modifier = Modifier
                    .size(width = boxWidth, height = boxHeight)
                    .clip(DigitShape)
                    .background(Color(0x08FFFFFF))
                    .border(
                        width = 1.dp,
                        color = if (filled) Color(0x73E8A54B) else Color(0x24F4F1EA),
                        shape = DigitShape,
                    ),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = char,
                    color = if (filled) RunupColors.Text else RunupColors.Muted.copy(alpha = 0.7f),
                    fontSize = if (filled) filledFontSize else emptyFontSize,
                    fontWeight = FontWeight.SemiBold,
                )
            }
        }
    }
}

@DrawableRes
fun providerIconRes(provider: String?): Int? = when (provider) {
    "hotstar" -> com.runup.tv.R.drawable.ic_hotstar
    else -> null
}

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun RunupPillButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    primary: Boolean = false,
    compact: Boolean = false,
    @DrawableRes leadingIconRes: Int? = null,
) {
    val horizontalPadding = if (compact) 10.dp else 18.dp
    val buttonHeight = if (compact) 44.dp else 48.dp
    val fontSize = if (compact) 11.sp else 14.sp
    val letterSpacing = if (compact) 0.6.sp else 1.1.sp
    val lineHeight = if (compact) 12.sp else fontSize

    Surface(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier
            .height(buttonHeight)
            .fillMaxWidth(),
        shape = ClickableSurfaceDefaults.shape(shape = PillShape),
        colors = runupSurfaceColors(primary = primary),
        border = runupSurfaceBorder(primary = primary),
        glow = runupSurfaceGlow(primary = primary),
        scale = ClickableSurfaceDefaults.scale(focusedScale = 1.02f, pressedScale = 0.98f),
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = horizontalPadding),
            contentAlignment = Alignment.Center,
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                if (leadingIconRes != null) {
                    Image(
                        painter = painterResource(leadingIconRes),
                        contentDescription = null,
                        modifier = Modifier.size(if (compact) 24.dp else 20.dp),
                    )
                }
                Text(
                    text = text.uppercase(),
                style = TextStyle(
                    fontSize = fontSize,
                    fontWeight = FontWeight.Medium,
                    letterSpacing = letterSpacing,
                    lineHeight = lineHeight,
                    textAlign = TextAlign.Center,
                    platformStyle = PlatformTextStyle(includeFontPadding = false),
                    lineHeightStyle = LineHeightStyle(
                        alignment = LineHeightStyle.Alignment.Center,
                        trim = LineHeightStyle.Trim.Both,
                    ),
                ),
                    maxLines = if (compact) 2 else 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
    }
}

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun RunupKeypadButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    compact: Boolean = false,
) {
    val width = if (compact) 76.dp else 92.dp
    val height = if (compact) 42.dp else 50.dp

    Surface(
        onClick = onClick,
        modifier = modifier.size(width = width, height = height),
        shape = ClickableSurfaceDefaults.shape(shape = KeyShape),
        colors = runupSurfaceColors(primary = false),
        border = runupSurfaceBorder(primary = false),
        glow = runupSurfaceGlow(primary = false),
        scale = ClickableSurfaceDefaults.scale(focusedScale = 1.04f, pressedScale = 0.97f),
    ) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = label,
                style = TextStyle(
                    fontSize = if (label.length == 1) 22.sp else 12.sp,
                    fontWeight = FontWeight.Medium,
                    letterSpacing = if (label.length == 1) 0.sp else 0.8.sp,
                    textAlign = TextAlign.Center,
                    platformStyle = PlatformTextStyle(includeFontPadding = false),
                    lineHeightStyle = LineHeightStyle(
                        alignment = LineHeightStyle.Alignment.Center,
                        trim = LineHeightStyle.Trim.Both,
                    ),
                ),
                maxLines = 1,
            )
        }
    }
}

@Composable
fun RunupPosterFrame(
    modifier: Modifier = Modifier,
    content: @Composable BoxScope.() -> Unit,
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(Color(0xEB0C0D12))
            .border(1.dp, Color(0xD9F8E2B8), RoundedCornerShape(10.dp)),
        content = content,
    )
}

@Composable
fun RunupTonightBody(
    modifier: Modifier = Modifier,
    poster: @Composable () -> Unit,
    copy: @Composable () -> Unit,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(18.dp),
        verticalAlignment = Alignment.Bottom,
    ) {
        poster()
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            copy()
        }
    }
}

@Composable
fun RunupTonightActions(
    modifier: Modifier = Modifier,
    content: @Composable RowScope.() -> Unit,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(top = 10.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically,
        content = content,
    )
}
