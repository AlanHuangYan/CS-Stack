# Vue 基础 三层深度学习教程

## [总览] 技术总览

Vue.js 是一款渐进式 JavaScript 框架，专注于构建用户界面。它的核心库只关注视图层，易于上手且便于与第三方库整合。Vue 采用自顶向下的数据流和组件化开发模式，让开发者可以高效地构建复杂的单页应用。

本教程采用三层漏斗学习法：**核心层**聚焦组件与模板、响应式数据、Props与Emit三大基石，掌握后即可完成 50% 以上的日常 Vue 开发任务；**重点层**深入 Composition API 和生命周期，提升代码复用性和开发效率；**扩展层**仅作关键词索引，供后续按需查阅。

学习策略：先精通核心层（必须动手敲代码），再理解重点层原理，扩展层建立索引即可。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成该技术 **50% 以上** 的常见任务。

### 1. 组件与模板

#### [概念] 概念解释

Vue 组件是可复用的 Vue 实例，每个组件都有自己的模板、数据和逻辑。单文件组件（SFC）是 Vue 的特色，将模板、脚本和样式封装在 `.vue` 文件中，让代码更易维护。

为什么归为核心层？因为组件是 Vue 应用的基本构建单元，不理解组件就无法构建任何 Vue 应用。模板语法定义了如何将数据渲染到视图，是组件开发的基础。

#### [语法] 核心语法 / 命令 / API

| 语法 | 用途 | 示例 |
|------|------|------|
| `{{ }}` | 插值表达式 | `{{ message }}` |
| `v-bind` | 属性绑定 | `v-bind:href="url"` 或 `:href="url"` |
| `v-on` | 事件绑定 | `v-on:click="handler"` 或 `@click="handler"` |
| `v-if/v-else` | 条件渲染 | `v-if="show"` |
| `v-for` | 列表渲染 | `v-for="item in items"` |
| `v-model` | 双向绑定 | `v-model="inputValue"` |

#### [代码] 代码示例

```html
<template>
  <div class="todo-app">
    <h1>{{ title }}</h1>
    
    <!-- 输入框：双向绑定 -->
    <div class="input-section">
      <input 
        v-model="newTodo" 
        @keyup.enter="addTodo"
        placeholder="输入待办事项"
      />
      <button @click="addTodo">添加</button>
    </div>
    
    <!-- 列表渲染 -->
    <ul class="todo-list">
      <li v-for="(todo, index) in todos" :key="todo.id">
        <span :class="{ completed: todo.done }" @click="toggleTodo(index)">
          {{ todo.text }}
        </span>
        <button @click="removeTodo(index)">删除</button>
      </li>
    </ul>
    
    <!-- 条件渲染 -->
    <p v-if="todos.length === 0" class="empty-tip">暂无待办事项</p>
    <p v-else class="count-tip">共 {{ todos.length }} 项待办</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const title = ref('我的待办清单')
const newTodo = ref('')
const todos = ref([
  { id: 1, text: '学习 Vue 基础', done: false },
  { id: 2, text: '完成组件练习', done: true }
])

let nextId = 3

function addTodo() {
  const text = newTodo.value.trim()
  if (text) {
    todos.value.push({
      id: nextId++,
      text,
      done: false
    })
    newTodo.value = ''
  }
}

function removeTodo(index) {
  todos.value.splice(index, 1)
}

function toggleTodo(index) {
  todos.value[index].done = !todos.value[index].done
}
</script>

<style scoped>
.todo-app {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.input-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list li {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.completed {
  text-decoration: line-through;
  color: #999;
}

.empty-tip, .count-tip {
  text-align: center;
  color: #666;
  margin-top: 20px;
}
</style>
```

#### [场景] 典型应用场景

1. **单页应用** — 使用组件构建多页面应用
2. **后台管理系统** — 表单、表格、弹窗等组件复用
3. **移动端 H5** — 轻量级组件快速开发

---

### 2. 响应式数据

#### [概念] 概念解释

响应式数据是 Vue 的核心特性：当数据变化时，视图自动更新。Vue 3 使用 `ref` 和 `reactive` 创建响应式数据。`ref` 用于基本类型，`reactive` 用于对象和数组。

为什么归为核心层？不理解响应式原理，就无法正确管理组件状态，会出现数据变化但视图不更新的问题。

#### [语法] 核心语法 / 命令 / API

