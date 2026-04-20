# SQL 基础 三层深度学习教程

## [总览] 技术总览

SQL（Structured Query Language）是用于管理关系型数据库的标准语言。它提供了数据查询、插入、更新、删除和数据库结构定义等功能，是数据分析和后端开发的必备技能。

本教程采用三层漏斗学习法：**核心层**聚焦 SELECT 查询、数据操作、表管理三大基石；**重点层**深入 JOIN 连接、聚合函数和子查询；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成 SQL 数据操作 **50% 以上** 的常见任务。

### 1. SELECT 查询

#### [概念] 概念解释

SELECT 语句用于从数据库中检索数据。它是 SQL 中最常用的语句，支持条件过滤、排序、分组等功能。

#### [语法] 核心语法 / 命令 / API

**基本语法：**

```sql
SELECT columns
FROM table
WHERE conditions
ORDER BY columns
LIMIT count;
```

**常用子句：**

| 子句 | 说明 |
|------|------|
| SELECT | 选择列 |
| FROM | 指定表 |
| WHERE | 过滤条件 |
| ORDER BY | 排序 |
| LIMIT | 限制行数 |
| DISTINCT | 去重 |

#### [代码] 代码示例

```sql
-- 创建示例数据库和表
CREATE DATABASE IF NOT EXISTS shop;
USE shop;

CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    city VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    stock INT DEFAULT 0
);

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    product_id INT,
    quantity INT NOT NULL,
    total_price DECIMAL(10, 2),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 插入示例数据
INSERT INTO customers (name, email, city) VALUES
    ('Alice', 'alice@example.com', 'Beijing'),
    ('Bob', 'bob@example.com', 'Shanghai'),
    ('Charlie', 'charlie@example.com', 'Guangzhou'),
    ('Diana', 'diana@example.com', 'Beijing');

INSERT INTO products (name, price, category, stock) VALUES
    ('Laptop', 999.99, 'Electronics', 50),
    ('Phone', 699.99, 'Electronics', 100),
    ('Book', 29.99, 'Books', 200),
    ('Pen', 4.99, 'Stationery', 500);

INSERT INTO orders (customer_id, product_id, quantity, total_price) VALUES
    (1, 1, 1, 999.99),
    (1, 3, 2, 59.98),
    (2, 2, 1, 699.99),
    (3, 1, 1, 999.99),
    (3, 4, 10, 49.90);

-- 基本 SELECT
SELECT * FROM customers;

-- 选择特定列
SELECT name, email FROM customers;

-- 使用别名
SELECT name AS customer_name, email AS contact_email FROM customers;

-- WHERE 条件过滤
SELECT * FROM customers WHERE city = 'Beijing';
SELECT * FROM products WHERE price > 100;
SELECT * FROM products WHERE category = 'Electronics' AND price < 1000;
SELECT * FROM products WHERE category = 'Electronics' OR category = 'Books';

-- 比较运算符
SELECT * FROM products WHERE price >= 100;
SELECT * FROM products WHERE price != 999.99;
SELECT * FROM products WHERE price BETWEEN 50 AND 500;

-- IN 和 NOT IN
SELECT * FROM customers WHERE city IN ('Beijing', 'Shanghai');
SELECT * FROM products WHERE category NOT IN ('Electronics');

-- LIKE 模糊匹配
SELECT * FROM customers WHERE name LIKE 'A%';
SELECT * FROM customers WHERE email LIKE '%@example.com';
SELECT * FROM products WHERE name LIKE '%a%';

-- NULL 处理
SELECT * FROM customers WHERE email IS NOT NULL;

-- DISTINCT 去重
SELECT DISTINCT city FROM customers;
SELECT DISTINCT category FROM products;

-- ORDER BY 排序
SELECT * FROM products ORDER BY price;
SELECT * FROM products ORDER BY price DESC;
SELECT * FROM products ORDER BY category, price DESC;

-- LIMIT 限制结果
SELECT * FROM products LIMIT 3;
SELECT * FROM products LIMIT 2, 3;

-- 组合使用
SELECT name, price 
FROM products 
WHERE category = 'Electronics' 
ORDER BY price DESC 
LIMIT 2;

-- 计算字段
SELECT name, price, price * 0.9 AS discounted_price FROM products;
SELECT name, CONCAT(name, ' - $', price) AS product_info FROM products;

-- 条件表达式
SELECT 
    name,
    price,
    CASE 
        WHEN price > 500 THEN 'Expensive'
        WHEN price > 50 THEN 'Moderate'
        ELSE 'Cheap'
    END AS price_level
FROM products;
```

