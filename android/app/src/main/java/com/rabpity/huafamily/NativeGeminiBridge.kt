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
        val keyCount = keyVault.getKeys().size
        return JSONObject()
            .put("apiReady", keyCount > 0)
            .put("apiKeyCount", keyCount)
            .put("directorModel", BuildConfig.DIRECTOR_MODEL)
            .put("writerModel", BuildConfig.WRITER_MODEL)
            .put("pipeline", "direct-gemini-multi-key-v1")
            .toString()
    }

    @JavascriptInterface
    fun openApiKeySettings() {
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
        val keys = keyVault.getKeys()
        if (keys.isEmpty()) {
            reject(requestId, "APK chưa có Gemini API key. Hãy mở Cấu hình API key.")
            return
        }

        if (modelName !in allowedModels) {
            reject(requestId, "Model không nằm trong cấu hình APK.")
            return
        }

        activity.lifecycleScope.launch {
            try {
                val startIndex = keyVault.getStartIndex(keys.size)
                val result = withContext(Dispatchers.IO) {
                    GeminiApiClient.generate(
                        apiKeys = keys,
                        startIndex = startIndex,
                        modelName = modelName,
                        systemInstruction = systemInstruction,
                        prompt = prompt,
                        maxOutputTokens = maxOutputTokens
                    )
                }

                keyVault.advanceAfter(result.keyIndex, keys.size)
                resolve(requestId, result.text)
            } catch (error: Throwable) {
                reject(
                    requestId,
                    error.message?.take(500) ?: "Không thể gọi Gemini API."
                )
            }
        }
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
