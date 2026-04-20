# 移动端离线存储 三层深度学习教程

## [总览] 技术总览

移动端离线存储确保应用在无网络时仍能正常工作。核心策略包括：本地数据库、缓存机制、数据同步、离线优先架构。良好的离线支持提升用户体验，是现代移动应用的必备能力。

本教程采用三层漏斗学习法：**核心层**聚焦 SQLite/Room、SharedPreferences、数据缓存三大基石；**重点层**深入数据同步和冲突解决；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. Room 数据库

#### [概念] 概念解释

Room 是 Android 官方推荐的 SQLite 抽象层，提供编译时 SQL 验证、类型安全查询、LiveData/Flow 支持。核心组件：Entity（实体）、DAO（数据访问对象）、Database（数据库）。

#### [代码] 代码示例

```kotlin
// Room 数据库完整实现

// Entity 定义
@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val email: String,
    val avatar: String?,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    @ColumnInfo(name = "is_synced")
    val isSynced: Boolean = false
)

@Entity(
    tableName = "posts",
    foreignKeys = [
        ForeignKey(
            entity = UserEntity::class,
            parentColumns = ["id"],
            childColumns = ["author_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("author_id")]
)
data class PostEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val content: String,
    @ColumnInfo(name = "author_id")
    val authorId: String,
    val createdAt: Long,
    val updatedAt: Long
)

// 嵌入式关系
data class UserWithPosts(
    @Embedded
    val user: UserEntity,
    @Relation(
        parentColumn = "id",
        entityColumn = "author_id"
    )
    val posts: List<PostEntity>
)

// DAO 定义
@Dao
interface UserDao {
    
    @Query("SELECT * FROM users WHERE id = :id")
    suspend fun getById(id: String): UserEntity?
    
    @Query("SELECT * FROM users WHERE id = :id")
    fun observeById(id: String): Flow<UserEntity?>
    
    @Query("SELECT * FROM users ORDER BY name ASC")
    suspend fun getAll(): List<UserEntity>
    
    @Query("SELECT * FROM users ORDER BY name ASC")
    fun observeAll(): Flow<List<UserEntity>>
    
    @Query("SELECT * FROM users WHERE name LIKE '%' || :query || '%'")
    suspend fun searchByName(query: String): List<UserEntity>
    
    @Query("SELECT * FROM users WHERE is_synced = 0")
    suspend fun getUnsynced(): List<UserEntity>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(user: UserEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(users: List<UserEntity>)
    
    @Update
    suspend fun update(user: UserEntity)
    
    @Delete
    suspend fun delete(user: UserEntity)
    
    @Query("DELETE FROM users WHERE id = :id")
    suspend fun deleteById(id: String)
    
    @Query("DELETE FROM users")
    suspend fun deleteAll()
    
    @Transaction
    @Query("SELECT * FROM users WHERE id = :id")
    suspend fun getUserWithPosts(id: String): UserWithPosts?
    
    @Transaction
    suspend fun insertAndUpdateTimestamp(user: UserEntity) {
        val updatedUser = user.copy(updatedAt = System.currentTimeMillis())
        insert(updatedUser)
    }
}

// Database 定义
@Database(
    entities = [UserEntity::class, PostEntity::class],
    version = 1,
    exportSchema = true
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun postDao(): PostDao
    
    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null
        
        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "app_database"
                )
                    .addMigrations(MIGRATION_1_2)
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
        
        private val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(database: SupportSQLiteDatabase) {
                database.execSQL("ALTER TABLE users ADD COLUMN phone TEXT")
            }
        }
    }
}

// Type Converter
class Converters {
    @TypeConverter
    fun fromStringList(value: String?): List<String> {
        return value?.split(",") ?: emptyList()
    }
    
    @TypeConverter
    fun toStringList(list: List<String>?): String? {
        return list?.joinToString(",")
    }
    
    @TypeConverter
    fun fromJson(value: String?): Map<String, String>? {
        return value?.let { Gson().fromJson(it, object : TypeToken<Map<String, String>>() {}.type) }
    }
    
    @TypeConverter
    fun toJson(map: Map<String, String>?): String? {
        return map?.let { Gson().toJson(it) }
    }
}
```

### 2. SharedPreferences 与 DataStore

#### [概念] 概念解释

SharedPreferences 是轻量级键值存储，适合存储简单配置。DataStore 是其现代替代品，支持协程、类型安全、数据迁移。分为 Preferences DataStore（键值对）和 Proto DataStore（类型化对象）。

