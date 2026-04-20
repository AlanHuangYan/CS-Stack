# VS Code 精通 三层深度学习教程

## [总览] 技术总览

Visual Studio Code（VS Code）是微软开发的免费、开源代码编辑器，凭借其轻量级、跨平台、丰富的扩展生态系统，已成为最流行的开发工具之一。掌握 VS Code 的高级功能可以显著提升开发效率。

本教程采用三层漏斗学习法：**核心层**聚焦快捷键、扩展管理、调试配置三大基石；**重点层**深入工作区配置、代码片段、任务自动化；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能高效使用 VS Code 完成 **50% 以上** 的日常开发任务。

### 1. 快捷键精通

#### [概念] 概念解释

快捷键是提升编辑效率的核心。VS Code 提供了丰富的快捷键系统，掌握常用快捷键可以大幅减少鼠标操作，实现"键盘流"开发。

#### [语法] 核心语法 / 命令 / API

**必会快捷键：**

| 快捷键 | 功能 | 说明 |
|--------|------|------|
| Ctrl+P | 快速打开文件 | 输入文件名快速跳转 |
| Ctrl+Shift+P | 命令面板 | 执行所有 VS Code 命令 |
| Ctrl+D | 选中下一个相同词 | 多光标编辑 |
| Ctrl+Shift+K | 删除整行 | 快速删除代码行 |
| Alt+Up/Down | 移动行 | 上下移动当前行 |
| Ctrl+/ | 注释切换 | 快速注释/取消注释 |
| Ctrl+Shift+F | 全局搜索 | 在整个项目中搜索 |
| Ctrl+` | 终端切换 | 打开/关闭集成终端 |

#### [代码] 代码示例

```json
// keybindings.json - 自定义快捷键
[
    {
        "key": "ctrl+shift+d",
        "command": "editor.action.copyLinesDownAction",
        "when": "editorTextFocus"
    },
    {
        "key": "ctrl+alt+up",
        "command": "cursorColumnSelectUp",
        "when": "editorTextFocus"
    },
    {
        "key": "ctrl+alt+down",
        "command": "cursorColumnSelectDown",
        "when": "editorTextFocus"
    },
    {
        "key": "f2",
        "command": "editor.action.rename",
        "when": "editorHasRenameProvider && editorTextFocus"
    }
]
```

#### [场景] 典型应用场景

1. 快速导航和文件切换
2. 多光标批量编辑
3. 代码重构和重命名

### 2. 扩展管理

#### [概念] 概念解释

扩展是 VS Code 的核心优势，通过安装扩展可以增强编辑器功能。合理选择和配置扩展可以打造个性化的开发环境。

#### [语法] 核心语法 / 命令 / API

**必备扩展分类：**

| 类别 | 推荐扩展 | 用途 |
|------|----------|------|
| 语言支持 | Python, ESLint, Prettier | 语法高亮、代码检查 |
| Git | GitLens, Git Graph | 版本控制增强 |
| 主题 | One Dark Pro, Material Icon | 界面美化 |
| 效率 | Auto Rename Tag, Bracket Pair | 代码编辑增强 |
| AI | GitHub Copilot, Codeium | AI 辅助编程 |

#### [代码] 代码示例

```json
// settings.json - 扩展配置
{
    // Python 扩展配置
    "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": true,
    "python.formatting.provider": "black",
    
    // ESLint 配置
    "eslint.validate": [
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact"
    ],
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    
    // Prettier 配置
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "prettier.singleQuote": true,
    "prettier.tabWidth": 2,
    
    // GitLens 配置
    "gitlens.codeLens.enabled": true,
    "gitlens.currentLine.enabled": true,
    
    // 主题配置
    "workbench.colorTheme": "One Dark Pro",
    "workbench.iconTheme": "material-icon-theme"
}
```

```json
// extensions.json - 工作区推荐扩展
{
    "recommendations": [
        "ms-python.python",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "eamodio.gitlens",
        "ms-azuretools.vscode-docker",
        "github.copilot"
    ]
}
```

#### [场景] 典型应用场景

1. 配置团队统一的开发环境
2. 安装语言特定的开发工具
3. 集成代码检查和格式化工具

### 3. 调试配置

#### [概念] 概念解释

VS Code 内置强大的调试功能，支持多种语言和运行时。通过配置 launch.json，可以实现断点调试、变量监视、条件断点等高级调试功能。

#### [语法] 核心语法 / 命令 / API

**调试配置结构：**

| 属性 | 说明 |
|------|------|
| type | 调试器类型 |
| request | 启动/附加模式 |
| name | 配置名称 |
| program | 程序入口 |
| args | 命令行参数 |
| env | 环境变量 |

#### [代码] 代码示例

```json
// launch.json - 调试配置
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Current File",
            "type": "python",
            "request": "launch",
            "program": "${file}",
            "console": "integratedTerminal",
            "justMyCode": false,
            "env": {
                "PYTHONPATH": "${workspaceFolder}",
                "DEBUG": "true"
            }
        },
        {
            "name": "Python: FastAPI",
            "type": "python",
            "request": "launch",
            "module": "uvicorn",
            "args": [
                "main:app",
                "--reload",
                "--host", "0.0.0.0",
                "--port", "8000"
            ],
            "jinja": true,
            "justMyCode": false
        },
        {
            "name": "JavaScript: Launch",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/src/index.js",
            "runtimeExecutable": "node",
            "runtimeArgs": ["--inspect"],
            "console": "integratedTerminal"
        },
        {
            "name": "JavaScript: Attach",
            "type": "node",
            "request": "attach",
            "port": 9229,
            "restart": true
        },
        {
            "name": "Docker: Python",
            "type": "docker",
            "request": "launch",
            "preLaunchTask": "docker-run: debug",
            "python": {
                "pathMappings": [
                    {
                        "localRoot": "${workspaceFolder}",
                        "remoteRoot": "/app"
                    }
                ],
                "projectType": "general"
            }
        }
    ]
}
```

#### [场景] 典型应用场景

1. 调试 Python Web 应用
2. 调试 Node.js 后端服务
3. 调试 Docker 容器中的应用

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的开发效率和代码质量将显著提升。

### 1. 工作区配置

#### [概念] 概念与解决的问题

工作区配置允许为不同项目设置独立的开发环境，包括设置、任务、扩展推荐等。这解决了多项目开发时环境冲突的问题。

#### [语法] 核心用法

**工作区文件结构：**

```
.vscode/
├── settings.json    # 工作区设置
├── launch.json      # 调试配置
├── tasks.json       # 任务配置
├── extensions.json  # 推荐扩展
└── snippets/        # 代码片段
```

#### [代码] 代码示例

```json
// .vscode/settings.json - 工作区设置
{
    // 项目特定设置
    "python.pythonPath": "${workspaceFolder}/.venv/bin/python",
    "python.terminal.activateEnvironment": true,
    
    // 文件排除
    "files.exclude": {
        "**/__pycache__": true,
        "**/.git": true,
        "**/node_modules": true,
        "**/.venv": true
    },
    
    // 搜索排除
    "search.exclude": {
        "**/node_modules": true,
        "**/.venv": true,
        "**/dist": true
    },
    
    // 编辑器设置
    "editor.rulers": [80, 120],
    "editor.wordWrap": "on",
    "editor.minimap.enabled": false,
    
    // 文件监视器排除
    "files.watcherExclude": {
        "**/.git/**": true,
        "**/node_modules/**": true,
        "**/.venv/**": true
    },
    
    // Emmet 配置
    "emmet.includeLanguages": {
        "javascript": "javascriptreact",
        "typescript": "typescriptreact"
    }
}
```

```json
// project.code-workspace - 多根工作区
{
    "folders": [
        {
            "path": "./frontend"
        },
        {
            "path": "./backend"
        },
        {
            "path": "./shared"
        }
    ],
    "settings": {
        "editor.formatOnSave": true,
        "editor.tabSize": 4
    },
    "extensions": {
        "recommendations": [
            "ms-python.python",
            "dbaeumer.vscode-eslint"
        ]
    }
}
```

#### [关联] 与核心层的关联

工作区配置是扩展管理和调试配置的基础，为项目提供统一的环境配置。

### 2. 代码片段

#### [概念] 概念与解决的问题

代码片段（Snippets）是预定义的代码模板，通过简短的触发词快速插入常用代码结构。这解决了重复编写相同代码的问题。

#### [语法] 核心用法

**片段变量：**

| 变量 | 说明 |
|------|------|
| $1, $2 | 光标位置 |
| ${1:default} | 带默认值的光标 |
| $TM_FILENAME | 当前文件名 |
| $TM_SELECTED_TEXT | 选中文本 |

#### [代码] 代码示例

```json
// python.json - Python 代码片段
{
    "FastAPI Route": {
        "prefix": "fastroute",
        "body": [
            "@${1:app}.${2:get}(\"${3:/path}\")",
            "async def ${4:handler}(${5:request}: Request):",
            "    ${6:pass}",
            "    return {\"message\": \"${7:Hello}\"}"
        ],
        "description": "Create a FastAPI route"
    },
    "Python Class": {
        "prefix": "pyclass",
        "body": [
            "class ${1:ClassName}:",
            "    \"\"\"${2:Description}.\"\"\"",
            "    ",
            "    def __init__(self, ${3:*args}, **kwargs):",
            "        ${4:super().__init__(*args, **kwargs)}",
            "        ${5:pass}"
        ],
        "description": "Create a Python class"
    },
    "Pytest Function": {
        "prefix": "pytest",
        "body": [
            "def test_${1:function_name}(${2:fixture}):",
            "    \"\"\"Test ${1:function_name}.\"\"\"",
            "    ${3:# Arrange}",
            "    ${4:pass}",
            "    ${5:# Act}",
            "    ${6:pass}",
            "    ${7:# Assert}",
            "    ${8:pass}"
        ],
        "description": "Create a pytest test function"
    }
}
```

```json
// javascript.json - JavaScript 代码片段
{
    "React Component": {
        "prefix": "rfc",
        "body": [
            "import React from 'react';",
            "",
            "interface ${1:ComponentName}Props {",
            "  ${2:prop}: ${3:string};",
            "}",
            "",
            "export const ${1:ComponentName}: React.FC<${1:ComponentName}Props> = ({ ${2:prop} }) => {",
            "  return (",
            "    <div>",
            "      ${4:content}",
            "    </div>",
            "  );",
            "};"
        ],
        "description": "Create a React functional component"
    },
    "Console Log": {
        "prefix": "clg",
        "body": [
            "console.log('${1:message}:', ${2:variable});"
        ],
        "description": "Console log with variable"
    },
    "Async Function": {
        "prefix": "af",
        "body": [
            "async function ${1:functionName}(${2:params}) {",
            "  try {",
            "    ${3:// code}",
            "  } catch (error) {",
            "    console.error('Error:', error);",
            "    throw error;",
            "  }",
            "}"
        ],
        "description": "Create an async function with error handling"
    }
}
```

#### [场景] 典型应用场景

1. 快速创建 React 组件
2. 生成测试函数模板
3. 插入常用的 API 路由代码

### 3. 任务自动化

#### [概念] 概念与解决的问题

任务（Tasks）允许在 VS Code 中运行外部命令，如构建、测试、部署等。这解决了频繁切换终端执行命令的问题。

#### [语法] 核心用法

**任务类型：**

| 类型 | 说明 |
|------|------|
| shell | 执行 shell 命令 |
| process | 执行进程 |
| npm | 执行 npm 脚本 |

#### [代码] 代码示例

```json
// tasks.json - 任务配置
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Run Python Tests",
            "type": "shell",
            "command": "pytest",
            "args": [
                "tests/",
                "-v",
                "--cov=src",
                "--cov-report=html"
            ],
            "group": {
                "kind": "test",
                "isDefault": true
            },
            "problemMatcher": ["$python"],
            "presentation": {
                "reveal": "always",
                "panel": "new"
            }
        },
        {
            "label": "Run FastAPI Server",
            "type": "shell",
            "command": "uvicorn",
            "args": [
                "main:app",
                "--reload",
                "--port", "8000"
            ],
            "group": "build",
            "presentation": {
                "reveal": "always",
                "panel": "dedicated"
            },
            "isBackground": true,
            "problemMatcher": {
                "pattern": {
                    "regexp": "^(.*):(\\d+):(\\d+)\\s+-\\s+(.*)$",
                    "file": 1,
                    "line": 2,
                    "column": 3,
                    "message": 4
                },
                "background": {
                    "activeOnStart": true,
                    "beginsPattern": "Uvicorn running",
                    "endsPattern": "Application startup complete"
                }
            }
        },
        {
            "label": "Build Frontend",
            "type": "npm",
            "script": "build",
            "path": "frontend/",
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "problemMatcher": ["$tsc"]
        },
        {
            "label": "Docker Compose Up",
            "type": "shell",
            "command": "docker-compose",
            "args": ["up", "-d"],
            "group": "build",
            "presentation": {
                "reveal": "always"
            }
        },
        {
            "label": "Full Build",
            "dependsOn": [
                "Run Python Tests",
                "Build Frontend"
            ],
            "dependsOrder": "sequence",
            "group": {
                "kind": "build",
                "isDefault": true
            }
        }
    ]
}
```

#### [场景] 典型应用场景

1. 一键运行测试套件
2. 启动开发服务器
3. 执行构建和部署流程

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| Multi-root Workspaces | 需要同时处理多个项目时 |
| Settings Sync | 需要跨设备同步配置时 |
| Remote Development | 需要远程开发时 |
| Dev Containers | 需要容器化开发环境时 |
| Live Share | 需要实时协作时 |
| Keymap Extensions | 需要使用其他编辑器快捷键时 |
| Language Servers | 需要增强语言支持时 |
| Debug Adapters | 需要调试新语言时 |
| Terminal Profiles | 需要自定义终端时 |
| Workspace Trust | 需要安全工作区时 |

---

## [实战] 核心实战清单

### 实战任务 1：配置完整的 Python 开发环境

**任务描述：**
为 Python Web 项目配置完整的 VS Code 开发环境，包括调试、测试、代码检查和格式化。

**要求：**
- 配置 Python 解释器和虚拟环境
- 设置代码检查和格式化工具
- 配置调试和测试任务
- 创建常用代码片段

**参考实现：**

```json
// .vscode/settings.json
{
    "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
    "python.terminal.activateEnvironment": true,
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": true,
    "python.linting.flake8Enabled": true,
    "python.formatting.provider": "black",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.organizeImports": true
    },
    "python.testing.pytestEnabled": true,
    "python.testing.unittestEnabled": false,
    "python.analysis.typeCheckingMode": "basic"
}
```

```json
// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: FastAPI",
            "type": "python",
            "request": "launch",
            "module": "uvicorn",
            "args": ["main:app", "--reload"],
            "jinja": true
        },
        {
            "name": "Python: Pytest",
            "type": "python",
            "request": "launch",
            "module": "pytest",
            "args": ["-v", "--cov=src"],
            "console": "integratedTerminal"
        }
    ]
}
```

```json
// .vscode/tasks.json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Run Tests",
            "type": "shell",
            "command": "pytest",
            "args": ["tests/", "-v", "--cov=src"],
            "group": {"kind": "test", "isDefault": true}
        },
        {
            "label": "Format Code",
            "type": "shell",
            "command": "black",
            "args": ["src/", "tests/"],
            "group": "build"
        }
    ]
}
```