| API | 用途 | 说明 |
|------|------|------|
| `ref()` | 创建响应式基本类型 | 返回 `.value` 访问的对象 |
| `reactive()` | 创建响应式对象 | 直接访问属性 |
| `computed()` | 计算属性 | 基于其他响应式数据派生 |
| `watch()` | 监听数据变化 | 执行副作用 |

#### [代码] 代码示例

```html
<template>
  <div class="counter">
    <h2>计数器示例</h2>
    
    <!-- ref 示例 -->
    <div class="section">
      <h3>使用 ref</h3>
      <p>计数: {{ count }}</p>
      <button @click="count++">+1</button>
      <button @click="count--">-1</button>
      <button @click="reset">重置</button>
    </div>
    
    <!-- reactive 示例 -->
    <div class="section">
      <h3>使用 reactive</h3>
      <p>姓名: {{ user.name }}</p>
      <p>年龄: {{ user.age }}</p>
      <input v-model="user.name" placeholder="输入姓名" />
      <input v-model.number="user.age" type="number" placeholder="输入年龄" />
    </div>
    
    <!-- computed 示例 -->
    <div class="section">
      <h3>计算属性</h3>
      <p>双倍计数: {{ doubleCount }}</p>
      <p>用户信息: {{ userInfo }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

// ref：用于基本类型
const count = ref(0)
const initialCount = 0

function reset() {
  count.value = initialCount
}

// reactive：用于对象
const user = reactive({
  name: '张三',
  age: 25
})

// computed：计算属性
const doubleCount = computed(() => count.value * 2)

const userInfo = computed(() => {
  return `${user.name}，${user.age}岁`
})
</script>

<style scoped>
.counter {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
}

.section {
  margin-bottom: 30px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

button {
  margin-right: 10px;
  padding: 8px 16px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

input {
  display: block;
  margin: 10px 0;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 200px;
}
</style>
```

#### [场景] 典型应用场景

1. **表单状态管理** — 使用 ref 管理输入值
2. **复杂对象状态** — 使用 reactive 管理用户信息
3. **派生数据** — 使用 computed 计算总价、过滤列表

---

### 3. Props 与 Emit

#### [概念] 概念解释

Props 用于父组件向子组件传递数据，Emit 用于子组件向父组件发送事件。这是 Vue 组件通信的基础机制，实现了单向数据流。

为什么归为核心层？组件化开发的核心就是组件间通信，不理解 Props 和 Emit 就无法构建可复用的组件体系。

#### [语法] 核心语法 / 命令 / API

| API | 用途 | 示例 |
|------|------|------|
| `defineProps()` | 定义接收的属性 | `const props = defineProps(['title'])` |
| `defineEmits()` | 定义触发的事件 | `const emit = defineEmits(['update'])` |
| `emit()` | 触发事件 | `emit('update', newValue)` |

#### [代码] 代码示例

```html
<!-- 父组件 Parent.vue -->
<template>
  <div class="parent">
    <h2>父组件</h2>
    <p>当前计数: {{ parentCount }}</p>
    
    <!-- 使用子组件，传递 props -->
    <ChildCounter 
      :count="parentCount"
      :max="10"
      @increment="handleIncrement"
      @decrement="handleDecrement"
      @reset="handleReset"
    />
    
    <!-- 可复用按钮组件 -->
    <div class="button-group">
      <CustomButton 
        v-for="btn in buttons" 
        :key="btn.text"
        :text="btn.text"
        :type="btn.type"
        @click="btn.handler"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ChildCounter from './ChildCounter.vue'
import CustomButton from './CustomButton.vue'

const parentCount = ref(0)

function handleIncrement(amount) {
  parentCount.value += amount
}

function handleDecrement(amount) {
  parentCount.value -= amount
}

function handleReset() {
  parentCount.value = 0
}

const buttons = [
  { text: '加5', type: 'primary', handler: () => parentCount.value += 5 },
  { text: '减5', type: 'danger', handler: () => parentCount.value -= 5 },
  { text: '清零', type: 'default', handler: () => parentCount.value = 0 }
]
</script>

<style scoped>
.parent {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
  border: 2px solid #42b883;
  border-radius: 8px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
</style>
```

