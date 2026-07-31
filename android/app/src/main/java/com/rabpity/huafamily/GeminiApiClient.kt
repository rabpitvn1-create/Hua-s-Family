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
        val keyIndex: Int
    )

    fun generate(
        apiKeys: List<String>,
        startIndex: Int,
        modelName: String,
        systemInstruction: String,
        prompt: String,
        maxOutputTokens: Int
    ): GenerationResult {
        require(apiKeys.isNotEmpty()) { "Chưa có Gemini API key." }

        val safeModel = modelName.trim()
        require(safeModel.matches(Regex("[A-Za-z0-9._-]{3,120}"))) {
            "Tên model Gemini không hợp lệ."
        }

        var lastMessage = "Không thể gọi Gemini API."
        var lastStatus = 0

        for (offset in apiKeys.indices) {
            val keyIndex = (startIndex + offset).mod(apiKeys.size)
            val apiKey = apiKeys[keyIndex]

            try {
                val response = request(
                    apiKey = apiKey,
                    modelName = safeModel,
                    systemInstruction = systemInstruction,
                    prompt = prompt,
                    maxOutputTokens = maxOutputTokens
                )

                if (response.status in 200..299) {
                    val text = extractText(response.body)
                    if (text.isBlank()) throw IOException("Gemini không trả về nội dung.")
                    return GenerationResult(text = text, keyIndex = keyIndex)
                }

                lastStatus = response.status
                lastMessage = extractErrorMessage(response.body, response.status)
                if (!shouldRotateKey(response.status, lastMessage)) {
                    throw GeminiRequestException(response.status, lastMessage)
                }
            } catch (error: GeminiRequestException) {
                throw error
            } catch (error: IOException) {
                lastStatus = 0
                lastMessage = error.message ?: "Không thể kết nối Gemini API."
                break
            }
        }

        val prefix = if (lastStatus > 0) "Gemini trả lỗi $lastStatus" else "Kết nối Gemini thất bại"
        throw GeminiRequestException(
            lastStatus,
            "$prefix sau khi thử ${apiKeys.size} API key: ${lastMessage.take(420)}"
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

    private fun shouldRotateKey(status: Int, message: String): Boolean {
        if (status in ROTATE_KEY_STATUSES) return true
        if (status != 400) return false
        val normalized = message.lowercase()
        return normalized.contains("api key") ||
            normalized.contains("api_key_invalid") ||
            normalized.contains("key expired")
    }

    private data class HttpResult(val status: Int, val body: String)

    class GeminiRequestException(
        val status: Int,
        message: String
    ) : Exception(message)

    private val ROTATE_KEY_STATUSES = setOf(401, 403, 408, 429, 500, 502, 503, 504)
}
