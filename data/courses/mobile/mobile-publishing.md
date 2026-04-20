# 移动应用发布 三层深度学习教程

## [总览] 技术总览

移动应用发布是将开发完成的应用交付给用户的过程，涵盖打包签名、应用商店提交、版本管理、更新机制等环节。掌握发布流程能确保应用顺利上架、安全分发、持续迭代。

本教程采用三层漏斗学习法：**核心层**聚焦应用签名、打包构建、应用商店提交三大基石；**重点层**深入版本管理和热更新；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 应用签名

#### [概念] 概念解释

应用签名确保应用来源可信、完整性未被篡改。Android 使用 APK 签名（v1/v2/v3），iOS 使用开发者证书和 Provisioning Profile。签名密钥需妥善保管，丢失将无法更新应用。

#### [代码] 代码示例

```kotlin
// Android 签名配置

// build.gradle.kts (app level)
android {
    signingConfigs {
        create("release") {
            storeFile = file("../keystore/release.keystore")
            storePassword = System.getenv("KEYSTORE_PASSWORD")
            keyAlias = "release"
            keyPassword = System.getenv("KEY_PASSWORD")
        }
        
        create("debug") {
            storeFile = file("../keystore/debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
    }
    
    buildTypes {
        getByName("release") {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
        
        getByName("debug") {
            isDebuggable = true
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

// 生成签名密钥命令
/*
keytool -genkey -v -keystore release.keystore \
    -alias release \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass <password> \
    -keypass <password>
*/

// 验证 APK 签名
/*
apksigner verify --verbose --print-certs app-release.apk
*/

// iOS 签名配置 (Xcode)
/*
Signing & Capabilities:
- Team: 选择开发者团队
- Bundle Identifier: com.company.app
- Signing Certificate: Apple Development / Apple Distribution
- Provisioning Profile: 自动或手动选择
*/

// Fastlane iOS 签名自动化
/*
match(
  type: "appstore",
  app_identifier: "com.company.app",
  username: "apple@company.com"
)
*/

// 签名验证工具
class SignatureVerifier {
    
    fun verifyApkSignature(apkPath: String): SignatureInfo {
        val apkFile = File(apkPath)
        val apkParser = ApkFile(apkFile)
        
        val signers = apkParser.getApkSingerCertificateList()
        
        return SignatureInfo(
            isValid = signers.isNotEmpty(),
            signatures = signers.map { cert ->
                SignatureDetail(
                    subject = cert.subjectDN.name,
                    issuer = cert.issuerDN.name,
                    validFrom = cert.notBefore,
                    validUntil = cert.notAfter,
                    algorithm = cert.sigAlgName
                )
            }
        )
    }
    
    data class SignatureInfo(
        val isValid: Boolean,
        val signatures: List<SignatureDetail>
    )
    
    data class SignatureDetail(
        val subject: String,
        val issuer: String,
        val validFrom: Date,
        val validUntil: Date,
        val algorithm: String
    )
}
```

### 2. 打包构建

#### [概念] 概念解释

打包构建将源代码转换为可分发的应用包。Android 生成 APK/AAB，iOS 生成 IPA。构建类型包括 Debug、Release、Staging。优化手段：代码混淆、资源压缩、多渠道打包。

#### [代码] 代码示例