#### [场景] 典型应用场景

1. 数据报表：查询并展示业务数据
2. 数据筛选：根据条件过滤数据
3. 数据导出：提取特定格式的数据

### 2. 数据操作

#### [概念] 概念解释

数据操作包括插入（INSERT）、更新（UPDATE）和删除（DELETE）数据，统称为 DML（Data Manipulation Language）操作。

#### [语法] 核心语法 / 命令 / API

**DML 语句：**

| 语句 | 说明 |
|------|------|
| INSERT | 插入数据 |
| UPDATE | 更新数据 |
| DELETE | 删除数据 |

#### [代码] 代码示例

```sql
-- INSERT 插入数据

-- 插入单行
INSERT INTO customers (name, email, city) 
VALUES ('Eve', 'eve@example.com', 'Shenzhen');

-- 插入多行
INSERT INTO customers (name, email, city) VALUES
    ('Frank', 'frank@example.com', 'Hangzhou'),
    ('Grace', 'grace@example.com', 'Nanjing');

-- 从查询插入
INSERT INTO customers_backup 
SELECT * FROM customers WHERE city = 'Beijing';

-- 插入并返回
INSERT INTO customers (name, email, city) 
VALUES ('Henry', 'henry@example.com', 'Wuhan')
RETURNING *;

-- UPDATE 更新数据

-- 更新单个字段
UPDATE customers 
SET city = 'Shanghai' 
WHERE name = 'Eve';

-- 更新多个字段
UPDATE products 
SET price = 899.99, stock = 45 
WHERE name = 'Laptop';

-- 使用表达式更新
UPDATE products 
SET price = price * 1.1 
WHERE category = 'Electronics';

-- 更新基于子查询
UPDATE products 
SET stock = stock - 1 
WHERE id = (
    SELECT product_id FROM orders WHERE id = 1
);

-- 条件更新
UPDATE products 
SET stock = CASE 
    WHEN stock < 10 THEN stock + 100
    WHEN stock > 100 THEN stock - 50
    ELSE stock
END;

-- DELETE 删除数据

-- 删除特定行
DELETE FROM customers WHERE name = 'Henry';

-- 删除多行
DELETE FROM customers WHERE city = 'Wuhan';

-- 删除所有行（保留表结构）
DELETE FROM customers_backup;

-- 截断表（更快，重置自增）
TRUNCATE TABLE customers_backup;

-- 删除基于子查询
DELETE FROM products 
WHERE id NOT IN (SELECT DISTINCT product_id FROM orders);

-- 安全删除（先查询再删除）
BEGIN;
SELECT * FROM customers WHERE id = 10;
DELETE FROM customers WHERE id = 10;
COMMIT;

-- 事务处理
START TRANSACTION;

INSERT INTO orders (customer_id, product_id, quantity, total_price)
VALUES (1, 1, 1, 999.99);

UPDATE products SET stock = stock - 1 WHERE id = 1;

COMMIT;

-- 回滚
ROLLBACK;

-- 实际应用：订单处理
DELIMITER //

CREATE PROCEDURE place_order(
    IN p_customer_id INT,
    IN p_product_id INT,
    IN p_quantity INT
)
BEGIN
    DECLARE v_price DECIMAL(10, 2);
    DECLARE v_stock INT;
    
    START TRANSACTION;
    
    SELECT price, stock INTO v_price, v_stock
    FROM products WHERE id = p_product_id FOR UPDATE;
    
    IF v_stock >= p_quantity THEN
        INSERT INTO orders (customer_id, product_id, quantity, total_price)
        VALUES (p_customer_id, p_product_id, p_quantity, v_price * p_quantity);
        
        UPDATE products SET stock = stock - p_quantity WHERE id = p_product_id;
        
        COMMIT;
        SELECT 'Order placed successfully' AS message;
    ELSE
        ROLLBACK;
        SELECT 'Insufficient stock' AS message;
    END IF;
END //

DELIMITER ;

CALL place_order(1, 1, 2);
```

