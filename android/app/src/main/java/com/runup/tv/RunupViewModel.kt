package com.runup.tv

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.runup.tv.data.CatalogRepository
import com.runup.tv.data.SessionRepository
import com.runup.tv.data.SupabaseApi
import com.runup.tv.domain.CatalogTitle
import com.runup.tv.domain.Horizon
import com.runup.tv.domain.PlacementOption
import com.runup.tv.domain.PlacementOptions
import com.runup.tv.domain.QueueModelBuilder
import com.runup.tv.domain.RunupState
import com.runup.tv.domain.StrandTitle
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

data class RunupUiState(
    val paired: Boolean = false,
    val pairingLoading: Boolean = false,
    val pairingError: String? = null,
    val placementMode: Boolean = false,
    val pendingPlacement: PlacementOption? = null,
    val pendingReset: Boolean = false,
    val strandQueue: List<StrandTitle> = emptyList(),
    val tonight: CatalogTitle? = null,
    val personaLabel: String? = null,
    val budgetNote: String = "",
    val queueCount: Int = 0,
    val queueHours: Double = 0.0,
    val horizon: String? = null,
    val daysLeft: Int? = null,
    val behindPace: Boolean = false,
    val dailyHoursNeeded: Double = 0.0,
    val loading: Boolean = false,
    val isDrawing: Boolean = false,
    val completingId: String? = null,
    val sessionEnded: Boolean = false,
    val error: String? = null,
    val currentPersonaId: String? = null,
    val currentBudgetHours: Double? = null,
)

class RunupViewModel(application: Application) : AndroidViewModel(application) {
    private val sessionRepo = SessionRepository(application)
    private val catalogRepo = CatalogRepository(application)
    private val api = SupabaseApi()

    private val _uiState = MutableStateFlow(RunupUiState(paired = sessionRepo.isPaired()))
    val uiState: StateFlow<RunupUiState> = _uiState.asStateFlow()

    private var runupState: RunupState? = null

    init {
        if (sessionRepo.isPaired()) {
            refreshState()
            startPolling()
        }
    }

    private fun startPolling() {
        viewModelScope.launch {
            while (true) {
                delay(15_000)
                if (sessionRepo.isPaired() && !_uiState.value.placementMode && !_uiState.value.isDrawing) {
                    refreshState(silent = true)
                }
            }
        }
    }

