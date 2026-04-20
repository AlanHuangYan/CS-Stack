# Git 版本控制 三层深度学习教程

## [总览] 技术总览

Git 是一个分布式版本控制系统，用于跟踪文件的更改并协调多人协作开发。它记录了项目历史的每一次修改，支持分支管理、合并和回滚，是现代软件开发不可或缺的工具。

本教程采用三层漏斗学习法：**核心层**聚焦基本概念、常用命令、分支管理三大基石；**重点层**深入冲突解决、远程协作和暂存区操作；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成 Git 日常操作 **50% 以上** 的常见任务。

### 1. Git 基本概念

#### [概念] 概念解释

Git 通过快照方式记录文件状态，每次提交都是一个完整的项目快照。理解仓库、暂存区、工作区三个区域的关系是使用 Git 的基础。

#### [语法] 核心语法 / 命令 / API

**三个区域：**

| 区域 | 说明 | 命令流向 |
|------|------|----------|
| 工作区 | 实际编辑文件的目录 | git add -> |
| 暂存区 | 准备提交的更改 | -> git commit |
| 本地仓库 | 提交历史记录 | git push -> 远程 |

**文件状态：**

| 状态 | 说明 |
|------|------|
| Untracked | 未跟踪的新文件 |
| Modified | 已修改但未暂存 |
| Staged | 已暂存，准备提交 |
| Committed | 已提交到仓库 |

#### [代码] 代码示例

```bash
# 初始化仓库
git init

# 查看仓库状态
git status

# 查看简洁状态
git status -s

# 配置用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 查看配置
git config --list

# 克隆远程仓库
git clone https://github.com/user/repo.git
git clone https://github.com/user/repo.git my-repo

# 查看提交历史
git log
git log --oneline
git log --oneline --graph --all
git log -p -2

# 查看文件差异
git diff
git diff --staged
git diff HEAD
git diff branch1 branch2

# 查看文件内容
git show HEAD:filename
git show HEAD~1:filename

# 忽略文件
cat > .gitignore << 'EOF'
# 忽略所有 .log 文件
*.log

# 忽略 node_modules 目录
node_modules/

# 忽略 .env 文件
.env

# 但保留 important.log
!important.log
EOF
```

#### [场景] 典型应用场景

1. 新项目初始化：创建新仓库并开始版本控制
2. 克隆项目：获取远程仓库的完整副本
3. 查看历史：了解项目的修改记录

### 2. 常用命令

#### [概念] 概念解释

日常开发中最常用的命令包括添加、提交、推送、拉取等操作。这些命令构成了 Git 工作流的基础。

#### [语法] 核心语法 / 命令 / API

**基础命令：**

| 命令 | 说明 |
|------|------|
| git add | 添加文件到暂存区 |
| git commit | 提交暂存区更改 |
| git push | 推送到远程仓库 |
| git pull | 拉取远程更改 |
| git status | 查看状态 |
| git log | 查看历史 |

#### [代码] 代码示例

```bash
# 创建示例项目
mkdir my-project
cd my-project
git init

# 创建文件
echo "# My Project" > README.md
echo "print('Hello, Git!')" > main.py

# 查看状态（文件为 Untracked）
git status

# 添加单个文件
git add README.md

# 添加多个文件
git add main.py .gitignore

# 添加所有文件
git add .
git add -A

# 交互式添加
git add -p

# 查看暂存状态
git status

# 提交更改
git commit -m "Initial commit: add README and main.py"

# 提交并添加所有已跟踪文件的修改
git commit -am "Update main.py"

# 修改上次提交信息
git commit --amend -m "New commit message"

# 查看提交历史
git log --oneline

# 添加远程仓库
git remote add origin https://github.com/user/repo.git

# 查看远程仓库
git remote -v

# 推送到远程
git push -u origin main
git push origin main

# 拉取远程更改
git pull origin main

# 拉取并变基
git pull --rebase origin main

# 获取远程信息（不合并）
git fetch origin

# 删除文件
git rm filename
git rm --cached filename

# 重命名文件
git mv oldname newname

# 撤销工作区修改
git checkout -- filename
git restore filename

# 撤销暂存
git reset HEAD filename
git restore --staged filename

# 撤销提交（保留修改）
git reset --soft HEAD~1

# 撤销提交（丢弃修改）
git reset --hard HEAD~1

# 创建标签
git tag v1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"

# 推送标签
git push origin v1.0.0
git push origin --tags
```

