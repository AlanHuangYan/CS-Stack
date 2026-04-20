# 高级 Prompt 工程 三层深度学习教程

## [总览] 技术总览

Prompt 工程是与大语言模型交互的核心技能，通过精心设计的提示词引导模型生成高质量的输出。高级 Prompt 工程包括结构化提示、思维链推理、少样本学习等技术，是充分发挥 LLM 能力的关键。

本教程采用三层漏斗学习法：**核心层**聚焦 Prompt 基本结构、Zero-shot 与 Few-shot、输出格式控制三大基石；**重点层**深入 Chain of Thought 和 ReAct 模式；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成 Prompt 设计 **50% 以上** 的常见任务。

### 1. Prompt 基本结构

#### [概念] 概念解释

一个有效的 Prompt 通常包含角色定义、任务描述、约束条件和示例四个部分。清晰的结构可以帮助模型更好地理解意图并生成期望的输出。

#### [语法] 核心语法 / 命令 / API

**Prompt 结构：**

| 组件 | 说明 | 示例 |
|------|------|------|
| 角色 | 定义 AI 的身份 | 你是一位资深 Python 开发者 |
| 任务 | 明确要做什么 | 编写一个排序函数 |
| 约束 | 限制输出范围 | 代码需要包含注释 |
| 示例 | 提供参考格式 | 输入输出示例 |

#### [代码] 代码示例

```python
import openai
import json
from typing import Optional, List, Dict

client = openai.OpenAI()

def create_prompt(
    role: str,
    task: str,
    constraints: Optional[List[str]] = None,
    examples: Optional[List[Dict]] = None,
    output_format: Optional[str] = None
) -> str:
    """
    构建结构化 Prompt
    """
    prompt_parts = [f"# 角色\n{role}"]
    
    prompt_parts.append(f"\n# 任务\n{task}")
    
    if constraints:
        constraints_text = "\n".join([f"- {c}" for c in constraints])
        prompt_parts.append(f"\n# 约束条件\n{constraints_text}")
    
    if examples:
        examples_text = ""
        for i, example in enumerate(examples, 1):
            examples_text += f"\n示例 {i}:\n"
            examples_text += f"输入: {example.get('input', '')}\n"
            examples_text += f"输出: {example.get('output', '')}\n"
        prompt_parts.append(f"\n# 示例\n{examples_text}")
    
    if output_format:
        prompt_parts.append(f"\n# 输出格式\n{output_format}")
    
    return "\n".join(prompt_parts)

code_review_prompt = create_prompt(
    role="你是一位资深代码审查专家，精通 Python 最佳实践和安全编码规范。",
    task="审查以下 Python 代码，指出潜在问题并提供改进建议。",
    constraints=[
        "关注代码质量、性能和安全性",
        "提供具体的改进建议和代码示例",
        "按严重程度分类问题（高/中/低）"
    ],
    examples=[
        {
            "input": "def get_user(id):\n    return db.query(f'SELECT * FROM users WHERE id = {id}')",
            "output": "问题: SQL 注入风险 (高)\n建议: 使用参数化查询\n改进: db.query('SELECT * FROM users WHERE id = ?', [id])"
        }
    ],
    output_format="按以下格式输出:\n## 问题列表\n- [严重程度] 问题描述\n## 改进建议\n具体建议和代码"
)

print("=== 代码审查 Prompt ===")
print(code_review_prompt)

def call_llm(prompt: str, user_input: str, model: str = "gpt-4") -> str:
    """
    调用 LLM API
    """
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": user_input}
        ],
        temperature=0.7
    )
    return response.choices[0].message.content

class PromptTemplate:
    """
    Prompt 模板类
    """
    def __init__(self, template: str, input_variables: List[str]):
        self.template = template
        self.input_variables = input_variables
    
    def format(self, **kwargs) -> str:
        for var in self.input_variables:
            if var not in kwargs:
                raise ValueError(f"Missing required variable: {var}")
        return self.template.format(**kwargs)

translation_template = PromptTemplate(
    template="""# 角色
你是一位专业的翻译专家，精通 {source_lang} 和 {target_lang}。

# 任务
将以下 {source_lang} 文本翻译成 {target_lang}。

# 约束条件
- 保持原文的语气和风格
- 确保翻译准确、自然
- 保留专有名词的原文

# 输入文本
{text}

# 翻译结果""",
    input_variables=["source_lang", "target_lang", "text"]
)

print("\n=== 翻译 Prompt ===")
formatted_prompt = translation_template.format(
    source_lang="英语",
    target_lang="中文",
    text="Hello, World! This is a test."
)
print(formatted_prompt)

def create_system_prompt(
    identity: str,
    capabilities: List[str],
    limitations: List[str],
    style: str = "professional"
) -> str:
    """
    创建系统提示词
    """
    capabilities_text = "\n".join([f"- {c}" for c in capabilities])
    limitations_text = "\n".join([f"- {l}" for l in limitations])
    
    style_instructions = {
        "professional": "使用专业、正式的语言风格",
        "friendly": "使用友好、亲切的语言风格",
        "concise": "使用简洁、直接的语言风格",
        "detailed": "使用详细、解释性的语言风格"
    }
    
    return f"""# 身份
{identity}

# 能力
{capabilities_text}

# 限制
{limitations_text}

# 风格
{style_instructions.get(style, style_instructions['professional'])}

# 交互规则
1. 始终基于事实回答问题
2. 如果不确定，明确说明
3. 提供可操作的建议
4. 必要时请求澄清"""

assistant_prompt = create_system_prompt(
    identity="你是一个 AI 编程助手，专注于帮助开发者解决编程问题。",
    capabilities=[
        "代码编写和调试",
        "代码审查和优化",
        "技术方案设计",
        "最佳实践建议"
    ],
    limitations=[
        "无法执行代码",
        "无法访问外部资源",
        "不处理敏感信息"
    ],
    style="professional"
)

print("\n=== 系统提示词 ===")
print(assistant_prompt)
```