```kotlin
// Android 构建配置

// build.gradle.kts (app level)
android {
    defaultConfig {
        applicationId = "com.example.app"
        minSdk = 24
        targetSdk = 34
        versionCode = getVersionCode()
        versionName = getVersionName()
        
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        
        ndk {
            abiFilters += listOf("armeabi-v7a", "arm64-v8a", "x86", "x86_64")
        }
    }
    
    buildTypes {
        getByName("debug") {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-DEBUG"
            isDebuggable = true
            buildConfigField("String", "API_URL", "\"https://api-dev.example.com/\"")
        }
        
        getByName("release") {
            isMinifyEnabled = true
            isShrinkResources = true
            buildConfigField("String", "API_URL", "\"https://api.example.com/\"")
        }
        
        create("staging") {
            initWith(getByName("release"))
            applicationIdSuffix = ".staging"
            versionNameSuffix = "-STAGING"
            buildConfigField("String", "API_URL", "\"https://api-staging.example.com/\"")
        }
    }
    
    flavorDimensions += "environment"
    productFlavors {
        create("free") {
            dimension = "environment"
            applicationIdSuffix = ".free"
        }
        create("premium") {
            dimension = "environment"
            applicationIdSuffix = ".premium"
        }
    }
    
    bundle {
        language {
            enableSplit = true
        }
        density {
            enableSplit = true
        }
        abi {
            enableSplit = true
        }
    }
}

// 版本号管理
fun getVersionCode(): Int {
    val versionPropsFile = file("version.properties")
    
    if (versionPropsFile.exists()) {
        val versionProps = Properties()
        versionProps.load(FileInputStream(versionPropsFile))
        return versionProps.getProperty("VERSION_CODE").toInt()
    }
    
    return 1
}

fun getVersionName(): String {
    return "1.0.0"
}

// ProGuard 规则
/*
# proguard-rules.pro

# Keep application classes
-keep class com.example.app.** { *; }

# Keep data classes for serialization
-keep class com.example.app.data.model.** { *; }

# OkHttp
-dontwarn okhttp3.**
-keep class okhttp3.** { *; }

# Gson
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.google.gson.** { *; }

# Retrofit
-keep class retrofit2.** { *; }
-keepclasseswithmembers class * {
    @retrofit2.http.* <methods>;
}
*/

// 构建脚本
/*
# 构建命令

# Debug APK
./gradlew assembleDebug

# Release APK
./gradlew assembleRelease

# Android App Bundle
./gradlew bundleRelease

# 多渠道打包
./gradlew assembleFreeRelease
./gradlew assemblePremiumRelease

# 清理构建
./gradlew clean
*/

// Fastlane 构建配置
/*
# Fastfile

default_platform(:android)

platform :android do
  desc "Build debug APK"
  lane :debug do
    gradle(task: "assembleDebug")
  end
  
  desc "Build release APK"
  lane :release do
    gradle(task: "assembleRelease")
  end
  
  desc "Build and upload to Play Store"
  lane :deploy do
    gradle(task: "bundleRelease")
    upload_to_play_store(
      track: "internal",
      aab: "app/build/outputs/bundle/release/app-release.aab"
    )
  end
end
*/

// iOS 构建配置
/*
# Fastfile (iOS)

platform :ios do
  desc "Build and archive iOS app"
  lane :build_release do
    gym(
      scheme: "MyApp",
      configuration: "Release",
      export_method: "app-store",
      output_directory: "./build",
      output_name: "MyApp.ipa"
    )
  end
  
  desc "Upload to TestFlight"
  lane :beta do
    build_release
    pilot(
      skip_waiting_for_build_processing: true
    )
  end
  
  desc "Upload to App Store"
  lane :release do
    build_release
    deliver(
      force: true,
      submit_for_review: true
    )
  end
end
*/
```

### 3. 应用商店提交

#### [概念] 概念解释

应用商店提交是将应用发布到 Google Play 或 App Store。需要准备：应用信息、截图、图标、隐私政策、内容分级。审核周期通常数小时到数天。

#### [代码] 代码示例

