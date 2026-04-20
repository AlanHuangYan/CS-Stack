# React 基础 三层深度学习教程

## [总览] 技术总览

React 是一个用于构建用户界面的 JavaScript 库，由 Facebook 开发维护。它采用组件化思想和声明式编程，通过虚拟 DOM 实现高效的页面更新，是现代前端开发的主流框架之一。

本教程采用三层漏斗学习法：**核心层**聚焦组件与 JSX、Props、State 三大基石；**重点层**深入 useEffect、事件处理和条件渲染；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成 React 开发 **50% 以上** 的常见任务。

### 1. 组件与 JSX

#### [概念] 概念解释

组件是 React 的基本构建块，将 UI 拆分为独立、可复用的部分。JSX 是 JavaScript 的语法扩展，允许在 JavaScript 中编写类似 HTML 的代码，最终会被编译为 React.createElement 调用。

#### [语法] 核心语法 / 命令 / API

**组件类型：**

| 类型 | 说明 | 特点 |
|------|------|------|
| 函数组件 | 使用函数定义 | 推荐，支持 Hooks |
| 类组件 | 使用 class 定义 | 传统方式，有生命周期 |

**JSX 规则：**

| 规则 | 说明 |
|------|------|
| 单根节点 | JSX 必须有一个根元素 |
| 闭合标签 | 所有标签必须闭合 |
| 驼峰命名 | HTML 属性转为驼峰命名 |
| JavaScript 表达式 | 使用 {} 插入表达式 |

#### [代码] 代码示例

```jsx
// 基本函数组件
function Welcome() {
    return <h1>Hello, React!</h1>;
}

// 箭头函数组件
const Greeting = () => {
    return <h2>Welcome to React</h2>;
};

// 带返回括号的组件
const Card = () => (
    <div className="card">
        <h3>Card Title</h3>
        <p>Card content</p>
    </div>
);

// JSX 中使用 JavaScript 表达式
const UserCard = () => {
    const name = "Alice";
    const age = 25;
    const isAdmin = true;
    
    return (
        <div className="user-card">
            <h2>{name}</h2>
            <p>Age: {age}</p>
            <p>Role: {isAdmin ? "Admin" : "User"}</p>
            <p>Next year: {age + 1}</p>
        </div>
    );
};

// JSX 中使用数组
const TodoList = () => {
    const todos = ["Learn React", "Build App", "Deploy"];
    
    return (
        <ul>
            {todos.map((todo, index) => (
                <li key={index}>{todo}</li>
            ))}
        </ul>
    );
};

// 条件渲染
const StatusBadge = ({ isActive }) => {
    return (
        <span className={isActive ? "badge-active" : "badge-inactive"}>
            {isActive ? "Active" : "Inactive"}
        </span>
    );
};

// 组件组合
const Header = () => <header><h1>My App</h1></header>;

const Footer = () => <footer><p>Copyright 2024</p></footer>;

const Layout = ({ children }) => (
    <div className="layout">
        <Header />
        <main>{children}</main>
        <Footer />
    </div>
);

const App = () => (
    <Layout>
        <UserCard />
        <TodoList />
    </Layout>
);

// 内联样式
const StyledButton = () => {
    const buttonStyle = {
        backgroundColor: "#007bff",
        color: "white",
        padding: "10px 20px",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
    };
    
    return <button style={buttonStyle}>Click Me</button>;
};

// Fragment 使用
const FragmentExample = () => (
    <>
        <h1>Title</h1>
        <p>Paragraph</p>
    </>
);

// 完整示例：Todo 应用组件
import { useState } from 'react';

function TodoApp() {
    const [todos, setTodos] = useState([
        { id: 1, text: "Learn React", completed: false },
        { id: 2, text: "Build App", completed: true }
    ]);
    const [inputValue, setInputValue] = useState("");

    const addTodo = () => {
        if (inputValue.trim()) {
            setTodos([
                ...todos,
                { id: Date.now(), text: inputValue, completed: false }
            ]);
            setInputValue("");
        }
    };

    const toggleTodo = (id) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    const deleteTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    return (
        <div className="todo-app">
            <h1>Todo List</h1>
            <div className="todo-input">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Add a todo..."
                />
                <button onClick={addTodo}>Add</button>
            </div>
            <ul className="todo-list">
                {todos.map(todo => (
                    <li key={todo.id} className={todo.completed ? "completed" : ""}>
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo.id)}
                        />
                        <span>{todo.text}</span>
                        <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TodoApp;
```

