# Java 基础 三层深度学习教程

## [总览] 技术总览

Java 是一门面向对象的编程语言，具有跨平台、安全、稳定等特点。它广泛应用于企业级应用开发、Android 开发、大数据处理等领域。Java 的核心思想是"一次编写，到处运行"。

本教程采用三层漏斗学习法：**核心层**聚焦面向对象编程、集合框架、异常处理三大基石；**重点层**深入泛型和流式编程；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成 Java 开发 **50% 以上** 的常见任务。

### 1. 面向对象编程

#### [概念] 概念解释

Java 是纯面向对象语言，一切皆对象。核心概念包括类、对象、继承、封装、多态。理解这些概念是 Java 开发的基础。

#### [语法] 核心语法 / 命令 / API

**OOP 核心概念：**

| 概念 | 说明 |
|------|------|
| 类 | 对象的模板 |
| 对象 | 类的实例 |
| 封装 | 隐藏实现细节 |
| 继承 | 代码复用 |
| 多态 | 同一接口不同实现 |

#### [代码] 代码示例

```java
// 类定义
public class Person {
    private String name;
    private int age;
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public int getAge() {
        return age;
    }
    
    public void setAge(int age) {
        if (age > 0) {
            this.age = age;
        }
    }
    
    public void introduce() {
        System.out.println("My name is " + name + ", I'm " + age + " years old.");
    }
}

// 继承
public class Student extends Person {
    private String school;
    private double gpa;
    
    public Student(String name, int age, String school) {
        super(name, age);
        this.school = school;
    }
    
    public String getSchool() {
        return school;
    }
    
    public void setSchool(String school) {
        this.school = school;
    }
    
    @Override
    public void introduce() {
        super.introduce();
        System.out.println("I study at " + school);
    }
}

// 接口
public interface Drawable {
    void draw();
    
    default void printInfo() {
        System.out.println("This is a drawable object");
    }
}

public interface Resizable {
    void resize(double factor);
}

// 实现接口
public class Circle implements Drawable, Resizable {
    private double radius;
    
    public Circle(double radius) {
        this.radius = radius;
    }
    
    @Override
    public void draw() {
        System.out.println("Drawing a circle with radius " + radius);
    }
    
    @Override
    public void resize(double factor) {
        radius *= factor;
    }
}

// 抽象类
public abstract class Shape {
    protected String color;
    
    public Shape(String color) {
        this.color = color;
    }
    
    public abstract double getArea();
    
    public String getColor() {
        return color;
    }
}

public class Rectangle extends Shape {
    private double width;
    private double height;
    
    public Rectangle(String color, double width, double height) {
        super(color);
        this.width = width;
        this.height = height;
    }
    
    @Override
    public double getArea() {
        return width * height;
    }
}

// 多态示例
public class PolymorphismDemo {
    public static void main(String[] args) {
        Person person = new Student("Alice", 20, "MIT");
        person.introduce();
        
        Drawable drawable = new Circle(5.0);
        drawable.draw();
        
        Shape shape = new Rectangle("red", 10, 20);
        System.out.println("Area: " + shape.getArea());
    }
}

// 访问修饰符
public class AccessModifiers {
    public int publicField;
    protected int protectedField;
    int defaultField;
    private int privateField;
    
    public void publicMethod() {}
    protected void protectedMethod() {}
    void defaultMethod() {}
    private void privateMethod() {}
}

// 静态成员
public class Counter {
    private static int count = 0;
    
    public Counter() {
        count++;
    }
    
    public static int getCount() {
        return count;
    }
    
    public static void reset() {
        count = 0;
    }
}

// 单例模式
public class Singleton {
    private static volatile Singleton instance;
    
    private Singleton() {}
    
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}

// 枚举
public enum Day {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY;
    
    public boolean isWeekend() {
        return this == SATURDAY || this == SUNDAY;
    }
}

public enum Status {
    PENDING("等待中"),
    APPROVED("已批准"),
    REJECTED("已拒绝");
    
    private final String description;
    
    Status(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
```

#### [场景] 典型应用场景

1. 实体类：定义数据模型
2. 服务类：封装业务逻辑
3. 工具类：提供通用功能

### 2. 集合框架

#### [概念] 概念解释

Java 集合框架提供了存储和操作对象组的统一架构。主要包括 List、Set、Map 三大类接口及其实现类。

#### [语法] 核心语法 / 命令 / API

**集合类型：**

