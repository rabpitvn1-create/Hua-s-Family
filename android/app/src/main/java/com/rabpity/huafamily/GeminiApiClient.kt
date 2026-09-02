package com.rabpity.huafamily

import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

object GeminiApiClient {
    data class GenerationResult(
        val text: String,
        val keyIndex: Int,
        val modelName: String
    )

    fun generate(
        apiKeys: List<String>,
        modelNames: List<String>,
        systemInstruction: String,
        prompt: String,
        maxOutputTokens: Int
    ): GenerationResult {
        require(apiKeys.isNotEmpty()) { "Chưa có Gemini API key." }

        val safeModels = modelNames
            .map(String::trim)
            .filter { it.matches(Regex("[A-Za-z0-9._-]{3,120}")) }
            .distinct()
        require(safeModels.isNotEmpty()) { "Không có model Gemini hợp lệ." }

        var lastMessage = "Không thể gọi Gemini API."
        var lastStatus = 0
        var attempts = 0

        keyLoop@ for (keyIndex in apiKeys.indices) {
            val apiKey = apiKeys[keyIndex].trim()
            if (apiKey.isBlank()) continue

            for (modelName in safeModels) {
                attempts += 1
                val response = try {
                    request(
                        apiKey = apiKey,
                        modelName = modelName,
                        systemInstruction = systemInstruction,
                        prompt = prompt,
                        maxOutputTokens = maxOutputTokens
                    )
                } catch (error: IOException) {
                    lastStatus = 0
                    lastMessage = error.message ?: "Không thể kết nối Gemini API."
                    break@keyLoop
                }

                if (response.status in 200..299) {
                    val text = extractText(response.body)
                    if (text.isNotBlank()) {
                        return GenerationResult(
                            text = text,
                            keyIndex = keyIndex,
                            modelName = modelName
                        )
                    }
                    lastStatus = response.status
                    lastMessage = "Gemini không trả về nội dung."
                    continue
                }

                lastStatus = response.status
                lastMessage = extractErrorMessage(response.body, response.status)

                if (isApiKeyFailure(response.status, lastMessage)) {
                    break
                }

                if (shouldFallbackModel(response.status, lastMessage)) {
                    continue
                }

                throw GeminiRequestException(response.status, lastMessage)
            }
        }

        val prefix = if (lastStatus > 0) "Gemini trả lỗi $lastStatus" else "Kết nối Gemini thất bại"
        throw GeminiRequestException(
            lastStatus,
            "$prefix sau $attempts lần thử model-first trên ${apiKeys.size} API key: ${lastMessage.take(420)}"
        )
    }

    private fun request(
        apiKey: String,
        modelName: String,
        systemInstruction: String,
        prompt: String,
        maxOutputTokens: Int
    ): HttpResult {
        val encodedModel = URLEncoder.encode(modelName, StandardCharsets.UTF_8.name())
        val connection = URL(
            "https://generativelanguage.googleapis.com/v1beta/models/$encodedModel:generateContent"
        ).openConnection() as HttpURLConnection

        return try {
            connection.requestMethod = "POST"
            connection.connectTimeout = 25_000
            connection.readTimeout = 150_000
            connection.doOutput = true
            connection.useCaches = false
            connection.setRequestProperty("Content-Type", "application/json; charset=utf-8")
            connection.setRequestProperty("Accept", "application/json")
            connection.setRequestProperty("x-goog-api-key", apiKey)

            val body = buildRequestBody(
                systemInstruction = systemInstruction,
                prompt = prompt,
                maxOutputTokens = maxOutputTokens
            ).toString()

            connection.outputStream.use { stream ->
                stream.write(body.toByteArray(Charsets.UTF_8))
            }

            val status = connection.responseCode
            val stream = if (status in 200..299) connection.inputStream else connection.errorStream
            val responseBody = stream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()
            HttpResult(status = status, body = responseBody)
        } finally {
            connection.disconnect()
        }
    }

    private fun buildRequestBody(
        systemInstruction: String,
        prompt: String,
        maxOutputTokens: Int
    ): JSONObject {
        val systemPart = JSONObject().put("text", systemInstruction.take(80_000))
        val userPart = JSONObject().put("text", prompt.take(160_000))

        return JSONObject()
            .put(
                "systemInstruction",
                JSONObject().put("parts", JSONArray().put(systemPart))
            )
            .put(
                "contents",
                JSONArray().put(
                    JSONObject()
                        .put("role", "user")
                        .put("parts", JSONArray().put(userPart))
                )
            )
            .put(
                "generationConfig",
                JSONObject()
                    .put("maxOutputTokens", maxOutputTokens.coerceIn(256, 4_096))
                    .put("responseMimeType", "application/json")
            )
    }

    private fun extractText(rawBody: String): String {
        val root = JSONObject(rawBody)
        val parts = root
            .optJSONArray("candidates")
            ?.optJSONObject(0)
            ?.optJSONObject("content")
            ?.optJSONArray("parts")
            ?: return ""

        return buildString {
            for (index in 0 until parts.length()) {
                val text = parts.optJSONObject(index)?.optString("text").orEmpty()
                if (text.isNotBlank()) append(text)
            }
        }.trim()
    }

    private fun extractErrorMessage(rawBody: String, status: Int): String {
        return try {
            JSONObject(rawBody)
                .optJSONObject("error")
                ?.optString("message")
                ?.takeIf(String::isNotBlank)
                ?: "Gemini API trả lỗi $status."
        } catch (_: Throwable) {
            rawBody.trim().take(420).ifBlank { "Gemini API trả lỗi $status." }
        }
    }

    private fun isApiKeyFailure(status: Int, message: String): Boolean {
        if (status == 401) return true
        if (status !in setOf(400, 403)) return false
        val normalized = message.lowercase()
        return normalized.contains("api key") ||
            normalized.contains("api_key_invalid") ||
            normalized.contains("key expired") ||
            normalized.contains("invalid credential")
    }

    private fun shouldFallbackModel(status: Int, message: String): Boolean {
        if (status in MODEL_FALLBACK_STATUSES) return true
        if (status != 400) return false
        val normalized = message.lowercase()
        return normalized.contains("model") && (
            normalized.contains("not found") ||
                normalized.contains("unavailable") ||
                normalized.contains("inactive") ||
                normalized.contains("not supported")
            )
    }

    private data class HttpResult(val status: Int, val body: String)

    class GeminiRequestException(
        val status: Int,
        message: String
    ) : Exception(message)

    private val MODEL_FALLBACK_STATUSES = setOf(403, 404, 408, 429, 500, 502, 503, 504)
}
