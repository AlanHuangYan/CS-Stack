# 配置管理 三层深度学习教程

## [总览] 技术总览

配置管理是自动化管理基础设施和应用配置的实践。主流工具包括 Ansible、Puppet、Chef、SaltStack。配置管理实现基础设施即代码（IaC），确保环境一致性和可重复性。

本教程采用三层漏斗学习法：**核心层**聚焦配置定义、配置分发、状态管理三大基石；**重点层**深入 Ansible 自动化和配置版本控制；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 配置定义

#### [概念] 概念解释

配置定义使用代码描述系统期望状态。包括软件包、服务、文件、用户等资源的声明。配置定义应该是声明式的，描述"是什么"而非"怎么做"。

#### [语法] 核心语法 / 命令 / API

```yaml
# Ansible Playbook 示例
---
- name: Configure Web Server
  hosts: webservers
  become: yes
  vars:
    http_port: 80
    document_root: /var/www/html
    
  tasks:
    - name: Install Apache
      apt:
        name: apache2
        state: present
        update_cache: yes
    
    - name: Start Apache service
      service:
        name: apache2
        state: started
        enabled: yes
    
    - name: Configure Apache port
      lineinfile:
        path: /etc/apache2/ports.conf
        regexp: '^Listen '
        line: 'Listen {{ http_port }}'
      notify: Restart Apache
    
    - name: Deploy website
      copy:
        src: files/index.html
        dest: '{{ document_root }}/index.html'
        owner: www-data
        group: www-data
        mode: '0644'
  
  handlers:
    - name: Restart Apache
      service:
        name: apache2
        state: restarted

# Ansible Role 结构
# roles/
#   webserver/
#     tasks/
#       main.yml
#     handlers/
#       main.yml
#     templates/
#       apache.conf.j2
#     files/
#       index.html
#     vars/
#       main.yml
#     defaults/
#       main.yml
#     meta/
#       main.yml

# Ansible Inventory
[webservers]
web1.example.com
web2.example.com

[dbservers]
db1.example.com

[all:vars]
ansible_user=admin
ansible_ssh_private_key_file=~/.ssh/id_rsa
```

#### [代码] 代码示例

```python
# Python 配置管理示例
from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum
import yaml
import json

class ResourceType(Enum):
    PACKAGE = "package"
    SERVICE = "service"
    FILE = "file"
    USER = "user"
    GROUP = "group"

@dataclass
class Resource:
    resource_type: ResourceType
    name: str
    state: str  # present, absent, running, stopped
    attributes: Dict

class ConfigurationDefinition:
    """配置定义"""
    
    def __init__(self, name: str):
        self.name = name
        self.resources: List[Resource] = []
    
    def package(self, name: str, state: str = "present", version: str = None):
        """定义软件包"""
        attrs = {}
        if version:
            attrs['version'] = version
        
        self.resources.append(Resource(
            resource_type=ResourceType.PACKAGE,
            name=name,
            state=state,
            attributes=attrs
        ))
        return self
    
    def service(self, name: str, state: str = "running", enabled: bool = True):
        """定义服务"""
        self.resources.append(Resource(
            resource_type=ResourceType.SERVICE,
            name=name,
            state=state,
            attributes={'enabled': enabled}
        ))
        return self
    
    def file(self, path: str, content: str = None, owner: str = None,
             group: str = None, mode: str = None):
        """定义文件"""
        attrs = {}
        if content:
            attrs['content'] = content
        if owner:
            attrs['owner'] = owner
        if group:
            attrs['group'] = group
        if mode:
            attrs['mode'] = mode
        
        self.resources.append(Resource(
            resource_type=ResourceType.FILE,
            name=path,
            state="present",
            attributes=attrs
        ))
        return self
    
    def user(self, name: str, state: str = "present", groups: List[str] = None):
        """定义用户"""
        attrs = {}
        if groups:
            attrs['groups'] = groups
        
        self.resources.append(Resource(
            resource_type=ResourceType.USER,
            name=name,
            state=state,
            attributes=attrs
        ))
        return self
    
    def to_yaml(self) -> str:
        """转换为 YAML"""
        resources = []
        for r in self.resources:
            resources.append({
                'type': r.resource_type.value,
                'name': r.name,
                'state': r.state,
                **r.attributes
            })
        
        return yaml.dump({
            'name': self.name,
            'resources': resources
        }, default_flow_style=False)

# 使用示例
config = ConfigurationDefinition("web-server")
config.package("nginx", state="present")
config.service("nginx", state="running", enabled=True)
config.file("/var/www/html/index.html", content="<h1>Hello</h1>", owner="www-data")
config.user("deploy", groups=["www-data", "sudo"])

print(config.to_yaml())
```