#### [场景] 典型应用场景

1. 代码助手：定义编程专家角色，提供代码帮助
2. 文档生成：定义技术写作角色，生成规范文档
3. 数据分析：定义数据分析师角色，分析数据并生成报告

### 2. Zero-shot 与 Few-shot

#### [概念] 概念解释

Zero-shot 是不提供示例直接让模型完成任务，Few-shot 是提供少量示例帮助模型理解任务格式。选择合适的方式取决于任务复杂度和模型能力。

#### [语法] 核心语法 / 命令 / API

**对比：**

| 方式 | 说明 | 适用场景 |
|------|------|----------|
| Zero-shot | 无示例 | 简单任务、通用任务 |
| Few-shot | 1-5 个示例 | 复杂格式、特定领域 |
| Many-shot | 更多示例 | 高度定制化任务 |

#### [代码] 代码示例

```python
import openai
from typing import List, Dict

client = openai.OpenAI()

def zero_shot_classification(text: str, categories: List[str]) -> str:
    """
    Zero-shot 文本分类
    """
    categories_text = ", ".join(categories)
    
    prompt = f"""请将以下文本分类到以下类别之一: {categories_text}

文本: {text}

类别:"""
    
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )
    
    return response.choices[0].message.content.strip()

result = zero_shot_classification(
    "这个产品质量很好，物流也很快，非常满意！",
    ["正面评价", "负面评价", "中性评价"]
)
print(f"Zero-shot 分类结果: {result}")

def few_shot_classification(text: str) -> str:
    """
    Few-shot 文本分类
    """
    prompt = """请根据以下示例对文本进行情感分类。

示例:
文本: "这个产品太棒了，我非常喜欢！"
分类: 正面

文本: "质量很差，完全不推荐购买。"
分类: 负面

文本: "产品一般，没有特别的感觉。"
分类: 中性

文本: "服务态度很好，但产品有待改进。"
分类: 混合

现在请分类:
文本: "{text}"
分类:"""
    
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )
    
    return response.choices[0].message.content.strip()

result = few_shot_classification("物流很快，但产品有点小问题")
print(f"Few-shot 分类结果: {result}")

def create_few_shot_prompt(
    task_description: str,
    examples: List[Dict[str, str]],
    input_text: str,
    input_label: str = "输入",
    output_label: str = "输出"
) -> str:
    """
    创建 Few-shot Prompt
    """
    prompt = f"{task_description}\n\n"
    
    for example in examples:
        prompt += f"{input_label}: {example['input']}\n"
        prompt += f"{output_label}: {example['output']}\n\n"
    
    prompt += f"{input_label}: {input_text}\n{output_label}:"
    
    return prompt

entity_extraction_examples = [
    {
        "input": "苹果公司在加州库比蒂诺发布了新款 iPhone。",
        "output": '{"组织": ["苹果公司"], "地点": ["加州库比蒂诺"], "产品": ["iPhone"]}'
    },
    {
        "input": "马斯克的 SpaceX 在德克萨斯州成功发射了星舰。",
        "output": '{"人物": ["马斯克"], "组织": ["SpaceX"], "地点": ["德克萨斯州"], "产品": ["星舰"]}'
    }
]

entity_prompt = create_few_shot_prompt(
    task_description="从文本中提取实体，以 JSON 格式输出。",
    examples=entity_extraction_examples,
    input_text="微软在西雅图发布了 Windows 11，由纳德拉主持发布会。"
)

print("\n=== 实体提取 Prompt ===")
print(entity_prompt)

def select_examples(
    query: str,
    example_pool: List[Dict],
    n: int = 3,
    method: str = "random"
) -> List[Dict]:
    """
    选择 Few-shot 示例
    """
    if method == "random":
        import random
        return random.sample(example_pool, min(n, len(example_pool)))
    
    elif method == "similarity":
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        
        texts = [e["input"] for e in example_pool] + [query]
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(texts)
        
        similarities = cosine_similarity(tfidf_matrix[-1:], tfidf_matrix[:-1])[0]
        top_indices = similarities.argsort()[-n:][::-1]
        
        return [example_pool[i] for i in top_indices]
    
    return example_pool[:n]

example_pool = [
    {"input": "Python 是一门编程语言", "output": "技术"},
    {"input": "今天天气很好", "output": "日常"},
    {"input": "股票市场今日上涨", "output": "财经"},
    {"input": "JavaScript 用于网页开发", "output": "技术"},
    {"input": "周末去公园散步", "output": "日常"},
]

selected = select_examples("学习 Go 语言编程", example_pool, n=2, method="similarity")
print("\n=== 相似示例选择 ===")
for ex in selected:
    print(f"输入: {ex['input']}, 输出: {ex['output']}")

class FewShotLearner:
    """
    Few-shot 学习器
    """
    def __init__(self, examples: List[Dict], model: str = "gpt-4"):
        self.examples = examples
        self.model = model
    
    def predict(self, input_text: str, n_shots: int = 3) -> str:
        selected_examples = select_examples(input_text, self.examples, n_shots)
        
        prompt = "根据以下示例完成任务:\n\n"
        for ex in selected_examples:
            prompt += f"输入: {ex['input']}\n输出: {ex['output']}\n\n"
        prompt += f"输入: {input_text}\n输出:"
        
        response = client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        
        return response.choices[0].message.content.strip()

learner = FewShotLearner(example_pool)
result = learner.predict("React 是一个前端框架")
print(f"\nFew-shot 学习结果: {result}")
```