#### [代码] 代码示例

```kotlin
// SharedPreferences 使用
class PreferenceManager(context: Context) {
    
    private val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
    
    fun getString(key: String, defaultValue: String = ""): String {
        return prefs.getString(key, defaultValue) ?: defaultValue
    }
    
    fun putString(key: String, value: String) {
        prefs.edit().putString(key, value).apply()
    }
    
    fun getInt(key: String, defaultValue: Int = 0): Int {
        return prefs.getInt(key, defaultValue)
    }
    
    fun putInt(key: String, value: Int) {
        prefs.edit().putInt(key, value).apply()
    }
    
    fun getBoolean(key: String, defaultValue: Boolean = false): Boolean {
        return prefs.getBoolean(key, defaultValue)
    }
    
    fun putBoolean(key: String, value: Boolean) {
        prefs.edit().putBoolean(key, value).apply()
    }
    
    fun remove(key: String) {
        prefs.edit().remove(key).apply()
    }
    
    fun clear() {
        prefs.edit().clear().apply()
    }
}

// Preferences DataStore
private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

class SettingsDataStore(private val context: Context) {
    
    companion object {
        private val THEME_KEY = intPreferencesKey("theme")
        private val NOTIFICATIONS_KEY = booleanPreferencesKey("notifications_enabled")
        private val LANGUAGE_KEY = stringPreferencesKey("language")
        private val USER_ID_KEY = stringPreferencesKey("user_id")
    }
    
    val theme: Flow<Int> = context.dataStore.data
        .map { prefs -> prefs[THEME_KEY] ?: AppTheme.SYSTEM.ordinal }
    
    val notificationsEnabled: Flow<Boolean> = context.dataStore.data
        .map { prefs -> prefs[NOTIFICATIONS_KEY] ?: true }
    
    val language: Flow<String> = context.dataStore.data
        .map { prefs -> prefs[LANGUAGE_KEY] ?: "en" }
    
    suspend fun setTheme(theme: Int) {
        context.dataStore.edit { prefs ->
            prefs[THEME_KEY] = theme
        }
    }
    
    suspend fun setNotificationsEnabled(enabled: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[NOTIFICATIONS_KEY] = enabled
        }
    }
    
    suspend fun setLanguage(language: String) {
        context.dataStore.edit { prefs ->
            prefs[LANGUAGE_KEY] = language
        }
    }
    
    suspend fun setUserId(userId: String) {
        context.dataStore.edit { prefs ->
            prefs[USER_ID_KEY] = userId
        }
    }
    
    suspend fun clearAll() {
        context.dataStore.edit { prefs ->
            prefs.clear()
        }
    }
}

// Proto DataStore
// user_prefs.proto
/*
syntax = "proto3";

option java_package = "com.example.app.data";
option java_multiple_files = true;

message UserPreferences {
  string user_id = 1;
  bool dark_mode = 2;
  int32 font_size = 3;
  repeated string recent_searches = 4;
}
*/

class UserPreferencesRepository(private val context: Context) {
    
    private object PreferencesKeys {
        val USER_PREFERENCES = preferencesKey<UserPreferences>("user_prefs")
    }
    
    private val Context.userPreferencesStore: DataStore<UserPreferences> by dataStore(
        fileName = "user_prefs.pb",
        serializer = UserPreferencesSerializer
    )
    
    val userPreferences: Flow<UserPreferences> = context.userPreferencesStore.data
        .catch { e ->
            if (e is IOException) {
                emit(UserPreferences.getDefaultInstance())
            } else {
                throw e
            }
        }
    
    suspend fun updateUserId(userId: String) {
        context.userPreferencesStore.updateData { prefs ->
            prefs.toBuilder()
                .setUserId(userId)
                .build()
        }
    }
    
    suspend fun toggleDarkMode() {
        context.userPreferencesStore.updateData { prefs ->
            prefs.toBuilder()
                .setDarkMode(!prefs.darkMode)
                .build()
        }
    }
    
    suspend fun addRecentSearch(query: String) {
        context.userPreferencesStore.updateData { prefs ->
            val recentSearches = prefs.recentSearchesList
                .toMutableList()
                .apply {
                    remove(query)
                    add(0, query)
                    if (size > 10) removeLast()
                }
            
            prefs.toBuilder()
                .clearRecentSearches()
                .addAllRecentSearches(recentSearches)
                .build()
        }
    }
}

object UserPreferencesSerializer : Serializer<UserPreferences> {
    override val defaultValue: UserPreferences = UserPreferences.getDefaultInstance()
    
    override suspend fun readFrom(input: InputStream): UserPreferences {
        return try {
            UserPreferences.parseFrom(input)
        } catch (e: InvalidProtocolBufferException) {
            defaultValue
        }
    }
    
    override suspend fun writeTo(t: UserPreferences, output: OutputStream) {
        t.writeTo(output)
    }
}
```