#### [场景] 典型应用场景

1. 页面组件：将页面拆分为 Header、Content、Footer 等组件
2. UI 组件：按钮、卡片、表单等可复用组件
3. 列表渲染：使用 map 渲染数据列表

### 2. Props

#### [概念] 概念解释

Props（属性）是组件的输入参数，用于父组件向子组件传递数据。Props 是只读的，子组件不应该修改接收到的 props。

#### [语法] 核心语法 / 命令 / API

**Props 特点：**

| 特点 | 说明 |
|------|------|
| 只读性 | 子组件不能修改 props |
| 单向数据流 | 数据从父组件流向子组件 |
| 任意类型 | 可以传递任何 JavaScript 值 |

#### [代码] 代码示例

```jsx
// 基本 Props
const Greeting = (props) => {
    return <h1>Hello, {props.name}!</h1>;
};

// 使用
<Greeting name="Alice" />

// 解构 Props
const UserCard = ({ name, age, email }) => {
    return (
        <div className="user-card">
            <h2>{name}</h2>
            <p>Age: {age}</p>
            <p>Email: {email}</p>
        </div>
    );
};

// 默认 Props
const Button = ({ text = "Click", color = "blue" }) => {
    return (
        <button style={{ backgroundColor: color }}>
            {text}
        </button>
    );
};

// 传递多个 Props
const ProductCard = ({ product }) => {
    const { name, price, description, image } = product;
    
    return (
        <div className="product-card">
            <img src={image} alt={name} />
            <h3>{name}</h3>
            <p>{description}</p>
            <p className="price">${price}</p>
        </div>
    );
};

// Props.children
const Card = ({ title, children }) => {
    return (
        <div className="card">
            <div className="card-header">
                <h3>{title}</h3>
            </div>
            <div className="card-body">
                {children}
            </div>
        </div>
    );
};

// 使用 children
<Card title="User Profile">
    <p>Name: Alice</p>
    <p>Email: alice@example.com</p>
</Card>

// 函数作为 Props
const Button = ({ onClick, children }) => {
    return <button onClick={onClick}>{children}</button>;
};

const Counter = () => {
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <p>Count: {count}</p>
            <Button onClick={() => setCount(count + 1)}>
                Increment
            </Button>
        </div>
    );
};

// 条件渲染 Props
const Message = ({ type = "info", children }) => {
    const styles = {
        info: { backgroundColor: "#d1ecf1", color: "#0c5460" },
        success: { backgroundColor: "#d4edda", color: "#155724" },
        error: { backgroundColor: "#f8d7da", color: "#721c24" }
    };
    
    return (
        <div style={styles[type]}>
            {children}
        </div>
    );
};

// 渲染 Props 模式
const MouseTracker = ({ render }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    
    const handleMouseMove = (e) => {
        setPosition({ x: e.clientX, y: e.clientY });
    };
    
    return (
        <div onMouseMove={handleMouseMove}>
            {render(position)}
        </div>
    );
};

// 使用渲染 Props
<MouseTracker
    render={({ x, y }) => (
        <p>Mouse position: {x}, {y}</p>
    )}
/>

// Props 类型检查（使用 PropTypes）
import PropTypes from 'prop-types';

const UserProfile = ({ name, age, hobbies, onEdit }) => {
    return (
        <div>
            <h2>{name}</h2>
            <p>Age: {age}</p>
            <ul>
                {hobbies.map(hobby => <li key={hobby}>{hobby}</li>)}
            </ul>
            <button onClick={onEdit}>Edit Profile</button>
        </div>
    );
};

UserProfile.propTypes = {
    name: PropTypes.string.isRequired,
    age: PropTypes.number,
    hobbies: PropTypes.arrayOf(PropTypes.string),
    onEdit: PropTypes.func
};

UserProfile.defaultProps = {
    age: 0,
    hobbies: [],
    onEdit: () => {}
};

// 完整示例：可复用列表组件
const List = ({ items, renderItem, keyExtractor, emptyMessage = "No items" }) => {
    if (items.length === 0) {
        return <p className="empty-message">{emptyMessage}</p>;
    }
    
    return (
        <ul className="list">
            {items.map(item => (
                <li key={keyExtractor(item)}>
                    {renderItem(item)}
                </li>
            ))}
        </ul>
    );
};

// 使用
const UserList = () => {
    const users = [
        { id: 1, name: "Alice", email: "alice@example.com" },
        { id: 2, name: "Bob", email: "bob@example.com" }
    ];
    
    return (
        <List
            items={users}
            keyExtractor={user => user.id}
            renderItem={user => (
                <div>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                </div>
            )}
            emptyMessage="No users found"
        />
    );
};
```

