package com.rabpity.huafamily

import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

class NativeGeminiBridge(
    private val activity: AppCompatActivity,
    private val webView: WebView,
    private val keyVault: ApiKeyVault,
    private val openKeySettings: () -> Unit
) {
    private val allowedModels = setOf(
        BuildConfig.DIRECTOR_MODEL,
        BuildConfig.WRITER_MODEL
    )

    @JavascriptInterface
    fun getConfiguration(): String {
        val bundled = ApiProviderConfig.hasBundledProviders()
        val localKeys = if (bundled) emptyList() else keyVault.getKeys()
        val providerCount = if (bundled) {
            ApiProviderConfig.bundledProviderCount()
        } else {
            localKeys.size
        }

        return JSONObject()
            .put("apiReady", providerCount > 0)
            .put("apiKeyCount", providerCount)
            .put("directorModel", BuildConfig.DIRECTOR_MODEL)
            .put("writerModel", BuildConfig.WRITER_MODEL)
            .put("pipeline", "model-first-six-provider-v2")
            .put("keySource", if (bundled) "github-secrets" else "device-vault")
            .put("keySettingsAvailable", !bundled)
            .toString()
    }

    @JavascriptInterface
    fun openApiKeySettings() {
        if (ApiProviderConfig.hasBundledProviders()) return
        webView.post(openKeySettings)
    }

    @JavascriptInterface
    fun generate(
        requestId: String,
        modelName: String,
        systemInstruction: String,
        prompt: String,
        maxOutputTokens: Int
    ) {
        if (modelName !in allowedModels) {
            reject(requestId, "Model không nằm trong cấu hình APK.")
            return
        }

        val bundled = ApiProviderConfig.hasBundledProviders()
        val geminiKeys = if (bundled) {
            ApiProviderConfig.bundledGeminiKeys()
        } else {
            keyVault.getKeys()
        }
        val openRouterKey = if (bundled) ApiProviderConfig.openRouterKey() else ""

        if (geminiKeys.isEmpty() && openRouterKey.isBlank()) {
            reject(requestId, "APK chưa có API provider khả dụng.")
            return
        }

        val geminiModels = ApiProviderConfig.geminiModelCandidates(modelName)
        if (geminiModels.isEmpty()) {
            reject(requestId, "Không có model Game Master hợp lệ.")
            return
        }

        activity.lifecycleScope.launch {
            try {
                val text = withContext(Dispatchers.IO) {
                    runProviderChain(
                        geminiKeys = geminiKeys,
                        openRouterKey = openRouterKey,
                        geminiModels = geminiModels,
                        systemInstruction = systemInstruction,
                        prompt = prompt,
                        maxOutputTokens = maxOutputTokens
                    )
                }
                resolve(requestId, text)
            } catch (error: Throwable) {
                reject(
                    requestId,
                    error.message?.take(500) ?: "Không thể gọi Game Master API."
                )
            }
        }
    }

    private fun runProviderChain(
        geminiKeys: List<String>,
        openRouterKey: String,
        geminiModels: List<String>,
        systemInstruction: String,
        prompt: String,
        maxOutputTokens: Int
    ): String {
        var geminiFailure: GeminiApiClient.GeminiRequestException? = null

        if (geminiKeys.isNotEmpty()) {
            try {
                return GeminiApiClient.generate(
                    apiKeys = geminiKeys,
                    modelNames = geminiModels,
                    systemInstruction = systemInstruction,
                    prompt = prompt,
                    maxOutputTokens = maxOutputTokens
                ).text
            } catch (error: GeminiApiClient.GeminiRequestException) {
                geminiFailure = error
                if (!error.allowProviderFallback) throw error
            }
        }

        if (openRouterKey.isNotBlank()) {
            val openRouterModels = ApiProviderConfig.openRouterModelCandidates(geminiModels)
            if (openRouterModels.isNotEmpty()) {
                return GeminiApiClient.generateOpenRouter(
                    apiKey = openRouterKey,
                    modelNames = openRouterModels,
                    systemInstruction = systemInstruction,
                    prompt = prompt,
                    maxOutputTokens = maxOutputTokens
                )
            }
        }

        throw geminiFailure ?: IllegalStateException("Không có API provider khả dụng.")
    }

    private fun resolve(requestId: String, payload: String) {
        callJavascript("__huaNativeResolve", requestId, payload)
    }

    private fun reject(requestId: String, message: String) {
        callJavascript("__huaNativeReject", requestId, message)
    }

    private fun callJavascript(functionName: String, requestId: String, payload: String) {
        val script = "window.$functionName(${JSONObject.quote(requestId)}, ${JSONObject.quote(payload)});"
        webView.post { webView.evaluateJavascript(script, null) }
    }
}