```html
<!-- 子组件 ChildCounter.vue -->
<template>
  <div class="child-counter">
    <h3>子组件计数器</h3>
    <p>接收的计数: {{ count }}</p>
    <p>最大值限制: {{ max }}</p>
    
    <div class="controls">
      <button 
        @click="emit('increment', 1)"
        :disabled="count >= max"
      >
        +1
      </button>
      <button 
        @click="emit('decrement', 1)"
        :disabled="count <= 0"
      >
        -1
      </button>
      <button @click="emit('reset')">重置</button>
    </div>
    
    <p v-if="count >= max" class="warning">已达到最大值！</p>
  </div>
</template>

<script setup>
const props = defineProps({
  count: {
    type: Number,
    required: true
  },
  max: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['increment', 'decrement', 'reset'])
</script>

<style scoped>
.child-counter {
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  margin: 10px 0;
}

.controls {
  display: flex;
  gap: 10px;
  margin: 10px 0;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #42b883;
  color: white;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.warning {
  color: #e74c3c;
  font-weight: bold;
}
</style>
```

```html
<!-- 可复用按钮组件 CustomButton.vue -->
<template>
  <button :class="['custom-btn', type]" @click="emit('click')">
    {{ text }}
  </button>
</template>

<script setup>
const props = defineProps({
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['primary', 'danger', 'default'].includes(value)
  }
})

const emit = defineEmits(['click'])
</script>

<style scoped>
.custom-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
}

.custom-btn:hover {
  opacity: 0.8;
}

.primary {
  background: #42b883;
  color: white;
}

.danger {
  background: #e74c3c;
  color: white;
}

.default {
  background: #95a5a6;
  color: white;
}
</style>
```

#### [场景] 典型应用场景

1. **表单组件** — 父组件传递初始值，子组件 emit 更新事件
2. **列表项组件** — 父组件传递数据，子组件 emit 删除/编辑事件
3. **弹窗组件** — 父组件控制显示，子组件 emit 关闭事件

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的代码质量、排错能力和开发效率将显著提升。

### 1. Composition API

#### [概念] 概念与解决的问题

Composition API 是 Vue 3 引入的新特性，允许使用函数组织组件逻辑。相比 Options API，它解决了逻辑复用困难、代码组织分散的问题。

解决的核心痛点：**逻辑复用**。在 Options API 中，相同功能的代码分散在 data、methods、computed 等选项中，难以提取复用。Composition API 让相关逻辑可以集中在一个函数中。

#### [语法] 核心用法

| 函数 | 用途 | 示例 |
|------|------|------|
| `setup()` | 组合式 API 入口 | `setup(props, context) {}` |
| `<script setup>` | 语法糖 | 自动解包，无需 return |
| 自定义 Hook | 封装可复用逻辑 | `useCounter()` |

#### [代码] 代码示例

```html
<template>
  <div class="demo">
    <h2>Composition API 示例</h2>
    
    <!-- 使用自定义 Hook -->
    <div class="section">
      <p>计数: {{ counter.count }}</p>
      <button @click="counter.increment">+1</button>
      <button @click="counter.decrement">-1</button>
    </div>
    
    <!-- 使用另一个 Hook -->
    <div class="section">
      <input v-model="searchQuery" placeholder="搜索..." />
      <ul>
        <li v-for="item in searchResults" :key="item">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 自定义 Hook：计数器逻辑
function useCounter(initial = 0) {
  const count = ref(initial)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  function reset() {
    count.value = initial
  }
  
  return {
    count,
    increment,
    decrement,
    reset
  }
}

// 自定义 Hook：搜索过滤
function useSearch(items) {
  const query = ref('')
  
  const results = computed(() => {
    if (!query.value) return items.value
    return items.value.filter(item => 
      item.toLowerCase().includes(query.value.toLowerCase())
    )
  })
  
  return {
    query,
    results
  }
}

// 使用 Hooks
const counter = useCounter(0)

const fruits = ref(['苹果', '香蕉', '橙子', '葡萄', '西瓜'])
const { query: searchQuery, results: searchResults } = useSearch(fruits)
</script>

<style scoped>
.demo {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
}

.section {
  margin: 20px 0;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

button {
  margin-right: 10px;
  padding: 8px 16px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 200px;
}

ul {
  margin-top: 10px;
  padding-left: 20px;
}
</style>
```

#### [关联] 与核心层的关联

Composition API 是组织核心层知识的更好方式。使用 `ref`、`reactive` 创建响应式数据，通过自定义 Hook 封装 Props/Emit 逻辑，让代码更易复用。

---

### 2. 生命周期

#### [概念] 概念与解决的问题