#### [场景] 典型应用场景

1. 用户注册：插入新用户数据
2. 数据修正：更新错误或不完整的数据
3. 数据清理：删除过期或无效的数据

### 3. 表管理

#### [概念] 概念解释

表管理包括创建、修改和删除表结构，统称为 DDL（Data Definition Language）操作。良好的表设计是数据库性能的基础。

#### [语法] 核心语法 / 命令 / API

**DDL 语句：**

| 语句 | 说明 |
|------|------|
| CREATE TABLE | 创建表 |
| ALTER TABLE | 修改表 |
| DROP TABLE | 删除表 |

**数据类型：**

| 类型 | 说明 |
|------|------|
| INT | 整数 |
| VARCHAR(n) | 可变长度字符串 |
| DECIMAL(p,s) | 精确小数 |
| DATE | 日期 |
| TIMESTAMP | 时间戳 |
| TEXT | 长文本 |
| BOOLEAN | 布尔值 |

#### [代码] 代码示例

```sql
-- 创建表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    birth_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建带外键的表
CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- 创建带复合主键的表
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 查看表结构
DESCRIBE users;
SHOW CREATE TABLE users;

-- 修改表结构

-- 添加列
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255);

-- 添加多个列
ALTER TABLE users 
ADD COLUMN bio TEXT,
ADD COLUMN website VARCHAR(255);

-- 修改列类型
ALTER TABLE users MODIFY COLUMN phone VARCHAR(30);

-- 修改列名
ALTER TABLE users CHANGE COLUMN full_name display_name VARCHAR(100);

-- 删除列
ALTER TABLE users DROP COLUMN website;

-- 添加约束
ALTER TABLE users ADD CONSTRAINT chk_email CHECK (email LIKE '%@%');

-- 添加索引
ALTER TABLE users ADD INDEX idx_created_at (created_at);

-- 添加唯一索引
ALTER TABLE users ADD UNIQUE INDEX idx_username (username);

-- 删除索引
ALTER TABLE users DROP INDEX idx_created_at;

-- 添加外键
ALTER TABLE posts 
ADD CONSTRAINT fk_author 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 删除外键
ALTER TABLE posts DROP FOREIGN KEY fk_author;

-- 重命名表
ALTER TABLE users RENAME TO members;
RENAME TABLE members TO users;

-- 删除表
DROP TABLE IF EXISTS order_items;

-- 级联删除
DROP TABLE IF EXISTS posts CASCADE;

-- 清空表（保留结构）
TRUNCATE TABLE posts;

-- 创建临时表
CREATE TEMPORARY TABLE temp_orders AS
SELECT * FROM orders WHERE order_date > DATE_SUB(NOW(), INTERVAL 7 DAY);

-- 创建表副本
CREATE TABLE products_backup LIKE products;
INSERT INTO products_backup SELECT * FROM products;

-- 查看所有表
SHOW TABLES;

-- 查看表状态
SHOW TABLE STATUS LIKE 'users';

-- 实际应用：用户表完整设计
CREATE TABLE IF NOT EXISTS app_users (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    display_name VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT,
    phone VARCHAR(20),
    birth_date DATE,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    locale VARCHAR(10) DEFAULT 'zh_CN',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
    email_verified_at TIMESTAMP NULL,
    phone_verified_at TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(45),
    login_count INT UNSIGNED DEFAULT 0,
    failed_login_count TINYINT UNSIGNED DEFAULT 0,
    locked_until TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    role ENUM('user', 'premium', 'moderator', 'admin') DEFAULT 'user',
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_created_at (created_at),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active),
    
    CONSTRAINT chk_email_format CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_username_length CHECK (CHAR_LENGTH(username) >= 3)
);

-- 软删除视图
CREATE VIEW active_users AS
SELECT * FROM app_users WHERE deleted_at IS NULL;
```