| 类型 | 实现类 | 特点 |
|------|--------|------|
| List | ArrayList, LinkedList | 有序可重复 |
| Set | HashSet, TreeSet | 无序不重复 |
| Map | HashMap, TreeMap | 键值对 |

#### [代码] 代码示例

```java
import java.util.*;

// List 示例
public class ListDemo {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        
        names.add("Alice");
        names.add("Bob");
        names.add("Charlie");
        names.add(1, "David");
        
        System.out.println("First: " + names.get(0));
        System.out.println("Size: " + names.size());
        
        names.remove("Bob");
        names.remove(0);
        
        for (String name : names) {
            System.out.println(name);
        }
        
        List<Integer> numbers = new LinkedList<>();
        numbers.add(1);
        numbers.add(2);
        numbers.addFirst(0);
        numbers.addLast(3);
        
        System.out.println("First: " + numbers.getFirst());
        System.out.println("Last: " + numbers.getLast());
    }
}

// Set 示例
public class SetDemo {
    public static void main(String[] args) {
        Set<String> uniqueNames = new HashSet<>();
        
        uniqueNames.add("Alice");
        uniqueNames.add("Bob");
        uniqueNames.add("Alice");
        
        System.out.println("Size: " + uniqueNames.size());
        
        Set<Integer> sortedNumbers = new TreeSet<>();
        sortedNumbers.add(5);
        sortedNumbers.add(1);
        sortedNumbers.add(3);
        
        for (Integer num : sortedNumbers) {
            System.out.println(num);
        }
        
        Set<String> linkedSet = new LinkedHashSet<>();
        linkedSet.add("C");
        linkedSet.add("A");
        linkedSet.add("B");
    }
}

// Map 示例
public class MapDemo {
    public static void main(String[] args) {
        Map<String, Integer> ages = new HashMap<>();
        
        ages.put("Alice", 25);
        ages.put("Bob", 30);
        ages.put("Charlie", 28);
        
        System.out.println("Alice's age: " + ages.get("Alice"));
        System.out.println("Contains Bob: " + ages.containsKey("Bob"));
        System.out.println("Contains age 25: " + ages.containsValue(25));
        
        ages.remove("Bob");
        
        for (String key : ages.keySet()) {
            System.out.println(key + ": " + ages.get(key));
        }
        
        for (Map.Entry<String, Integer> entry : ages.entrySet()) {
            System.out.println(entry.getKey() + " = " + entry.getValue());
        }
        
        Map<String, String> sortedMap = new TreeMap<>();
        sortedMap.put("c", "charlie");
        sortedMap.put("a", "alice");
        sortedMap.put("b", "bob");
    }
}

// 实际应用：用户管理
public class UserManager {
    private Map<String, User> users = new HashMap<>();
    
    public void addUser(User user) {
        users.put(user.getId(), user);
    }
    
    public User getUser(String id) {
        return users.get(id);
    }
    
    public void removeUser(String id) {
        users.remove(id);
    }
    
    public List<User> getAllUsers() {
        return new ArrayList<>(users.values());
    }
    
    public List<User> findUsersByName(String name) {
        List<User> result = new ArrayList<>();
        for (User user : users.values()) {
            if (user.getName().contains(name)) {
                result.add(user);
            }
        }
        return result;
    }
}

class User {
    private String id;
    private String name;
    private String email;
    
    public User(String id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
    
    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
}

// 集合工具类
public class CollectionUtils {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(3, 1, 4, 1, 5, 9, 2, 6);
        
        Collections.sort(numbers);
        System.out.println("Sorted: " + numbers);
        
        Collections.reverse(numbers);
        System.out.println("Reversed: " + numbers);
        
        Collections.shuffle(numbers);
        System.out.println("Shuffled: " + numbers);
        
        int max = Collections.max(numbers);
        int min = Collections.min(numbers);
        
        int frequency = Collections.frequency(numbers, 1);
        
        List<Integer> unmodifiable = Collections.unmodifiableList(numbers);
    }
}
```

#### [场景] 典型应用场景

1. 数据存储：使用 List 存储有序数据
2. 去重：使用 Set 存储唯一值
3. 映射关系：使用 Map 存储键值对

### 3. 异常处理

#### [概念] 概念解释

Java 使用异常处理机制处理程序运行时的错误。异常分为检查异常（checked）和非检查异常（unchecked），通过 try-catch-finally 块捕获和处理。

#### [语法] 核心语法 / 命令 / API

