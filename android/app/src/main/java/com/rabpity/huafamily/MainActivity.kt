package com.rabpity.huafamily

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.net.Uri
import android.os.Bundle
import android.text.InputType
import android.view.Gravity
import android.view.ViewGroup
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewClientCompat

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private lateinit var keyVault: ApiKeyVault

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        keyVault = ApiKeyVault(this)
        webView = createWebView()
        setContentView(createRootView())
        webView.loadUrl("https://appassets.androidplatform.net/assets/www/index.html")

        if (keyVault.getKeys().isEmpty()) {
            webView.postDelayed({ showApiKeyDialog() }, 650)
        }
    }

    private fun createRootView(): FrameLayout {
        val root = FrameLayout(this)
        root.addView(
            webView,
            FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        )

        val settingsButton = ImageButton(this).apply {
            setImageResource(android.R.drawable.ic_menu_manage)
            setBackgroundColor(Color.TRANSPARENT)
            contentDescription = "Cấu hình Gemini API key"
            alpha = 0.82f
            setPadding(dp(10), dp(10), dp(10), dp(10))
            setOnClickListener { showApiKeyDialog() }
        }

        val buttonLayout = FrameLayout.LayoutParams(dp(48), dp(48), Gravity.TOP or Gravity.END).apply {
            topMargin = dp(6)
            marginEnd = dp(6)
        }
        root.addView(settingsButton, buttonLayout)
        return root
    }

    private fun showApiKeyDialog() {
        if (isFinishing || isDestroyed) return

        val existingCount = keyVault.getKeys().size
        val summary = TextView(this).apply {
            text = if (existingCount > 0) {
                "Đang lưu $existingCount API key đã mã hóa trên thiết bị."
            } else {
                "Chưa có API key."
            }
            setPadding(0, 0, 0, dp(12))
        }

        val instructions = TextView(this).apply {
            text = "Dán mỗi Gemini API key trên một dòng. Danh sách mới sẽ thay thế danh sách cũ. Tối đa ${ApiKeyVault.MAX_KEYS} key."
            setPadding(0, 0, 0, dp(10))
        }

        val input = EditText(this).apply {
            hint = "AIza...\nAIza...\nAIza..."
            minLines = 5
            maxLines = 10
            gravity = Gravity.TOP or Gravity.START
            typeface = Typeface.MONOSPACE
            inputType = InputType.TYPE_CLASS_TEXT or
                InputType.TYPE_TEXT_FLAG_MULTI_LINE or
                InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS
            setHorizontallyScrolling(false)
        }

        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(24), dp(8), dp(24), 0)
            addView(summary)
            addView(instructions)
            addView(input)
        }

        val dialog = AlertDialog.Builder(this)
            .setTitle("Cấu hình Gemini API key")
            .setView(container)
            .setPositiveButton("Lưu danh sách", null)
            .setNeutralButton("Xóa tất cả", null)
            .setNegativeButton("Đóng", null)
            .create()

        dialog.setOnShowListener {
            dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
                val keys = input.text
                    .toString()
                    .split(Regex("[\\n,;]+"))
                    .map(String::trim)
                    .filter(String::isNotBlank)

                val savedCount = keyVault.saveKeys(keys)
                if (savedCount <= 0) {
                    input.error = "Không tìm thấy API key hợp lệ."
                    return@setOnClickListener
                }

                Toast.makeText(
                    this,
                    "Đã lưu $savedCount API key trên thiết bị.",
                    Toast.LENGTH_SHORT
                ).show()
                notifyApiKeyConfigurationChanged()
                dialog.dismiss()
            }

            dialog.getButton(AlertDialog.BUTTON_NEUTRAL).setOnClickListener {
                AlertDialog.Builder(this)
                    .setTitle("Xóa toàn bộ API key?")
                    .setMessage("Game sẽ không gọi được Gemini cho đến khi bạn nhập lại key.")
                    .setPositiveButton("Xóa") { _, _ ->
                        keyVault.clear()
                        input.text?.clear()
                        summary.text = "Chưa có API key."
                        notifyApiKeyConfigurationChanged()
                        Toast.makeText(this, "Đã xóa toàn bộ API key.", Toast.LENGTH_SHORT).show()
                    }
                    .setNegativeButton("Hủy", null)
                    .show()
            }
        }

        dialog.show()
    }

    private fun notifyApiKeyConfigurationChanged() {
        if (!::webView.isInitialized) return
        webView.post {
            webView.evaluateJavascript(
                "if (window.__huaApiKeysChanged) window.__huaApiKeysChanged();",
                null
            )
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun createWebView(): WebView {
        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        return WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowFileAccess = false
            settings.allowContentAccess = false
            settings.setSupportZoom(true)
            settings.builtInZoomControls = false
            settings.displayZoomControls = false

            addJavascriptInterface(
                NativeGeminiBridge(
                    activity = this@MainActivity,
                    webView = this,
                    keyVault = keyVault,
                    openKeySettings = this@MainActivity::showApiKeyDialog
                ),
                "HuaAndroid"
            )

            webViewClient = object : WebViewClientCompat() {
                override fun shouldInterceptRequest(
                    view: WebView,
                    request: WebResourceRequest
                ): WebResourceResponse? = assetLoader.shouldInterceptRequest(request.url)

                override fun shouldOverrideUrlLoading(
                    view: WebView,
                    request: WebResourceRequest
                ): Boolean {
                    val uri = request.url
                    if (uri.host == "appassets.androidplatform.net") return false
                    startActivity(Intent(Intent.ACTION_VIEW, uri))
                    return true
                }
            }
        }
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (::webView.isInitialized && webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        if (::webView.isInitialized) {
            webView.removeJavascriptInterface("HuaAndroid")
            webView.destroy()
        }
        super.onDestroy()
    }
}