#### [场景] 典型应用场景

1. 日常提交流程：修改代码 -> git add -> git commit -> git push
2. 同步远程更改：git pull -> 解决冲突 -> git push
3. 撤销误操作：撤销暂存或撤销提交

### 3. 分支管理

#### [概念] 概念解释

分支是 Git 最强大的特性之一，允许在不影响主线的情况下开发新功能。每个分支都是独立的开发线，可以随时合并或删除。

#### [语法] 核心语法 / 命令 / API

**分支命令：**

| 命令 | 说明 |
|------|------|
| git branch | 列出分支 |
| git branch name | 创建分支 |
| git checkout name | 切换分支 |
| git checkout -b name | 创建并切换 |
| git merge name | 合并分支 |
| git branch -d name | 删除分支 |

#### [代码] 代码示例

```bash
# 创建示例仓库
mkdir git-branch-demo
cd git-branch-demo
git init

# 初始提交
echo "# Main Project" > README.md
git add README.md
git commit -m "Initial commit"

# 查看分支
git branch

# 创建新分支
git branch feature-login

# 列出所有分支
git branch -a

# 切换分支
git checkout feature-login

# 创建并切换（推荐）
git checkout -b feature-register

# 新版命令（推荐）
git switch feature-login
git switch -c feature-logout

# 在分支上工作
echo "def login(): pass" > auth.py
git add auth.py
git commit -m "Add login function"

# 切回主分支
git checkout main
git switch main

# 合并分支
git merge feature-login

# 查看合并结果
git log --oneline --graph

# 删除已合并的分支
git branch -d feature-login

# 强制删除未合并的分支
git branch -D feature-register

# 查看分支详情
git branch -v

# 查看已合并到当前分支的分支
git branch --merged

# 查看未合并的分支
git branch --no-merged

# 重命名分支
git branch -m old-name new-name

# 推送分支到远程
git push origin feature-login

# 删除远程分支
git push origin --delete feature-login

# 跟踪远程分支
git checkout --track origin/feature-login
git checkout -b feature-login origin/feature-login

# 变基操作
git checkout feature-login
git rebase main

# 解决变基冲突后继续
git add .
git rebase --continue

# 放弃变基
git rebase --abort

# 查看分支差异
git diff main..feature-login
git log main..feature-login
```

#### [场景] 典型应用场景

1. 功能开发：在新分支上开发功能，完成后合并到主分支
2. Bug 修复：创建修复分支，修复后合并
3. 版本发布：创建发布分支进行测试和修复

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的协作能力和问题解决能力将显著提升。

### 1. 冲突解决

#### [概念] 概念与解决的问题

当多人修改同一文件的同一位置时，Git 无法自动合并，需要手动解决冲突。理解冲突标记和解决流程是协作开发的关键。

#### [语法] 核心用法

**冲突标记：**

```
<<<<<<< HEAD
当前分支的内容
=======
要合并分支的内容
>>>>>>> branch-name
```

#### [代码] 代码示例

```bash
# 创建冲突场景
mkdir conflict-demo
cd conflict-demo
git init

# 初始提交
echo "Line 1" > file.txt
echo "Line 2" >> file.txt
echo "Line 3" >> file.txt
git add file.txt
git commit -m "Initial file"

# 创建分支并修改
git checkout -b feature
echo "Line 2 - modified in feature" > file.txt
echo "Line 1" >> file.txt
echo "Line 3" >> file.txt
git add file.txt
git commit -m "Modify line 2 in feature"

# 切回主分支并修改同一位置
git checkout main
echo "Line 2 - modified in main" > file.txt
echo "Line 1" >> file.txt
echo "Line 3" >> file.txt
git add file.txt
git commit -m "Modify line 2 in main"

# 尝试合并（会产生冲突）
git merge feature

# 查看冲突文件
git status

# 查看冲突内容
cat file.txt

# 手动解决冲突
cat > file.txt << 'EOF'
Line 1
Line 2 - resolved conflict
Line 3
EOF

# 标记冲突已解决
git add file.txt

# 完成合并
git commit -m "Merge feature branch, resolve conflict"

# 使用合并工具
git mergetool

# 查看冲突文件列表
git diff --name-only --diff-filter=U

# 放弃合并
git merge --abort

# 使用策略解决冲突
git merge -X theirs feature
git merge -X ours feature
```