**异常类型：**

| 类型 | 说明 | 示例 |
|------|------|------|
| Error | 系统级错误 | OutOfMemoryError |
| Checked Exception | 编译时检查 | IOException |
| Unchecked Exception | 运行时异常 | NullPointerException |

#### [代码] 代码示例

```java
// 基本异常处理
public class ExceptionDemo {
    public static void main(String[] args) {
        try {
            int result = 10 / 0;
        } catch (ArithmeticException e) {
            System.out.println("Error: " + e.getMessage());
        } finally {
            System.out.println("Cleanup");
        }
    }
}

// 多个 catch 块
public class MultipleCatch {
    public static void main(String[] args) {
        try {
            int[] arr = new int[5];
            arr[10] = 50;
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Array index error: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("General error: " + e.getMessage());
        }
    }
}

// try-with-resources
public class ResourceDemo {
    public static void main(String[] args) {
        try (BufferedReader reader = new BufferedReader(new FileReader("file.txt"))) {
            String line = reader.readLine();
            while (line != null) {
                System.out.println(line);
                line = reader.readLine();
            }
        } catch (IOException e) {
            System.out.println("Error reading file: " + e.getMessage());
        }
    }
}

// 自定义异常
public class InsufficientBalanceException extends Exception {
    private double balance;
    private double amount;
    
    public InsufficientBalanceException(double balance, double amount) {
        super("Insufficient balance: " + balance + ", required: " + amount);
        this.balance = balance;
        this.amount = amount;
    }
    
    public double getBalance() { return balance; }
    public double getAmount() { return amount; }
}

// 使用自定义异常
public class BankAccount {
    private double balance;
    
    public BankAccount(double initialBalance) {
        this.balance = initialBalance;
    }
    
    public void withdraw(double amount) throws InsufficientBalanceException {
        if (amount > balance) {
            throw new InsufficientBalanceException(balance, amount);
        }
        balance -= amount;
    }
    
    public double getBalance() {
        return balance;
    }
}

// 异常链
public class ExceptionChain {
    public void method1() throws Exception {
        try {
            method2();
        } catch (SQLException e) {
            throw new Exception("Failed to process data", e);
        }
    }
    
    public void method2() throws SQLException {
        throw new SQLException("Database connection failed");
    }
}

// 实际应用：文件处理
public class FileProcessor {
    public List<String> readLines(String filename) throws IOException {
        List<String> lines = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(filename))) {
            String line;
            while ((line = reader.readLine()) != null) {
                lines.add(line);
            }
        }
        return lines;
    }
    
    public void writeLines(String filename, List<String> lines) throws IOException {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filename))) {
            for (String line : lines) {
                writer.write(line);
                writer.newLine();
            }
        }
    }
}

// 异常处理最佳实践
public class ExceptionBestPractices {
    // 不要捕获 Exception
    public void badPractice() {
        try {
            // some code
        } catch (Exception e) {
            // Bad: catches everything
        }
    }
    
    // 捕获具体异常
    public void goodPractice() {
        try {
            // some code
        } catch (IOException e) {
            // Handle IO exception
        } catch (SQLException e) {
            // Handle SQL exception
        }
    }
    
    // 不要忽略异常
    public void dontIgnore() {
        try {
            // some code
        } catch (IOException e) {
            throw new RuntimeException("Failed to process", e);
        }
    }
}
```

#### [场景] 典型应用场景

1. 文件操作：处理 IO 异常
2. 数据库操作：处理 SQL 异常
3. 业务逻辑：处理自定义异常

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的 Java 开发能力将显著提升。

### 1. 泛型

#### [概念] 概念与解决的问题

泛型允许在编译时指定类型参数，提供类型安全和代码复用。泛型广泛应用于集合框架和工具类。

#### [语法] 核心用法

**泛型用法：**

| 用法 | 语法 |
|------|------|
| 泛型类 | class Box<T> |
| 泛型接口 | interface Generator<T> |
| 泛型方法 | <T> T method(T arg) |
| 泛型约束 | <T extends Number> |

#### [代码] 代码示例

