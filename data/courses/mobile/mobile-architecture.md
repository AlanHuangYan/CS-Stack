# 移动端架构设计 三层深度学习教程

## [总览] 技术总览

移动端架构设计关注应用的可扩展性、可维护性和性能。现代移动应用架构从 MVC 演进到 MVVM、MVI、Clean Architecture，核心目标是分离关注点、提高可测试性、降低耦合度。

本教程采用三层漏斗学习法：**核心层**聚焦 MVVM 架构、依赖注入、Repository 模式三大基石；**重点层**深入 Clean Architecture 和模块化设计；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. MVVM 架构模式

#### [概念] 概念解释

MVVM（Model-View-ViewModel）是移动开发的主流架构：Model 负责数据和业务逻辑，View 负责 UI 展示，ViewModel 作为桥梁连接两者，通过数据绑定实现解耦。ViewModel 不持有 View 引用，便于单元测试。

#### [代码] 代码示例

```kotlin
// Android MVVM 架构示例

// Model 层 - 数据模型
data class User(
    val id: String,
    val name: String,
    val email: String,
    val avatar: String
)

data class ApiResponse<T>(
    val data: T?,
    val error: String?,
    val success: Boolean
)

// Repository 层 - 数据仓库
interface UserRepository {
    suspend fun getUser(id: String): Result<User>
    suspend fun updateUser(user: User): Result<User>
    fun observeUser(id: String): Flow<User?>
}

class UserRepositoryImpl(
    private val apiService: ApiService,
    private val localDataSource: UserLocalDataSource
) : UserRepository {
    
    override suspend fun getUser(id: String): Result<User> {
        return try {
            val cached = localDataSource.getUser(id)
            if (cached != null) {
                Result.success(cached)
            } else {
                val response = apiService.getUser(id)
                localDataSource.saveUser(response)
                Result.success(response)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun updateUser(user: User): Result<User> {
        return try {
            val response = apiService.updateUser(user)
            localDataSource.saveUser(response)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override fun observeUser(id: String): Flow<User?> {
        return localDataSource.observeUser(id)
    }
}

// ViewModel 层
class UserViewModel(
    private val userRepository: UserRepository,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    private val _uiState = MutableStateFlow<UserUiState>(UserUiState.Loading)
    val uiState: StateFlow<UserUiState> = _uiState.asStateFlow()
    
    private val _events = MutableSharedFlow<UserEvent>()
    val events: SharedFlow<UserEvent> = _events.asSharedFlow()
    
    init {
        loadUser()
    }
    
    fun loadUser(userId: String? = null) {
        val id = userId ?: savedStateHandle.get<String>("userId") ?: return
        
        viewModelScope.launch {
            _uiState.value = UserUiState.Loading
            
            userRepository.getUser(id)
                .onSuccess { user ->
                    _uiState.value = UserUiState.Success(user)
                }
                .onFailure { error ->
                    _uiState.value = UserUiState.Error(error.message ?: "Unknown error")
                }
        }
    }
    
    fun updateUserName(newName: String) {
        val currentState = _uiState.value
        if (currentState is UserUiState.Success) {
            val updatedUser = currentState.user.copy(name = newName)
            
            viewModelScope.launch {
                userRepository.updateUser(updatedUser)
                    .onSuccess {
                        _events.emit(UserEvent.ShowToast("Name updated successfully"))
                    }
                    .onFailure {
                        _events.emit(UserEvent.ShowToast("Failed to update name"))
                    }
            }
        }
    }
}

// UI 状态封装
sealed class UserUiState {
    object Loading : UserUiState()
    data class Success(val user: User) : UserUiState()
    data class Error(val message: String) : UserUiState()
}

sealed class UserEvent {
    data class ShowToast(val message: String) : UserEvent()
    object NavigateBack : UserEvent()
}

// View 层 - Activity/Fragment
class UserFragment : Fragment() {
    
    private var _binding: FragmentUserBinding? = null
    private val binding get() = _binding!!
    
    private val viewModel: UserViewModel by viewModels()
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentUserBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.uiState.collect { state ->
                when (state) {
                    is UserUiState.Loading -> {
                        binding.progressBar.visible()
                        binding.contentGroup.gone()
                    }
                    is UserUiState.Success -> {
                        binding.progressBar.gone()
                        binding.contentGroup.visible()
                        binding.userNameText.text = state.user.name
                        binding.userEmailText.text = state.user.email
                        Glide.with(this@UserFragment)
                            .load(state.user.avatar)
                            .into(binding.avatarImage)
                    }
                    is UserUiState.Error -> {
                        binding.progressBar.gone()
                        binding.errorText.text = state.message
                        binding.errorText.visible()
                    }
                }
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.events.collect { event ->
                when (event) {
                    is UserEvent.ShowToast -> {
                        Toast.makeText(requireContext(), event.message, Toast.LENGTH_SHORT).show()
                    }
                    UserEvent.NavigateBack -> {
                        findNavController().navigateUp()
                    }
                }
            }
        }
        
        binding.editNameButton.setOnClickListener {
            showEditNameDialog()
        }
    }
    
    private fun showEditNameDialog() {
        val currentState = viewModel.uiState.value
        if (currentState is UserUiState.Success) {
            val input = EditText(requireContext()).apply {
                setText(currentState.user.name)
            }
            
            AlertDialog.Builder(requireContext())
                .setTitle("Edit Name")
                .setView(input)
                .setPositiveButton("Save") { _, _ ->
                    viewModel.updateUserName(input.text.toString())
                }
                .setNegativeButton("Cancel", null)
                .show()
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
```