#### [场景] 典型应用场景

- 服务器初始化
- 应用部署配置
- 环境标准化

### 2. 配置分发

#### [概念] 概念解释

配置分发将配置定义推送到目标节点。支持推送模式和拉取模式。推送模式由控制节点主动推送，拉取模式由目标节点定期拉取。

#### [语法] 核心语法 / 命令 / API

```python
import subprocess
import json
from typing import List, Dict
from dataclasses import dataclass

@dataclass
class Host:
    hostname: str
    ip: str
    groups: List[str]
    vars: Dict

class AnsibleRunner:
    """Ansible 执行器"""
    
    def __init__(self, inventory_path: str):
        self.inventory_path = inventory_path
    
    def run_playbook(self, playbook: str, limit: str = None,
                    tags: List[str] = None, check: bool = False) -> dict:
        """执行 Playbook"""
        cmd = ['ansible-playbook', '-i', self.inventory_path, playbook]
        
        if limit:
            cmd.extend(['--limit', limit])
        
        if tags:
            cmd.extend(['--tags', ','.join(tags)])
        
        if check:
            cmd.append('--check')
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        return {
            'returncode': result.returncode,
            'stdout': result.stdout,
            'stderr': result.stderr
        }
    
    def run_adhoc(self, pattern: str, module: str, args: str = None) -> dict:
        """执行 Ad-hoc 命令"""
        cmd = ['ansible', '-i', self.inventory_path, pattern, '-m', module]
        
        if args:
            cmd.extend(['-a', args])
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        return {
            'returncode': result.returncode,
            'stdout': result.stdout,
            'stderr': result.stderr
        }
    
    def ping(self, pattern: str = 'all') -> bool:
        """测试连接"""
        result = self.run_adhoc(pattern, 'ping')
        return result['returncode'] == 0
    
    def gather_facts(self, pattern: str = 'all') -> dict:
        """收集 Facts"""
        result = self.run_adhoc(pattern, 'setup')
        
        # 解析输出获取 facts
        # 简化实现
        return {}

# 动态 Inventory
class DynamicInventory:
    """动态 Inventory 生成器"""
    
    def __init__(self):
        self.hosts: Dict[str, Host] = {}
    
    def add_host(self, hostname: str, ip: str, groups: List[str], vars: Dict = None):
        """添加主机"""
        self.hosts[hostname] = Host(
            hostname=hostname,
            ip=ip,
            groups=groups,
            vars=vars or {}
        )
    
    def from_cloud_provider(self, provider: str):
        """从云提供商获取主机"""
        # AWS EC2 示例
        if provider == 'aws':
            import boto3
            ec2 = boto3.client('ec2')
            instances = ec2.describe_instances()
            
            for reservation in instances['Reservations']:
                for instance in reservation['Instances']:
                    if instance['State']['Name'] == 'running':
                        name = next(
                            (t['Value'] for t in instance.get('Tags', []) if t['Key'] == 'Name'),
                            instance['InstanceId']
                        )
                        groups = ['aws', instance.get('InstanceType', 'unknown')]
                        
                        self.add_host(
                            hostname=name,
                            ip=instance.get('PrivateIpAddress', ''),
                            groups=groups
                        )
    
    def to_json(self) -> str:
        """转换为 Ansible Inventory JSON 格式"""
        inventory = {
            '_meta': {'hostvars': {}},
            'all': {'hosts': []}
        }
        
        for hostname, host in self.hosts.items():
            inventory['all']['hosts'].append(hostname)
            inventory['_meta']['hostvars'][hostname] = {
                'ansible_host': host.ip,
                **host.vars
            }
            
            for group in host.groups:
                if group not in inventory:
                    inventory[group] = {'hosts': []}
                inventory[group]['hosts'].append(hostname)
        
        return json.dumps(inventory, indent=2)

# 使用示例
if __name__ == "__main__":
    runner = AnsibleRunner('inventory.ini')
    
    # 测试连接
    if runner.ping('webservers'):
        print("Connection successful")
    
    # 执行 Playbook
    result = runner.run_playbook('site.yml', limit='webservers')
    print(f"Playbook result: {result['returncode']}")
```

