# Android 开发基础 三层深度学习教程

## [总览] 技术总览

Android 是全球最流行的移动操作系统，Android 开发使用 Java 或 Kotlin 语言，通过 Android SDK 构建应用。现代 Android 开发推荐使用 Kotlin + Jetpack Compose 组合，实现声明式 UI 开发。

本教程采用三层漏斗学习法：**核心层**聚焦 Activity 生命周期、布局与 UI、数据存储三大基石；**重点层**深入 Jetpack 组件、网络请求、MVVM 架构；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成 Android 开发 **50% 以上** 的常见任务。

### 1. Activity 生命周期

#### [概念] 概念解释

Activity 是 Android 应用的四大组件之一，代表一个屏幕界面。理解 Activity 生命周期对于正确管理资源和状态至关重要。

#### [语法] 核心语法 / 命令 / API

**生命周期回调：**

| 方法 | 说明 |
|------|------|
| onCreate() | Activity 创建时调用 |
| onStart() | Activity 可见时调用 |
| onResume() | Activity 获得焦点时调用 |
| onPause() | Activity 失去焦点时调用 |
| onStop() | Activity 不可见时调用 |
| onDestroy() | Activity 销毁时调用 |
| onRestart() | Activity 重新启动时调用 |

#### [代码] 代码示例

```kotlin
// MainActivity.kt
package com.example.myapp

import android.os.Bundle
import android.util.Log
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    
    companion object {
        private const val TAG = "MainActivity"
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        Log.d(TAG, "onCreate")
        
        // 初始化视图
        initViews()
    }
    
    override fun onStart() {
        super.onStart()
        Log.d(TAG, "onStart")
    }
    
    override fun onResume() {
        super.onResume()
        Log.d(TAG, "onResume")
    }
    
    override fun onPause() {
        super.onPause()
        Log.d(TAG, "onPause")
    }
    
    override fun onStop() {
        super.onStop()
        Log.d(TAG, "onStop")
    }
    
    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "onDestroy")
    }
    
    private fun initViews() {
        // 初始化视图组件
    }
}
```

```xml
<!-- AndroidManifest.xml -->
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.myapp">
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.MyApp">
        
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
    </application>
    
</manifest>
```

#### [场景] 典型应用场景

1. 在 onCreate 中初始化视图和数据
2. 在 onPause 中保存未提交的数据
3. 在 onDestroy 中释放资源

### 2. 布局与 UI

#### [概念] 概念解释

Android 使用 XML 布局文件定义界面结构，也可以使用 Jetpack Compose 进行声明式 UI 开发。布局决定了应用的视觉呈现。

#### [语法] 核心语法 / 命令 / API

**常用布局：**

| 布局 | 说明 |
|------|------|
| LinearLayout | 线性布局 |
| RelativeLayout | 相对布局 |
| ConstraintLayout | 约束布局 |
| FrameLayout | 帧布局 |
| RecyclerView | 列表布局 |

#### [代码] 代码示例

```xml
<!-- activity_main.xml -->
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">
    
    <TextView
        android:id="@+id/titleText"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Hello Android!"
        android:textSize="24sp"
        android:textColor="@color/black"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        android:layout_marginTop="32dp"/>
    
    <EditText
        android:id="@+id/inputEditText"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:hint="请输入内容"
        android:inputType="text"
        app:layout_constraintTop_toBottomOf="@id/titleText"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        android:layout_marginTop="16dp"
        android:layout_marginStart="16dp"
        android:layout_marginEnd="16dp"/>
    
    <Button
        android:id="@+id/submitButton"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="提交"
        app:layout_constraintTop_toBottomOf="@id/inputEditText"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        android:layout_marginTop="16dp"/>
    
</androidx.constraintlayout.widget.ConstraintLayout>
```

```kotlin
// Jetpack Compose UI
package com.example.myapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class ComposeActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MyApp()
        }
    }
}

@Composable
fun MyApp() {
    var text by remember { mutableStateOf("") }
    var result by remember { mutableStateOf("") }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Hello Android!",
            style = MaterialTheme.typography.headlineMedium
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        OutlinedTextField(
            value = text,
            onValueChange = { text = it },
            label = { Text("请输入内容") },
            modifier = Modifier.fillMaxWidth()
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Button(
            onClick = { result = "你输入了: $text" }
        ) {
            Text("提交")
        }
        
        if (result.isNotEmpty()) {
            Spacer(modifier = Modifier.height(16.dp))
            Text(text = result)
        }
    }
}
```

#### [场景] 典型应用场景

1. 创建登录界面
2. 显示列表数据
3. 表单输入和验证

### 3. 数据存储

#### [概念] 概念解释

Android 提供多种数据存储方式，包括 SharedPreferences、SQLite 数据库、文件存储和 Room 持久化库。

#### [语法] 核心语法 / 命令 / API

**存储方式对比：**

| 方式 | 适用场景 | 特点 |
|------|----------|------|
| SharedPreferences | 简单键值对 | 轻量级 |
| SQLite | 结构化数据 | 关系型数据库 |
| Room | ORM 数据库 | 类型安全 |
| File | 文件数据 | 灵活 |

