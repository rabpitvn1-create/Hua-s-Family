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
        versionName = "0.1.${System.getenv("GITHUB_RUN_NUMBER") ?: "0"}"

        buildConfigField("String", "FIREBASE_API_KEY", "\"${envValue("FIREBASE_API_KEY")}\"")
        buildConfigField("String", "FIREBASE_APP_ID", "\"${envValue("FIREBASE_APP_ID")}\"")
        buildConfigField("String", "FIREBASE_PROJECT_ID", "\"${envValue("FIREBASE_PROJECT_ID")}\"")
        buildConfigField("String", "FIREBASE_MESSAGING_SENDER_ID", "\"${envValue("FIREBASE_MESSAGING_SENDER_ID")}\"")
        buildConfigField("String", "FIREBASE_STORAGE_BUCKET", "\"${envValue("FIREBASE_STORAGE_BUCKET")}\"")
        buildConfigField("String", "DIRECTOR_MODEL", "\"${envValue("GEMINI_DIRECTOR_MODEL").ifBlank { "gemini-3.5-flash-lite" }}\"")
        buildConfigField("String", "WRITER_MODEL", "\"${envValue("GEMINI_WRITER_MODEL").ifBlank { "gemini-3.6-flash" }}\"")
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
        include("ai-styles.css")
        include("src/**")
        include("api/gemini-prompts.js")
        include("api/gemini-schemas.js")
        include("api/gemini-state.js")
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

    implementation(platform("com.google.firebase:firebase-bom:34.16.0"))
    implementation("com.google.firebase:firebase-ai")
    debugImplementation("com.google.firebase:firebase-appcheck-debug")
    releaseImplementation("com.google.firebase:firebase-appcheck-playintegrity")
}