### 2. 依赖注入

#### [概念] 概念解释

依赖注入（DI）将对象的创建和管理交给容器，实现控制反转。移动端常用 Hilt（Android）和 Koin（Kotlin）。DI 提高可测试性、降低耦合、简化配置。

#### [代码] 代码示例

```kotlin
// Hilt 依赖注入示例

// Application 类
@HiltAndroidApp
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}

// Module 定义
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(LoggingInterceptor())
            .addInterceptor(AuthInterceptor())
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }
    
    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl("https://api.example.com/")
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    
    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): ApiService {
        return retrofit.create(ApiService::class.java)
    }
}

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    
    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "app_database"
        ).build()
    }
    
    @Provides
    fun provideUserDao(database: AppDatabase): UserDao {
        return database.userDao()
    }
}

@Module
@InstallIn(ViewModelComponent::class)
object RepositoryModule {
    
    @Provides
    fun provideUserRepository(
        apiService: ApiService,
        userDao: UserDao
    ): UserRepository {
        return UserRepositoryImpl(apiService, userDao)
    }
}

// 使用注入
@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    
    private val viewModel: MainViewModel by viewModels()
    
    @Inject
    lateinit var analytics: AnalyticsService
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        analytics.logEvent("main_activity_opened")
    }
}

// Koin 依赖注入示例
val appModule = module {
    single { provideOkHttpClient() }
    single { provideRetrofit(get()) }
    single { provideApiService(get()) }
    single { provideDatabase(androidContext()) }
    single { provideUserDao(get()) }
    single<UserRepository> { UserRepositoryImpl(get(), get()) }
    viewModel { UserViewModel(get()) }
}

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        startKoin {
            androidContext(this@MyApplication)
            modules(appModule)
        }
    }
}

// 限定符示例
@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class AuthInterceptor

@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class LoggingInterceptor

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @AuthInterceptor
    fun provideAuthInterceptor(): Interceptor {
        return Interceptor { chain ->
            val request = chain.request().newBuilder()
                .addHeader("Authorization", "Bearer token")
                .build()
            chain.proceed(request)
        }
    }
    
    @Provides
    @LoggingInterceptor
    fun provideLoggingInterceptor(): Interceptor {
        return HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
    }
}
```

### 3. Repository 模式

#### [概念] 概念解释

Repository 模式抽象数据访问层，为上层提供统一的数据接口。它封装数据源（网络、数据库、缓存）的访问逻辑，支持离线优先策略，使业务层不关心数据来源。

#### [代码] 代码示例

