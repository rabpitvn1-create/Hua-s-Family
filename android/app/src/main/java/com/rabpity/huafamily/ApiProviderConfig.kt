package com.rabpity.huafamily

object ApiProviderConfig {
    private val geminiModelRegex = Regex("[A-Za-z0-9._-]{3,120}")
    private val openRouterModelRegex = Regex("[A-Za-z0-9._:/-]{3,160}")

    fun bundledGeminiKeys(): List<String> = listOf(
        BuildConfig.GEMINI_API_KEY,
        BuildConfig.GEMINI_API_KEY_2,
        BuildConfig.GEMINI_API_KEY_3,
        BuildConfig.GEMINI_API_KEY_4,
        BuildConfig.GEMINI_API_KEY_5
    )
        .map(String::trim)
        .filter(String::isNotBlank)
        .distinct()

    fun openRouterKey(): String = BuildConfig.OPENROUTER_API_KEY.trim()

    fun hasBundledProviders(): Boolean =
        bundledGeminiKeys().isNotEmpty() || openRouterKey().isNotEmpty()

    fun bundledProviderCount(): Int =
        bundledGeminiKeys().size + if (openRouterKey().isNotEmpty()) 1 else 0

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

    fun openRouterModelCandidates(geminiModels: List<String>): List<String> {
        val configured = splitModels(BuildConfig.OPENROUTER_MODELS)
            .filter { it.matches(openRouterModelRegex) }
            .distinct()

        if (configured.isNotEmpty()) return configured

        return geminiModels
            .map { model -> if ('/' in model) model else "google/$model" }
            .filter { it.matches(openRouterModelRegex) }
            .distinct()
    }

    private fun splitModels(raw: String): List<String> = raw
        .split(',', ';', '\n')
        .map(String::trim)
        .filter(String::isNotBlank)
}