#### [场景] 典型应用场景

1. 文本分类：使用 Few-shot 提供分类示例
2. 信息提取：使用 Few-shot 展示提取格式
3. 代码生成：使用 Few-shot 展示代码风格

### 3. 输出格式控制

#### [概念] 概念解释

通过 Prompt 约束模型的输出格式，确保输出可以被程序解析。常见的格式包括 JSON、Markdown、CSV 等。

#### [语法] 核心语法 / 命令 / API

**格式控制方法：**

| 方法 | 说明 |
|------|------|
| 格式说明 | 明确描述输出格式 |
| 示例展示 | 提供格式示例 |
| JSON Schema | 定义 JSON 结构 |
| 约束指令 | 使用强制约束语言 |

#### [代码] 代码示例

```python
import openai
import json
from pydantic import BaseModel
from typing import List, Optional

client = openai.OpenAI()

def structured_output_prompt(
    task: str,
    output_schema: dict,
    example: Optional[dict] = None
) -> str:
    """
    创建结构化输出 Prompt
    """
    prompt = f"""# 任务
{task}

# 输出格式
请严格按照以下 JSON Schema 格式输出:
```json
{json.dumps(output_schema, indent=2, ensure_ascii=False)}
```
"""
    
    if example:
        prompt += f"""
# 输出示例
```json
{json.dumps(example, indent=2, ensure_ascii=False)}
```
"""
    
    prompt += """
# 注意
- 只输出 JSON，不要有其他文字
- 确保输出是有效的 JSON 格式
- 所有字段都必须存在"""
    
    return prompt

person_schema = {
    "type": "object",
    "properties": {
        "name": {"type": "string", "description": "姓名"},
        "age": {"type": "integer", "description": "年龄"},
        "skills": {
            "type": "array",
            "items": {"type": "string"},
            "description": "技能列表"
        },
        "experience": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "company": {"type": "string"},
                    "years": {"type": "integer"}
                }
            }
        }
    },
    "required": ["name", "age", "skills"]
}

person_example = {
    "name": "张三",
    "age": 28,
    "skills": ["Python", "JavaScript"],
    "experience": [
        {"company": "ABC公司", "years": 3}
    ]
}

prompt = structured_output_prompt(
    task="从以下简历文本中提取个人信息",
    output_schema=person_schema,
    example=person_example
)

print("=== 结构化输出 Prompt ===")
print(prompt)

class PersonInfo(BaseModel):
    name: str
    age: int
    skills: List[str]
    experience: Optional[List[dict]] = None

def extract_with_pydantic(text: str, model_class) -> dict:
    """
    使用 Pydantic 进行结构化提取
    """
    schema = model_class.model_json_schema()
    
    prompt = f"""从以下文本中提取信息，并以 JSON 格式输出。

文本: {text}

JSON Schema:
{json.dumps(schema, indent=2, ensure_ascii=False)}

只输出 JSON，不要有其他内容。"""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )
    
    try:
        result = json.loads(response.choices[0].message.content)
        validated = model_class(**result)
        return validated.model_dump()
    except Exception as e:
        return {"error": str(e)}

def markdown_table_prompt(data_description: str, columns: List[str]) -> str:
    """
    创建 Markdown 表格输出 Prompt
    """
    columns_text = " | ".join(columns)
    separator = " | ".join(["---"] * len(columns))
    
    return f"""# 任务
根据以下描述生成数据表格。

# 数据描述
{data_description}

# 输出格式
以 Markdown 表格格式输出，包含以下列:
| {columns_text} |
| {separator} |
| ... |

# 要求
- 表格至少包含 5 行数据
- 数据要真实合理
- 只输出表格，不要有其他文字"""

table_prompt = markdown_table_prompt(
    "2024年全球主要科技公司市值排名",
    ["排名", "公司", "市值(亿美元)", "总部", "主要业务"]
)

print("\n=== Markdown 表格 Prompt ===")
print(table_prompt)

def code_output_prompt(
    task: str,
    language: str,
    requirements: List[str] = None,
    style_guide: str = None
) -> str:
    """
    创建代码输出 Prompt
    """
    prompt = f"""# 任务
{task}

# 编程语言
{language}

# 输出格式
```{language.lower()}
// 你的代码
```

"""
    
    if requirements:
        prompt += "# 要求\n"
        for req in requirements:
            prompt += f"- {req}\n"
        prompt += "\n"
    
    if style_guide:
        prompt += f"# 代码风格\n{style_guide}\n\n"
    
    prompt += "# 注意\n- 只输出代码，不要有解释\n- 确保代码完整可运行"
    
    return prompt

code_prompt = code_output_prompt(
    task="实现一个简单的 REST API 服务器",
    language="Python",
    requirements=[
        "使用 FastAPI 框架",
        "包含用户 CRUD 操作",
        "添加基本的错误处理"
    ],
    style_guide="遵循 PEP 8 规范，使用类型提示"
)

print("\n=== 代码输出 Prompt ===")
print(code_prompt)

def multi_format_output(
    task: str,
    formats: List[str]
) -> str:
    """
    创建多格式输出 Prompt
    """
    format_instructions = {
        "json": "JSON 格式输出",
        "markdown": "Markdown 格式输出",
        "csv": "CSV 格式输出",
        "yaml": "YAML 格式输出",
        "xml": "XML 格式输出"
    }
    
    format_list = "\n".join([f"{i+1}. {format_instructions.get(f, f)}" for i, f in enumerate(formats)])
    
    return f"""# 任务
{task}

# 输出要求
请按以下格式分别输出:

{format_list}

# 格式分隔
使用 "=== 格式名称 ===" 作为每种格式的分隔符"""

multi_prompt = multi_format_output(
    "列出 5 种编程语言及其特点",
    ["json", "markdown", "csv"]
)

print("\n=== 多格式输出 Prompt ===")
print(multi_prompt)
```