#### [场景] 典型应用场景

1. 数据传递：父组件向子组件传递数据
2. 事件回调：子组件通过 props 回调通知父组件
3. 组件复用：通过 props 配置组件行为

### 3. State

#### [概念] 概念解释

State 是组件内部的状态数据，当 state 改变时，组件会重新渲染。State 是私有的，完全由组件自己控制。

#### [语法] 核心语法 / 命令 / API

**useState Hook：**

```jsx
const [state, setState] = useState(initialValue);
```

**State 更新规则：**

| 规则 | 说明 |
|------|------|
| 不可变更新 | 不要直接修改 state |
| 异步更新 | setState 是异步的 |
| 批量更新 | 多次 setState 会合并 |
| 函数式更新 | 基于前一个状态更新 |

#### [代码] 代码示例

```jsx
import { useState } from 'react';

// 基本 State
const Counter = () => {
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <button onClick={() => setCount(count - 1)}>Decrement</button>
            <button onClick={() => setCount(0)}>Reset</button>
        </div>
    );
};

// 对象 State
const UserForm = () => {
    const [user, setUser] = useState({
        name: "",
        email: "",
        age: 0
    });
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    return (
        <form>
            <input
                name="name"
                value={user.name}
                onChange={handleChange}
                placeholder="Name"
            />
            <input
                name="email"
                value={user.email}
                onChange={handleChange}
                placeholder="Email"
            />
            <input
                name="age"
                type="number"
                value={user.age}
                onChange={handleChange}
                placeholder="Age"
            />
        </form>
    );
};

// 数组 State
const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState("");
    
    const addTodo = () => {
        if (input.trim()) {
            setTodos(prev => [...prev, { id: Date.now(), text: input }]);
            setInput("");
        }
    };
    
    const removeTodo = (id) => {
        setTodos(prev => prev.filter(todo => todo.id !== id));
    };
    
    const toggleTodo = (id) => {
        setTodos(prev => prev.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };
    
    return (
        <div>
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={addTodo}>Add</button>
            <ul>
                {todos.map(todo => (
                    <li key={todo.id}>
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo.id)}
                        />
                        <span style={{
                            textDecoration: todo.completed ? "line-through" : "none"
                        }}>
                            {todo.text}
                        </span>
                        <button onClick={() => removeTodo(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// 函数式更新
const Counter = () => {
    const [count, setCount] = useState(0);
    
    const incrementThree = () => {
        setCount(prev => prev + 1);
        setCount(prev => prev + 1);
        setCount(prev => prev + 1);
    };
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={incrementThree}>+3</button>
        </div>
    );
};

// 惰性初始化
const ExpensiveComponent = () => {
    const [data, setData] = useState(() => {
        console.log("Computing initial state...");
        return expensiveComputation();
    });
    
    return <div>{data}</div>;
};

function expensiveComputation() {
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
        result += i;
    }
    return result;
}

// 完整示例：购物车
const ShoppingCart = () => {
    const [cart, setCart] = useState([]);
    const [products] = useState([
        { id: 1, name: "Laptop", price: 999 },
        { id: 2, name: "Phone", price: 699 },
        { id: 3, name: "Tablet", price: 499 }
    ]);
    
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };
    
    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };
    
    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prev => prev.map(item =>
            item.id === productId ? { ...item, quantity } : item
        ));
    };
    
    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    
    return (
        <div className="shopping-cart">
            <div className="products">
                <h2>Products</h2>
                {products.map(product => (
                    <div key={product.id} className="product">
                        <span>{product.name} - ${product.price}</span>
                        <button onClick={() => addToCart(product)}>
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="cart">
                <h2>Cart</h2>
                {cart.length === 0 ? (
                    <p>Cart is empty</p>
                ) : (
                    <>
                        {cart.map(item => (
                            <div key={item.id} className="cart-item">
                                <span>{item.name}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                <span>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                <span>${item.price * item.quantity}</span>
                                <button onClick={() => removeFromCart(item.id)}>Remove</button>
                            </div>
                        ))}
                        <div className="total">
                            <strong>Total: ${total}</strong>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
```