```java
// 泛型类
public class Box<T> {
    private T value;
    
    public void set(T value) {
        this.value = value;
    }
    
    public T get() {
        return value;
    }
}

Box<Integer> intBox = new Box<>();
intBox.set(42);
Integer value = intBox.get();

Box<String> strBox = new Box<>();
strBox.set("Hello");

// 泛型接口
public interface Generator<T> {
    T generate();
}

public class StringGenerator implements Generator<String> {
    @Override
    public String generate() {
        return UUID.randomUUID().toString();
    }
}

// 泛型方法
public class GenericMethods {
    public static <T> void printArray(T[] array) {
        for (T element : array) {
            System.out.println(element);
        }
    }
    
    public static <T extends Comparable<T>> T max(T a, T b) {
        return a.compareTo(b) > 0 ? a : b;
    }
    
    public static <T> List<T> toList(T... elements) {
        List<T> list = new ArrayList<>();
        Collections.addAll(list, elements);
        return list;
    }
}

// 泛型约束
public class NumberBox<T extends Number> {
    private T value;
    
    public void set(T value) {
        this.value = value;
    }
    
    public double doubleValue() {
        return value.doubleValue();
    }
}

// 通配符
public class WildcardDemo {
    // 无界通配符
    public void printList(List<?> list) {
        for (Object elem : list) {
            System.out.println(elem);
        }
    }
    
    // 上界通配符
    public double sum(List<? extends Number> list) {
        double total = 0;
        for (Number num : list) {
            total += num.doubleValue();
        }
        return total;
    }
    
    // 下界通配符
    public void addNumbers(List<? super Integer> list) {
        list.add(1);
        list.add(2);
        list.add(3);
    }
}
```

#### [关联] 与核心层的关联

泛型与集合框架紧密相关，提供了类型安全的集合操作。

### 2. 流式编程

#### [概念] 概念与解决的问题

Stream API 提供了声明式的数据处理方式，支持链式操作和并行处理，简化了集合操作的代码。

#### [语法] 核心用法

**Stream 操作：**

| 操作类型 | 方法 | 说明 |
|----------|------|------|
| 中间操作 | filter, map, sorted | 返回新 Stream |
| 终端操作 | collect, forEach, reduce | 产生结果 |

#### [代码] 代码示例

```java
import java.util.stream.*;
import java.util.*;

public class StreamDemo {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        
        // filter
        List<Integer> evens = numbers.stream()
            .filter(n -> n % 2 == 0)
            .collect(Collectors.toList());
        
        // map
        List<Integer> squared = numbers.stream()
            .map(n -> n * n)
            .collect(Collectors.toList());
        
        // sorted
        List<Integer> sorted = numbers.stream()
            .sorted(Comparator.reverseOrder())
            .collect(Collectors.toList());
        
        // reduce
        int sum = numbers.stream()
            .reduce(0, Integer::sum);
        
        // 组合操作
        List<Integer> result = numbers.stream()
            .filter(n -> n > 3)
            .map(n -> n * 2)
            .sorted()
            .collect(Collectors.toList());
        
        // 统计
        IntSummaryStatistics stats = numbers.stream()
            .mapToInt(Integer::intValue)
            .summaryStatistics();
        
        System.out.println("Max: " + stats.getMax());
        System.out.println("Min: " + stats.getMin());
        System.out.println("Average: " + stats.getAverage());
        
        // 分组
        Map<Boolean, List<Integer>> partitioned = numbers.stream()
            .collect(Collectors.partitioningBy(n -> n % 2 == 0));
        
        // 并行流
        long count = numbers.parallelStream()
            .filter(n -> n > 5)
            .count();
    }
}

// 实际应用：数据处理
class Employee {
    private String name;
    private String department;
    private double salary;
    
    public Employee(String name, String department, double salary) {
        this.name = name;
        this.department = department;
        this.salary = salary;
    }
    
    public String getName() { return name; }
    public String getDepartment() { return department; }
    public double getSalary() { return salary; }
}

public class EmployeeProcessor {
    public static void main(String[] args) {
        List<Employee> employees = Arrays.asList(
            new Employee("Alice", "IT", 80000),
            new Employee("Bob", "HR", 60000),
            new Employee("Charlie", "IT", 90000),
            new Employee("Diana", "Finance", 75000)
        );
        
        // 按部门分组
        Map<String, List<Employee>> byDepartment = employees.stream()
            .collect(Collectors.groupingBy(Employee::getDepartment));
        
        // 计算每个部门的平均工资
        Map<String, Double> avgSalaryByDept = employees.stream()
            .collect(Collectors.groupingBy(
                Employee::getDepartment,
                Collectors.averagingDouble(Employee::getSalary)
            ));
        
        // 找出工资最高的员工
        Optional<Employee> highestPaid = employees.stream()
            .max(Comparator.comparingDouble(Employee::getSalary));
        
        // 获取 IT 部门员工名字
        List<String> itNames = employees.stream()
            .filter(e -> "IT".equals(e.getDepartment()))
            .map(Employee::getName)
            .collect(Collectors.toList());
    }
}
```

