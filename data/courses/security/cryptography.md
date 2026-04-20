# 密码学基础 三层深度学习教程

## [总览] 技术总览

密码学是保护信息安全的科学，包括加密算法、哈希函数、数字签名等技术。现代密码学分为对称加密、非对称加密和哈希函数三大类。是网络安全和应用安全的基础。

本教程采用三层漏斗学习法：**核心层**聚焦对称加密、非对称加密、哈希函数三大基石；**重点层**深入数字签名和密钥管理；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 对称加密

#### [概念] 概念解释

对称加密使用相同的密钥进行加密和解密。常见算法包括 AES、DES、ChaCha20。具有加密速度快、适合大量数据的特点。

#### [语法] 核心语法 / 命令 / API

| 算法 | 密钥长度 | 分组大小 | 模式 |
|------|----------|----------|------|
| AES | 128/192/256 位 | 128 位 | CBC, GCM, CTR |
| DES | 56 位 | 64 位 | CBC, ECB |
| ChaCha20 | 256 位 | 流加密 | - |

#### [代码] 代码示例

```python
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
import os

# AES 加密
def aes_encrypt(plaintext: bytes, key: bytes) -> tuple:
    """
    AES-CBC 加密
    返回: (ciphertext, iv)
    """
    # 生成随机 IV
    iv = os.urandom(16)
    
    # 创建加密器
    cipher = Cipher(
        algorithms.AES(key),
        modes.CBC(iv),
        backend=default_backend()
    )
    encryptor = cipher.encryptor()
    
    # PKCS7 填充
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(plaintext) + padder.finalize()
    
    # 加密
    ciphertext = encryptor.update(padded_data) + encryptor.finalize()
    
    return ciphertext, iv

def aes_decrypt(ciphertext: bytes, key: bytes, iv: bytes) -> bytes:
    """AES-CBC 解密"""
    cipher = Cipher(
        algorithms.AES(key),
        modes.CBC(iv),
        backend=default_backend()
    )
    decryptor = cipher.decryptor()
    
    # 解密
    padded_data = decryptor.update(ciphertext) + decryptor.finalize()
    
    # 移除填充
    unpadder = padding.PKCS7(128).unpadder()
    plaintext = unpadder.update(padded_data) + unpadder.finalize()
    
    return plaintext

# AES-GCM 加密（推荐）
def aes_gcm_encrypt(plaintext: bytes, key: bytes, associated_data: bytes = None) -> dict:
    """
    AES-GCM 加密（带认证）
    返回: {ciphertext, iv, tag}
    """
    iv = os.urandom(12)  # GCM 推荐 12 字节 IV
    
    cipher = Cipher(
        algorithms.AES(key),
        modes.GCM(iv),
        backend=default_backend()
    )
    encryptor = cipher.encryptor()
    
    # 添加关联数据
    if associated_data:
        encryptor.authenticate_additional_data(associated_data)
    
    ciphertext = encryptor.update(plaintext) + encryptor.finalize()
    
    return {
        'ciphertext': ciphertext,
        'iv': iv,
        'tag': encryptor.tag
    }

def aes_gcm_decrypt(ciphertext: bytes, key: bytes, iv: bytes, tag: bytes, 
                    associated_data: bytes = None) -> bytes:
    """AES-GCM 解密"""
    cipher = Cipher(
        algorithms.AES(key),
        modes.GCM(iv, tag),
        backend=default_backend()
    )
    decryptor = cipher.decryptor()
    
    if associated_data:
        decryptor.authenticate_additional_data(associated_data)
    
    return decryptor.update(ciphertext) + decryptor.finalize()

# 使用示例
if __name__ == "__main__":
    # 生成密钥
    key = os.urandom(32)  # AES-256
    
    # 加密
    plaintext = b"Hello, World!"
    result = aes_gcm_encrypt(plaintext, key)
    
    # 解密
    decrypted = aes_gcm_decrypt(
        result['ciphertext'], 
        key, 
        result['iv'], 
        result['tag']
    )
    
    print(f"原文: {plaintext}")
    print(f"解密: {decrypted}")
    assert plaintext == decrypted
```

#### [场景] 典型应用场景

- 数据存储加密
- 通信加密
- 文件加密

### 2. 非对称加密

#### [概念] 概念解释