    fun pair(code: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(pairingLoading = true, pairingError = null) }
            try {
                val result = withContext(Dispatchers.IO) {
                    api.pair(code, deviceLabel = "Living room TV")
                }
                sessionRepo.savePairing(result.sessionId, result.deviceToken)
                _uiState.update { it.copy(paired = true, pairingLoading = false) }
                refreshState()
            } catch (err: Exception) {
                _uiState.update {
                    it.copy(
                        pairingLoading = false,
                        pairingError = err.message ?: "Pairing failed",
                    )
                }
            }
        }
    }

    fun refreshState(silent: Boolean = false) {
        val sessionId = sessionRepo.getSessionId() ?: return
        val deviceToken = sessionRepo.getDeviceToken() ?: return

        viewModelScope.launch {
            if (!silent) {
                _uiState.update { it.copy(loading = true, error = null, sessionEnded = false) }
            }
            try {
                val state = withContext(Dispatchers.IO) {
                    api.fetchState(sessionId, deviceToken)
                }
                runupState = state
                renderState(state)
            } catch (err: SupabaseApi.ApiException) {
                if (err.code == 401 || err.code == 404) {
                    sessionRepo.clear()
                    _uiState.update {
                        RunupUiState(
                            paired = false,
                            sessionEnded = true,
                            pairingError = "Session ended — enter a new code from runup.app",
                        )
                    }
                } else {
                    _uiState.update { it.copy(loading = false, error = err.message) }
                }
            } catch (err: Exception) {
                _uiState.update { it.copy(loading = false, error = err.message) }
            }
        }
    }

    fun openPlacement() {
        _uiState.update { it.copy(placementMode = true, pendingPlacement = null) }
    }

    fun cancelPlacement() {
        if (runupState?.personaId == null) return
        _uiState.update { it.copy(placementMode = false, pendingPlacement = null) }
    }

    fun selectPlacement(option: PlacementOption) {
        val current = runupState
        if (current != null && PlacementOptions.matchesState(option, current)) {
            _uiState.update { it.copy(placementMode = false, pendingPlacement = null) }
            return
        }
        if (current?.personaId != null) {
            _uiState.update { it.copy(pendingPlacement = option) }
        } else {
            applyPlacement(option)
        }
    }

    fun confirmPlacementChange() {
        val option = _uiState.value.pendingPlacement ?: return
        applyPlacement(option)
    }

    fun dismissPlacementConfirm() {
        _uiState.update { it.copy(pendingPlacement = null, error = null) }
    }

    fun requestResetProgress() {
        val state = runupState ?: return
        if (state.watchedIds.isEmpty() && state.skippedIds.isEmpty()) {
            return
        }
        _uiState.update { it.copy(pendingReset = true, error = null) }
    }

    fun dismissResetConfirm() {
        _uiState.update { it.copy(pendingReset = false, error = null) }
    }

    fun confirmResetProgress() {
        val sessionId = sessionRepo.getSessionId()
        val deviceToken = sessionRepo.getDeviceToken()
        if (sessionId == null || deviceToken == null) {
            _uiState.update {
                it.copy(error = "Session expired — pair again from the web app")
            }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(loading = true, error = null) }
            try {
                val patch = JSONObject().put("resetProgress", true)
                val next = withContext(Dispatchers.IO) {
                    api.patchState(sessionId, deviceToken, patch)
                }
                runupState = next
                _uiState.update {
                    it.copy(
                        loading = false,
                        pendingReset = false,
                        error = null,
                    )
                }
                renderState(next)
            } catch (err: Exception) {
                _uiState.update {
                    it.copy(
                        loading = false,
                        error = err.message ?: "Could not reset progress",
                    )
                }
            }
        }
    }

    private fun applyPlacement(option: PlacementOption) {
        val sessionId = sessionRepo.getSessionId()
        val deviceToken = sessionRepo.getDeviceToken()
        if (sessionId == null || deviceToken == null) {
            _uiState.update {
                it.copy(error = "Session expired — pair again from the web app")
            }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(loading = true, error = null) }
            try {
                val patch = JSONObject()
                    .put("personaId", option.personaId)
                    .put("budgetHours", option.budgetHours ?: JSONObject.NULL)
                val next = withContext(Dispatchers.IO) {
                    api.patchState(sessionId, deviceToken, patch)
                }
                runupState = next
                _uiState.update {
                    it.copy(
                        loading = false,
                        pendingPlacement = null,
                        placementMode = false,
                        error = null,
                    )
                }
                renderState(next)
            } catch (err: Exception) {
                _uiState.update {
                    it.copy(
                        loading = false,
                        error = err.message ?: "Could not save placement",
                    )
                }
            }
        }
    }

    fun markAlreadySeen() {
        val title = _uiState.value.tonight ?: return
        if (_uiState.value.isDrawing) return
        _uiState.update { it.copy(isDrawing = true, completingId = title.id) }
        viewModelScope.launch {
            delay(1500)
            patchIds(watchedId = title.id)
            _uiState.update { it.copy(isDrawing = false, completingId = null) }
        }
    }

    fun markSkipped() {
        val title = _uiState.value.tonight ?: return
        if (_uiState.value.isDrawing) return
        patchIds(skippedId = title.id)
    }

    fun fitToPace() {
        val daysLeft = _uiState.value.daysLeft ?: return
        val budget = Horizon.fitToPaceBudgetHours(daysLeft)
        val sessionId = sessionRepo.getSessionId() ?: return
        val deviceToken = sessionRepo.getDeviceToken() ?: return

        viewModelScope.launch {
            _uiState.update { it.copy(loading = true) }
            try {
                val patch = JSONObject().put("budgetHours", budget)
                val next = withContext(Dispatchers.IO) {
                    api.patchState(sessionId, deviceToken, patch)
                }
                runupState = next
                renderState(next)
            } catch (err: Exception) {
                _uiState.update { it.copy(loading = false, error = err.message) }
            }
        }
    }

    private fun patchIds(watchedId: String? = null, skippedId: String? = null) {
        val sessionId = sessionRepo.getSessionId() ?: return
        val deviceToken = sessionRepo.getDeviceToken() ?: return

        viewModelScope.launch {
            _uiState.update { it.copy(loading = true) }
            try {
                val patch = JSONObject()
                if (watchedId != null) patch.put("watchedIds", JSONArray(listOf(watchedId)))
                if (skippedId != null) patch.put("skippedIds", JSONArray(listOf(skippedId)))
                val next = withContext(Dispatchers.IO) {
                    api.patchState(sessionId, deviceToken, patch)
                }
                runupState = next
                renderState(next)
            } catch (err: Exception) {
                _uiState.update { it.copy(loading = false, error = err.message, isDrawing = false, completingId = null) }
            }
        }
    }

    private fun renderState(state: RunupState) {
        val catalog = catalogRepo.loadCatalog()
        val personas = catalogRepo.loadPersonas()
        val daysLeft = Horizon.daysUntilHorizon(catalog.horizon)

        if (state.personaId == null) {
            _uiState.update {
                it.copy(
                    loading = false,
                    placementMode = true,
                    strandQueue = emptyList(),
                    tonight = null,
                    personaLabel = null,
                    budgetNote = "",
                    queueCount = 0,
                    queueHours = 0.0,
                    horizon = catalog.horizon,
                    daysLeft = daysLeft,
                    behindPace = false,
                    dailyHoursNeeded = 0.0,
                    error = null,
                    currentPersonaId = null,
                    currentBudgetHours = null,
                )
            }
            return
        }

        val model = QueueModelBuilder.build(catalog, personas, state)
        if (model == null) {
            _uiState.update {
                it.copy(
                    loading = false,
                    placementMode = true,
                    error = null,
                    horizon = catalog.horizon,
                    daysLeft = daysLeft,
                )
            }
            return
        }

        val behindPace = Horizon.needsPaceWarning(model.queueHours, daysLeft)
        val dailyHours = Horizon.hoursPerDayNeeded(model.queueHours, daysLeft)

        _uiState.update {
            it.copy(
                loading = false,
                strandQueue = model.strandQueue,
                tonight = model.tonight,
                personaLabel = model.persona.label,
                budgetNote = model.budgetNote,
                queueCount = model.queue.size,
                queueHours = model.queueHours,
                horizon = catalog.horizon,
                daysLeft = daysLeft,
                behindPace = behindPace,
                dailyHoursNeeded = dailyHours,
                error = null,
                currentPersonaId = state.personaId,
                currentBudgetHours = state.budgetHours,
            )
        }
    }
}
