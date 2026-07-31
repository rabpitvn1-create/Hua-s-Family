package com.rabpity.huafamily

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewClientCompat
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val firebaseReady = initializeFirebase()
        webView = createWebView(firebaseReady)
        setContentView(webView)
        webView.loadUrl("https://appassets.androidplatform.net/assets/www/index.html")
    }

    private fun initializeFirebase(): Boolean {
        val apiKey = BuildConfig.FIREBASE_API_KEY.trim()
        val appId = BuildConfig.FIREBASE_APP_ID.trim()
        val projectId = BuildConfig.FIREBASE_PROJECT_ID.trim()

        if (apiKey.isBlank() || appId.isBlank() || projectId.isBlank()) return false

        if (FirebaseApp.getApps(this).isEmpty()) {
            val options = FirebaseOptions.Builder()
                .setApiKey(apiKey)
                .setApplicationId(appId)
                .setProjectId(projectId)
                .apply {
                    BuildConfig.FIREBASE_MESSAGING_SENDER_ID.trim()
                        .takeIf(String::isNotBlank)
                        ?.let(::setGcmSenderId)
                    BuildConfig.FIREBASE_STORAGE_BUCKET.trim()
                        .takeIf(String::isNotBlank)
                        ?.let(::setStorageBucket)
                }
                .build()

            FirebaseApp.initializeApp(this, options)
        }

        AppCheckInitializer.install()
        return true
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun createWebView(firebaseReady: Boolean): WebView {
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
                NativeGeminiBridge(this@MainActivity, this, firebaseReady),
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