#### [场景] 典型应用场景

- 批量服务器配置
- 应用部署
- 配置更新

### 3. 状态管理

#### [概念] 概念解释

状态管理确保系统持续符合配置定义的期望状态。通过定期检查和自动修复实现状态一致性。支持幂等操作，多次执行结果相同。

#### [语法] 核心语法 / 命令 / API

```python
from dataclasses import dataclass
from typing import Dict, List, Optional
from enum import Enum
import subprocess
import json

class ComplianceStatus(Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    ERROR = "error"

@dataclass
class ComplianceResult:
    resource: str
    status: ComplianceStatus
    expected: str
    actual: str
    message: str

class StateManager:
    """状态管理器"""
    
    def __init__(self):
        self.state_cache: Dict[str, dict] = {}
    
    def check_package(self, name: str, state: str) -> ComplianceResult:
        """检查软件包状态"""
        try:
            result = subprocess.run(
                ['dpkg', '-l', name],
                capture_output=True,
                text=True
            )
            
            installed = result.returncode == 0
            
            if state == "present" and installed:
                return ComplianceResult(
                    resource=f"package:{name}",
                    status=ComplianceStatus.COMPLIANT,
                    expected="present",
                    actual="present",
                    message="Package is installed"
                )
            elif state == "absent" and not installed:
                return ComplianceResult(
                    resource=f"package:{name}",
                    status=ComplianceStatus.COMPLIANT,
                    expected="absent",
                    actual="absent",
                    message="Package is not installed"
                )
            else:
                return ComplianceResult(
                    resource=f"package:{name}",
                    status=ComplianceStatus.NON_COMPLIANT,
                    expected=state,
                    actual="present" if installed else "absent",
                    message=f"Package state mismatch"
                )
        except Exception as e:
            return ComplianceResult(
                resource=f"package:{name}",
                status=ComplianceStatus.ERROR,
                expected=state,
                actual="unknown",
                message=str(e)
            )
    
    def check_service(self, name: str, state: str, enabled: bool) -> ComplianceResult:
        """检查服务状态"""
        try:
            # 检查服务是否运行
            result = subprocess.run(
                ['systemctl', 'is-active', name],
                capture_output=True,
                text=True
            )
            is_running = result.stdout.strip() == 'active'
            
            # 检查是否开机启动
            result = subprocess.run(
                ['systemctl', 'is-enabled', name],
                capture_output=True,
                text=True
            )
            is_enabled = result.returncode == 0
            
            expected_running = state == "running"
            
            if is_running == expected_running and is_enabled == enabled:
                return ComplianceResult(
                    resource=f"service:{name}",
                    status=ComplianceStatus.COMPLIANT,
                    expected=f"{state}, enabled={enabled}",
                    actual=f"{'running' if is_running else 'stopped'}, enabled={is_enabled}",
                    message="Service state matches"
                )
            else:
                return ComplianceResult(
                    resource=f"service:{name}",
                    status=ComplianceStatus.NON_COMPLIANT,
                    expected=f"{state}, enabled={enabled}",
                    actual=f"{'running' if is_running else 'stopped'}, enabled={is_enabled}",
                    message="Service state mismatch"
                )
        except Exception as e:
            return ComplianceResult(
                resource=f"service:{name}",
                status=ComplianceStatus.ERROR,
                expected=f"{state}, enabled={enabled}",
                actual="unknown",
                message=str(e)
            )
    
    def check_file(self, path: str, owner: str = None, 
                   mode: str = None) -> ComplianceResult:
        """检查文件状态"""
        import os
        import pwd
        import stat
        
        try:
            if not os.path.exists(path):
                return ComplianceResult(
                    resource=f"file:{path}",
                    status=ComplianceStatus.NON_COMPLIANT,
                    expected="present",
                    actual="absent",
                    message="File does not exist"
                )
            
            stat_info = os.stat(path)
            
            # 检查所有者
            if owner:
                file_owner = pwd.getpwuid(stat_info.st_uid).pw_name
                if file_owner != owner:
                    return ComplianceResult(
                        resource=f"file:{path}",
                        status=ComplianceStatus.NON_COMPLIANT,
                        expected=f"owner={owner}",
                        actual=f"owner={file_owner}",
                        message="File owner mismatch"
                    )
            
            # 检查权限
            if mode:
                file_mode = oct(stat.S_IMODE(stat_info.st_mode))[2:]
                if file_mode != mode:
                    return ComplianceResult(
                        resource=f"file:{path}",
                        status=ComplianceStatus.NON_COMPLIANT,
                        expected=f"mode={mode}",
                        actual=f"mode={file_mode}",
                        message="File mode mismatch"
                    )
            
            return ComplianceResult(
                resource=f"file:{path}",
                status=ComplianceStatus.COMPLIANT,
                expected="present",
                actual="present",
                message="File state matches"
            )
        except Exception as e:
            return ComplianceResult(
                resource=f"file:{path}",
                status=ComplianceStatus.ERROR,
                expected="present",
                actual="unknown",
                message=str(e)
            )
    
    def remediate(self, result: ComplianceResult) -> bool:
        """修复非合规状态"""
        if result.status == ComplianceStatus.COMPLIANT:
            return True
        
        resource_type, resource_name = result.resource.split(':')
        
        try:
            if resource_type == "package":
                state = result.expected
                action = "install" if state == "present" else "remove"
                subprocess.run(
                    ['apt-get', action, '-y', resource_name],
                    check=True
                )
                return True
            
            elif resource_type == "service":
                # 修复服务状态
                if "running" in result.expected:
                    subprocess.run(['systemctl', 'start', resource_name], check=True)
                else:
                    subprocess.run(['systemctl', 'stop', resource_name], check=True)
                return True
            
            elif resource_type == "file":
                # 修复文件状态
                if result.expected == "present":
                    # 需要更多信息来创建文件
                    pass
                return True
            
        except Exception:
            return False
        
        return False

# 使用示例
if __name__ == "__main__":
    manager = StateManager()
    
    # 检查软件包
    result = manager.check_package("nginx", "present")
    print(f"Package: {result.status.value}")
    
    # 检查服务
    result = manager.check_service("nginx", "running", True)
    print(f"Service: {result.status.value}")
    
    # 修复非合规状态
    if result.status == ComplianceStatus.NON_COMPLIANT:
        manager.remediate(result)
```

