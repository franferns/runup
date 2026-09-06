package com.runup.tv

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.tv.material3.ExperimentalTvMaterial3Api
import com.runup.tv.ui.PairingScreen
import com.runup.tv.ui.PlacementScreen
import com.runup.tv.ui.RunupConfirmDialog
import com.runup.tv.ui.RunupShell
import com.runup.tv.ui.RunupTheme
import com.runup.tv.ui.ThreadfieldScreen
import com.runup.tv.util.StreamingLauncher

class MainActivity : ComponentActivity() {
    private val viewModel: RunupViewModel by viewModels()

    @OptIn(ExperimentalTvMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            val uiState by viewModel.uiState.collectAsState()

            RunupTheme {
                Box(modifier = Modifier.fillMaxSize()) {
                    when {
                    !uiState.paired -> {
                        RunupShell {
                            PairingScreen(
                                loading = uiState.pairingLoading,
                                error = uiState.pairingError,
                                onSubmit = viewModel::pair,
                            )
                        }
                    }

                    uiState.placementMode -> {
                        PlacementScreen(
                            currentPersonaId = uiState.currentPersonaId,
                            currentBudgetHours = uiState.currentBudgetHours,
                            onSelect = viewModel::selectPlacement,
                            onCancel = viewModel::cancelPlacement,
                        )
                    }

                    else -> {
                        ThreadfieldScreen(
                            personaLabel = uiState.personaLabel,
                            budgetNote = uiState.budgetNote,
                            queueCount = uiState.queueCount,
                            strandQueue = uiState.strandQueue,
                            tonight = uiState.tonight,
                            isDrawing = uiState.isDrawing,
                            completingId = uiState.completingId,
                            loading = uiState.loading,
                            error = uiState.error,
                            queueHours = uiState.queueHours,
                            daysLeft = uiState.daysLeft ?: 0,
                            horizon = uiState.horizon.orEmpty(),
                            behindPace = uiState.behindPace,
                            dailyHoursNeeded = uiState.dailyHoursNeeded,
                            onChangePlacement = viewModel::openPlacement,
                            onOpenProvider = {
                                uiState.tonight?.streaming?.let {
                                    StreamingLauncher.openInProvider(this@MainActivity, it)
                                }
                            },
                            onAlreadySeen = viewModel::markAlreadySeen,
                            onSkip = viewModel::markSkipped,
                            onFitToPace = viewModel::fitToPace,
                        )
                    }
                    }

                    if (uiState.pendingPlacement != null) {
                        RunupConfirmDialog(
                            title = "Change starting point?",
                            message = "This resets your watched and skipped titles.",
                            confirmText = "Change",
                            dismissText = "Cancel",
                            loading = uiState.loading,
                            error = uiState.error,
                            onConfirm = viewModel::confirmPlacementChange,
                            onDismiss = viewModel::dismissPlacementConfirm,
                        )
                    }
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        if (viewModel.uiState.value.paired) {
            viewModel.refreshState()
        }
    }
}