```kotlin
// Google Play 发布配置

// build.gradle.kts
plugins {
    id("com.github.triplet.play") version "3.8.4"
}

play {
    serviceAccountCredentials.set(file("../play-service-account.json"))
    track.set("internal")
    defaultToAppBundles.set(true)
}

// 发布命令
/*
# 上传到内部测试轨道
./gradlew publishBundle

# 上传到生产轨道
./gradlew promoteArtifact --from-track internal --to-track production
*/

// Google Play Console 配置
/*
应用信息:
- 应用名称: My App
- 简短描述: 80 字符以内
- 完整描述: 4000 字符以内
- 应用图标: 512x512 PNG
- 特色图片: 1024x500 PNG
- 手机截图: 至少 2 张，最多 8 张
- 平板截图: 可选
- 分类: 应用类型和内容分级
- 隐私政策 URL: 必填
- 目标受众: 年龄范围
*/

// App Store Connect 配置
/*
应用信息:
- App 名称: 30 字符以内
- 副标题: 30 字符以内
- 描述: 4000 字符以内
- 关键词: 100 字符以内
- 技术支持 URL: 必填
- 营销 URL: 可选
- App 图标: 1024x1024 PNG
- iPhone 截图: 6.5 英寸和 5.5 英寸
- iPad 截图: 12.9 英寸和 11 英寸
- 预览视频: 可选
- 年龄分级: 根据内容自动确定
*/

// Fastlane 自动化发布
/*
# 上传截图和元数据
lane :upload_metadata do
  deliver(
    skip_binary_upload: true,
    skip_screenshots: false,
    force: true
  )
end

# 完整发布流程
lane :full_release do
  # 运行测试
  run_tests
  
  # 增加版本号
  increment_version_number(
    bump_type: "patch"
  )
  
  # 构建
  gym(
    scheme: "MyApp",
    configuration: "Release",
    export_method: "app-store"
  )
  
  # 上传到 TestFlight
  pilot(
    skip_waiting_for_build_processing: true
  )
  
  # 提交审核
  deliver(
    submit_for_review: true,
    automatic_release: true,
    force: true
  )
end
*/

// 发布检查清单
class ReleaseChecklist {
    
    val items = listOf(
        ChecklistItem("版本号已更新", false),
        ChecklistItem("变更日志已准备", false),
        ChecklistItem("截图已更新", false),
        ChecklistItem("隐私政策已更新", false),
        ChecklistItem("ProGuard 规则已测试", false),
        ChecklistItem("签名配置正确", false),
        ChecklistItem("API URL 配置正确", false),
        ChecklistItem("测试用例全部通过", false),
        ChecklistItem("性能测试通过", false),
        ChecklistItem("安全审计完成", false)
    )
    
    fun validate(): Boolean {
        return items.all { it.checked }
    }
    
    data class ChecklistItem(
        val description: String,
        val checked: Boolean
    )
}

// 版本信息
data class AppVersion(
    val versionCode: Int,
    val versionName: String,
    val buildType: String,
    val flavor: String,
    val buildTime: Long = System.currentTimeMillis()
) {
    fun toDisplayString(): String {
        return "$versionName ($versionCode) - $buildType"
    }
}
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 版本管理

#### [概念] 概念解释

版本管理包括语义化版本号、版本号递增策略、版本兼容性检查。Android 使用 versionCode（整数）和 versionName（字符串），iOS 使用 Build Number 和 Version。

#### [代码] 代码示例

```kotlin
// 版本管理实现

// 语义化版本
data class SemanticVersion(
    val major: Int,
    val minor: Int,
    val patch: Int,
    val preRelease: String? = null
) : Comparable<SemanticVersion> {
    
    override fun compareTo(other: SemanticVersion): Int {
        return compareValuesBy(
            this, other,
            { it.major },
            { it.minor },
            { it.patch }
        )
    }
    
    fun toVersionName(): String {
        return buildString {
            append("$major.$minor.$patch")
            preRelease?.let { append("-$it") }
        }
    }
    
    fun toVersionCode(): Int {
        return major * 10000 + minor * 100 + patch
    }
    
    fun bumpMajor(): SemanticVersion = copy(major = major + 1, minor = 0, patch = 0, preRelease = null)
    
    fun bumpMinor(): SemanticVersion = copy(minor = minor + 1, patch = 0, preRelease = null)
    
    fun bumpPatch(): SemanticVersion = copy(patch = patch + 1, preRelease = null)
    
    companion object {
        fun parse(version: String): SemanticVersion {
            val parts = version.split("-", limit = 2)
            val numbers = parts[0].split(".")
            
            return SemanticVersion(
                major = numbers.getOrElse(0) { "0" }.toInt(),
                minor = numbers.getOrElse(1) { "0" }.toInt(),
                patch = numbers.getOrElse(2) { "0" }.toInt(),
                preRelease = parts.getOrNull(1)
            )
        }
    }
}

// 版本管理器
class VersionManager(private val context: Context) {
    
    private val prefs = context.getSharedPreferences("version_prefs", Context.MODE_PRIVATE)
    
    fun getCurrentVersion(): SemanticVersion {
        val versionName = BuildConfig.VERSION_NAME
        return SemanticVersion.parse(versionName)
    }
    
    fun getLastVersion(): SemanticVersion? {
        val lastVersionName = prefs.getString("last_version_name", null) ?: return null
        return SemanticVersion.parse(lastVersionName)
    }
    
    fun isFirstInstall(): Boolean {
        return getLastVersion() == null
    }
    
    fun isUpgrade(): Boolean {
        val last = getLastVersion() ?: return false
        val current = getCurrentVersion()
        return current > last
    }
    
    fun saveCurrentVersion() {
        val current = getCurrentVersion()
        prefs.edit()
            .putString("last_version_name", current.toVersionName())
            .putInt("last_version_code", current.toVersionCode())
            .apply()
    }
    