```kotlin
// Repository 模式完整实现

// 数据源接口
interface RemoteDataSource {
    suspend fun fetchUsers(): List<User>
    suspend fun fetchUser(id: String): User
    suspend fun syncUsers(users: List<User>)
}

interface LocalDataSource {
    suspend fun getUsers(): List<User>
    suspend fun getUser(id: String): User?
    suspend fun saveUsers(users: List<User>)
    suspend fun saveUser(user: User)
    suspend fun deleteUser(id: String)
    fun observeUsers(): Flow<List<User>>
    suspend fun clearAll()
}

// 网络数据源实现
class RemoteDataSourceImpl(
    private val apiService: ApiService
) : RemoteDataSource {
    
    override suspend fun fetchUsers(): List<User> {
        return apiService.getUsers()
    }
    
    override suspend fun fetchUser(id: String): User {
        return apiService.getUser(id)
    }
    
    override suspend fun syncUsers(users: List<User>) {
        apiService.syncUsers(users)
    }
}

// 本地数据源实现
class LocalDataSourceImpl(
    private val userDao: UserDao
) : LocalDataSource {
    
    override suspend fun getUsers(): List<User> {
        return userDao.getAll()
    }
    
    override suspend fun getUser(id: String): User? {
        return userDao.getById(id)
    }
    
    override suspend fun saveUsers(users: List<User>) {
        userDao.insertAll(users)
    }
    
    override suspend fun saveUser(user: User) {
        userDao.insert(user)
    }
    
    override suspend fun deleteUser(id: String) {
        userDao.deleteById(id)
    }
    
    override fun observeUsers(): Flow<List<User>> {
        return userDao.observeAll()
    }
    
    override suspend fun clearAll() {
        userDao.deleteAll()
    }
}

// Repository 实现 - 离线优先策略
class UserRepositoryImpl(
    private val remoteDataSource: RemoteDataSource,
    private val localDataSource: LocalDataSource,
    private val networkMonitor: NetworkMonitor
) : UserRepository {
    
    override suspend fun getUsers(): Result<List<User>> {
        return try {
            if (networkMonitor.isOnline) {
                val remoteUsers = remoteDataSource.fetchUsers()
                localDataSource.saveUsers(remoteUsers)
                Result.success(remoteUsers)
            } else {
                val localUsers = localDataSource.getUsers()
                if (localUsers.isEmpty()) {
                    Result.failure(Exception("No cached data available"))
                } else {
                    Result.success(localUsers)
                }
            }
        } catch (e: Exception) {
            val localUsers = localDataSource.getUsers()
            if (localUsers.isNotEmpty()) {
                Result.success(localUsers)
            } else {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun getUser(id: String): Result<User> {
        return try {
            val localUser = localDataSource.getUser(id)
            if (localUser != null && !shouldRefresh(localUser)) {
                return Result.success(localUser)
            }
            
            if (networkMonitor.isOnline) {
                val remoteUser = remoteDataSource.fetchUser(id)
                localDataSource.saveUser(remoteUser)
                Result.success(remoteUser)
            } else if (localUser != null) {
                Result.success(localUser)
            } else {
                Result.failure(Exception("User not found and no network"))
            }
        } catch (e: Exception) {
            val localUser = localDataSource.getUser(id)
            if (localUser != null) {
                Result.success(localUser)
            } else {
                Result.failure(e)
            }
        }
    }
    
    override fun observeUsers(): Flow<Result<List<User>>> = flow {
        localDataSource.observeUsers().collect { users ->
            emit(Result.success(users))
        }
    }
    
    override suspend fun sync(): Result<Unit> {
        return try {
            if (networkMonitor.isOnline) {
                val localUsers = localDataSource.getUsers()
                remoteDataSource.syncUsers(localUsers)
                Result.success(Unit)
            } else {
                Result.failure(Exception("No network connection"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    private fun shouldRefresh(user: User): Boolean {
        val cacheDuration = 5 * 60 * 1000L
        return System.currentTimeMillis() - user.lastUpdated > cacheDuration
    }
}

// 带缓存的 Repository
class CachedUserRepository(
    private val repository: UserRepository
) : UserRepository by repository {
    
    private val cache = mutableMapOf<String, User>()
    private val cacheExpiry = mutableMapOf<String, Long>()
    private val cacheDuration = 5 * 60 * 1000L
    
    override suspend fun getUser(id: String): Result<User> {
        val cached = cache[id]
        val expiry = cacheExpiry[id] ?: 0
        
        if (cached != null && System.currentTimeMillis() < expiry) {
            return Result.success(cached)
        }
        
        return repository.getUser(id).also { result ->
            result.onSuccess { user ->
                cache[id] = user
                cacheExpiry[id] = System.currentTimeMillis() + cacheDuration
            }
        }
    }
    
    fun clearCache() {
        cache.clear()
        cacheExpiry.clear()
    }
}
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. Clean Architecture

#### [概念] 概念解释

Clean Architecture 将应用分为同心圆层：Entities（业务实体）、Use Cases（用例）、Interface Adapters（接口适配器）、Frameworks（框架）。依赖规则是内层不依赖外层，通过接口解耦。

#### [代码] 代码示例

```kotlin
// Clean Architecture 实现

