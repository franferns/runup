plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

import java.util.Properties

val localProperties = Properties().apply {
    val file = rootProject.file("local.properties")
    if (file.exists()) {
        load(file.inputStream())
    }
}

fun localProp(name: String, default: String = ""): String =
    localProperties.getProperty(name) ?: default

android {
    namespace = "com.runup.tv"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.runup.tv"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"

        buildConfigField("String", "SUPABASE_URL", "\"${localProp("SUPABASE_URL")}\"")
        buildConfigField("String", "SUPABASE_ANON_KEY", "\"${localProp("SUPABASE_ANON_KEY")}\"")
        buildConfigField(
            "String",
            "CATALOG_URL",
            "\"${localProp("CATALOG_URL", "https://runup.app/data/official-15.json")}\"",
        )
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

tasks.register<Copy>("copyCatalogAssets") {
    from("${rootProject.projectDir}/../data") {
        include("official-15.json", "personas.json")
    }
    into("${project.projectDir}/src/main/assets")
}

tasks.register<Copy>("copyBackgroundAssets") {
    from("${rootProject.projectDir}/../public/backgrounds") {
        include("void-atmosphere-sm.jpg", "void-atmosphere.jpg")
    }
    into("${project.projectDir}/src/main/assets/backgrounds")
}

tasks.named("preBuild") {
    dependsOn("copyCatalogAssets", "copyBackgroundAssets")
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.10.01")
    implementation(composeBom)
    androidTestImplementation(composeBom)

    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.tv:tv-foundation:1.0.0-alpha11")
    implementation("androidx.tv:tv-material:1.0.0-alpha10")
    implementation("io.coil-kt:coil-compose:2.7.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")

    debugImplementation("androidx.compose.ui:ui-tooling")
}