#### [场景] 典型应用场景

1. 表单状态：管理用户输入
2. 列表数据：管理动态列表
3. UI 状态：管理加载、展开/折叠等状态

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的 React 开发能力将显著提升，能够处理更复杂的场景。

### 1. useEffect

#### [概念] 概念与解决的问题

useEffect 用于处理副作用，如数据获取、订阅、DOM 操作等。它在组件渲染后执行，可以替代类组件的生命周期方法。

#### [语法] 核心用法

**useEffect 形式：**

| 形式 | 说明 |
|------|------|
| useEffect(fn) | 每次渲染后执行 |
| useEffect(fn, []) | 仅组件挂载时执行 |
| useEffect(fn, [dep]) | 依赖变化时执行 |

#### [代码] 代码示例

```jsx
import { useState, useEffect } from 'react';

// 每次渲染后执行
const Logger = () => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        console.log("Component rendered");
    });
    
    return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
};

// 仅挂载时执行
const DataLoader = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetch("/api/data")
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            });
    }, []);
    
    if (loading) return <div>Loading...</div>;
    return <div>{JSON.stringify(data)}</div>;
};

// 依赖变化时执行
const UserProfile = ({ userId }) => {
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        fetch(`/api/users/${userId}`)
            .then(res => res.json())
            .then(setUser);
    }, [userId]);
    
    if (!user) return <div>Loading...</div>;
    return <div>{user.name}</div>;
};

// 清理函数
const Timer = () => {
    const [seconds, setSeconds] = useState(0);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);
        
        return () => clearInterval(interval);
    }, []);
    
    return <div>Seconds: {seconds}</div>;
};

// 事件监听
const MouseTracker = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    
    useEffect(() => {
        const handleMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };
        
        window.addEventListener("mousemove", handleMouseMove);
        
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);
    
    return (
        <div>
            Mouse: {position.x}, {position.y}
        </div>
    );
};

// 多个 useEffect
const UserProfile = ({ userId }) => {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    
    useEffect(() => {
        fetch(`/api/users/${userId}`)
            .then(res => res.json())
            .then(setUser);
    }, [userId]);
    
    useEffect(() => {
        fetch(`/api/users/${userId}/posts`)
            .then(res => res.json())
            .then(setPosts);
    }, [userId]);
    
    if (!user) return <div>Loading...</div>;
    
    return (
        <div>
            <h1>{user.name}</h1>
            <ul>
                {posts.map(post => (
                    <li key={post.id}>{post.title}</li>
                ))}
            </ul>
        </div>
    );
};

// 自定义 Hook
const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        setLoading(true);
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error("Network error");
                return res.json();
            })
            .then(data => {
                setData(data);
                setError(null);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [url]);
    
    return { data, loading, error };
};

// 使用自定义 Hook
const UserList = () => {
    const { data: users, loading, error } = useFetch("/api/users");
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
        <ul>
            {users.map(user => (
                <li key={user.id}>{user.name}</li>
            ))}
        </ul>
    );
};

// 完整示例：实时搜索
const SearchUsers = () => {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        if (!query.trim()) {
            setUsers([]);
            return;
        }
        
        setLoading(true);
        const timeoutId = setTimeout(() => {
            fetch(`/api/users/search?q=${query}`)
                .then(res => res.json())
                .then(data => {
                    setUsers(data);
                    setLoading(false);
                });
        }, 300);
        
        return () => clearTimeout(timeoutId);
    }, [query]);
    
    return (
        <div>
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users..."
            />
            {loading && <div>Searching...</div>}
            <ul>
                {users.map(user => (
                    <li key={user.id}>{user.name}</li>
                ))}
            </ul>
        </div>
    );
};
```

