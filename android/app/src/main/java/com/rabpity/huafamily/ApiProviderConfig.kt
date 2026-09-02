package com.rabpity.huafamily

object ApiProviderConfig {
    private val geminiModelRegex = Regex("[A-Za-z0-9._-]{3,120}")

    fun bundledGeminiKeys(): List<String> = listOf(
        BuildConfig.GEMINI_API_KEY,
        BuildConfig.GEMINI_API_KEY_2,
        BuildConfig.GEMINI_API_KEY_3,
        BuildConfig.GEMINI_API_KEY_4,
        BuildConfig.GEMINI_API_KEY_5,
        BuildConfig.GEMINI_API_KEY_6
    )
        .map(String::trim)
        .filter(String::isNotBlank)
        .distinct()

    fun hasBundledProviders(): Boolean = bundledGeminiKeys().isNotEmpty()

    fun bundledProviderCount(): Int = bundledGeminiKeys().size

    fun geminiModelCandidates(primaryModel: String): List<String> {
        val models = LinkedHashSet<String>()
        primaryModel.trim()
            .takeIf { it.matches(geminiModelRegex) }
            ?.let(models::add)

        splitModels(BuildConfig.GEMINI_FALLBACK_MODELS)
            .filter { it.matches(geminiModelRegex) }
            .forEach(models::add)

        return models.toList()
    }

    private fun splitModels(raw: String): List<String> = raw
        .split(',', ';', '\n')
        .map(String::trim)
        .filter(String::isNotBlank)
}
