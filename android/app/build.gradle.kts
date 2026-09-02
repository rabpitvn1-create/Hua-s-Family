import org.gradle.api.tasks.Sync

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

fun envValue(name: String): String = (System.getenv(name) ?: "")
    .replace("\\", "\\\\")
    .replace("\"", "\\\"")

android {
    namespace = "com.rabpity.huafamily"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.rabpity.huafamily"
        minSdk = 23
        targetSdk = 35
        versionCode = (System.getenv("GITHUB_RUN_NUMBER")?.toIntOrNull() ?: 1)
        versionName = "1.0.0.1"

        buildConfigField("String", "DIRECTOR_MODEL", "\"${envValue("GEMINI_DIRECTOR_MODEL").ifBlank { "gemini-3.5-flash-lite" }}\"")
        buildConfigField("String", "WRITER_MODEL", "\"${envValue("GEMINI_WRITER_MODEL").ifBlank { "gemini-3.6-flash" }}\"")
        buildConfigField("String", "GEMINI_FALLBACK_MODELS", "\"${envValue("GEMINI_FALLBACK_MODELS").ifBlank { "gemini-3.5-flash-lite" }}\"")

        buildConfigField("String", "GEMINI_API_KEY", "\"${envValue("GEMINI_API_KEY")}\"")
        buildConfigField("String", "GEMINI_API_KEY_2", "\"${envValue("GEMINI_API_KEY_2")}\"")
        buildConfigField("String", "GEMINI_API_KEY_3", "\"${envValue("GEMINI_API_KEY_3")}\"")
        buildConfigField("String", "GEMINI_API_KEY_4", "\"${envValue("GEMINI_API_KEY_4")}\"")
        buildConfigField("String", "GEMINI_API_KEY_5", "\"${envValue("GEMINI_API_KEY_5")}\"")
        buildConfigField("String", "GEMINI_API_KEY_6", "\"${envValue("GEMINI_API_KEY_6")}\"")
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

val syncWebAssets by tasks.registering(Sync::class) {
    val webRoot = rootProject.projectDir.parentFile
    from(webRoot) {
        include("index.html")
        include("styles.css")
        include("ui-layout.css")
        include("ui-components.css")
        include("ai-styles.css")
        include("ui-responsive.css")
        include("assets/**")
        include("src/**")
        include("apk-ai/**")
    }
    into(layout.buildDirectory.dir("generated/webAssets/www"))
}

android.sourceSets["main"].assets.srcDir(layout.buildDirectory.dir("generated/webAssets"))
tasks.named("preBuild").configure { dependsOn(syncWebAssets) }

dependencies {
    implementation("androidx.core:core-ktx:1.16.0")
    implementation("androidx.appcompat:appcompat:1.7.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.9.2")
    implementation("androidx.webkit:webkit:1.14.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")
}