### 3. 数据缓存策略

#### [概念] 概念解释

数据缓存减少网络请求、提升响应速度。策略包括：内存缓存（速度快但易丢失）、磁盘缓存（持久化）、数据库缓存（结构化）。缓存策略：Cache-First、Network-First、Stale-While-Revalidate。

#### [代码] 代码示例

```kotlin
// 内存缓存实现
class MemoryCache<T>(
    private val maxSize: Int = 100,
    private val expireAfterMs: Long = 5 * 60 * 1000L
) {
    private val cache = LinkedHashMap<String, CacheEntry<T>>(maxSize, 0.75f, true)
    private val lock = ReentrantReadWriteLock()
    
    data class CacheEntry<T>(
        val value: T,
        val timestamp: Long = System.currentTimeMillis()
    ) {
        fun isExpired(expireAfterMs: Long): Boolean {
            return System.currentTimeMillis() - timestamp > expireAfterMs
        }
    }
    
    fun get(key: String): T? {
        return lock.readLock().withLock {
            cache[key]?.takeIf { !it.isExpired(expireAfterMs) }?.value
        }
    }
    
    fun put(key: String, value: T) {
        lock.writeLock().withLock {
            if (cache.size >= maxSize && !cache.containsKey(key)) {
                val iterator = cache.keys.iterator()
                if (iterator.hasNext()) {
                    cache.remove(iterator.next())
                }
            }
            cache[key] = CacheEntry(value)
        }
    }
    
    fun remove(key: String) {
        lock.writeLock().withLock {
            cache.remove(key)
        }
    }
    
    fun clear() {
        lock.writeLock().withLock {
            cache.clear()
        }
    }
    
    fun size(): Int {
        return lock.readLock().withLock { cache.size }
    }
}

// 磁盘缓存实现
class DiskCache(private val context: Context) {
    
    private val cacheDir = File(context.cacheDir, "http_cache")
    
    init {
        if (!cacheDir.exists()) {
            cacheDir.mkdirs()
        }
    }
    
    fun get(key: String): String? {
        val file = File(cacheDir, key.toMd5())
        if (!file.exists()) return null
        
        return try {
            file.readText()
        } catch (e: Exception) {
            null
        }
    }
    
    fun put(key: String, value: String) {
        val file = File(cacheDir, key.toMd5())
        try {
            file.writeText(value)
        } catch (e: Exception) {
        }
    }
    
    fun remove(key: String) {
        val file = File(cacheDir, key.toMd5())
        if (file.exists()) {
            file.delete()
        }
    }
    
    fun clear() {
        cacheDir.listFiles()?.forEach { it.delete() }
    }
    
    fun getSize(): Long {
        return cacheDir.listFiles()?.sumOf { it.length() } ?: 0
    }
    
    private fun String.toMd5(): String {
        val md = MessageDigest.getInstance("MD5")
        val digest = md.digest(this.toByteArray())
        return digest.joinToString("") { "%02x".format(it) }
    }
}

// 综合缓存策略
class CacheManager<T>(
    private val memoryCache: MemoryCache<T>,
    private val diskCache: DiskCache,
    private val json: Gson
) {
    suspend fun get(
        key: String,
        fetchFromNetwork: suspend () -> T,
        strategy: CacheStrategy = CacheStrategy.CACHE_FIRST
    ): Result<T> {
        return when (strategy) {
            CacheStrategy.CACHE_FIRST -> cacheFirst(key, fetchFromNetwork)
            CacheStrategy.NETWORK_FIRST -> networkFirst(key, fetchFromNetwork)
            CacheStrategy.STALE_WHILE_REVALIDATE -> staleWhileRevalidate(key, fetchFromNetwork)
        }
    }
    
    private suspend fun cacheFirst(
        key: String,
        fetchFromNetwork: suspend () -> T
    ): Result<T> {
        memoryCache.get(key)?.let {
            return Result.success(it)
        }
        
        diskCache.get(key)?.let { cached ->
            return try {
                val data = json.fromJson<T>(cached, object : TypeToken<T>() {}.type)
                memoryCache.put(key, data)
                Result.success(data)
            } catch (e: Exception) {
                null
            }
        }
        
        return fetchAndCache(key, fetchFromNetwork)
    }
    
    private suspend fun networkFirst(
        key: String,
        fetchFromNetwork: suspend () -> T
    ): Result<T> {
        return fetchAndCache(key, fetchFromNetwork).getOrElse {
            memoryCache.get(key)?.let { cached ->
                return Result.success(cached)
            }
            
            diskCache.get(key)?.let { cached ->
                return try {
                    val data = json.fromJson<T>(cached, object : TypeToken<T>() {}.type)
                    memoryCache.put(key, data)
                    Result.success(data)
                } catch (e: Exception) {
                    Result.failure(it)
                }
            }
            
            Result.failure(it)
        }
    }
    
    private suspend fun staleWhileRevalidate(
        key: String,
        fetchFromNetwork: suspend () -> T
    ): Result<T> {
        memoryCache.get(key)?.let { cached ->
            CoroutineScope(Dispatchers.IO).launch {
                fetchAndCache(key, fetchFromNetwork)
            }
            return Result.success(cached)
        }
        
        diskCache.get(key)?.let { cached ->
            return try {
                val data = json.fromJson<T>(cached, object : TypeToken<T>() {}.type)
                CoroutineScope(Dispatchers.IO).launch {
                    fetchAndCache(key, fetchFromNetwork)
                }
                Result.success(data)
            } catch (e: Exception) {
                null
            }
        }
        
        return fetchAndCache(key, fetchFromNetwork)
    }
    
    private suspend fun fetchAndCache(
        key: String,
        fetchFromNetwork: suspend () -> T
    ): Result<T> {
        return try {
            val data = fetchFromNetwork()
            memoryCache.put(key, data)
            diskCache.put(key, json.toJson(data))
            Result.success(data)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

enum class CacheStrategy {
    CACHE_FIRST,
    NETWORK_FIRST,
    STALE_WHILE_REVALIDATE
}
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 离线数据同步

#### [概念] 概念解释

离线数据同步确保本地和服务器数据一致。关键技术：变更追踪、增量同步、队列管理、后台同步。WorkManager 用于可靠的后台同步任务。

#### [代码] 代码示例

```kotlin
// 离线数据同步实现