#### [场景] 典型应用场景

1. 数据提取：将非结构化文本转为结构化数据
2. 报告生成：生成格式化的分析报告
3. API 集成：生成可解析的标准格式输出

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的 Prompt 设计能力将显著提升，能够处理复杂推理任务。

### 1. Chain of Thought

#### [概念] 概念与解决的问题

Chain of Thought (CoT) 是一种让模型逐步推理的技术。通过引导模型展示推理过程，可以显著提高复杂问题的解决准确率。

#### [语法] 核心用法

**CoT 方法：**

| 方法 | 说明 |
|------|------|
| 标准 CoT | 添加"让我们一步步思考" |
| Few-shot CoT | 提供带推理步骤的示例 |
| Zero-shot CoT | 使用"Let's think step by step" |

#### [代码] 代码示例

```python
import openai

client = openai.OpenAI()

def zero_shot_cot(prompt: str, model: str = "gpt-4") -> str:
    """
    Zero-shot Chain of Thought
    """
    cot_prompt = f"""{prompt}

Let's think step by step."""
    
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": cot_prompt}],
        temperature=0
    )
    
    return response.choices[0].message.content

def few_shot_cot_prompt(examples: list, question: str) -> str:
    """
    Few-shot Chain of Thought Prompt
    """
    prompt = "请按照示例的推理方式解决以下问题。\n\n"
    
    for i, example in enumerate(examples, 1):
        prompt += f"问题 {i}: {example['question']}\n"
        prompt += f"推理过程:\n{example['reasoning']}\n"
        prompt += f"答案: {example['answer']}\n\n"
    
    prompt += f"问题: {question}\n推理过程:"
    
    return prompt

math_examples = [
    {
        "question": "一个班级有 30 名学生，其中 60% 是女生。如果女生中有 1/3 戴眼镜，那么戴眼镜的女生有多少人？",
        "reasoning": """1. 首先计算女生人数：30 × 60% = 18 名女生
2. 然后计算戴眼镜的女生：18 × 1/3 = 6 人
3. 验证：6 人戴眼镜，占女生的 33.3%，占全班的 20%""",
        "answer": "6 人"
    },
    {
        "question": "一本书有 240 页，小明第一天读了 1/4，第二天读了剩余的 1/3。两天共读了多少页？",
        "reasoning": """1. 第一天读的页数：240 × 1/4 = 60 页
2. 剩余页数：240 - 60 = 180 页
3. 第二天读的页数：180 × 1/3 = 60 页
4. 两天总共：60 + 60 = 120 页""",
        "answer": "120 页"
    }
]

def self_consistency_cot(prompt: str, n_samples: int = 5, model: str = "gpt-4") -> str:
    """
    Self-Consistency CoT: 多次采样取多数
    """
    from collections import Counter
    
    cot_prompt = f"""{prompt}

请一步步思考并给出最终答案。格式：
推理过程: [你的推理]
答案: [最终答案]"""
    
    responses = []
    for _ in range(n_samples):
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": cot_prompt}],
            temperature=0.7
        )
        responses.append(response.choices[0].message.content)
    
    answers = []
    for r in responses:
        if "答案:" in r:
            answer = r.split("答案:")[-1].strip()
            answers.append(answer)
    
    if answers:
        most_common = Counter(answers).most_common(1)[0]
        return f"最终答案: {most_common[0]} (出现 {most_common[1]}/{n_samples} 次)"
    
    return responses[0]

class ChainOfThoughtReasoner:
    """
    Chain of Thought 推理器
    """
    def __init__(self, model: str = "gpt-4"):
        self.model = model
    
    def reason(self, question: str, show_steps: bool = True) -> str:
        prompt = f"""问题: {question}

请按照以下步骤进行推理:
1. 理解问题：识别关键信息和要求
2. 分析条件：列出已知条件和约束
3. 制定计划：确定解决步骤
4. 执行计算：逐步执行
5. 验证结果：检查答案是否合理

推理过程:"""
        
        response = client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        
        return response.choices[0].message.content
    
    def reason_with_verification(self, question: str) -> dict:
        reasoning = self.reason(question)
        
        verify_prompt = f"""问题: {question}

之前的推理过程:
{reasoning}

请验证以上推理是否正确，如果有错误请指出并给出正确答案。

验证结果:"""
        
        verification = client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": verify_prompt}],
            temperature=0
        ).choices[0].message.content
        
        return {
            "reasoning": reasoning,
            "verification": verification
        }

reasoner = ChainOfThoughtReasoner()
print("=== Chain of Thought 推理示例 ===")
print(reasoner.reason("如果 5 个苹果的价格等于 3 个橘子的价格，1 个橘子 2 元，那么 10 个苹果多少钱？"))
```

