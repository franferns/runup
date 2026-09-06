package com.runup.tv.ui

import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import androidx.tv.material3.ExperimentalTvMaterial3Api

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun PairingScreen(
    loading: Boolean,
    error: String?,
    onSubmit: (String) -> Unit,
) {
    var code by remember { mutableStateOf("") }

    fun handleKey(key: String) {
        when (key) {
            "clear" -> code = ""
            "back" -> if (code.isNotEmpty()) code = code.dropLast(1)
            else -> if (code.length < 6) code += key
        }
    }

    RunupBottomSheet(compact = true) {
        RunupEyebrow("On your TV")
        RunupTitle(text = "Pair your TV", compact = true)
        RunupMuted(
            text = "Enter the 6-digit code from runup.app → Watch tonight → On your TV",
            modifier = Modifier.fillMaxWidth(),
        )

        RunupCodeDisplay(code = code, compact = true)

        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            listOf(
                listOf("1", "2", "3"),
                listOf("4", "5", "6"),
                listOf("7", "8", "9"),
                listOf("clear", "0", "back"),
            ).forEach { row ->
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    row.forEach { key ->
                        val label = when (key) {
                            "clear" -> "Clear"
                            "back" -> "⌫"
                            else -> key
                        }
                        RunupKeypadButton(
                            label = label,
                            onClick = { handleKey(key) },
                            compact = true,
                            modifier = Modifier.pointerInput(key) {
                                detectTapGestures(onTap = { handleKey(key) })
                            },
                        )
                    }
                }
            }
        }

        val submit = { onSubmit(code) }
        Box(
            modifier = Modifier.fillMaxWidth(),
            contentAlignment = Alignment.Center,
        ) {
            RunupPillButton(
                text = if (loading) "Pairing…" else "Pair",
                onClick = submit,
                enabled = !loading && code.length == 6,
                primary = true,
                compact = true,
                modifier = Modifier
                    .fillMaxWidth(0.68f)
                    .pointerInput(code, loading) {
                        if (!loading && code.length == 6) {
                            detectTapGestures(onTap = { submit() })
                        }
                    },
            )
        }

        if (error != null) {
            RunupError(
                text = error,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}