#### [代码] 代码示例

```kotlin
// SharedPreferences 示例
package com.example.myapp

import android.content.Context
import android.content.SharedPreferences

class PreferencesManager(context: Context) {
    private val prefs: SharedPreferences = 
        context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
    
    fun saveString(key: String, value: String) {
        prefs.edit().putString(key, value).apply()
    }
    
    fun getString(key: String, defaultValue: String = ""): String {
        return prefs.getString(key, defaultValue) ?: defaultValue
    }
    
    fun saveBoolean(key: String, value: Boolean) {
        prefs.edit().putBoolean(key, value).apply()
    }
    
    fun getBoolean(key: String, defaultValue: Boolean = false): Boolean {
        return prefs.getBoolean(key, defaultValue)
    }
    
    fun clear() {
        prefs.edit().clear().apply()
    }
}

// 使用示例
val prefsManager = PreferencesManager(this)
prefsManager.saveString("username", "张三")
val username = prefsManager.getString("username")
```

```kotlin
// Room 数据库示例
package com.example.myapp.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

// 实体类
@Entity(tableName = "users")
data class User(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val email: String,
    val createdAt: Long = System.currentTimeMillis()
)

// DAO 接口
@Dao
interface UserDao {
    @Query("SELECT * FROM users")
    fun getAllUsers(): Flow<List<User>>
    
    @Query("SELECT * FROM users WHERE id = :id")
    suspend fun getUserById(id: Long): User?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: User): Long
    
    @Update
    suspend fun updateUser(user: User)
    
    @Delete
    suspend fun deleteUser(user: User)
    
    @Query("DELETE FROM users")
    suspend fun deleteAllUsers()
}

// 数据库类
@Database(entities = [User::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
}
```

#### [场景] 典型应用场景

1. 保存用户设置和偏好
2. 缓存应用数据
3. 持久化用户信息

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的 Android 开发能力和应用质量将显著提升。

### 1. Jetpack 组件

#### [概念] 概念与解决的问题

Jetpack 是 Android 官方推荐的开发组件库，包括 ViewModel、LiveData、Navigation、WorkManager 等，帮助开发者遵循最佳实践。

#### [语法] 核心用法

**核心组件：**

| 组件 | 说明 |
|------|------|
| ViewModel | 管理界面数据 |
| LiveData | 可观察数据容器 |
| Navigation | 导航管理 |
| WorkManager | 后台任务 |

#### [代码] 代码示例

```kotlin
// ViewModel + LiveData 示例
package com.example.myapp.ui

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.myapp.data.User
import com.example.myapp.data.UserRepository
import kotlinx.coroutines.launch

class UserViewModel(private val repository: UserRepository) : ViewModel() {
    
    private val _users = MutableLiveData<List<User>>()
    val users: LiveData<List<User>> = _users
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error
    
    fun loadUsers() {
        _isLoading.value = true
        viewModelScope.launch {
            try {
                val result = repository.getUsers()
                _users.value = result
                _error.value = null
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun addUser(user: User) {
        viewModelScope.launch {
            repository.insertUser(user)
            loadUsers()
        }
    }
}
```

#### [关联] 与核心层的关联

Jetpack 组件是 Activity 生命周期的延伸，帮助正确管理数据和状态。

### 2. 网络请求

#### [概念] 概念与解决的问题

Android 应用通常需要与后端 API 交互，使用 Retrofit + OkHttp 是最流行的网络请求方案。

#### [语法] 核心用法

**网络请求流程：**

1. 定义 API 接口
2. 创建 Retrofit 实例
3. 发起请求
4. 处理响应

#### [代码] 代码示例

```kotlin
// Retrofit 网络请求示例
package com.example.myapp.network

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*

// API 接口定义
interface ApiService {
    @GET("users")
    suspend fun getUsers(): List<UserResponse>
    
    @GET("users/{id}")
    suspend fun getUserById(@Path("id") id: Long): UserResponse
    
    @POST("users")
    suspend fun createUser(@Body user: UserRequest): UserResponse
    
    @PUT("users/{id}")
    suspend fun updateUser(@Path("id") id: Long, @Body user: UserRequest): UserResponse
    
    @DELETE("users/{id}")
    suspend fun deleteUser(@Path("id") id: Long)
}

// 响应数据类
data class UserResponse(
    val id: Long,
    val name: String,
    val email: String
)

data class UserRequest(
    val name: String,
    val email: String
)

// Retrofit 客户端
object ApiClient {
    private const val BASE_URL = "https://api.example.com/"
    
    val apiService: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}

// Repository
class UserRepository {
    private val api = ApiClient.apiService
    
    suspend fun getUsers(): List<UserResponse> = api.getUsers()
    
    suspend fun getUserById(id: Long): UserResponse = api.getUserById(id)
    
    suspend fun createUser(name: String, email: String): UserResponse {
        return api.createUser(UserRequest(name, email))
    }
}
```