#### [场景] 典型应用场景

1. 数据库初始化：创建应用所需的表结构
2. 迭代开发：根据需求修改表结构
3. 数据迁移：创建表副本进行数据迁移

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的数据查询能力和分析能力将显著提升。

### 1. JOIN 连接

#### [概念] 概念与解决的问题

JOIN 用于根据关联条件连接多个表的数据。理解不同类型的 JOIN 是进行复杂查询的基础。

#### [语法] 核心用法

**JOIN 类型：**

| 类型 | 说明 |
|------|------|
| INNER JOIN | 内连接，只返回匹配的行 |
| LEFT JOIN | 左连接，返回左表所有行 |
| RIGHT JOIN | 右连接，返回右表所有行 |
| FULL JOIN | 全连接，返回所有行 |
| CROSS JOIN | 交叉连接，笛卡尔积 |

#### [代码] 代码示例

```sql
-- INNER JOIN 内连接
SELECT 
    orders.id AS order_id,
    customers.name AS customer_name,
    products.name AS product_name,
    orders.quantity,
    orders.total_price
FROM orders
INNER JOIN customers ON orders.customer_id = customers.id
INNER JOIN products ON orders.product_id = products.id;

-- LEFT JOIN 左连接
SELECT 
    customers.name AS customer_name,
    COUNT(orders.id) AS order_count,
    COALESCE(SUM(orders.total_price), 0) AS total_spent
FROM customers
LEFT JOIN orders ON customers.id = orders.customer_id
GROUP BY customers.id, customers.name;

-- 查找没有订单的客户
SELECT customers.name
FROM customers
LEFT JOIN orders ON customers.id = orders.customer_id
WHERE orders.id IS NULL;

-- RIGHT JOIN 右连接
SELECT 
    products.name AS product_name,
    COUNT(orders.id) AS order_count
FROM orders
RIGHT JOIN products ON orders.product_id = products.id
GROUP BY products.id, products.name;

-- 自连接
CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    manager_id INT,
    FOREIGN KEY (manager_id) REFERENCES employees(id)
);

SELECT 
    e.name AS employee,
    m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;

-- 多表连接
SELECT 
    o.id AS order_id,
    c.name AS customer,
    p.name AS product,
    p.category,
    o.quantity,
    o.total_price,
    o.order_date
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id
INNER JOIN products p ON o.product_id = p.id
WHERE o.order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY o.order_date DESC;

-- 复合条件连接
SELECT 
    o.id,
    c.name,
    p.name,
    o.quantity
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN products p ON o.product_id = p.id
    AND p.category = 'Electronics';

-- 使用 USING（列名相同时）
SELECT * FROM orders
INNER JOIN customers USING (id);

-- 实际应用：销售报表
SELECT 
    c.city,
    p.category,
    COUNT(DISTINCT o.id) AS order_count,
    SUM(o.quantity) AS total_quantity,
    SUM(o.total_price) AS total_revenue,
    AVG(o.total_price) AS avg_order_value
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN products p ON o.product_id = p.id
GROUP BY c.city, p.category
ORDER BY total_revenue DESC;
```

#### [关联] 与核心层的关联

JOIN 是 SELECT 查询的扩展，用于关联多个表的数据，实现更复杂的数据分析。