    fun getUpgradeType(): UpgradeType? {
        val last = getLastVersion() ?: return null
        val current = getCurrentVersion()
        
        return when {
            current.major > last.major -> UpgradeType.MAJOR
            current.minor > last.minor -> UpgradeType.MINOR
            current.patch > last.patch -> UpgradeType.PATCH
            else -> null
        }
    }
}

enum class UpgradeType {
    MAJOR, MINOR, PATCH
}

// 迁移管理
class MigrationManager(
    private val versionManager: VersionManager,
    private val migrations: List<Migration>
) {
    
    fun runMigrations() {
        val lastVersion = versionManager.getLastVersion()
        val currentVersion = versionManager.getCurrentVersion()
        
        val pendingMigrations = migrations.filter { migration ->
            lastVersion?.let { migration.fromVersion > it } ?: true
        }
        
        pendingMigrations.sortedBy { it.fromVersion }.forEach { migration ->
            migration.migrate()
        }
        
        versionManager.saveCurrentVersion()
    }
}

data class Migration(
    val fromVersion: SemanticVersion,
    val migrate: () -> Unit
)

// 变更日志
data class ChangeLog(
    val version: SemanticVersion,
    val date: Long,
    val changes: List<Change>
)

data class Change(
    val type: ChangeType,
    val description: String
)

enum class ChangeType {
    FEATURE, FIX, IMPROVEMENT, BREAKING
}

class ChangeLogProvider {
    
    fun getChangeLog(): List<ChangeLog> {
        return listOf(
            ChangeLog(
                version = SemanticVersion(1, 2, 0),
                date = System.currentTimeMillis(),
                changes = listOf(
                    Change(ChangeType.FEATURE, "新增深色模式"),
                    Change(ChangeType.FIX, "修复登录页面崩溃问题"),
                    Change(ChangeType.IMPROVEMENT, "优化列表滚动性能")
                )
            )
        )
    }
}
```

### 2. 应用内更新

#### [概念] 概念解释

应用内更新允许用户不离开应用即可更新。Android 提供 In-App Updates API，支持立即更新和灵活更新两种模式。iOS 需引导用户到 App Store。

#### [代码] 代码示例

```kotlin
// Android 应用内更新

class InAppUpdateManager(
    private val activity: Activity,
    private val appUpdateManager: AppUpdateManager
) {
    
    private val updateResultLauncher = activity.registerForActivityResult(
        ActivityResultContracts.StartIntentSenderForResult()
    ) { result ->
        if (result.resultCode != Activity.RESULT_OK) {
            updateFailed()
        }
    }
    
    fun checkForUpdate(callback: (UpdateInfo?) -> Unit) {
        val appUpdateInfoTask = appUpdateManager.appUpdateInfo
        
        appUpdateInfoTask.addOnSuccessListener { appUpdateInfo ->
            if (appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE) {
                callback(appUpdateInfo)
            } else {
                callback(null)
            }
        }.addOnFailureListener {
            callback(null)
        }
    }
    
    fun startFlexibleUpdate(updateInfo: UpdateInfo) {
        appUpdateManager.startUpdateFlowForResult(
            updateInfo,
            AppUpdateType.FLEXIBLE,
            activity,
            UPDATE_REQUEST_CODE
        )
    }
    
    fun startImmediateUpdate(updateInfo: UpdateInfo) {
        appUpdateManager.startUpdateFlowForResult(
            updateInfo,
            AppUpdateType.IMMEDIATE,
            activity,
            UPDATE_REQUEST_CODE
        )
    }
    
    fun registerUpdateListener() {
        appUpdateManager.registerListener { state ->
            if (state.installStatus() == InstallStatus.DOWNLOADED) {
                showUpdateReadyNotification()
            }
        }
    }
    
    fun completeUpdate() {
        appUpdateManager.completeUpdate()
    }
    
    private fun showUpdateReadyNotification() {
        Snackbar.make(
            activity.findViewById(android.R.id.content),
            "更新已下载完成",
            Snackbar.LENGTH_INDEFINITE
        ).setAction("重启") {
            completeUpdate()
        }.show()
    }
    
    private fun updateFailed() {
        Toast.makeText(activity, "更新失败", Toast.LENGTH_SHORT).show()
    }
    
    companion object {
        private const val UPDATE_REQUEST_CODE = 1001
    }
}