#### [关联] 与核心层的关联

Stream API 与集合框架配合使用，提供了更简洁的数据处理方式。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| 多线程 | 需要并发编程 |
| 线程池 | 需要管理线程 |
| 同步机制 | 需要线程安全 |
| 反射 | 需要运行时类型操作 |
| 注解 | 需要元数据标记 |
| Lambda 表达式 | 需要函数式编程 |
| Optional | 需要空值处理 |
| 文件 NIO | 需要高效文件操作 |
| 网络编程 | 需要 Socket 通信 |
| JDBC | 需要数据库操作 |
| 序列化 | 需要对象持久化 |
| 正则表达式 | 需要文本匹配 |
| 日期时间 | 需要日期处理 |
| 日志 | 需要日志记录 |
| 单元测试 | 需要代码测试 |

---

## [实战] 核心实战清单

### 实战任务 1：实现一个简单的学生管理系统

**任务描述：**

创建一个学生管理系统，支持：
1. 添加、删除、修改学生信息
2. 按条件查询学生
3. 统计分析功能

**要求：**
- 使用面向对象设计
- 使用集合框架存储数据
- 使用泛型保证类型安全

**参考实现：**

```java
import java.util.*;
import java.util.stream.*;

public class StudentManagementSystem {
    private Map<String, Student> students = new HashMap<>();
    
    public void addStudent(Student student) {
        if (students.containsKey(student.getId())) {
            throw new IllegalArgumentException("Student already exists");
        }
        students.put(student.getId(), student);
    }
    
    public void removeStudent(String id) {
        students.remove(id);
    }
    
    public Student getStudent(String id) {
        return students.get(id);
    }
    
    public void updateStudent(Student student) {
        if (!students.containsKey(student.getId())) {
            throw new IllegalArgumentException("Student not found");
        }
        students.put(student.getId(), student);
    }
    
    public List<Student> getAllStudents() {
        return new ArrayList<>(students.values());
    }
    
    public List<Student> findByMajor(String major) {
        return students.values().stream()
            .filter(s -> s.getMajor().equals(major))
            .collect(Collectors.toList());
    }
    
    public List<Student> findByGpaRange(double min, double max) {
        return students.values().stream()
            .filter(s -> s.getGpa() >= min && s.getGpa() <= max)
            .collect(Collectors.toList());
    }
    
    public Map<String, Double> getAverageGpaByMajor() {
        return students.values().stream()
            .collect(Collectors.groupingBy(
                Student::getMajor,
                Collectors.averagingDouble(Student::getGpa)
            ));
    }
    
    public Optional<Student> getTopStudent() {
        return students.values().stream()
            .max(Comparator.comparingDouble(Student::getGpa));
    }
    
    public static void main(String[] args) {
        StudentManagementSystem system = new StudentManagementSystem();
        
        system.addStudent(new Student("S001", "Alice", "Computer Science", 3.8));
        system.addStudent(new Student("S002", "Bob", "Mathematics", 3.5));
        system.addStudent(new Student("S003", "Charlie", "Computer Science", 3.9));
        
        System.out.println("All students:");
        system.getAllStudents().forEach(System.out::println);
        
        System.out.println("\nCS students:");
        system.findByMajor("Computer Science").forEach(System.out::println);
        
        System.out.println("\nAverage GPA by major:");
        system.getAverageGpaByMajor().forEach((k, v) -> 
            System.out.println(k + ": " + v));
        
        System.out.println("\nTop student:");
        system.getTopStudent().ifPresent(System.out::println);
    }
}

class Student {
    private String id;
    private String name;
    private String major;
    private double gpa;
    
    public Student(String id, String name, String major, double gpa) {
        this.id = id;
        this.name = name;
        this.major = major;
        this.gpa = gpa;
    }
    
    public String getId() { return id; }
    public String getName() { return name; }
    public String getMajor() { return major; }
    public double getGpa() { return gpa; }
    
    @Override
    public String toString() {
        return String.format("Student{id='%s', name='%s', major='%s', gpa=%.2f}",
            id, name, major, gpa);
    }
}
```