// Domain 层 - Entities
data class UserEntity(
    val id: String,
    val name: String,
    val email: String
) {
    fun isValidEmail(): Boolean {
        return android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }
    
    fun displayName(): String {
        return name.trim().ifEmpty { "Unknown" }
    }
}

// Domain 层 - Repository 接口
interface UserRepository {
    suspend fun getUser(id: String): Result<UserEntity>
    suspend fun saveUser(user: UserEntity): Result<Unit>
    fun observeUser(id: String): Flow<UserEntity?>
}

// Domain 层 - Use Cases
class GetUserUseCase(
    private val userRepository: UserRepository
) {
    suspend operator fun invoke(userId: String): Result<UserEntity> {
        if (userId.isBlank()) {
            return Result.failure(IllegalArgumentException("User ID cannot be empty"))
        }
        return userRepository.getUser(userId)
    }
}

class SaveUserUseCase(
    private val userRepository: UserRepository
) {
    suspend operator fun invoke(user: UserEntity): Result<Unit> {
        if (!user.isValidEmail()) {
            return Result.failure(IllegalArgumentException("Invalid email"))
        }
        return userRepository.saveUser(user)
    }
}

class ObserveUserUseCase(
    private val userRepository: UserRepository
) {
    operator fun invoke(userId: String): Flow<UserEntity?> {
        return userRepository.observeUser(userId)
    }
}