#### [关联] 与核心层的关联

useEffect 与 state 配合使用，在 state 变化时执行副作用操作，是 React 数据流的重要组成部分。

### 2. 事件处理

#### [概念] 概念与解决的问题

React 事件处理与原生 DOM 事件类似，但有一些语法差异。理解事件处理机制对于构建交互式应用至关重要。

#### [语法] 核心用法

**事件命名规则：**

| 原生事件 | React 事件 |
|----------|-----------|
| onclick | onClick |
| onchange | onChange |
| onsubmit | onSubmit |

#### [代码] 代码示例

```jsx
// 基本事件处理
const Button = () => {
    const handleClick = () => {
        console.log("Button clicked");
    };
    
    return <button onClick={handleClick}>Click Me</button>;
};

// 传递参数
const ItemList = () => {
    const items = ["Apple", "Banana", "Orange"];
    
    const handleItemClick = (item, index) => {
        console.log(`Clicked ${item} at index ${index}`);
    };
    
    return (
        <ul>
            {items.map((item, index) => (
                <li key={item}>
                    <button onClick={() => handleItemClick(item, index)}>
                        {item}
                    </button>
                </li>
            ))}
        </ul>
    );
};

// 使用事件对象
const Form = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted");
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="username" />
            <button type="submit">Submit</button>
        </form>
    );
};

// 输入处理
const InputForm = () => {
    const [value, setValue] = useState("");
    
    const handleChange = (e) => {
        setValue(e.target.value);
    };
    
    return (
        <input
            value={value}
            onChange={handleChange}
            placeholder="Type something..."
        />
    );
};

// 多输入处理
const MultiInputForm = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    });
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form data:", formData);
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
            />
            <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
            />
            <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
            />
            <button type="submit">Register</button>
        </form>
    );
};

// 键盘事件
const KeyboardDemo = () => {
    const [lastKey, setLastKey] = useState("");
    
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            console.log("Enter pressed");
        }
        setLastKey(e.key);
    };
    
    return (
        <div>
            <input onKeyDown={handleKeyDown} placeholder="Press keys..." />
            <p>Last key: {lastKey}</p>
        </div>
    );
};

// 鼠标事件
const MouseDemo = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    
    const handleMouseMove = (e) => {
        setPosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleClick = (e) => {
        console.log(`Clicked at ${e.clientX}, ${e.clientY}`);
    };
    
    return (
        <div
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            style={{ height: "200px", border: "1px solid black" }}
        >
            <p>Position: {position.x}, {position.y}</p>
        </div>
    );
};

// 事件委托
const TodoList = ({ todos, onToggle, onDelete }) => {
    const handleClick = (e) => {
        const id = e.target.dataset.id;
        const action = e.target.dataset.action;
        
        if (action === "toggle") {
            onToggle(Number(id));
        } else if (action === "delete") {
            onDelete(Number(id));
        }
    };
    
    return (
        <ul onClick={handleClick}>
            {todos.map(todo => (
                <li key={todo.id}>
                    <span
                        data-id={todo.id}
                        data-action="toggle"
                        style={{ cursor: "pointer" }}
                    >
                        {todo.completed ? "[x]" : "[ ]"} {todo.text}
                    </span>
                    <button data-id={todo.id} data-action="delete">
                        Delete
                    </button>
                </li>
            ))}
        </ul>
    );
};

// 阻止默认行为
const Link = ({ href, children }) => {
    const handleClick = (e) => {
        e.preventDefault();
        console.log(`Navigating to ${href}`);
    };
    
    return (
        <a href={href} onClick={handleClick}>
            {children}
        </a>
    );
};
```