// 使用示例
class MainActivity : AppCompatActivity() {
    
    private lateinit var updateManager: InAppUpdateManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        updateManager = InAppUpdateManager(
            this,
            AppUpdateManagerFactory.create(this)
        )
        
        checkForUpdates()
    }
    
    private fun checkForUpdates() {
        updateManager.checkForUpdate { updateInfo ->
            updateInfo?.let { info ->
                if (info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)) {
                    updateManager.startImmediateUpdate(info)
                } else if (info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)) {
                    updateManager.startFlexibleUpdate(info)
                    updateManager.registerUpdateListener()
                }
            }
        }
    }
    
    override fun onResume() {
        super.onResume()
        
        appUpdateManager.appUpdateInfo.addOnSuccessListener { info ->
            if (info.installStatus() == InstallStatus.DOWNLOADED) {
                updateManager.showUpdateReadyNotification()
            } else if (info.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {
                updateManager.startImmediateUpdate(info)
            }
        }
    }
}

// iOS 强制更新提示
class iOSUpdateManager {
    
    func checkForUpdate(completion: @escaping (Bool, String?) -> Void) {
        guard let url = URL(string: "https://itunes.apple.com/lookup?bundleId=com.example.app") else {
            completion(false, nil)
            return
        }
        
        URLSession.shared.dataTask(with: url) { data, _, error in
            guard let data = data,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let results = json["results"] as? [[String: Any]],
                  let appStoreVersion = results.first?["version"] as? String else {
                completion(false, nil)
                return
            }
            
            let currentVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String
            
            DispatchQueue.main.async {
                completion(appStoreVersion != currentVersion, appStoreVersion)
            }
        }.resume()
    }
    
    func openAppStore() {
        guard let url = URL(string: "itms-apps://itunes.apple.com/app/id123456789") else { return }
        UIApplication.shared.open(url)
    }
}
```

### 3. CI/CD 自动化发布

#### [概念] 概念解释

CI/CD 自动化发布流程：代码提交触发构建、运行测试、打包签名、上传到应用商店。常用工具：GitHub Actions、GitLab CI、Jenkins、Fastlane。

#### [代码] 代码示例

```yaml
# GitHub Actions Android 发布
name: Android Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Grant execute permission for gradlew
        run: chmod +x gradlew
      
      - name: Build Release AAB
        run: ./gradlew bundleRelease
        env:
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
      
      - name: Upload to Play Store
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.PLAY_SERVICE_ACCOUNT }}
          packageName: com.example.app
          releaseFiles: app/build/outputs/bundle/release/app-release.aab
          track: internal
          status: completed

# GitHub Actions iOS 发布
name: iOS Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: macos-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Select Xcode version
        run: sudo xcode-select -s /Applications/Xcode_15.0.app
      
      - name: Install dependencies
        run: |
          bundle install
          pod install
      
      - name: Build and upload to TestFlight
        run: bundle exec fastlane beta
        env:
          APP_STORE_CONNECT_API_KEY_ID: ${{ secrets.APP_STORE_CONNECT_API_KEY_ID }}
          APP_STORE_CONNECT_ISSUER_ID: ${{ secrets.APP_STORE_CONNECT_ISSUER_ID }}
          APP_STORE_CONNECT_API_KEY: ${{ secrets.APP_STORE_CONNECT_API_KEY }}
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}

# GitLab CI 配置
stages:
  - test
  - build
  - deploy

test:
  stage: test
  script:
    - ./gradlew test
  artifacts:
    reports:
      junit: app/build/test-results/testDebugUnitTest/*.xml

build:
  stage: build
  script:
    - ./gradlew assembleRelease
  artifacts:
    paths:
      - app/build/outputs/apk/release/*.apk
  only:
    - main

deploy_internal:
  stage: deploy
  script:
    - fastlane android internal
  only:
    - develop

deploy_production:
  stage: deploy
  script:
    - fastlane android production
  only:
    - main
  when: manual
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| A/B Testing | 应用内 A/B 测试，功能开关 |
| Feature Flags | 功能开关，灰度发布 |
| Firebase App Distribution | 测试版分发 |
| TestFlight | iOS 测试版分发 |
| Play Console | Google Play 管理后台 |
| App Store Connect | Apple 应用管理后台 |
| Code Signing | 代码签名机制 |
| Obfuscation | 代码混淆保护 |
| R8 | Android 代码优化器 |
| App Bundle | Android 动态交付格式 |