#### [场景] 典型应用场景

1. 获取服务器数据
2. 提交表单数据
3. 文件上传下载

### 3. MVVM 架构

#### [概念] 概念与解决的问题

MVVM（Model-View-ViewModel）是 Android 推荐的架构模式，分离视图和业务逻辑，提高代码可测试性和可维护性。

#### [语法] 核心用法

**MVVM 分层：**

| 层 | 职责 |
|------|------|
| Model | 数据层 |
| View | UI 层 |
| ViewModel | 业务逻辑层 |

#### [代码] 代码示例

```kotlin
// MVVM 完整示例

// Model - 数据层
@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: Long,
    val name: String,
    val email: String
)

// Repository - 数据仓库
class UserRepository(
    private val apiService: ApiService,
    private val userDao: UserDao
) {
    fun getUsers(): Flow<List<UserEntity>> = userDao.getAllUsers()
    
    suspend fun refreshUsers() {
        val users = apiService.getUsers()
        userDao.insertAll(users.map { it.toEntity() })
    }
    
    suspend fun addUser(user: UserEntity) {
        val response = apiService.createUser(user.name, user.email)
        userDao.insert(response.toEntity())
    }
}

// ViewModel - 业务逻辑层
class UserViewModel(
    private val repository: UserRepository
) : ViewModel() {
    
    val users: Flow<List<UserEntity>> = repository.getUsers()
    
    private val _uiState = MutableStateFlow<UiState>(UiState.Idle)
    val uiState: StateFlow<UiState> = _uiState
    
    sealed class UiState {
        object Idle : UiState()
        object Loading : UiState()
        data class Error(val message: String) : UiState()
    }
    
    fun refreshUsers() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            try {
                repository.refreshUsers()
                _uiState.value = UiState.Idle
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "Unknown error")
            }
        }
    }
    
    fun addUser(name: String, email: String) {
        viewModelScope.launch {
            repository.addUser(UserEntity(0, name, email))
        }
    }
}

// View - UI 层 (Compose)
@Composable
fun UserScreen(viewModel: UserViewModel = viewModel()) {
    val users by viewModel.users.collectAsState(initial = emptyList())
    val uiState by viewModel.uiState.collectAsState()
    
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        when (uiState) {
            is UserViewModel.UiState.Loading -> {
                CircularProgressIndicator()
            }
            is UserViewModel.UiState.Error -> {
                Text(text = (uiState as UserViewModel.UiState.Error).message)
            }
            else -> {
                LazyColumn {
                    items(users) { user ->
                        UserItem(user = user)
                    }
                }
            }
        }
    }
}
```

#### [场景] 典型应用场景

1. 构建可维护的应用架构
2. 实现单元测试
3. 处理复杂业务逻辑

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| Jetpack Compose | 需要声明式 UI 开发时 |
| Coroutines | 需要异步编程时 |
| Hilt/Dagger | 需要依赖注入时 |
| Navigation | 需要页面导航时 |
| DataStore | 需要替代 SharedPreferences 时 |
| WorkManager | 需要后台任务时 |
| Paging 3 | 需要分页加载时 |
| CameraX | 需要相机功能时 |
| Location | 需要定位功能时 |
| Bluetooth | 需要蓝牙功能时 |

---

## [实战] 核心实战清单

### 实战任务 1：构建一个完整的用户管理应用

**任务描述：**
使用 MVVM 架构构建一个用户管理应用，支持用户列表展示、添加用户、编辑用户和删除用户功能。

**要求：**
- 使用 Jetpack Compose 构建 UI
- 使用 Room 进行本地数据存储
- 使用 ViewModel 管理状态
- 实现完整的 CRUD 操作

**参考实现：**

```kotlin
// UserApplication.kt
class UserApplication : Application() {
    val database by lazy { AppDatabase.getDatabase(this) }
    val repository by lazy { UserRepository(database.userDao()) }
}

// MainActivity.kt
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val viewModel: UserViewModel = viewModel(
                factory = UserViewModelFactory(
                    (application as UserApplication).repository
                )
            )
            UserApp(viewModel)
        }
    }
}

// UserApp.kt
@Composable
fun UserApp(viewModel: UserViewModel) {
    val users by viewModel.users.collectAsState(initial = emptyList())
    var showAddDialog by remember { mutableStateOf(false) }
    
    Scaffold(
        floatingActionButton = {
            FloatingActionButton(onClick = { showAddDialog = true }) {
                Icon(Icons.Default.Add, contentDescription = "Add")
            }
        }
    ) { padding ->
        LazyColumn(modifier = Modifier.padding(padding)) {
            items(users) { user ->
                UserItem(
                    user = user,
                    onDelete = { viewModel.deleteUser(user) }
                )
            }
        }
    }
    
    if (showAddDialog) {
        AddUserDialog(
            onDismiss = { showAddDialog = false },
            onAdd = { name, email ->
                viewModel.addUser(name, email)
                showAddDialog = false
            }
        )
    }
}
```
