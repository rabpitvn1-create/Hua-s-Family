package com.rabpity.huafamily

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import org.json.JSONArray
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

class ApiKeyVault(context: Context) {
    private val preferences = context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)

    @Synchronized
    fun saveKeys(rawKeys: List<String>): Int {
        val keys = rawKeys
            .map(String::trim)
            .filter { it.length in 20..256 && it.none(Char::isWhitespace) }
            .distinct()
            .take(MAX_KEYS)

        if (keys.isEmpty()) {
            clear()
            return 0
        }

        val plaintext = JSONArray(keys).toString().toByteArray(Charsets.UTF_8)
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, getOrCreateSecretKey())

        preferences.edit()
            .putString(FIELD_CIPHERTEXT, Base64.encodeToString(cipher.doFinal(plaintext), Base64.NO_WRAP))
            .putString(FIELD_IV, Base64.encodeToString(cipher.iv, Base64.NO_WRAP))
            .putInt(FIELD_NEXT_INDEX, 0)
            .apply()

        return keys.size
    }

    @Synchronized
    fun getKeys(): List<String> {
        val encrypted = preferences.getString(FIELD_CIPHERTEXT, null) ?: return emptyList()
        val iv = preferences.getString(FIELD_IV, null) ?: return emptyList()

        return try {
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(
                Cipher.DECRYPT_MODE,
                getOrCreateSecretKey(),
                GCMParameterSpec(128, Base64.decode(iv, Base64.NO_WRAP))
            )

            val plaintext = cipher.doFinal(Base64.decode(encrypted, Base64.NO_WRAP))
            val array = JSONArray(String(plaintext, Charsets.UTF_8))
            buildList {
                for (index in 0 until array.length()) {
                    val key = array.optString(index).trim()
                    if (key.length in 20..256 && key.none(Char::isWhitespace)) add(key)
                }
            }.distinct().take(MAX_KEYS)
        } catch (_: Throwable) {
            clearEncryptedPayload()
            emptyList()
        }
    }

    @Synchronized
    fun clear() {
        clearEncryptedPayload()
        preferences.edit().remove(FIELD_NEXT_INDEX).apply()
    }

    @Synchronized
    fun getStartIndex(keyCount: Int): Int {
        if (keyCount <= 0) return 0
        return preferences.getInt(FIELD_NEXT_INDEX, 0).mod(keyCount)
    }

    @Synchronized
    fun advanceAfter(successfulIndex: Int, keyCount: Int) {
        if (keyCount <= 0) return
        preferences.edit()
            .putInt(FIELD_NEXT_INDEX, (successfulIndex + 1).mod(keyCount))
            .apply()
    }

    private fun clearEncryptedPayload() {
        preferences.edit()
            .remove(FIELD_CIPHERTEXT)
            .remove(FIELD_IV)
            .apply()
    }

    private fun getOrCreateSecretKey(): SecretKey {
        val keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER).apply { load(null) }
        val existing = keyStore.getKey(KEY_ALIAS, null) as? SecretKey
        if (existing != null) return existing

        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KEYSTORE_PROVIDER)
        generator.init(
            KeyGenParameterSpec.Builder(
                KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setRandomizedEncryptionRequired(true)
                .build()
        )
        return generator.generateKey()
    }

    companion object {
        const val MAX_KEYS = 20
        private const val PREFERENCES_NAME = "hua_gemini_key_vault"
        private const val FIELD_CIPHERTEXT = "ciphertext"
        private const val FIELD_IV = "iv"
        private const val FIELD_NEXT_INDEX = "next_index"
        private const val KEYSTORE_PROVIDER = "AndroidKeyStore"
        private const val KEY_ALIAS = "hua_gemini_api_keys_v1"
        private const val TRANSFORMATION = "AES/GCM/NoPadding"
    }
}