#### [关联] 与核心层的关联

事件处理是组件交互的核心，通过事件更新 state，触发组件重新渲染。

### 3. 条件渲染

#### [概念] 概念与解决的问题

条件渲染允许根据不同条件显示不同的 UI。React 提供了多种条件渲染方式，选择合适的方式可以提高代码可读性。

#### [语法] 核心用法

**条件渲染方式：**

| 方式 | 说明 | 使用场景 |
|------|------|----------|
| if 语句 | 完整的条件逻辑 | 复杂条件 |
| 三元运算符 | 简洁的条件表达式 | 二选一 |
| 逻辑与 | 条件为真时渲染 | 可选渲染 |

#### [代码] 代码示例

```jsx
// if 语句
const UserGreeting = ({ user }) => {
    if (!user) {
        return <p>Please log in</p>;
    }
    
    return <p>Welcome, {user.name}!</p>;
};

// 三元运算符
const StatusBadge = ({ isActive }) => {
    return (
        <span className={isActive ? "active" : "inactive"}>
            {isActive ? "Active" : "Inactive"}
        </span>
    );
};

// 逻辑与
const Notification = ({ message }) => {
    return (
        <div>
            {message && <div className="alert">{message}</div>}
        </div>
    );
};

// 多条件
const GradeDisplay = ({ score }) => {
    let grade;
    
    if (score >= 90) {
        grade = "A";
    } else if (score >= 80) {
        grade = "B";
    } else if (score >= 70) {
        grade = "C";
    } else if (score >= 60) {
        grade = "D";
    } else {
        grade = "F";
    }
    
    return <p>Grade: {grade}</p>;
};

// 使用对象映射
const StatusIcon = ({ status }) => {
    const icons = {
        success: "✓",
        warning: "⚠",
        error: "✗",
        info: "ℹ"
    };
    
    return <span>{icons[status] || "?"}</span>;
};

// 短路求值
const LoadingButton = ({ loading, onClick, children }) => {
    return (
        <button onClick={onClick} disabled={loading}>
            {loading && <span className="spinner" />}
            {children}
        </button>
    );
};

// 立即执行函数
const ComplexCondition = ({ user, permissions }) => {
    return (
        <div>
            {(() => {
                if (!user) return <p>Please log in</p>;
                if (!permissions.canView) return <p>Access denied</p>;
                return <p>Welcome, {user.name}!</p>;
            })()}
        </div>
    );
};

// 子组件条件渲染
const AuthWrapper = ({ user, fallback, children }) => {
    if (!user) {
        return fallback || <p>Please log in</p>;
    }
    return children;
};

// 使用
<AuthWrapper user={currentUser} fallback={<LoginForm />}>
    <Dashboard />
</AuthWrapper>

// 完整示例：权限控制
const PermissionGate = ({ user, permission, children, fallback }) => {
    const hasPermission = user?.permissions?.includes(permission);
    
    if (!user) {
        return <p>Please log in</p>;
    }
    
    if (!hasPermission) {
        return fallback || <p>Access denied</p>;
    }
    
    return children;
};

const AdminPanel = ({ user }) => {
    return (
        <div>
            <h1>Admin Panel</h1>
            
            <PermissionGate user={user} permission="view_users">
                <UserManagement />
            </PermissionGate>
            
            <PermissionGate user={user} permission="edit_settings" fallback={<p>Read only</p>}>
                <SettingsEditor />
            </PermissionGate>
        </div>
    );
};

// 列表条件渲染
const UserList = ({ users, loading, error }) => {
    if (loading) {
        return <div>Loading users...</div>;
    }
    
    if (error) {
        return <div>Error: {error.message}</div>;
    }
    
    if (!users || users.length === 0) {
        return <div>No users found</div>;
    }
    
    return (
        <ul>
            {users.map(user => (
                <li key={user.id}>{user.name}</li>
            ))}
        </ul>
    );
};
```

#### [关联] 与核心层的关联

