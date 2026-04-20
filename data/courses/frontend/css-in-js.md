# CSS-in-JS 三层深度学习教程

## [总览] 技术总览

CSS-in-JS 是一种将 CSS 写在 JavaScript 中的技术方案，通过 JavaScript 管理样式，实现组件级样式隔离、动态样式、主题切换等高级功能。Styled Components 是最流行的 CSS-in-JS 库之一，广泛应用于 React 项目。

本教程采用三层漏斗学习法：**核心层**聚焦 Styled Components、动态样式、全局样式三大基石，掌握后即可完成 50% 以上的样式开发任务；**重点层**深入主题系统和样式继承，提升设计系统构建能力；**扩展层**仅作关键词索引，供后续按需查阅。

学习策略：先精通核心层（必须动手敲代码），再理解重点层原理，扩展层建立索引即可。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成该技术 **50% 以上** 的常见任务。

### 1. Styled Components

#### [概念] 概念解释

Styled Components 是一个 CSS-in-JS 库，允许使用标签模板字符串编写 CSS，创建带有样式的 React 组件。每个组件有唯一的类名，实现样式隔离。

为什么归为核心层？Styled Components 是 React 生态中最流行的样式方案之一，不理解它就无法参与许多现代 React 项目。

#### [语法] 核心语法 / 命令 / API

| API | 用途 | 示例 |
|------|------|------|
| `styled.tag` | 创建样式化组件 | `styled.button` |
| `styled(Component)` | 样式化已有组件 | `styled(CustomButton)` |
| `attrs` | 添加默认属性 | `styled.input.attrs({ type: 'text' })` |

#### [代码] 代码示例

```jsx
// Button.jsx
import styled from 'styled-components';

// 基础按钮
const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// 主要按钮
export const PrimaryButton = styled(Button)`
  background-color: #3498db;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #2980b9;
  }
`;

// 次要按钮
export const SecondaryButton = styled(Button)`
  background-color: #2ecc71;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #27ae60;
  }
`;

// 边框按钮
export const OutlineButton = styled(Button)`
  background-color: transparent;
  border: 2px solid #3498db;
  color: #3498db;
  
  &:hover:not(:disabled) {
    background-color: #3498db;
    color: white;
  }
`;

// 文字按钮
export const TextButton = styled(Button)`
  background-color: transparent;
  color: #3498db;
  
  &:hover:not(:disabled) {
    background-color: rgba(52, 152, 219, 0.1);
  }
`;

// 使用示例
function App() {
  return (
    <div>
      <PrimaryButton>主要按钮</PrimaryButton>
      <SecondaryButton>次要按钮</SecondaryButton>
      <OutlineButton>边框按钮</OutlineButton>
      <TextButton>文字按钮</TextButton>
      <PrimaryButton disabled>禁用按钮</PrimaryButton>
    </div>
  );
}
```

```jsx
// Card.jsx
import styled from 'styled-components';

// 卡片容器
const CardContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }
`;

// 卡片图片
export const CardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

// 卡片内容
export const CardContent = styled.div`
  padding: 20px;
`;

// 卡片标题
export const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
`;

// 卡片描述
export const CardDescription = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
`;

// 卡片底部
export const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #eee;
`;

// 组合使用
export function Card({ image, title, description, children }) {
  return (
    <CardContainer>
      {image && <CardImage src={image} alt={title} />}
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {children}
      </CardContent>
    </CardContainer>
  );
}
```

#### [场景] 典型应用场景

1. **React 组件库** — 创建可复用的 UI 组件
2. **设计系统** — 构建统一的设计语言
3. **动态主题** — 实现主题切换功能

---

### 2. 动态样式

#### [概念] 概念解释

动态样式是指根据组件 props 动态改变样式。Styled Components 通过在模板字符串中插入函数实现动态样式。

为什么归为核心层？动态样式是 CSS-in-JS 的核心优势，让样式可以根据状态、数据动态变化。

#### [语法] 核心语法 / 命令 / API

```jsx
const Component = styled.tag`
  property: ${props => props.value ? 'a' : 'b'};
`;
```

#### [代码] 代码示例