#### [关联] 与核心层的关联

冲突解决是分支合并的进阶操作，在多人协作场景中必不可少。

### 2. 远程协作

#### [概念] 概念与解决的问题

远程协作涉及与远程仓库的交互，包括推送、拉取、同步等操作。理解远程分支和本地分支的关系是协作的基础。

#### [语法] 核心用法

**远程命令：**

| 命令 | 说明 |
|------|------|
| git remote | 管理远程仓库 |
| git fetch | 获取远程更新 |
| git pull | 拉取并合并 |
| git push | 推送到远程 |

#### [代码] 代码示例

```bash
# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add origin https://github.com/user/repo.git
git remote add upstream https://github.com/original/repo.git

# 修改远程仓库 URL
git remote set-url origin https://github.com/user/new-repo.git

# 删除远程仓库
git remote remove origin

# 获取远程更新（不合并）
git fetch origin

# 获取所有远程更新
git fetch --all

# 查看远程分支
git branch -r
git branch -a

# 拉取并合并
git pull origin main

# 拉取并变基（推荐）
git pull --rebase origin main

# 推送到远程
git push origin main

# 推送并设置上游
git push -u origin main

# 强制推送（谨慎使用）
git push --force origin main
git push --force-with-lease origin main

# 推送所有分支
git push --all origin

# 推送标签
git push origin --tags

# 删除远程分支
git push origin --delete feature-branch

# 查看远程仓库详情
git remote show origin

# 清理已删除的远程分支引用
git remote prune origin

# 创建跟踪远程分支的本地分支
git checkout -b feature origin/feature

# Fork 工作流
git clone https://github.com/your-username/repo.git
cd repo
git remote add upstream https://github.com/original/repo.git
git fetch upstream
git checkout main
git merge upstream/main
git push origin main

# Pull Request 工作流
git checkout -b feature-branch
git add .
git commit -m "Add feature"
git push origin feature-branch
# 然后在 GitHub/GitLab 上创建 Pull Request
```

#### [关联] 与核心层的关联

远程协作是分支管理的延伸，将本地操作扩展到团队协作场景。

### 3. 暂存与恢复

#### [概念] 概念与解决的问题

当需要临时切换分支但不想提交当前修改时，可以使用 stash 暂存更改。reflog 可以帮助恢复误操作丢失的提交。

#### [语法] 核心用法

**Stash 命令：**

| 命令 | 说明 |
|------|------|
| git stash | 暂存更改 |
| git stash list | 列出暂存 |
| git stash pop | 应用并删除 |
| git stash apply | 应用但不删除 |

#### [代码] 代码示例

```bash
# 暂存当前修改
git stash

# 带消息暂存
git stash save "Work in progress on feature"

# 暂存包括未跟踪的文件
git stash -u

# 查看暂存列表
git stash list

# 查看暂存详情
git stash show
git stash show -p

# 应用最近的暂存
git stash apply

# 应用指定暂存
git stash apply stash@{2}

# 应用并删除暂存
git stash pop

# 删除暂存
git stash drop stash@{0}

# 清空所有暂存
git stash clear

# 从暂存创建分支
git stash branch feature-from-stash

# Reflog 操作
git reflog

# 恢复误删的提交
git reset --hard HEAD@{1}

# 恢复误删的分支
git checkout -b recovered-branch HEAD@{5}

# 查看指定时间的 reflog
git reflog show --date=iso

# Cherry-pick 操作
git cherry-pick commit-hash

# Cherry-pick 多个提交
git cherry-pick commit1 commit2

# Cherry-pick 范围
git cherry-pick commit1..commit2

# 只应用更改但不提交
git cherry-pick -n commit-hash
```

