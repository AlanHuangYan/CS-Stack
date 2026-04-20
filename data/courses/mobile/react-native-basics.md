# React Native 基础 三层深度学习教程

## [总览] 技术总览

React Native 是 Facebook 开发的跨平台移动应用框架，使用 JavaScript/TypeScript 和 React 构建原生移动应用。一套代码可以同时运行在 iOS 和 Android 平台，大幅提高开发效率。

本教程采用三层漏斗学习法：**核心层**聚焦组件开发、样式系统、导航管理三大基石；**重点层**深入原生模块、状态管理、性能优化；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成 React Native 开发 **50% 以上** 的常见任务。

### 1. 组件开发

#### [概念] 概念解释

React Native 组件是构建移动应用 UI 的基础单元。与 React Web 类似，使用声明式语法描述界面，但渲染为原生组件而非 HTML 元素。

#### [语法] 核心语法 / 命令 / API

**核心组件：**

| 组件 | 说明 |
|------|------|
| View | 容器组件 |
| Text | 文本组件 |
| Image | 图片组件 |
| TextInput | 输入框 |
| ScrollView | 滚动容器 |
| FlatList | 高效列表 |

#### [代码] 代码示例

```javascript
// App.js
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView
} from 'react-native';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);

  const addTask = () => {
    if (task.trim()) {
      setTasks([...tasks, { id: Date.now().toString(), title: task }]);
      setTask('');
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskItem}>
      <Text style={styles.taskText}>{item.title}</Text>
      <TouchableOpacity onPress={() => deleteTask(item.id)}>
        <Text style={styles.deleteText}>删除</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>待办事项</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="添加新任务"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity style={styles.button} onPress={addTask}>
          <Text style={styles.buttonText}>添加</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  taskText: {
    fontSize: 16,
  },
  deleteText: {
    color: 'red',
  },
});
```

#### [场景] 典型应用场景

1. 构建表单界面
2. 显示列表数据
3. 处理用户交互

### 2. 样式系统

#### [概念] 概念解释

React Native 使用 StyleSheet 创建样式，类似 CSS 但有一些差异。样式使用 JavaScript 对象定义，支持 Flexbox 布局。

#### [语法] 核心语法 / 命令 / API

**样式属性：**

| 属性 | 说明 |
|------|------|
| flex | 弹性布局 |
| flexDirection | 主轴方向 |
| justifyContent | 主轴对齐 |
| alignItems | 交叉轴对齐 |
| padding/margin | 内外边距 |
| backgroundColor | 背景色 |

#### [代码] 代码示例

```javascript
// styles.js
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

// 响应式样式
export const responsiveStyles = (screenWidth) => StyleSheet.create({
  container: {
    padding: screenWidth > 600 ? 24 : 16,
  },
  grid: {
    flexDirection: screenWidth > 600 ? 'row' : 'column',
  },
});
```

#### [场景] 典型应用场景

1. 创建响应式布局
2. 设计卡片样式
3. 实现主题切换

### 3. 导航管理

#### [概念] 概念解释

React Navigation 是 React Native 最流行的导航库，支持栈导航、标签导航、抽屉导航等多种导航模式。

#### [语法] 核心语法 / 命令 / API

**导航类型：**

| 类型 | 说明 |
|------|------|
| Stack Navigator | 栈式导航 |
| Tab Navigator | 标签导航 |
| Drawer Navigator | 抽屉导航 |

#### [代码] 代码示例

```javascript
// App.js - 导航配置
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// 屏幕
import HomeScreen from './screens/HomeScreen';
import DetailScreen from './screens/DetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: '首页' }}
      />
      <Stack.Screen 
        name="Detail" 
        component={DetailScreen}
        options={{ title: '详情' }}
      />
    </Stack.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'HomeTab') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen 
          name="HomeTab" 
          component={HomeStack}
          options={{ title: '首页', headerShown: false }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: '个人' }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ title: '设置' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;

// DetailScreen.js - 导航传参
import React from 'react';
import { View, Text, Button } from 'react-native';

function DetailScreen({ route, navigation }) {
  const { itemId, title } = route.params;
  
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>详情页面</Text>
      <Text>Item ID: {itemId}</Text>
      <Text>Title: {title}</Text>
      <Button
        title="返回"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}

// 导航传参示例
// navigation.navigate('Detail', { itemId: 123, title: '示例标题' });
```

#### [场景] 典型应用场景

1. 多页面应用导航
2. 底部标签栏
3. 页面间参数传递

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的 React Native 应用质量和性能将显著提升。

### 1. 原生模块

#### [概念] 概念与解决的问题

原生模块允许 JavaScript 代码调用平台原生功能，如相机、蓝牙、推送通知等。通过桥接机制实现 JS 与原生代码通信。

#### [语法] 核心用法

**原生模块调用：**

- 使用 NativeModules API
- 使用第三方原生库
- 创建自定义原生模块

#### [代码] 代码示例

```javascript
// 使用原生模块
import { NativeModules, NativeEventEmitter } from 'react-native';

// 调用原生模块
const { CalendarModule } = NativeModules;

// 调用原生方法
const createEvent = async (title, location) => {
  try {
    const eventId = await CalendarModule.createEvent(title, location);
    console.log(`Created event with ID: ${eventId}`);
    return eventId;
  } catch (e) {
    console.error(e);
  }
};

// 监听原生事件
const eventEmitter = new NativeEventEmitter(CalendarModule);
const subscription = eventEmitter.addListener('EventReminder', (event) => {
  console.log('Event received:', event);
});

// 清理监听
// subscription.remove();
```