#### [关联] 与核心层的关联

CoT 是对基本 Prompt 结构的增强，通过添加推理步骤引导模型进行深度思考。

### 2. ReAct 模式

#### [概念] 概念与解决的问题

ReAct (Reasoning + Acting) 结合了推理和行动，让模型能够使用工具完成任务。模型交替进行思考和行动，直到得出最终答案。

#### [语法] 核心用法

**ReAct 循环：**

| 步骤 | 说明 |
|------|------|
| Thought | 思考下一步 |
| Action | 执行工具调用 |
| Observation | 观察结果 |
| ... | 重复直到完成 |

#### [代码] 代码示例

```python
import openai
import json
from typing import Callable, Dict, List

client = openai.OpenAI()

class ReActAgent:
    """
    ReAct 模式 Agent
    """
    def __init__(self, tools: Dict[str, Callable], model: str = "gpt-4"):
        self.tools = tools
        self.model = model
        self.max_iterations = 10
    
    def create_prompt(self, question: str) -> str:
        tools_desc = "\n".join([
            f"- {name}: {func.__doc__ or '无描述'}"
            for name, func in self.tools.items()
        ])
        
        return f"""你是一个可以使用工具的智能助手。请使用 ReAct 模式回答问题。

可用工具:
{tools_desc}

格式要求:
Thought: [你的思考]
Action: [工具名称]
Action Input: [工具输入，JSON 格式]
Observation: [工具返回结果]
... (重复 Thought/Action/Observation 直到得出答案)
Thought: 我现在知道最终答案了
Final Answer: [最终答案]

问题: {question}

Thought:"""
    
    def run(self, question: str) -> str:
        prompt = self.create_prompt(question)
        messages = [{"role": "user", "content": prompt}]
        
        for _ in range(self.max_iterations):
            response = client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0,
                stop=["Observation:"]
            )
            
            thought = response.choices[0].message.content
            messages.append({"role": "assistant", "content": thought})
            
            if "Final Answer:" in thought:
                return thought.split("Final Answer:")[-1].strip()
            
            if "Action:" in thought:
                try:
                    action_line = [l for l in thought.split("\n") if "Action:" in l][0]
                    action = action_line.split("Action:")[-1].strip()
                    
                    input_line = [l for l in thought.split("\n") if "Action Input:" in l][0]
                    action_input = json.loads(input_line.split("Action Input:")[-1].strip())
                    
                    if action in self.tools:
                        observation = self.tools[action](**action_input)
                    else:
                        observation = f"错误: 未知工具 {action}"
                    
                    messages.append({"role": "user", "content": f"Observation: {observation}"})
                except Exception as e:
                    messages.append({"role": "user", "content": f"Observation: 错误 - {str(e)}"})
            else:
                break
        
        return "无法完成任务"

def search(query: str) -> str:
    """搜索网络获取信息"""
    return f"搜索结果: 关于 '{query}' 的相关信息..."

def calculate(expression: str) -> str:
    """计算数学表达式"""
    try:
        result = eval(expression)
        return f"计算结果: {result}"
    except:
        return "计算错误"

def get_weather(city: str) -> str:
    """获取城市天气"""
    return f"{city} 今天天气晴朗，温度 25°C"

tools = {
    "search": search,
    "calculate": calculate,
    "get_weather": get_weather
}

agent = ReActAgent(tools)

print("=== ReAct Agent 示例 ===")
result = agent.run("北京今天天气怎么样？如果温度是 25 度，那么华氏温度是多少？")
print(result)

def create_react_prompt_with_examples(question: str, examples: List[dict]) -> str:
    """
    带示例的 ReAct Prompt
    """
    prompt = "请使用 ReAct 模式解决问题。\n\n"
    
    for ex in examples:
        prompt += f"问题: {ex['question']}\n"
        prompt += ex['trajectory']
        prompt += "\n\n"
    
    prompt += f"问题: {question}\nThought:"
    
    return prompt

react_examples = [
    {
        "question": "Python 的创始人是谁？",
        "trajectory": """Thought: 我需要搜索 Python 创始人的信息
Action: search
Action Input: {"query": "Python 创始人"}
Observation: 搜索结果: Python 的创始人是 Guido van Rossum
Thought: 我现在知道答案了
Final Answer: Python 的创始人是 Guido van Rossum"""
    }
]
```