// 同步状态追踪
@Entity(tableName = "sync_queue")
data class SyncQueueItem(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val entityType: String,
    val entityId: String,
    val operation: SyncOperation,
    val payload: String,
    val createdAt: Long = System.currentTimeMillis(),
    val retryCount: Int = 0,
    val lastError: String? = null
)

enum class SyncOperation {
    CREATE, UPDATE, DELETE
}

// 同步管理器
class SyncManager(
    private val syncDao: SyncDao,
    private val apiService: ApiService,
    private val workManager: WorkManager
) {
    fun enqueueSync() {
        val syncWork = OneTimeWorkRequestBuilder<SyncWorker>()
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build()
            )
            .setBackoffCriteria(
                BackoffPolicy.LINEAR,
                WorkRequest.MIN_BACKOFF_MILLIS,
                TimeUnit.MILLISECONDS
            )
            .build()
        
        workManager.enqueueUniqueWork(
            "sync_work",
            ExistingWorkPolicy.KEEP,
            syncWork
        )
    }
    
    suspend fun addToQueue(entityType: String, entityId: String, operation: SyncOperation, payload: String) {
        val item = SyncQueueItem(
            entityType = entityType,
            entityId = entityId,
            operation = operation,
            payload = payload
        )
        syncDao.insert(item)
        enqueueSync()
    }
}