### 2. 聚合函数

#### [概念] 概念与解决的问题

聚合函数对一组值进行计算，返回单个值。结合 GROUP BY 可以对数据进行分组统计。

#### [语法] 核心用法

**常用聚合函数：**

| 函数 | 说明 |
|------|------|
| COUNT() | 计数 |
| SUM() | 求和 |
| AVG() | 平均值 |
| MAX() | 最大值 |
| MIN() | 最小值 |

#### [代码] 代码示例

```sql
-- 基本聚合
SELECT COUNT(*) AS total_customers FROM customers;
SELECT COUNT(email) AS customers_with_email FROM customers;
SELECT COUNT(DISTINCT city) AS unique_cities FROM customers;

SELECT 
    SUM(total_price) AS total_revenue,
    AVG(total_price) AS avg_order_value,
    MAX(total_price) AS max_order,
    MIN(total_price) AS min_order
FROM orders;

-- GROUP BY 分组
SELECT city, COUNT(*) AS customer_count
FROM customers
GROUP BY city;

SELECT category, COUNT(*) AS product_count, AVG(price) AS avg_price
FROM products
GROUP BY category;

-- HAVING 过滤分组
SELECT 
    customer_id,
    COUNT(*) AS order_count,
    SUM(total_price) AS total_spent
FROM orders
GROUP BY customer_id
HAVING total_spent > 500;

-- 多列分组
SELECT 
    city,
    category,
    COUNT(*) AS count
FROM customers c
JOIN orders o ON c.id = o.customer_id
JOIN products p ON o.product_id = p.id
GROUP BY city, category
ORDER BY city, count DESC;

-- ROLLUP 分组汇总
SELECT 
    city,
    COUNT(*) AS count
FROM customers
GROUP BY city WITH ROLLUP;

-- CUBE 多维汇总
SELECT 
    city,
    category,
    COUNT(*) AS count
FROM customers c
JOIN orders o ON c.id = o.customer_id
JOIN products p ON o.product_id = p.id
GROUP BY city, category WITH CUBE;

-- GROUPING SETS
SELECT 
    city,
    category,
    COUNT(*) AS count
FROM customers c
JOIN orders o ON c.id = o.customer_id
JOIN products p ON o.product_id = p.id
GROUP BY GROUPING SETS (
    (city, category),
    (city),
    (category),
    ()
);

-- 窗口函数
SELECT 
    name,
    price,
    category,
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS rank_in_category,
    RANK() OVER (ORDER BY price DESC) AS overall_rank,
    DENSE_RANK() OVER (ORDER BY price DESC) AS dense_rank,
    SUM(price) OVER (PARTITION BY category) AS category_total,
    AVG(price) OVER (PARTITION BY category) AS category_avg,
    LAG(price) OVER (ORDER BY price) AS prev_price,
    LEAD(price) OVER (ORDER BY price) AS next_price
FROM products;

-- 累计求和
SELECT 
    order_date,
    total_price,
    SUM(total_price) OVER (ORDER BY order_date) AS running_total
FROM orders
ORDER BY order_date;

-- 移动平均
SELECT 
    order_date,
    total_price,
    AVG(total_price) OVER (
        ORDER BY order_date 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS moving_avg
FROM orders;

-- 实际应用：销售分析
SELECT 
    DATE(order_date) AS date,
    COUNT(*) AS orders,
    SUM(total_price) AS revenue,
    AVG(total_price) AS avg_order,
    SUM(SUM(total_price)) OVER (ORDER BY DATE(order_date)) AS cumulative_revenue
FROM orders
GROUP BY DATE(order_date)
ORDER BY date;
```

#### [关联] 与核心层的关联

聚合函数与 SELECT 查询结合，用于数据统计和分析，是报表查询的核心。

### 3. 子查询

#### [概念] 概念与解决的问题