生命周期钩子让你可以在组件的不同阶段执行代码。Vue 3 的 Composition API 使用 `onMounted`、`onUnmounted` 等函数替代 Options API 的 `mounted`、`unmounted`。

解决的核心痛点：**副作用管理**。在正确的时机执行初始化、清理操作，避免内存泄漏。

#### [语法] 核心用法

| 钩子函数 | 触发时机 | 用途 |
|------|------|------|
| `onMounted` | 组件挂载后 | DOM 操作、API 请求 |
| `onUpdated` | 组件更新后 | 响应数据变化 |
| `onUnmounted` | 组件卸载后 | 清理定时器、事件监听 |
| `onBeforeMount` | 挂载前 | 最后一次修改数据 |
| `onBeforeUnmount` | 卸载前 | 最后的清理机会 |

#### [代码] 代码示例

```html
<template>
  <div class="lifecycle-demo">
    <h2>生命周期示例</h2>
    
    <div class="section">
      <p>组件已挂载: {{ mounted }}</p>
      <p>更新次数: {{ updateCount }}</p>
      <p>当前时间: {{ currentTime }}</p>
      <button @click="refreshTime">刷新时间</button>
    </div>
    
    <div class="section">
      <h3>用户列表</h3>
      <div v-if="loading">加载中...</div>
      <ul v-else>
        <li v-for="user in users" :key="user.id">
          {{ user.name }}
        </li>
      </ul>
      <button @click="fetchUsers">重新加载</button>
    </div>
    
    <div class="section">
      <h3>窗口尺寸</h3>
      <p>宽度: {{ windowSize.width }}px</p>
      <p>高度: {{ windowSize.height }}px</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUpdated, onUnmounted } from 'vue'

// 基础生命周期
const mounted = ref(false)
const updateCount = ref(0)
const currentTime = ref('')

onMounted(() => {
  mounted.value = true
  console.log('组件已挂载')
  updateTime()
})

onUpdated(() => {
  updateCount.value++
  console.log('组件已更新，次数:', updateCount.value)
})

onUnmounted(() => {
  console.log('组件已卸载')
})

function updateTime() {
  currentTime.value = new Date().toLocaleTimeString()
}

function refreshTime() {
  updateTime()
}

// API 请求示例
const users = ref([])
const loading = ref(false)

async function fetchUsers() {
  loading.value = true
  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    users.value = [
      { id: 1, name: '张三' },
      { id: 2, name: '李四' },
      { id: 3, name: '王五' }
    ]
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})

// 事件监听示例
const windowSize = ref({
  width: window.innerWidth,
  height: window.innerHeight
})

function handleResize() {
  windowSize.value = {
    width: window.innerWidth,
    height: window.innerHeight
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

// 重要：组件卸载时清理事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  console.log('已清理 resize 事件监听')
})
</script>

<style scoped>
.lifecycle-demo {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
}

.section {
  margin: 20px 0;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

button {
  margin-top: 10px;
  padding: 8px 16px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 8px;
  border-bottom: 1px solid #ddd;
}
</style>
```

#### [关联] 与核心层的关联

生命周期钩子用于管理组件的副作用：在 `onMounted` 中初始化响应式数据、发起 API 请求更新 Props 传递的数据。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| Pinia | 需要全局状态管理时使用 |
| Vue Router | 需要路由管理时使用 |
| Vuex | 需要兼容 Vue 2 的状态管理时使用 |
| Teleport | 需要将组件渲染到 DOM 其他位置时使用 |
| Suspense | 需要处理异步组件加载状态时使用 |
| Provide/Inject | 需要跨层级传递数据时使用 |
| 自定义指令 | 需要封装 DOM 操作时使用 |
| 插件开发 | 需要扩展 Vue 功能时使用 |
| SSR | 需要服务端渲染时使用 |
| TypeScript | 需要类型安全时使用 |

---

## [实战] 核心实战清单

### 实战任务 1：可复用的购物车组件

**任务描述：** 使用 Vue 3 Composition API 创建一个完整的购物车组件。

**要求：**
1. 使用 `ref`/`reactive` 管理购物车状态
2. 商品列表作为 Props 传入
3. 使用 `emit` 通知父组件数量变化
4. 使用 `computed` 计算总价
5. 使用自定义 Hook 封装购物车逻辑

**输出：** 一个完整的购物车组件，包含商品列表、数量控制、总价计算功能。