#### [关联] 与核心层的关联

暂存与恢复是对提交操作的补充，提供了更灵活的工作流管理能力。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| Git Hooks | 需要在提交/推送前自动执行脚本 |
| Git Submodules | 需要在项目中包含其他 Git 仓库 |
| Git Subtree | 需要合并另一个仓库的历史 |
| Git Bisect | 需要二分查找引入 Bug 的提交 |
| Git Blame | 需要查看文件每一行的修改者 |
| Git Grep | 需要在仓库中搜索内容 |
| Git Filter-Branch | 需要重写仓库历史 |
| Git LFS | 需要管理大文件 |
| Git Worktree | 需要同时检出多个分支 |
| Git Notes | 需要给提交添加注释 |
| Git Rebase -i | 需要交互式修改历史提交 |
| Git Reset 三种模式 | 需要理解 --soft/--mixed/--hard 区别 |
| Git Clean | 需要清理未跟踪的文件 |
| Git Archive | 需要导出仓库快照 |
| Git Config | 需要配置别名和自定义设置 |

---

## [实战] 核心实战清单

### 实战任务 1：模拟团队协作流程

**任务描述：**

模拟一个完整的团队协作流程，包括：
1. 创建中央仓库
2. Fork 工作流
3. 功能分支开发
4. 解决合并冲突
5. 代码审查和合并

**要求：**
- 使用分支进行功能开发
- 模拟冲突并解决
- 使用 stash 保存临时工作
- 使用 reflog 恢复误操作

**参考实现：**

```bash
#!/bin/bash

# 创建模拟团队协作环境

# 1. 创建中央仓库
mkdir -p /tmp/git-team-demo
cd /tmp/git-team-demo
git init --bare central.git

# 2. 开发者 A 克隆仓库
cd /tmp/git-team-demo
git clone central.git developer-a
cd developer-a
echo "# Team Project" > README.md
git add README.md
git commit -m "Initial commit"
git push origin main

# 3. 开发者 B 克隆仓库
cd /tmp/git-team-demo
git clone central.git developer-b

# 4. 开发者 A 创建功能分支
cd /tmp/git-team-demo/developer-a
git checkout -b feature-a
echo "Feature A implementation" > feature-a.txt
git add feature-a.txt
git commit -m "Add feature A"
git push origin feature-a

# 5. 开发者 B 同时修改
cd /tmp/git-team-demo/developer-b
git checkout -b feature-b
echo "Feature B implementation" > feature-b.txt
git add feature-b.txt
git commit -m "Add feature B"

# 6. 开发者 B 修改 README（将产生冲突）
echo "Feature B added" >> README.md
git add README.md
git commit -m "Update README for feature B"
git push origin feature-b

# 7. 开发者 A 也修改 README
cd /tmp/git-team-demo/developer-a
git checkout main
echo "Feature A added" >> README.md
git add README.md
git commit -m "Update README for feature A"

# 8. 拉取远程更新（产生冲突）
git pull origin main || true

# 9. 解决冲突
cat > README.md << 'EOF'
# Team Project

## Features
- Feature A added
- Feature B added
EOF
git add README.md
git commit -m "Merge and resolve conflict"

# 10. 使用 stash 保存临时工作
echo "Temporary work" > temp.txt
git add temp.txt
git stash save "Temporary work in progress"

# 11. 切换分支处理紧急任务
git checkout main
echo "Hotfix applied" > hotfix.txt
git add hotfix.txt
git commit -m "Apply hotfix"

# 12. 恢复 stash
git stash pop

# 13. 模拟误操作和恢复
git reset --hard HEAD~1
git reflog
git reset --hard HEAD@{1}

# 14. 清理
cd /tmp
rm -rf git-team-demo

echo "团队协作流程演示完成"
```