子查询是嵌套在其他查询中的查询，可以用于条件判断、数据来源或计算字段。理解子查询是编写复杂查询的关键。

#### [语法] 核心用法

**子查询类型：**

| 类型 | 说明 |
|------|------|
| 标量子查询 | 返回单个值 |
| 列子查询 | 返回单列多行 |
| 行子查询 | 返回单行多列 |
| 表子查询 | 返回多行多列 |

#### [代码] 代码示例

```sql
-- 标量子查询
SELECT name FROM customers
WHERE id = (SELECT customer_id FROM orders WHERE id = 1);

SELECT 
    name,
    price,
    (SELECT AVG(price) FROM products) AS avg_price,
    price - (SELECT AVG(price) FROM products) AS diff_from_avg
FROM products;

-- 列子查询
SELECT * FROM customers
WHERE id IN (SELECT customer_id FROM orders);

SELECT * FROM products
WHERE id NOT IN (SELECT DISTINCT product_id FROM orders);

-- EXISTS 子查询
SELECT name FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o WHERE o.customer_id = c.id
);

SELECT name FROM customers c
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.customer_id = c.id
);

-- 行子查询
SELECT * FROM products
WHERE (category, price) = (
    SELECT category, MAX(price) FROM products GROUP BY category LIMIT 1
);

-- 表子查询（派生表）
SELECT category, avg_price
FROM (
    SELECT category, AVG(price) AS avg_price
    FROM products
    GROUP BY category
) AS category_avg
WHERE avg_price > 100;

-- 公用表表达式（CTE）
WITH customer_orders AS (
    SELECT 
        customer_id,
        COUNT(*) AS order_count,
        SUM(total_price) AS total_spent
    FROM orders
    GROUP BY customer_id
)
SELECT 
    c.name,
    co.order_count,
    co.total_spent
FROM customers c
LEFT JOIN customer_orders co ON c.id = co.customer_id
ORDER BY co.total_spent DESC;

-- 多个 CTE
WITH 
top_products AS (
    SELECT id, name, price
    FROM products
    ORDER BY price DESC
    LIMIT 5
),
top_customers AS (
    SELECT customer_id, SUM(total_price) AS total
    FROM orders
    GROUP BY customer_id
    ORDER BY total DESC
    LIMIT 5
)
SELECT 
    p.name AS product,
    c.name AS customer
FROM top_products p
CROSS JOIN top_customers tc
JOIN customers c ON tc.customer_id = c.id;

-- 递归 CTE
WITH RECURSIVE category_tree AS (
    SELECT id, name, parent_id, 1 AS level
    FROM categories
    WHERE parent_id IS NULL
    
    UNION ALL
    
    SELECT c.id, c.name, c.parent_id, ct.level + 1
    FROM categories c
    INNER JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY level;

-- 相关子查询
SELECT 
    name,
    price,
    category,
    (SELECT AVG(price) FROM products p2 WHERE p2.category = p1.category) AS category_avg
FROM products p1;

-- UPDATE 中的子查询
UPDATE products
SET price = (
    SELECT AVG(price) * 1.1 FROM products WHERE category = 'Electronics'
)
WHERE category = 'Electronics';

-- DELETE 中的子查询
DELETE FROM customers
WHERE id NOT IN (SELECT DISTINCT customer_id FROM orders);

-- 实际应用：复杂报表
WITH monthly_sales AS (
    SELECT 
        DATE_FORMAT(order_date, '%Y-%m') AS month,
        category,
        SUM(total_price) AS revenue
    FROM orders o
    JOIN products p ON o.product_id = p.id
    GROUP BY month, category
),
monthly_totals AS (
    SELECT 
        month,
        SUM(revenue) AS total_revenue
    FROM monthly_sales
    GROUP BY month
)
SELECT 
    ms.month,
    ms.category,
    ms.revenue,
    mt.total_revenue,
    ROUND(ms.revenue / mt.total_revenue * 100, 2) AS percentage
FROM monthly_sales ms
JOIN monthly_totals mt ON ms.month = mt.month
ORDER BY ms.month, ms.revenue DESC;
```