#### [场景] 典型应用场景

- 合规检查
- 配置漂移检测
- 自动修复

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. Ansible 自动化

#### [概念] 概念与解决的问题

Ansible 是最流行的配置管理工具之一，使用 YAML 格式定义配置，无需代理，通过 SSH 连接目标节点。

#### [语法] 核心用法

```yaml
# 完整 Ansible Playbook 示例
---
- name: Deploy Application
  hosts: all
  become: yes
  vars:
    app_name: myapp
    app_version: "1.0.0"
    app_port: 8080
    
  pre_tasks:
    - name: Update apt cache
      apt:
        update_cache: yes
        cache_valid_time: 3600
    
  roles:
    - role: geerlingguy.docker
      vars:
        docker_users:
          - "{{ ansible_user }}"
    
  tasks:
    - name: Create application directory
      file:
        path: "/opt/{{ app_name }}"
        state: directory
        owner: "{{ ansible_user }}"
        mode: '0755'
    
    - name: Deploy application
      docker_container:
        name: "{{ app_name }}"
        image: "myregistry.com/{{ app_name }}:{{ app_version }}"
        state: started
        ports:
          - "{{ app_port }}:8080"
        env:
          DATABASE_URL: "{{ database_url }}"
        restart_policy: always
    
    - name: Wait for application to start
      wait_for:
        port: "{{ app_port }}"
        timeout: 60
    
    - name: Health check
      uri:
        url: "http://localhost:{{ app_port }}/health"
        return_content: yes
      register: health_check
      retries: 3
      delay: 10
      until: health_check.status == 200
  
  post_tasks:
    - name: Notify deployment
      slack:
        token: "{{ slack_token }}"
        msg: "Deployed {{ app_name }} version {{ app_version }}"
      delegate_to: localhost
      run_once: true

# Ansible Galaxy Role
# requirements.yml
roles:
  - name: geerlingguy.docker
    version: 4.1.0
  - name: geerlingguy.nginx
    version: 3.1.0
```