// Data 层 - Repository 实现
class UserRepositoryImpl(
    private val userRemoteDataSource: UserRemoteDataSource,
    private val userLocalDataSource: UserLocalDataSource,
    private val userMapper: UserMapper
) : UserRepository {
    
    override suspend fun getUser(id: String): Result<UserEntity> {
        return try {
            val remoteUser = userRemoteDataSource.getUser(id)
            val entity = userMapper.toEntity(remoteUser)
            userLocalDataSource.saveUser(userMapper.toLocal(remoteUser))
            Result.success(entity)
        } catch (e: Exception) {
            try {
                val localUser = userLocalDataSource.getUser(id)
                if (localUser != null) {
                    Result.success(userMapper.toEntity(localUser))
                } else {
                    Result.failure(e)
                }
            } catch (localError: Exception) {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun saveUser(user: UserEntity): Result<Unit> {
        return try {
            val remoteUser = userMapper.toRemote(user)
            userRemoteDataSource.saveUser(remoteUser)
            userLocalDataSource.saveUser(userMapper.toLocal(user))
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override fun observeUser(id: String): Flow<UserEntity?> {
        return userLocalDataSource.observeUser(id).map { local ->
            local?.let { userMapper.toEntity(it) }
        }
    }
}

// Presentation 层 - ViewModel
class UserViewModel(
    private val getUserUseCase: GetUserUseCase,
    private val saveUserUseCase: SaveUserUseCase,
    private val observeUserUseCase: ObserveUserUseCase
) : ViewModel() {
    
    private val _uiState = MutableStateFlow<UserUiState>(UserUiState.Idle)
    val uiState: StateFlow<UserUiState> = _uiState.asStateFlow()
    
    fun loadUser(userId: String) {
        viewModelScope.launch {
            _uiState.value = UserUiState.Loading
            
            getUserUseCase(userId)
                .onSuccess { user ->
                    _uiState.value = UserUiState.Success(user)
                }
                .onFailure { error ->
                    _uiState.value = UserUiState.Error(error.message ?: "Unknown error")
                }
        }
    }
    
    fun observeUser(userId: String) {
        viewModelScope.launch {
            observeUserUseCase(userId).collect { user ->
                user?.let {
                    _uiState.value = UserUiState.Success(it)
                }
            }
        }
    }
    
    fun saveUser(user: UserEntity) {
        viewModelScope.launch {
            saveUserUseCase(user)
                .onSuccess {
                    _uiState.value = UserUiState.Saved
                }
                .onFailure { error ->
                    _uiState.value = UserUiState.Error(error.message ?: "Save failed")
                }
        }
    }
}

// Mapper
class UserMapper {
    fun toEntity(dto: UserDto): UserEntity {
        return UserEntity(
            id = dto.id,
            name = dto.name,
            email = dto.email
        )
    }
    
    fun toEntity(local: UserLocal): UserEntity {
        return UserEntity(
            id = local.id,
            name = local.name,
            email = local.email
        )
    }
    
    fun toRemote(entity: UserEntity): UserDto {
        return UserDto(
            id = entity.id,
            name = entity.name,
            email = entity.email
        )
    }
    
    fun toLocal(entity: UserEntity): UserLocal {
        return UserLocal(
            id = entity.id,
            name = entity.name,
            email = entity.email
        )
    }
}
```

### 2. 模块化设计

#### [概念] 概念解释

模块化将应用拆分为独立模块，每个模块负责特定功能。优点包括：加速构建、隔离职责、支持动态功能、团队并行开发。模块类型：App 模块、Feature 模块、Core 模块、Shared 模块。

#### [代码] 代码示例

```kotlin
// 模块化项目结构
/*
:app                    // 主应用模块
:feature:auth           // 认证功能模块
:feature:profile        // 个人资料功能模块
:feature:settings       // 设置功能模块
:core:network           // 网络核心模块
:core:database          // 数据库核心模块
:core:ui                // UI 组件模块
:shared:utils           // 工具类模块
:shared:models          // 共享数据模型
*/

// Feature 模块接口定义
interface FeatureEntry {
    val route: String
    fun createIntent(context: Context): Intent
}

// Auth 模块
object AuthEntry : FeatureEntry {
    override val route = "auth"
    
    override fun createIntent(context: Context): Intent {
        return Intent(context, AuthActivity::class.java)
    }
}

// 模块间导航
class AppNavigator(
    private val context: Context
) {
    fun navigateToAuth() {
        context.startActivity(AuthEntry.createIntent(context))
    }
    
    fun navigateToProfile(userId: String) {
        val intent = ProfileEntry.createIntent(context).apply {
            putExtra("user_id", userId)
        }
        context.startActivity(intent)
    }
}

// 动态功能模块
class DynamicFeatureManager(
    private val context: Context
) {
    private val splitInstallManager = SplitInstallManagerFactory.create(context)
    
    fun installFeature(featureName: String, onInstalled: () -> Unit) {
        if (splitInstallManager.installedModules.contains(featureName)) {
            onInstalled()
            return
        }
        
        val request = SplitInstallRequest.newBuilder()
            .addModule(featureName)
            .build()
        
        splitInstallManager.startInstall(request)
            .addOnSuccessListener {
                onInstalled()
            }
            .addOnFailureListener { e ->
            }
    }
    
    fun isFeatureInstalled(featureName: String): Boolean {
        return splitInstallManager.installedModules.contains(featureName)
    }
}

// 模块依赖配置
// feature/auth/build.gradle.kts
/*
dependencies {
    implementation(project(":core:network"))
    implementation(project(":core:ui"))
    implementation(project(":shared:models"))
    implementation(project(":shared:utils"))
}
*/

// 核心模块公共接口
// core/network/src/main/kotlin/NetworkModule.kt
object NetworkModule {
    fun provideOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(LoggingInterceptor())
            .build()
    }
    
    fun provideRetrofit(client: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl("https://api.example.com/")
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
}
```

### 3. 状态管理

#### [概念] 概念解释

移动端状态管理关注 UI 状态的维护和更新。常见模式：MVI（Model-View-Intent）、Redux、单向数据流。核心原则：状态不可变、状态变化可预测、UI 是状态的函数。

#### [代码] 代码示例

```kotlin
// MVI 状态管理

// 状态定义
data class UserProfileState(
    val user: User? = null,
    val isLoading: Boolean = false,
    val error: String? = null,
    val isEditing: Boolean = false,
    val editName: String = "",
    val editEmail: String = ""
) {
    val canSave: Boolean
        get() = editName.isNotBlank() && editEmail.isNotBlank()
}

// 意图定义
sealed class UserProfileIntent {
    object LoadProfile : UserProfileIntent()
    object StartEditing : UserProfileIntent()
    object CancelEditing : UserProfileIntent()
    object SaveChanges : UserProfileIntent()
    data class UpdateName(val name: String) : UserProfileIntent()
    data class UpdateEmail(val email: String) : UserProfileIntent()
}

// 副作用定义
sealed class UserProfileEffect {
    data class ShowToast(val message: String) : UserProfileEffect()
    object NavigateBack : UserProfileEffect()
    data class ShowError(val error: Throwable) : UserProfileEffect()
}

// ViewModel 实现 MVI
class UserProfileViewModel(
    private val userRepository: UserRepository
) : ViewModel() {
    
    private val _state = MutableStateFlow(UserProfileState())
    val state: StateFlow<UserProfileState> = _state.asStateFlow()
    
    private val _effects = MutableSharedFlow<UserProfileEffect>()
    val effects: SharedFlow<UserProfileEffect> = _effects.asSharedFlow()
    
    fun processIntent(intent: UserProfileIntent) {
        when (intent) {
            is UserProfileIntent.LoadProfile -> loadProfile()
            is UserProfileIntent.StartEditing -> startEditing()
            is UserProfileIntent.CancelEditing -> cancelEditing()
            is UserProfileIntent.SaveChanges -> saveChanges()
            is UserProfileIntent.UpdateName -> updateName(intent.name)
            is UserProfileIntent.UpdateEmail -> updateEmail(intent.email)
        }
    }
    
    private fun loadProfile() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            
            userRepository.getCurrentUser()
                .onSuccess { user ->
                    _state.update { 
                        it.copy(
                            user = user,
                            isLoading = false,
                            editName = user.name,
                            editEmail = user.email
                        )
                    }
                }
                .onFailure { error ->
                    _state.update { 
                        it.copy(isLoading = false, error = error.message) 
                    }
                    _effects.emit(UserProfileEffect.ShowError(error))
                }
        }
    }
    
    private fun startEditing() {
        _state.update { it.copy(isEditing = true) }
    }
    
    private fun cancelEditing() {
        _state.update { 
            it.copy(
                isEditing = false,
                editName = it.user?.name ?: "",
                editEmail = it.user?.email ?: ""
            )
        }
    }
    
    private fun saveChanges() {
        val currentState = _state.value
        
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            
            val updatedUser = currentState.user?.copy(
                name = currentState.editName,
                email = currentState.editEmail
            ) ?: return@launch
            
            userRepository.updateUser(updatedUser)
                .onSuccess { user ->
                    _state.update { 
                        it.copy(
                            user = user,
                            isLoading = false,
                            isEditing = false
                        )
                    }
                    _effects.emit(UserProfileEffect.ShowToast("Profile updated"))
                }
                .onFailure { error ->
                    _state.update { it.copy(isLoading = false) }
                    _effects.emit(UserProfileEffect.ShowToast("Update failed"))
                }
        }
    }
    
    private fun updateName(name: String) {
        _state.update { it.copy(editName = name) }
    }
    
    private fun updateEmail(email: String) {
        _state.update { it.copy(editEmail = email) }
    }
}

// View 层处理
class UserProfileFragment : Fragment() {
    
    private val viewModel: UserProfileViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.state.collect { state ->
                renderState(state)
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.effects.collect { effect ->
                handleEffect(effect)
            }
        }
        
        binding.editButton.setOnClickListener {
            viewModel.processIntent(UserProfileIntent.StartEditing)
        }
        
        binding.saveButton.setOnClickListener {
            viewModel.processIntent(UserProfileIntent.SaveChanges)
        }
        
        binding.nameEditText.addTextChangedListener { text ->
            viewModel.processIntent(UserProfileIntent.UpdateName(text?.toString() ?: ""))
        }
    }
    
    private fun renderState(state: UserProfileState) {
        binding.progressBar.isVisible = state.isLoading
        binding.errorText.isVisible = state.error != null
        binding.errorText.text = state.error
        
        state.user?.let { user ->
            binding.nameText.text = user.name
            binding.emailText.text = user.email
        }
        
        binding.editGroup.isVisible = state.isEditing
        binding.viewGroup.isVisible = !state.isEditing
        
        binding.saveButton.isEnabled = state.canSave
    }
    
    private fun handleEffect(effect: UserProfileEffect) {
        when (effect) {
            is UserProfileEffect.ShowToast -> {
                Toast.makeText(requireContext(), effect.message, Toast.LENGTH_SHORT).show()
            }
            is UserProfileEffect.NavigateBack -> {
                findNavController().navigateUp()
            }
            is UserProfileEffect.ShowError -> {
                Snackbar.make(binding.root, effect.error.message ?: "Error", Snackbar.LENGTH_LONG).show()
            }
        }
    }
}
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| MVC Pattern | 传统模型-视图-控制器模式 |
| MVP Pattern | 模型-视图-展示器模式 |
| MVI Pattern | 模型-视图-意图模式 |
| Redux | 单向数据流状态管理 |
| Coordinator | 协调器模式，导航管理 |
| Factory Pattern | 工厂模式，对象创建 |
| Singleton | 单例模式，全局状态 |
| Observer Pattern | 观察者模式，事件通知 |
| Strategy Pattern | 策略模式，算法切换 |
| Adapter Pattern | 适配器模式，接口转换 |