#### [关联] 与核心层的关联

子查询扩展了 SELECT 的能力，可以处理更复杂的查询逻辑。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| 索引优化 | 需要提高查询性能 |
| 事务隔离级别 | 需要控制并发访问 |
| 存储过程 | 需要封装业务逻辑 |
| 触发器 | 需要自动执行操作 |
| 视图 | 需要简化复杂查询 |
| 分区表 | 需要管理大表数据 |
| 全文索引 | 需要文本搜索 |
| JSON 操作 | 需要处理 JSON 数据 |
| 正则表达式 | 需要复杂模式匹配 |
| 游标 | 需要逐行处理数据 |
| 动态 SQL | 需要构建动态查询 |
| 性能分析 | 需要分析查询性能 |
| 备份恢复 | 需要数据备份和恢复 |
| 主从复制 | 需要数据同步 |
| 分库分表 | 需要处理海量数据 |

---

## [实战] 核心实战清单

### 实战任务 1：设计一个电商订单系统

**任务描述：**

设计并实现一个电商订单系统的数据库，包括：
1. 用户表、商品表、订单表、订单详情表
2. 查询用户订单历史
3. 统计商品销售情况
4. 分析用户消费行为

**要求：**
- 使用外键保证数据完整性
- 使用索引优化查询
- 使用事务保证数据一致性

**参考实现：**

```sql
-- 数据库设计
CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;

-- 用户表
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- 商品分类表
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    parent_id INT,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- 商品表
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    category_id INT,
    status ENUM('active', 'inactive', 'discontinued') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_price (price)
);

-- 订单表
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    status ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- 订单详情表
CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
);

-- 插入测试数据
INSERT INTO categories (name, parent_id) VALUES
    ('Electronics', NULL),
    ('Books', NULL),
    ('Phones', 1),
    ('Laptops', 1);

INSERT INTO products (name, description, price, stock, category_id) VALUES
    ('iPhone 15', 'Latest iPhone', 999.99, 100, 3),
    ('MacBook Pro', 'Professional laptop', 1999.99, 50, 4),
    ('Python Programming', 'Learn Python', 49.99, 200, 2);

INSERT INTO users (username, email, phone, address) VALUES
    ('alice', 'alice@example.com', '13800138000', 'Beijing'),
    ('bob', 'bob@example.com', '13900139000', 'Shanghai');

-- 查询用户订单历史
SELECT 
    o.id AS order_id,
    o.created_at,
    o.status,
    o.total_amount,
    GROUP_CONCAT(p.name SEPARATOR ', ') AS products
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.user_id = 1
GROUP BY o.id
ORDER BY o.created_at DESC;

-- 统计商品销售情况
SELECT 
    p.id,
    p.name,
    p.category_id,
    SUM(oi.quantity) AS total_sold,
    SUM(oi.subtotal) AS total_revenue,
    COUNT(DISTINCT o.user_id) AS unique_buyers
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
GROUP BY p.id, p.name, p.category_id
ORDER BY total_revenue DESC;

-- 分析用户消费行为
WITH user_stats AS (
    SELECT 
        u.id,
        u.username,
        COUNT(DISTINCT o.id) AS order_count,
        SUM(o.total_amount) AS total_spent,
        AVG(o.total_amount) AS avg_order_value,
        MAX(o.created_at) AS last_order_date
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
    GROUP BY u.id, u.username
)
SELECT 
    username,
    order_count,
    total_spent,
    avg_order_value,
    CASE 
        WHEN order_count >= 10 THEN 'VIP'
        WHEN order_count >= 5 THEN 'Regular'
        WHEN order_count >= 1 THEN 'New'
        ELSE 'Inactive'
    END AS customer_level
FROM user_stats
ORDER BY total_spent DESC;
```