#### [关联] 与核心层的关联

Ansible 实现了配置定义、分发、状态管理的完整流程。

### 2. 配置版本控制

#### [概念] 概念与解决的问题

配置版本控制将配置代码纳入 Git 管理，实现变更追踪、审计、回滚。是 GitOps 的基础。

#### [语法] 核心用法

```python
import subprocess
from datetime import datetime
from typing import List, Dict

class ConfigVersionControl:
    """配置版本控制"""
    
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
    
    def commit_config(self, message: str, files: List[str] = None):
        """提交配置变更"""
        if files:
            subprocess.run(['git', 'add'] + files, cwd=self.repo_path)
        else:
            subprocess.run(['git', 'add', '.'], cwd=self.repo_path)
        
        subprocess.run(['git', 'commit', '-m', message], cwd=self.repo_path)
    
    def get_config_history(self, file_path: str, limit: int = 10) -> List[Dict]:
        """获取配置历史"""
        result = subprocess.run(
            ['git', 'log', f'-{limit}', '--pretty=format:%H|%an|%ad|%s', '--date=short', file_path],
            cwd=self.repo_path,
            capture_output=True,
            text=True
        )
        
        history = []
        for line in result.stdout.strip().split('\n'):
            if line:
                parts = line.split('|')
                if len(parts) >= 4:
                    history.append({
                        'commit': parts[0],
                        'author': parts[1],
                        'date': parts[2],
                        'message': '|'.join(parts[3:])
                    })
        
        return history
    
    def rollback_config(self, commit_hash: str):
        """回滚配置"""
        subprocess.run(
            ['git', 'checkout', commit_hash],
            cwd=self.repo_path
        )
    
    def diff_config(self, commit1: str, commit2: str, file_path: str = None) -> str:
        """比较配置差异"""
        cmd = ['git', 'diff', commit1, commit2]
        if file_path:
            cmd.append(file_path)
        
        result = subprocess.run(
            cmd,
            cwd=self.repo_path,
            capture_output=True,
            text=True
        )
        
        return result.stdout
```

#### [关联] 与核心层的关联

版本控制增强了配置管理的可追溯性。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| Puppet | 声明式配置管理 |
| Chef | Ruby DSL 配置管理 |
| SaltStack | Python 配置管理 |
| GitOps | Git 驱动运维 |
| Infrastructure as Code | 基础设施即代码 |
| Configuration Drift | 配置漂移 |
| Secret Management | 密钥管理 |
| Templating | 模板引擎 |
| Idempotency | 幂等性 |
| Blue-Green Deployment | 蓝绿部署 |

---

## [实战] 核心实战清单

### 实战任务 1：构建配置管理流水线

构建完整的配置管理流水线：

```yaml
# .gitlab-ci.yml
stages:
  - validate
  - test
  - deploy

validate_ansible:
  stage: validate
  script:
    - ansible-lint playbooks/
    - ansible-playbook --syntax-check playbooks/site.yml

test_ansible:
  stage: test
  script:
    - molecule test

deploy_production:
  stage: deploy
  script:
    - ansible-playbook -i inventory/production playbooks/site.yml
  when: manual
  only:
    - main
```