#### [关联] 与核心层的关联

ReAct 模式结合了 Few-shot 和结构化输出，通过定义清晰的交互格式实现工具调用。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| Tree of Thoughts | 需要多路径推理 |
| Self-Consistency | 需要提高答案可靠性 |
| Auto-CoT | 需要自动生成推理示例 |
| Least-to-Most | 需要分解复杂问题 |
| Self-Ask | 需要自我提问分解 |
| Directional Stimulus | 需要引导生成方向 |
| Prompt Tuning | 需要优化 Prompt 表示 |
| Soft Prompt | 需要可学习的 Prompt |
| Prefix Tuning | 需要任务特定的前缀 |
| P-Tuning | 需要连续 Prompt 优化 |
| Instruction Tuning | 需要指令微调 |
| Constitutional AI | 需要自我修正 |
| Self-Refine | 需要迭代优化输出 |
| Meta Prompting | 需要生成 Prompt |
| Multi-Prompt Ensemble | 需要组合多个 Prompt |

---

## [实战] 核心实战清单

### 实战任务 1：构建一个智能问答系统

**任务描述：**

构建一个支持多种问题类型的智能问答系统，包括：
1. 事实问答：使用 CoT 推理
2. 计算问题：使用 ReAct 调用计算工具
3. 开放问题：使用结构化输出