非对称加密使用一对密钥：公钥加密，私钥解密。常见算法包括 RSA、ECC。解决了密钥分发问题，是数字证书和 HTTPS 的基础。

#### [语法] 核心语法 / 命令 / API

```python
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.backends import default_backend

# RSA 密钥生成
def generate_rsa_keypair(key_size: int = 2048):
    """生成 RSA 密钥对"""
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=key_size,
        backend=default_backend()
    )
    public_key = private_key.public_key()
    
    return private_key, public_key

# RSA 加密
def rsa_encrypt(plaintext: bytes, public_key) -> bytes:
    """RSA 公钥加密"""
    ciphertext = public_key.encrypt(
        plaintext,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    return ciphertext

# RSA 解密
def rsa_decrypt(ciphertext: bytes, private_key) -> bytes:
    """RSA 私钥解密"""
    plaintext = private_key.decrypt(
        ciphertext,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    return plaintext

# 密钥序列化
def serialize_key(private_key, public_key):
    """序列化密钥"""
    # 私钥 PEM
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    
    # 公钥 PEM
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    return private_pem, public_pem

# ECC 椭圆曲线加密
from cryptography.hazmat.primitives.asymmetric import ec

def generate_ecc_keypair():
    """生成 ECC 密钥对"""
    private_key = ec.generate_private_key(
        ec.SECP256R1(),  # P-256 曲线
        backend=default_backend()
    )
    public_key = private_key.public_key()
    
    return private_key, public_key

# ECDH 密钥交换
def ecdh_key_exchange(private_key_a, public_key_b):
    """ECDH 密钥交换"""
    shared_key = private_key_a.exchange(
        ec.ECDH(),
        public_key_b
    )
    return shared_key

# 使用示例
if __name__ == "__main__":
    # RSA 示例
    private_key, public_key = generate_rsa_keypair()
    
    message = b"Secret message"
    encrypted = rsa_encrypt(message, public_key)
    decrypted = rsa_decrypt(encrypted, private_key)
    
    print(f"原文: {message}")
    print(f"解密: {decrypted}")
    
    # ECC 密钥交换示例
    priv_a, pub_a = generate_ecc_keypair()
    priv_b, pub_b = generate_ecc_keypair()
    
    # 双方计算共享密钥
    shared_a = ecdh_key_exchange(priv_a, pub_b)
    shared_b = ecdh_key_exchange(priv_b, pub_a)
    
    print(f"共享密钥匹配: {shared_a == shared_b}")
```

#### [场景] 典型应用场景

- 数字证书
- 密钥交换
- 数字签名

### 3. 哈希函数

#### [概念] 概念解释

哈希函数将任意长度数据映射为固定长度的摘要。具有单向性、抗碰撞性。常见算法包括 SHA-256、SHA-3、MD5（已不安全）。

#### [语法] 核心语法 / 命令 / API

```python
import hashlib
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend

# 使用 hashlib
def hash_sha256(data: bytes) -> str:
    """计算 SHA-256 哈希"""
    return hashlib.sha256(data).hexdigest()

def hash_sha512(data: bytes) -> str:
    """计算 SHA-512 哈希"""
    return hashlib.sha512(data).hexdigest()

def hash_blake2b(data: bytes) -> str:
    """计算 BLAKE2b 哈希"""
    return hashlib.blake2b(data).hexdigest()

# 使用 cryptography 库
def hash_with_cryptography(data: bytes) -> bytes:
    """使用 cryptography 库计算哈希"""
    digest = hashes.Hash(hashes.SHA256(), backend=default_backend())
    digest.update(data)
    return digest.finalize()

# 密码哈希（带盐值）
import os
import base64

def hash_password(password: str, salt: bytes = None) -> dict:
    """密码哈希（PBKDF2）"""
    if salt is None:
        salt = os.urandom(16)
    
    # PBKDF2 派生密钥
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        100000,  # 迭代次数
        dklen=32  # 输出长度
    )
    
    return {
        'hash': base64.b64encode(key).decode('utf-8'),
        'salt': base64.b64encode(salt).decode('utf-8'),
        'iterations': 100000
    }

def verify_password(password: str, stored_hash: str, stored_salt: str, iterations: int) -> bool:
    """验证密码"""
    salt = base64.b64decode(stored_salt)
    
    result = hash_password(password, salt)
    
    return result['hash'] == stored_hash

# HMAC 消息认证码
import hmac

def compute_hmac(key: bytes, message: bytes) -> str:
    """计算 HMAC"""
    return hmac.new(key, message, hashlib.sha256).hexdigest()

def verify_hmac(key: bytes, message: bytes, received_mac: str) -> bool:
    """验证 HMAC"""
    expected_mac = compute_hmac(key, message)
    return hmac.compare_digest(expected_mac, received_mac)

# 使用示例
if __name__ == "__main__":
    # 哈希示例
    data = b"Hello, World!"
    print(f"SHA-256: {hash_sha256(data)}")
    
    # 密码哈希示例
    password = "my_secure_password"
    result = hash_password(password)
    print(f"密码哈希: {result['hash']}")
    
    # 验证密码
    is_valid = verify_password(
        password, 
        result['hash'], 
        result['salt'],
        result['iterations']
    )
    print(f"密码验证: {is_valid}")
    
    # HMAC 示例
    key = b"secret_key"
    message = b"Important message"
    mac = compute_hmac(key, message)
    print(f"HMAC: {mac}")
```