// 同步 Worker
class SyncWorker(
    context: Context,
    params: WorkerParameters,
    private val syncDao: SyncDao,
    private val apiService: ApiService
) : CoroutineWorker(context, params) {
    
    override suspend fun doWork(): Result {
        return try {
            val pendingItems = syncDao.getPendingItems()
            
            for (item in pendingItems) {
                val success = processSyncItem(item)
                
                if (success) {
                    syncDao.delete(item)
                } else {
                    if (item.retryCount >= MAX_RETRIES) {
                        syncDao.delete(item)
                    } else {
                        syncDao.updateRetryCount(item.id, item.retryCount + 1)
                    }
                }
            }
            
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
    
    private suspend fun processSyncItem(item: SyncQueueItem): Boolean {
        return try {
            when (item.entityType) {
                "user" -> syncUser(item)
                "post" -> syncPost(item)
                else -> false
            }
        } catch (e: Exception) {
            syncDao.updateLastError(item.id, e.message)
            false
        }
    }
    
    private suspend fun syncUser(item: SyncQueueItem): Boolean {
        val user = Gson().fromJson(item.payload, User::class.java)
        
        return when (item.operation) {
            SyncOperation.CREATE -> {
                apiService.createUser(user)
                true
            }
            SyncOperation.UPDATE -> {
                apiService.updateUser(user)
                true
            }
            SyncOperation.DELETE -> {
                apiService.deleteUser(user.id)
                true
            }
        }
    }
    
    companion object {
        private const val MAX_RETRIES = 3
    }
}

// 增量同步
class IncrementalSync(
    private val apiService: ApiService,
    private val userDao: UserDao,
    private val syncStateDao: SyncStateDao
) {
    suspend fun syncUsers(): Result<Unit> {
        return try {
            val lastSyncTime = syncStateDao.getLastSyncTime("users")
            
            val changes = apiService.getUserChanges(since = lastSyncTime)
            
            for (change in changes) {
                when (change.operation) {
                    "CREATE", "UPDATE" -> {
                        userDao.insert(change.user)
                    }
                    "DELETE" -> {
                        userDao.deleteById(change.user.id)
                    }
                }
            }
            
            syncStateDao.updateLastSyncTime("users", System.currentTimeMillis())
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

### 2. 冲突解决策略

#### [概念] 概念解释

数据同步时可能发生冲突：同一数据在多个设备被修改。解决策略：Last-Write-Wins（最后写入胜出）、Three-Way Merge（三方合并）、Custom Logic（自定义逻辑）。

#### [代码] 代码示例

```kotlin
// 冲突解决实现

// 带版本的数据模型
@Entity(tableName = "notes")
data class NoteEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val content: String,
    val version: Int = 1,
    val updatedAt: Long = System.currentTimeMillis(),
    val deviceId: String,
    val isDeleted: Boolean = false
)

// 冲突检测
class ConflictDetector {
    fun detectConflict(local: NoteEntity, remote: NoteEntity): Boolean {
        return local.version != remote.version && 
               local.updatedAt > remote.updatedAt &&
               local.deviceId != remote.deviceId
    }
}

// 冲突解决策略
interface ConflictResolver<T> {
    fun resolve(local: T, remote: T): T
}

class LastWriteWinsResolver<T : VersionedEntity> : ConflictResolver<T> {
    override fun resolve(local: T, remote: T): T {
        return if (local.updatedAt >= remote.updatedAt) local else remote
    }
}

class ThreeWayMergeResolver : ConflictResolver<NoteEntity> {
    override fun resolve(local: NoteEntity, remote: NoteEntity): NoteEntity {
        val mergedTitle = if (local.title != remote.title) {
            "${local.title} (merged) / ${remote.title}"
        } else {
            local.title
        }
        
        val mergedContent = mergeContent(local.content, remote.content)
        
        return local.copy(
            title = mergedTitle,
            content = mergedContent,
            version = maxOf(local.version, remote.version) + 1,
            updatedAt = System.currentTimeMillis()
        )
    }
    
    private fun mergeContent(local: String, remote: String): String {
        if (local == remote) return local
        
        val localLines = local.split("\n")
        val remoteLines = remote.split("\n")
        
        val merged = mutableListOf<String>()
        val localSet = localLines.toSet()
        val remoteSet = remoteLines.toSet()
        
        merged.addAll(localLines)
        remoteLines.forEach { line ->
            if (line !in localSet) {
                merged.add(line)
            }
        }
        
        return merged.joinToString("\n")
    }
}

// 同步服务
class SyncService(
    private val apiService: ApiService,
    private val noteDao: NoteDao,
    private val conflictResolver: ConflictResolver<NoteEntity>
) {
    suspend fun syncNote(noteId: String): Result<NoteEntity> {
        return try {
            val local = noteDao.getById(noteId) ?: return Result.failure(Exception("Note not found"))
            
            val remote = try {
                apiService.getNote(noteId)
            } catch (e: Exception) {
                null
            }
            
            val result = if (remote != null && ConflictDetector().detectConflict(local, remote)) {
                val resolved = conflictResolver.resolve(local, remote)
                apiService.updateNote(resolved)
                noteDao.insert(resolved)
                resolved
            } else {
                val updated = local.copy(version = local.version + 1)
                apiService.updateNote(updated)
                noteDao.insert(updated)
                updated
            }
            
            Result.success(result)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

### 3. 后台任务与 WorkManager

#### [概念] 概念解释

WorkManager 管理可延迟的后台任务，保证任务执行。支持约束条件、重试策略、任务链、周期性任务。适合数据同步、日志上传、定时检查等场景。

#### [代码] 代码示例

```kotlin
// WorkManager 完整实现

// Worker 定义
class DataSyncWorker(
    context: Context,
    params: WorkerParameters,
    private val syncManager: SyncManager
) : CoroutineWorker(context, params) {
    
    override suspend fun doWork(): Result {
        return try {
            val result = syncManager.syncAll()
            
            if (result.isSuccess) {
                Result.success()
            } else {
                Result.retry()
            }
        } catch (e: Exception) {
            if (runAttemptCount < MAX_RETRIES) {
                Result.retry()
            } else {
                Result.failure()
            }
        }
    }
    
    companion object {
        const val MAX_RETRIES = 3
    }
}

// 周期性同步
class PeriodicSyncScheduler(private val workManager: WorkManager) {
    
    fun schedulePeriodicSync() {
        val syncWork = PeriodicWorkRequestBuilder<DataSyncWorker>(
            repeatInterval = 15,
            repeatIntervalTimeUnit = TimeUnit.MINUTES
        )
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .setRequiresBatteryNotLow(true)
                    .build()
            )
            .setBackoffCriteria(
                BackoffPolicy.LINEAR,
                WorkRequest.MIN_BACKOFF_MILLIS,
                TimeUnit.MILLISECONDS
            )
            .build()
        
        workManager.enqueueUniquePeriodicWork(
            "periodic_sync",
            ExistingPeriodicWorkPolicy.KEEP,
            syncWork
        )
    }
    
    fun cancelPeriodicSync() {
        workManager.cancelUniqueWork("periodic_sync")
    }
}

// 任务链
class TaskChainScheduler(private val workManager: WorkManager) {
    
    fun executeChain() {
        val fetchWork = OneTimeWorkRequestBuilder<FetchDataWorker>()
            .build()
        
        val processWork = OneTimeWorkRequestBuilder<ProcessDataWorker>()
            .build()
        
        val uploadWork = OneTimeWorkRequestBuilder<UploadDataWorker>()
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build()
            )
            .build()
        
        workManager.beginWith(fetchWork)
            .then(processWork)
            .then(uploadWork)
            .enqueue()
    }
}

// 带输入输出的 Worker
class ProcessDataWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {
    
    override suspend fun doWork(): Result {
        val inputUrl = inputData.getString("url") ?: return Result.failure()
        
        val result = processData(inputUrl)
        
        val output = workDataOf(
            "processed_count" to result.count,
            "status" to result.status
        )
        
        return Result.success(output)
    }
    
    private suspend fun processData(url: String): ProcessResult {
        return ProcessResult(count = 10, status = "success")
    }
}

// 监听任务状态
class WorkManagerObserver(
    private val workManager: WorkManager,
    private val callback: (WorkInfo) -> Unit
) {
    private var observer: LiveData<WorkInfo>? = null
    
    fun observe(workId: UUID) {
        observer = workManager.getWorkInfoByIdLiveData(workId)
        observer?.observeForever { info ->
            callback(info)
            
            if (info.state.isFinished) {
                stopObserving()
            }
        }
    }
    
    fun stopObserving() {
        observer?.let {
        }
    }
}
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| Realm | 移动端数据库，对象存储 |
| ObjectBox | 高性能移动数据库 |
| SQLCipher | 加密 SQLite 数据库 |
| Firebase Offline | Firebase 离线持久化 |
| Couchbase Lite | 嵌入式 NoSQL 数据库 |
| PouchDB | 浏览器端数据库 |
| IndexedDB | Web 离线存储 |
| Service Worker | Web 离线缓存 |
| Background Fetch | iOS 后台获取 |
| Background Modes | iOS 后台模式 |