**要求：**
- 自动识别问题类型
- 选择合适的 Prompt 策略
- 提供可解释的推理过程

**参考实现：**

```python
import openai
import json
from typing import Dict, Callable, List
from enum import Enum

client = openai.OpenAI()

class QuestionType(Enum):
    FACTUAL = "factual"
    CALCULATION = "calculation"
    OPEN_ENDED = "open_ended"
    MULTI_STEP = "multi_step"

class IntelligentQA:
    def __init__(self, model: str = "gpt-4"):
        self.model = model
        self.tools = {
            "calculate": self._calculate,
            "search": self._search
        }
    
    def classify_question(self, question: str) -> QuestionType:
        prompt = f"""分析以下问题的类型，返回以下类型之一:
- factual: 事实性问题，需要查询信息
- calculation: 计算问题，需要数学运算
- open_ended: 开放性问题，需要详细解释
- multi_step: 多步骤问题，需要分步推理

问题: {question}

类型:"""
        
        response = client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        
        type_str = response.choices[0].message.content.strip().lower()
        
        for qt in QuestionType:
            if qt.value in type_str:
                return qt
        
        return QuestionType.OPEN_ENDED
    
    def answer_factual(self, question: str) -> str:
        prompt = f"""请回答以下事实性问题。

问题: {question}

请一步步思考，然后给出答案。

推理过程:"""
        
        response = client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        
        return response.choices[0].message.content
    
    def answer_calculation(self, question: str) -> str:
        prompt = f"""请解决以下计算问题。

问题: {question}

请按以下格式回答:
1. 分析问题，列出已知条件
2. 列出计算步骤
3. 执行计算
4. 验证结果

解答:"""
        
        response = client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        
        return response.choices[0].message.content
    
    def answer_open_ended(self, question: str) -> str:
        prompt = f"""请详细回答以下开放性问题。

问题: {question}

请提供:
1. 核心观点
2. 详细分析
3. 实例说明
4. 总结

回答:"""
        
        response = client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        return response.choices[0].message.content
    
    def answer_multi_step(self, question: str) -> str:
        prompt = f"""请分步骤解决以下问题。

问题: {question}

请使用 Chain of Thought 方法:
1. 将问题分解为子问题
2. 逐个解决子问题
3. 整合得出最终答案

推理过程:"""
        
        response = client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        
        return response.choices[0].message.content
    
    def answer(self, question: str) -> Dict:
        question_type = self.classify_question(question)
        
        answer_methods = {
            QuestionType.FACTUAL: self.answer_factual,
            QuestionType.CALCULATION: self.answer_calculation,
            QuestionType.OPEN_ENDED: self.answer_open_ended,
            QuestionType.MULTI_STEP: self.answer_multi_step
        }
        
        answer = answer_methods[question_type](question)
        
        return {
            "question": question,
            "type": question_type.value,
            "answer": answer
        }
    
    def _calculate(self, expression: str) -> str:
        try:
            return str(eval(expression))
        except:
            return "计算错误"
    
    def _search(self, query: str) -> str:
        return f"关于 '{query}' 的搜索结果"

qa = IntelligentQA()

print("=== 智能问答系统示例 ===")
questions = [
    "Python 的创始人是谁？",
    "如果 5 个苹果 15 元，那么 8 个苹果多少钱？",
    "如何学习编程？",
    "一个班级有 30 人，女生占 60%，戴眼镜的女生占女生的 1/3，戴眼镜的女生有多少人？"
]

for q in questions:
    result = qa.answer(q)
    print(f"\n问题: {result['question']}")
    print(f"类型: {result['type']}")
    print(f"答案: {result['answer'][:200]}...")
```