#### [场景] 典型应用场景

- 密码存储
- 数据完整性验证
- 消息认证

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 数字签名

#### [概念] 概念与解决的问题

数字签名验证消息的真实性和完整性。发送方用私钥签名，接收方用公钥验证。广泛应用于软件分发、电子合同等场景。

#### [语法] 核心用法

```python
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidSignature

# RSA 签名
def sign_message(message: bytes, private_key) -> bytes:
    """RSA 私钥签名"""
    signature = private_key.sign(
        message,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    return signature

def verify_signature(message: bytes, signature: bytes, public_key) -> bool:
    """RSA 公钥验证签名"""
    try:
        public_key.verify(
            signature,
            message,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return True
    except InvalidSignature:
        return False

# ECDSA 签名
from cryptography.hazmat.primitives.asymmetric import ec

def sign_ecdsa(message: bytes, private_key) -> bytes:
    """ECDSA 签名"""
    signature = private_key.sign(
        message,
        ec.ECDSA(hashes.SHA256())
    )
    return signature

def verify_ecdsa(message: bytes, signature: bytes, public_key) -> bool:
    """ECDSA 验证"""
    try:
        public_key.verify(
            signature,
            message,
            ec.ECDSA(hashes.SHA256())
        )
        return True
    except InvalidSignature:
        return False

# 使用示例
if __name__ == "__main__":
    # RSA 签名示例
    private_key, public_key = generate_rsa_keypair()
    
    message = b"Important document"
    signature = sign_message(message, private_key)
    
    is_valid = verify_signature(message, signature, public_key)
    print(f"RSA 签名验证: {is_valid}")
    
    # ECDSA 签名示例
    priv_ecc, pub_ecc = generate_ecc_keypair()
    
    signature_ec = sign_ecdsa(message, priv_ecc)
    is_valid_ec = verify_ecdsa(message, signature_ec, pub_ecc)
    print(f"ECDSA 签名验证: {is_valid_ec}")
```

#### [关联] 与核心层的关联

数字签名基于非对称加密和哈希函数，是身份认证的核心技术。

### 2. 密钥管理

#### [概念] 概念与解决的问题

密钥管理包括密钥生成、存储、分发、更新、销毁等生命周期管理。是密码系统安全的关键环节。

#### [语法] 核心用法