```jsx
// DynamicButton.jsx
import styled, { css } from 'styled-components';

// 定义尺寸变体
const sizeStyles = {
  sm: css`
    padding: 6px 12px;
    font-size: 14px;
  `,
  md: css`
    padding: 10px 20px;
    font-size: 16px;
  `,
  lg: css`
    padding: 14px 28px;
    font-size: 18px;
  `,
};

// 定义颜色变体
const variantStyles = {
  primary: css`
    background-color: #3498db;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #2980b9;
    }
  `,
  success: css`
    background-color: #2ecc71;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #27ae60;
    }
  `,
  danger: css`
    background-color: #e74c3c;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #c0392b;
    }
  `,
  warning: css`
    background-color: #f39c12;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #d68910;
    }
  `,
};

// 动态按钮组件
export const DynamicButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  // 动态尺寸
  ${props => sizeStyles[props.$size || 'md']}
  
  // 动态变体
  ${props => variantStyles[props.$variant || 'primary']}
  
  // 动态宽度
  ${props => props.$fullWidth && css`
    width: 100%;
  `}
  
  // 动态圆角
  ${props => props.$rounded && css`
    border-radius: 9999px;
  `}
  
  // 禁用状态
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 使用示例
function ButtonDemo() {
  return (
    <div>
      {/* 不同尺寸 */}
      <DynamicButton $size="sm">小按钮</DynamicButton>
      <DynamicButton $size="md">中按钮</DynamicButton>
      <DynamicButton $size="lg">大按钮</DynamicButton>
      
      {/* 不同变体 */}
      <DynamicButton $variant="primary">主要</DynamicButton>
      <DynamicButton $variant="success">成功</DynamicButton>
      <DynamicButton $variant="danger">危险</DynamicButton>
      <DynamicButton $variant="warning">警告</DynamicButton>
      
      {/* 特殊样式 */}
      <DynamicButton $fullWidth>全宽按钮</DynamicButton>
      <DynamicButton $rounded>圆角按钮</DynamicButton>
    </div>
  );
}
```

```jsx
// Alert.jsx
import styled from 'styled-components';

// 动态警告组件
export const Alert = styled.div`
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  
  // 根据 type 动态设置样式
  background-color: ${props => {
    switch (props.$type) {
      case 'success': return '#d4edda';
      case 'danger': return '#f8d7da';
      case 'warning': return '#fff3cd';
      case 'info': return '#d1ecf1';
      default: return '#e2e3e5';
    }
  }};
  
  color: ${props => {
    switch (props.$type) {
      case 'success': return '#155724';
      case 'danger': return '#721c24';
      case 'warning': return '#856404';
      case 'info': return '#0c5460';
      default: return '#383d41';
    }
  }};
  
  border: 1px solid ${props => {
    switch (props.$type) {
      case 'success': return '#c3e6cb';
      case 'danger': return '#f5c6cb';
      case 'warning': return '#ffeeba';
      case 'info': return '#bee5eb';
      default: return '#d6d8db';
    }
  }};
`;

// 使用示例
function AlertDemo() {
  return (
    <div>
      <Alert $type="success">操作成功！</Alert>
      <Alert $type="danger">操作失败，请重试。</Alert>
      <Alert $type="warning">请注意，这是一个警告。</Alert>
      <Alert $type="info">这是一条提示信息。</Alert>
    </div>
  );
}
```

#### [场景] 典型应用场景

1. **按钮变体** — 根据类型显示不同颜色
2. **状态样式** — 根据激活/禁用状态改变样式
3. **响应式样式** — 根据屏幕尺寸调整样式

---

### 3. 全局样式

#### [概念] 概念解释

全局样式用于定义整个应用的基础样式，如 CSS Reset、字体、颜色变量等。Styled Components 使用 `createGlobalStyle` 创建全局样式组件。

为什么归为核心层？每个应用都需要全局样式来统一基础样式，不理解全局样式就无法正确初始化应用样式。

#### [语法] 核心语法 / 命令 / API

```jsx
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  // 全局样式
`;

function App() {
  return (
    <>
      <GlobalStyle />
      {/* 其他组件 */}
    </>
  );
}
```

#### [代码] 代码示例

```jsx
// styles/GlobalStyles.jsx
import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  // CSS Reset
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  // 根元素
  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
      'Helvetica Neue', Arial, sans-serif;
    line-height: 1.5;
    color: #333;
    background-color: #f5f5f5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  // 标题
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
  }
  
  // 链接
  a {
    color: #3498db;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  // 图片
  img {
    max-width: 100%;
    height: auto;
  }
  
  // 按钮
  button {
    font-family: inherit;
    cursor: pointer;
  }
  
  // 输入框
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }
  
  // 列表
  ul, ol {
    list-style: none;
  }
  
  // 滚动条样式
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
    
    &:hover {
      background: #999;
    }
  }
  
  // 选中文本样式
  ::selection {
    background-color: #3498db;
    color: white;
  }
`;
```

