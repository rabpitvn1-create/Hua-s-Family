package com.rabpity.huafamily

import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.firebase.Firebase
import com.google.firebase.ai.ai
import com.google.firebase.ai.type.GenerativeBackend
import com.google.firebase.ai.type.content
import com.google.firebase.ai.type.generationConfig
import kotlinx.coroutines.launch
import org.json.JSONObject

class NativeGeminiBridge(
    private val activity: AppCompatActivity,
    private val webView: WebView,
    private val firebaseReady: Boolean
) {
    private val allowedModels = setOf(
        BuildConfig.DIRECTOR_MODEL,
        BuildConfig.WRITER_MODEL
    )

    @JavascriptInterface
    fun getConfiguration(): String = JSONObject()
        .put("firebaseReady", firebaseReady)
        .put("directorModel", BuildConfig.DIRECTOR_MODEL)
        .put("writerModel", BuildConfig.WRITER_MODEL)
        .put("pipeline", "firebase-ai-director-writer-v1")
        .toString()

    @JavascriptInterface
    fun generate(
        requestId: String,
        modelName: String,
        systemInstruction: String,
        prompt: String,
        maxOutputTokens: Int
    ) {
        if (!firebaseReady) {
            reject(requestId, "APK chưa được cấu hình Firebase AI Logic.")
            return
        }

        if (modelName !in allowedModels) {
            reject(requestId, "Model không nằm trong cấu hình APK.")
            return
        }

        val safeSystem = systemInstruction.take(80_000)
        val safePrompt = prompt.take(160_000)
        val tokenLimit = maxOutputTokens.coerceIn(256, 4_096)

        activity.lifecycleScope.launch {
            try {
                val config = generationConfig {
                    responseMimeType = "application/json"
                    this.maxOutputTokens = tokenLimit
                }

                val model = Firebase.ai(
                    backend = GenerativeBackend.googleAI()
                ).generativeModel(
                    modelName = modelName,
                    generationConfig = config,
                    systemInstruction = content { text(safeSystem) }
                )

                val response = model.generateContent(safePrompt)
                val output = response.text?.trim()
                    ?: throw IllegalStateException("Gemini không trả về nội dung.")

                resolve(requestId, output)
            } catch (error: Throwable) {
                reject(
                    requestId,
                    error.message?.take(500) ?: "Không thể gọi Firebase AI Logic."
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