```python
import os
import json
from datetime import datetime, timedelta
from typing import Dict, Optional

class KeyManager:
    """密钥管理器"""
    
    def __init__(self, storage_path: str = "./keys"):
        self.storage_path = storage_path
        self.keys: Dict[str, dict] = {}
        os.makedirs(storage_path, exist_ok=True)
    
    def generate_key(self, key_id: str, key_type: str = "aes", 
                     key_size: int = 256, expires_days: int = 365) -> dict:
        """生成新密钥"""
        if key_type == "aes":
            key_value = os.urandom(key_size // 8).hex()
        elif key_type == "rsa":
            private_key, public_key = generate_rsa_keypair(key_size)
            private_pem, public_pem = serialize_key(private_key, public_key)
            key_value = {
                'private_key': private_pem.decode(),
                'public_key': public_pem.decode()
            }
        else:
            raise ValueError(f"Unsupported key type: {key_type}")
        
        key_info = {
            'key_id': key_id,
            'key_type': key_type,
            'key_size': key_size,
            'key_value': key_value,
            'created_at': datetime.now().isoformat(),
            'expires_at': (datetime.now() + timedelta(days=expires_days)).isoformat(),
            'status': 'active'
        }
        
        self.keys[key_id] = key_info
        self._save_key(key_id, key_info)
        
        return key_info
    
    def get_key(self, key_id: str) -> Optional[dict]:
        """获取密钥"""
        if key_id not in self.keys:
            self._load_key(key_id)
        
        return self.keys.get(key_id)
    
    def rotate_key(self, key_id: str) -> dict:
        """轮换密钥"""
        old_key = self.get_key(key_id)
        if not old_key:
            raise KeyError(f"Key not found: {key_id}")
        
        # 标记旧密钥为待销毁
        old_key['status'] = 'deprecated'
        
        # 生成新密钥
        new_key_id = f"{key_id}_v{datetime.now().strftime('%Y%m%d%H%M%S')}"
        new_key = self.generate_key(
            new_key_id,
            old_key['key_type'],
            old_key['key_size']
        )
        
        return new_key
    
    def revoke_key(self, key_id: str):
        """撤销密钥"""
        key = self.get_key(key_id)
        if key:
            key['status'] = 'revoked'
            key['revoked_at'] = datetime.now().isoformat()
            self._save_key(key_id, key)
    
    def _save_key(self, key_id: str, key_info: dict):
        """保存密钥到文件"""
        file_path = os.path.join(self.storage_path, f"{key_id}.json")
        with open(file_path, 'w') as f:
            json.dump(key_info, f, indent=2)
    
    def _load_key(self, key_id: str):
        """从文件加载密钥"""
        file_path = os.path.join(self.storage_path, f"{key_id}.json")
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                self.keys[key_id] = json.load(f)

# 密钥派生
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

def derive_key(password: bytes, salt: bytes, length: int = 32) -> bytes:
    """从密码派生密钥"""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=length,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    return kdf.derive(password)

# 使用示例
if __name__ == "__main__":
    km = KeyManager()
    
    # 生成密钥
    key_info = km.generate_key("app_key_001", "aes", 256)
    print(f"生成密钥: {key_info['key_id']}")
    
    # 获取密钥
    retrieved_key = km.get_key("app_key_001")
    print(f"密钥状态: {retrieved_key['status']}")
```

#### [关联] 与核心层的关联

密钥管理保障加密系统的安全性，是密码学应用的关键。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| PKI | 公钥基础设施 |
| X.509 | 数字证书标准 |
| TLS/SSL | 传输层安全 |
| HSM | 硬件安全模块 |
| Zero-Knowledge | 零知识证明 |
| Homomorphic | 同态加密 |
| Quantum Crypto | 量子密码学 |
| Blockchain | 区块链密码学 |
| Post-Quantum | 后量子密码学 |
| Key Escrow | 密钥托管 |

---

## [实战] 核心实战清单

### 实战任务 1：实现安全通信系统

使用对称加密和非对称加密实现端到端安全通信：

```python
# 完整安全通信示例
class SecureChannel:
    """安全通信通道"""
    
    def __init__(self):
        self.session_key = None
        self.private_key, self.public_key = generate_rsa_keypair()
    
    def establish_session(self, peer_public_key):
        """建立会话（密钥交换）"""
        # 生成会话密钥
        self.session_key = os.urandom(32)
        
        # 用对方公钥加密会话密钥
        encrypted_session_key = rsa_encrypt(self.session_key, peer_public_key)
        
        return encrypted_session_key
    
    def receive_session_key(self, encrypted_key):
        """接收会话密钥"""
        self.session_key = rsa_decrypt(encrypted_key, self.private_key)
    
    def send_message(self, message: bytes) -> dict:
        """发送加密消息"""
        result = aes_gcm_encrypt(message, self.session_key)
        return result
    
    def receive_message(self, ciphertext: bytes, iv: bytes, tag: bytes) -> bytes:
        """接收解密消息"""
        return aes_gcm_decrypt(ciphertext, self.session_key, iv, tag)
```