条件渲染与 state 紧密结合，根据 state 的不同值显示不同的 UI。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| useContext | 需要跨组件共享状态 |
| useReducer | 需要复杂状态管理 |
| useCallback | 需要缓存函数引用 |
| useMemo | 需要缓存计算结果 |
| useRef | 需要访问 DOM 或保存可变值 |
| React.memo | 需要组件记忆化优化 |
| useLayoutEffect | 需要在 DOM 更新后同步执行 |
| useImperativeHandle | 需要暴露组件方法给父组件 |
| useId | 需要生成唯一 ID |
| useTransition | 需要非阻塞状态更新 |
| useDeferredValue | 需要延迟更新值 |
| Error Boundary | 需要捕获子组件错误 |
| Suspense | 需要等待异步组件加载 |
| Lazy Loading | 需要懒加载组件 |
| Portal | 需要将子节点渲染到其他 DOM 节点 |

---

## [实战] 核心实战清单

### 实战任务 1：实现一个完整的 Todo 应用

**任务描述：**

创建一个功能完整的 Todo 应用，包括：
1. 添加、编辑、删除任务
2. 标记完成状态
3. 过滤显示（全部/进行中/已完成）
4. 本地存储持久化

**要求：**
- 使用 useState 管理状态
- 使用 useEffect 实现本地存储
- 使用条件渲染实现过滤功能

**参考实现：**

```jsx
import { useState, useEffect } from 'react';

function TodoApp() {
    const [todos, setTodos] = useState(() => {
        const saved = localStorage.getItem('todos');
        return saved ? JSON.parse(saved) : [];
    });
    const [inputValue, setInputValue] = useState('');
    const [filter, setFilter] = useState('all');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    useEffect(() => {
        localStorage.setItem('todos', JSON.stringify(todos));
    }, [todos]);

    const addTodo = () => {
        if (inputValue.trim()) {
            setTodos([
                ...todos,
                {
                    id: Date.now(),
                    text: inputValue.trim(),
                    completed: false,
                    createdAt: new Date().toISOString()
                }
            ]);
            setInputValue('');
        }
    };

    const toggleTodo = (id) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    const deleteTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    const startEdit = (todo) => {
        setEditingId(todo.id);
        setEditText(todo.text);
    };

    const saveEdit = () => {
        if (editText.trim()) {
            setTodos(todos.map(todo =>
                todo.id === editingId ? { ...todo, text: editText.trim() } : todo
            ));
        }
        setEditingId(null);
        setEditText('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditText('');
    };

    const clearCompleted = () => {
        setTodos(todos.filter(todo => !todo.completed));
    };

    const filteredTodos = todos.filter(todo => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
    });

    const remainingCount = todos.filter(todo => !todo.completed).length;

    return (
        <div className="todo-app">
            <h1>Todo List</h1>
            
            <div className="todo-input">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                    placeholder="What needs to be done?"
                />
                <button onClick={addTodo}>Add</button>
            </div>

            <div className="filters">
                <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button
                    className={filter === 'active' ? 'active' : ''}
                    onClick={() => setFilter('active')}
                >
                    Active
                </button>
                <button
                    className={filter === 'completed' ? 'active' : ''}
                    onClick={() => setFilter('completed')}
                >
                    Completed
                </button>
            </div>

            <ul className="todo-list">
                {filteredTodos.map(todo => (
                    <li key={todo.id} className={todo.completed ? 'completed' : ''}>
                        {editingId === todo.id ? (
                            <div className="edit-form">
                                <input
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                                />
                                <button onClick={saveEdit}>Save</button>
                                <button onClick={cancelEdit}>Cancel</button>
                            </div>
                        ) : (
                            <>
                                <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    onChange={() => toggleTodo(todo.id)}
                                />
                                <span>{todo.text}</span>
                                <button onClick={() => startEdit(todo)}>Edit</button>
                                <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>

            {todos.length > 0 && (
                <div className="todo-footer">
                    <span>{remainingCount} items left</span>
                    {todos.some(todo => todo.completed) && (
                        <button onClick={clearCompleted}>Clear completed</button>
                    )}
                </div>
            )}
        </div>
    );
}

export default TodoApp;
```