```java
// Android 原生模块示例
// CalendarModule.java
package com.example.app;

import android.widget.Toast;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class CalendarModule extends ReactContextBaseJavaModule {
  CalendarModule(ReactApplicationContext context) {
    super(context);
  }

  @Override
  public String getName() {
    return "CalendarModule";
  }

  @ReactMethod
  public void createEvent(String name, String location, Promise promise) {
    try {
      // 原生逻辑处理
      String eventId = "event_" + System.currentTimeMillis();
      promise.resolve(eventId);
    } catch (Exception e) {
      promise.reject("CREATE_EVENT_ERROR", e);
    }
  }
}
```

#### [关联] 与核心层的关联

原生模块是组件开发的扩展，通过桥接机制调用平台特定功能。

### 2. 状态管理

#### [概念] 概念与解决的问题

复杂应用需要统一的状态管理方案。Redux、MobX、Zustand 等状态管理库帮助管理全局状态，实现组件间状态共享。

#### [语法] 核心用法

**状态管理方案：**

- Context API + useReducer
- Redux Toolkit
- Zustand

#### [代码] 代码示例

```javascript
// 使用 Zustand 状态管理
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 创建 store
const useStore = create(
  persist(
    (set, get) => ({
      // 状态
      user: null,
      tasks: [],
      
      // 操作
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
      
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, { id: Date.now(), ...task }]
      })),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),
      
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map(t =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      })),
    }),
    { name: 'app-storage' }
  )
);

// 在组件中使用
function TaskList() {
  const { tasks, addTask, deleteTask, toggleTask } = useStore();
  
  return (
    <FlatList
      data={tasks}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => toggleTask(item.id)}>
          <Text style={{ 
            textDecorationLine: item.completed ? 'line-through' : 'none' 
          }}>
            {item.title}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}
```

#### [场景] 典型应用场景

1. 用户认证状态管理
2. 购物车状态
3. 应用配置管理

### 3. 性能优化

#### [概念] 概念与解决的问题

React Native 应用性能优化包括列表优化、渲染优化、内存管理等方面。合理的优化可以提升用户体验。

#### [语法] 核心用法

**优化策略：**

| 策略 | 说明 |
|------|------|
| React.memo | 组件记忆化 |
| useMemo/useCallback | 值/函数缓存 |
| FlatList 优化 | 列表性能优化 |
| InteractionManager | 延迟执行 |

#### [代码] 代码示例

```javascript
// 性能优化示例
import React, { memo, useMemo, useCallback } from 'react';
import { FlatList, TouchableOpacity, Text } from 'react-native';

// 使用 memo 优化组件
const TaskItem = memo(({ task, onPress }) => {
  console.log('Rendering TaskItem:', task.id);
  
  return (
    <TouchableOpacity onPress={() => onPress(task.id)}>
      <Text>{task.title}</Text>
    </TouchableOpacity>
  );
});

function TaskList({ tasks, onTaskPress }) {
  // 使用 useCallback 缓存回调
  const handlePress = useCallback((id) => {
    onTaskPress(id);
  }, [onTaskPress]);
  
  // 使用 useMemo 缓存计算结果
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => a.title.localeCompare(b.title));
  }, [tasks]);
  
  // FlatList 优化配置
  const renderItem = useCallback(({ item }) => (
    <TaskItem task={item} onPress={handlePress} />
  ), [handlePress]);
  
  const keyExtractor = useCallback((item) => item.id.toString(), []);
  
  const getItemLayout = useCallback((data, index) => ({
    length: 50,
    offset: 50 * index,
    index,
  }), []);
  
  return (
    <FlatList
      data={sortedTasks}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
}
```

#### [场景] 典型应用场景

1. 长列表性能优化
2. 频繁更新组件优化
3. 启动速度优化

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| Hermes | 需要使用新 JS 引擎时 |
| CodePush | 需要热更新时 |
| Fast Refresh | 需要快速开发调试时 |
| Debugging | 需要调试应用时 |
| Testing | 需要测试应用时 |
| Animation | 需要动画效果时 |
| Gesture Handler | 需要手势交互时 |
| Reanimated | 需要高性能动画时 |
| AsyncStorage | 需要本地存储时 |
| Push Notification | 需要推送通知时 |

---

## [实战] 核心实战清单

### 实战任务 1：构建一个完整的待办事项应用

**任务描述：**
使用 React Native 构建一个待办事项应用，支持添加、删除、标记完成功能，使用状态管理和本地存储。

**要求：**
- 使用 React Navigation 实现导航
- 使用 Zustand 管理状态
- 使用 AsyncStorage 持久化数据
- 实现完整的 CRUD 操作

**参考实现：**

```javascript
// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import AddTaskScreen from './screens/AddTaskScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddTask" component={AddTaskScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// store.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useTaskStore = create(
  persist(
    (set) => ({
      tasks: [],
      addTask: (title) => set((state) => ({
        tasks: [...state.tasks, {
          id: Date.now().toString(),
          title,
          completed: false,
          createdAt: new Date().toISOString()
        }]
      })),
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map(t =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      }))
    }),
    { name: 'task-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);
```