```jsx
// App.jsx
import { GlobalStyles } from './styles/GlobalStyles';
import { ThemeProvider } from './styles/ThemeProvider';
import { AppRoutes } from './routes';

function App() {
  return (
    <ThemeProvider>
      <GlobalStyles />
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;
```

#### [场景] 典型应用场景

1. **CSS Reset** — 统一浏览器默认样式
2. **字体设置** — 定义全局字体栈
3. **滚动条样式** — 自定义滚动条外观

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的代码质量、排错能力和开发效率将显著提升。

### 1. 主题系统

#### [概念] 概念与解决的问题

ThemeProvider 是 Styled Components 的主题系统，通过 React Context 将主题传递给所有样式化组件。组件可以通过 props.theme 访问主题值。

解决的核心痛点：**主题统一管理**。应用的颜色、字体、间距等设计 Token 可以集中管理，实现主题切换。

#### [语法] 核心用法

```jsx
import { ThemeProvider } from 'styled-components';

const theme = {
  colors: { primary: '#3498db' },
};

<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

#### [代码] 代码示例

```jsx
// styles/theme.js
export const lightTheme = {
  colors: {
    primary: '#3498db',
    secondary: '#2ecc71',
    danger: '#e74c3c',
    warning: '#f39c12',
    
    background: '#ffffff',
    surface: '#f5f5f5',
    border: '#e0e0e0',
    
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999',
    },
  },
  
  fonts: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", monospace',
  },
  
  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#1a1a1a',
    surface: '#2d2d2d',
    border: '#404040',
    
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
      disabled: '#666666',
    },
  },
};
```

```jsx
// components/ThemedButton.jsx
import styled from 'styled-components';

export const ThemedButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.md};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.colors.secondary};
  }
`;
```

```jsx
// App.jsx
import { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import { ThemedButton } from './components/ThemedButton';

function App() {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <GlobalStyles />
      <div style={{ padding: '20px' }}>
        <h1>主题切换示例</h1>
        <ThemedButton onClick={() => setIsDark(!isDark)}>
          切换到{isDark ? '亮色' : '暗色'}主题
        </ThemedButton>
      </div>
    </ThemeProvider>
  );
}
```

#### [关联] 与核心层的关联

主题系统与动态样式配合使用，组件通过 `props.theme` 访问主题值，实现统一的设计语言。

---

### 2. 样式继承

#### [概念] 概念与解决的问题

样式继承允许基于已有组件创建新组件，继承原组件的样式并扩展。使用 `styled(Component)` 语法。

解决的核心痛点：**样式复用**。避免重复编写相似的样式，通过继承扩展已有组件。

#### [语法] 核心用法

```jsx
const BaseButton = styled.button`...`;
const ExtendedButton = styled(BaseButton)`...`;
```

#### [代码] 代码示例

```jsx
// components/Button.jsx
import styled, { css } from 'styled-components';

// 基础按钮
const BaseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 继承并扩展：主要按钮
export const PrimaryButton = styled(BaseButton)`
  background-color: #3498db;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #2980b9;
  }
`;

// 继承并扩展：带图标的按钮
export const IconButton = styled(PrimaryButton)`
  gap: 8px;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

// 继承并扩展：加载状态按钮
export const LoadingButton = styled(PrimaryButton)`
  position: relative;
  color: transparent;
  
  &::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid white;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// 继承并扩展：带动画的按钮
export const AnimatedButton = styled(PrimaryButton)`
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;
```

#### [关联] 与核心层的关联

样式继承扩展了核心层的 Styled Components，让组件可以基于已有组件创建变体，提高代码复用性。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| Emotion | 需要另一个 CSS-in-JS 库时使用 |
| CSS Modules | 需要更简单的 CSS 作用域方案时使用 |
| styled-system | 需要更强大的样式属性系统时使用 |
| Stitches | 需要更小的运行时库时使用 |
| Linaria | 需要零运行时的 CSS-in-JS 时使用 |
| shouldForwardProp | 需要控制哪些 props 传递给 DOM 时使用 |
| StyleSheetManager | 需要自定义样式表管理时使用 |
| keyframes | 需要定义动画关键帧时使用 |
| css prop | 需要内联样式语法时使用 |
| Babel plugin | 需要更好的开发体验和性能时使用 |

---

## [实战] 核心实战清单

### 实战任务 1：主题化组件库

**任务描述：** 使用 Styled Components 创建一个支持主题切换的组件库。

**要求：**
1. 定义完整的主题系统（亮色/暗色主题）
2. 创建按钮、输入框、卡片组件
3. 组件使用主题值而非硬编码颜色
4. 实现主题切换功能

**输出：** 完整的 React 组件库，包含主题定义、全局样式和可复用组件。
