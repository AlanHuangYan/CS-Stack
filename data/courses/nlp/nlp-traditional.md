# 传统 NLP 技术 三层深度学习教程

## [总览] 技术总览

传统 NLP 技术是自然语言处理的基础，包括分词、词性标注、句法分析、语义分析等。虽然深度学习已广泛应用，传统方法在特定场景下仍有价值，且有助于理解 NLP 本质。

本教程采用三层漏斗学习法：**核心层**聚焦分词、词性标注、命名实体识别三大基石；**重点层**深入句法分析和语义分析；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 分词技术

#### [概念] 概念解释

分词将连续文本切分为有意义的词语单元。中文分词是中文 NLP 的基础任务，常用方法包括基于词典、基于统计、基于序列标注等。

#### [代码] 代码示例

```python
from typing import List, Dict, Tuple
from collections import defaultdict
from dataclasses import dataclass

@dataclass
class DictSegmenter:
    """基于词典的分词器"""
    
    def __init__(self):
        self.word_dict: Dict[str, int] = {}
        self.max_len: int = 0
    
    def load_dict(self, words: List[str]):
        """加载词典"""
        for word in words:
            self.word_dict[word] = len(word)
            self.max_len = max(self.max_len, len(word))
    
    def forward_max_match(self, text: str) -> List[str]:
        """正向最大匹配"""
        result = []
        i = 0
        
        while i < len(text):
            max_word = None
            
            for j in range(min(self.max_len, len(text) - i), 0, -1):
                word = text[i:i + j]
                if word in self.word_dict:
                    max_word = word
                    break
            
            if max_word:
                result.append(max_word)
                i += len(max_word)
            else:
                result.append(text[i])
                i += 1
        
        return result
    
    def backward_max_match(self, text: str) -> List[str]:
        """逆向最大匹配"""
        result = []
        i = len(text)
        
        while i > 0:
            max_word = None
            
            for j in range(min(self.max_len, i), 0, -1):
                word = text[i - j:i]
                if word in self.word_dict:
                    max_word = word
                    break
            
            if max_word:
                result.insert(0, max_word)
                i -= len(max_word)
            else:
                result.insert(0, text[i - 1])
                i -= 1
        
        return result
    
    def bidirectional_max_match(self, text: str) -> List[str]:
        """双向最大匹配"""
        forward = self.forward_max_match(text)
        backward = self.backward_max_match(text)
        
        if len(forward) != len(backward):
            return forward if len(forward) < len(backward) else backward
        
        forward_single = sum(1 for w in forward if len(w) == 1)
        backward_single = sum(1 for w in backward if len(w) == 1)
        
        return forward if forward_single < backward_single else backward

class HMMSegmenter:
    """基于 HMM 的分词器"""
    
    def __init__(self):
        self.states = ['B', 'M', 'E', 'S']
        self.start_prob: Dict[str, float] = {}
        self.trans_prob: Dict[str, Dict[str, float]] = {}
        self.emit_prob: Dict[str, Dict[str, float]] = {}
    
    def train(self, sentences: List[List[Tuple[str, str]]]):
        """训练模型"""
        start_count = defaultdict(int)
        trans_count = defaultdict(lambda: defaultdict(int))
        emit_count = defaultdict(lambda: defaultdict(int))
        
        for sentence in sentences:
            if not sentence:
                continue
            
            first_state = sentence[0][1]
            start_count[first_state] += 1
            
            for i, (word, state) in enumerate(sentence):
                emit_count[state][word] += 1
                
                if i > 0:
                    prev_state = sentence[i - 1][1]
                    trans_count[prev_state][state] += 1
        
        total_start = sum(start_count.values())
        for state in self.states:
            self.start_prob[state] = start_count[state] / total_start if total_start > 0 else 0
        
        for prev_state in self.states:
            total = sum(trans_count[prev_state].values())
            for state in self.states:
                self.trans_prob.setdefault(prev_state, {})[state] = \
                    trans_count[prev_state][state] / total if total > 0 else 0
        
        for state in self.states:
            total = sum(emit_count[state].values())
            for word in emit_count[state]:
                self.emit_prob.setdefault(state, {})[word] = \
                    emit_count[state][word] / total if total > 0 else 0
    
    def viterbi(self, text: str) -> List[str]:
        """维特比算法解码"""
        n = len(text)
        if n == 0:
            return []
        
        V = [{} for _ in range(n)]
        path = {}
        
        for state in self.states:
            emit = self.emit_prob.get(state, {}).get(text[0], 1e-10)
            V[0][state] = self.start_prob.get(state, 0.25) * emit
            path[state] = [state]
        
        for t in range(1, n):
            new_path = {}
            
            for state in self.states:
                emit = self.emit_prob.get(state, {}).get(text[t], 1e-10)
                
                best_prob = -1
                best_prev = None
                
                for prev_state in self.states:
                    prob = V[t - 1][prev_state] * self.trans_prob.get(prev_state, {}).get(state, 1e-10) * emit
                    if prob > best_prob:
                        best_prob = prob
                        best_prev = prev_state
                
                V[t][state] = best_prob
                new_path[state] = path[best_prev] + [state]
            
            path = new_path
        
        best_final = max(self.states, key=lambda s: V[n - 1][s])
        states = path[best_final]
        
        return self._decode_states(text, states)
    
    def _decode_states(self, text: str, states: List[str]) -> List[str]:
        """根据状态序列解码分词结果"""
        words = []
        word_start = 0
        
        for i, state in enumerate(states):
            if state == 'S':
                words.append(text[i])
                word_start = i + 1
            elif state == 'E':
                words.append(text[word_start:i + 1])
                word_start = i + 1
            elif state == 'B':
                word_start = i
        
        if word_start < len(text):
            words.append(text[word_start:])
        
        return words

dict_words = ['自然语言', '处理', '自然', '语言', '计算机', '科学', '人工', '智能', '人工智能']
segmenter = DictSegmenter()
segmenter.load_dict(dict_words)

text = "自然语言处理是人工智能的重要分支"
print(f"原文: {text}")
print(f"正向最大匹配: {segmenter.forward_max_match(text)}")
print(f"逆向最大匹配: {segmenter.backward_max_match(text)}")
print(f"双向最大匹配: {segmenter.bidirectional_max_match(text)}")

train_data = [
    [('自', 'B'), ('然', 'E'), ('语', 'B'), ('言', 'E'), ('处', 'B'), ('理', 'E')],
    [('人', 'B'), ('工', 'M'), ('智', 'M'), ('能', 'E')],
    [('计', 'B'), ('算', 'M'), ('机', 'E'), ('科', 'B'), ('学', 'E')],
]

hmm = HMMSegmenter()
hmm.train(train_data)
print(f"\nHMM 分词: {hmm.viterbi('自然语言处理')}")
```

### 2. 词性标注

#### [概念] 概念解释

词性标注为每个词语分配语法类别（名词、动词、形容词等）。常用方法包括基于规则、基于统计（HMM、CRF）、基于深度学习等。

#### [代码] 代码示例

```python
from typing import List, Dict, Tuple
from collections import defaultdict
from dataclasses import dataclass

@dataclass
class POSTagger:
    """词性标注器"""
    
    def __init__(self):
        self.tag_set: set = set()
        self.word_tag_freq: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
        self.tag_freq: Dict[str, int] = defaultdict(int)
        self.tag_trans_freq: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
    
    def train(self, tagged_sentences: List[List[Tuple[str, str]]]):
        """训练"""
        for sentence in tagged_sentences:
            prev_tag = '<START>'
            
            for word, tag in sentence:
                self.tag_set.add(tag)
                self.word_tag_freq[word][tag] += 1
                self.tag_freq[tag] += 1
                self.tag_trans_freq[prev_tag][tag] += 1
                prev_tag = tag
    
    def tag(self, words: List[str]) -> List[Tuple[str, str]]:
        """标注"""
        result = []
        
        for word in words:
            if word in self.word_tag_freq:
                tag = max(self.word_tag_freq[word].items(), key=lambda x: x[1])[0]
            else:
                tag = max(self.tag_freq.items(), key=lambda x: x[1])[0]
            
            result.append((word, tag))
        
        return result

class HMMTagger:
    """HMM 词性标注器"""
    
    def __init__(self):
        self.tags: List[str] = []
        self.start_prob: Dict[str, float] = {}
        self.trans_prob: Dict[str, Dict[str, float]] = {}
        self.emit_prob: Dict[str, Dict[str, float]] = {}
    
    def train(self, tagged_sentences: List[List[Tuple[str, str]]]):
        """训练"""
        start_count = defaultdict(int)
        trans_count = defaultdict(lambda: defaultdict(int))
        emit_count = defaultdict(lambda: defaultdict(int))
        tag_count = defaultdict(int)
        
        for sentence in tagged_sentences:
            if not sentence:
                continue
            
            start_count[sentence[0][1]] += 1
            
            for i, (word, tag) in enumerate(sentence):
                emit_count[tag][word] += 1
                tag_count[tag] += 1
                
                if i > 0:
                    prev_tag = sentence[i - 1][1]
                    trans_count[prev_tag][tag] += 1
        
        self.tags = list(tag_count.keys())
        
        total_start = sum(start_count.values())
        for tag in self.tags:
            self.start_prob[tag] = (start_count[tag] + 1) / (total_start + len(self.tags))
        
        for prev_tag in self.tags:
            total = tag_count[prev_tag]
            for tag in self.tags:
                self.trans_prob.setdefault(prev_tag, {})[tag] = \
                    (trans_count[prev_tag][tag] + 1) / (total + len(self.tags))
        
        for tag in self.tags:
            total = tag_count[tag]
            for word in emit_count[tag]:
                self.emit_prob.setdefault(tag, {})[word] = \
                    (emit_count[tag][word] + 1) / (total + len(emit_count[tag]))
    
    def viterbi(self, words: List[str]) -> List[Tuple[str, str]]:
        """维特比算法"""
        n = len(words)
        if n == 0:
            return []
        
        V = [{} for _ in range(n)]
        backpointer = [{} for _ in range(n)]
        
        for tag in self.tags:
            emit = self.emit_prob.get(tag, {}).get(words[0], 1e-10)
            V[0][tag] = self.start_prob.get(tag, 1e-10) * emit
        
        for t in range(1, n):
            for tag in self.tags:
                emit = self.emit_prob.get(tag, {}).get(words[t], 1e-10)
                
                best_prob = -1
                best_prev = self.tags[0]
                
                for prev_tag in self.tags:
                    prob = V[t - 1][prev_tag] * self.trans_prob.get(prev_tag, {}).get(tag, 1e-10) * emit
                    if prob > best_prob:
                        best_prob = prob
                        best_prev = prev_tag
                
                V[t][tag] = best_prob
                backpointer[t][tag] = best_prev
        
        best_tag = max(self.tags, key=lambda t: V[n - 1][t])
        
        result = [best_tag]
        for t in range(n - 1, 0, -1):
            best_tag = backpointer[t][best_tag]
            result.insert(0, best_tag)
        
        return list(zip(words, result))

tagged_data = [
    [('我', 'PN'), ('爱', 'VV'), ('自然语言', 'NN'), ('处理', 'NN')],
    [('他', 'PN'), ('学习', 'VV'), ('计算机', 'NN'), ('科学', 'NN')],
    [('这', 'DT'), ('是', 'VC'), ('一', 'CD'), ('本', 'M'), ('书', 'NN')],
]

hmm_tagger = HMMTagger()
hmm_tagger.train(tagged_data)

test_words = ['我', '学习', '计算机']
result = hmm_tagger.viterbi(test_words)
print(f"词性标注结果: {result}")
```

### 3. 命名实体识别

#### [概念] 概念解释

命名实体识别从文本中识别出人名、地名、机构名等实体。常用方法包括规则方法、统计方法（CRF）、深度学习方法（BiLSTM-CRF、BERT）等。

#### [代码] 代码示例

```python
from typing import List, Dict, Tuple
from collections import defaultdict
from dataclasses import dataclass

@dataclass
class Entity:
    """实体"""
    text: str
    label: str
    start: int
    end: int

class CRFNER:
    """简化版 CRF 命名实体识别"""
    
    def __init__(self):
        self.labels = ['O', 'B-PER', 'I-PER', 'B-LOC', 'I-LOC', 'B-ORG', 'I-ORG']
        self.feature_weights: Dict[str, float] = {}
    
    def extract_features(self, tokens: List[str], i: int) -> List[str]:
        """提取特征"""
        features = []
        word = tokens[i]
        
        features.append(f'word={word}')
        features.append(f'is_upper={word.isupper()}')
        features.append(f'is_title={word.istitle()}')
        features.append(f'is_digit={word.isdigit()}')
        features.append(f'prefix1={word[:1] if len(word) > 0 else ""}')
        features.append(f'prefix2={word[:2] if len(word) > 1 else ""}')
        features.append(f'suffix1={word[-1:] if len(word) > 0 else ""}')
        features.append(f'suffix2={word[-2:] if len(word) > 1 else ""}')
        
        if i > 0:
            features.append(f'prev_word={tokens[i - 1]}')
        else:
            features.append('BOS')
        
        if i < len(tokens) - 1:
            features.append(f'next_word={tokens[i + 1]}')
        else:
            features.append('EOS')
        
        return features
    
    def train(self, sentences: List[Tuple[List[str], List[str]]], n_epochs: int = 10, lr: float = 0.1):
        """训练"""
        for _ in range(n_epochs):
            for tokens, labels in sentences:
                for i, (token, label) in enumerate(zip(tokens, labels)):
                    features = self.extract_features(tokens, i)
                    
                    for feat in features:
                        key = f'{label}+{feat}'
                        self.feature_weights[key] = self.feature_weights.get(key, 0) + lr
                    
                    other_label = 'O' if label != 'O' else 'B-PER'
                    for feat in features:
                        key = f'{other_label}+{feat}'
                        self.feature_weights[key] = self.feature_weights.get(key, 0) - lr * 0.5
    
    def predict(self, tokens: List[str]) -> List[str]:
        """预测"""
        result = []
        
        for i in range(len(tokens)):
            features = self.extract_features(tokens, i)
            
            best_label = 'O'
            best_score = float('-inf')
            
            for label in self.labels:
                score = 0
                for feat in features:
                    key = f'{label}+{feat}'
                    score += self.feature_weights.get(key, 0)
                
                if score > best_score:
                    best_score = score
                    best_label = label
            
            result.append(best_label)
        
        return result
    
    def extract_entities(self, tokens: List[str], labels: List[str]) -> List[Entity]:
        """提取实体"""
        entities = []
        current_entity = None
        current_start = 0
        
        for i, (token, label) in enumerate(zip(tokens, labels)):
            if label.startswith('B-'):
                if current_entity:
                    entities.append(Entity(
                        text=' '.join(tokens[current_start:i]),
                        label=current_entity,
                        start=current_start,
                        end=i
                    ))
                current_entity = label[2:]
                current_start = i
            elif label.startswith('I-'):
                pass
            else:
                if current_entity:
                    entities.append(Entity(
                        text=' '.join(tokens[current_start:i]),
                        label=current_entity,
                        start=current_start,
                        end=i
                    ))
                    current_entity = None
        
        if current_entity:
            entities.append(Entity(
                text=' '.join(tokens[current_start:]),
                label=current_entity,
                start=current_start,
                end=len(tokens)
            ))
        
        return entities

train_sentences = [
    (['张三', '在', '北京', '工作'], ['B-PER', 'O', 'B-LOC', 'O']),
    (['李四', '就职于', '阿里巴巴'], ['B-PER', 'O', 'B-ORG']),
    (['王五', '来自', '上海'], ['B-PER', 'O', 'B-LOC']),
    (['小明', '在', '清华大学', '学习'], ['B-PER', 'O', 'B-ORG', 'O']),
]

ner = CRFNER()
ner.train(train_sentences, n_epochs=20)

test_tokens = ['张三', '在', '上海', '工作']
labels = ner.predict(test_tokens)
print(f"预测标签: {labels}")

entities = ner.extract_entities(test_tokens, labels)
print(f"识别实体:")
for entity in entities:
    print(f"  {entity.label}: '{entity.text}' at {entity.start}-{entity.end}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 句法分析

#### [概念] 概念解释

句法分析分析句子的语法结构，包括成分句法分析（短语结构）和依存句法分析（词语关系）。句法分析是理解句子语义的基础。

#### [代码] 代码示例

```python
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass

@dataclass
class TreeNode:
    """句法树节点"""
    label: str
    children: List['TreeNode']
    word: Optional[str] = None
    
    def __str__(self, indent: int = 0) -> str:
        if self.word:
            return '  ' * indent + f'({self.label} {self.word})'
        else:
            result = '  ' * indent + f'({self.label}'
            for child in self.children:
                result += '\n' + child.__str__(indent + 1)
            result += ')'
            return result

class ShiftReduceParser:
    """移进-归约句法分析器"""
    
    def __init__(self):
        self.grammar: Dict[str, List[List[str]]] = {}
        self.lexicon: Dict[str, List[str]] = {}
    
    def add_rule(self, lhs: str, rhs: List[str]):
        """添加语法规则"""
        if lhs not in self.grammar:
            self.grammar[lhs] = []
        self.grammar[lhs].append(rhs)
    
    def add_lexicon(self, word: str, pos_tags: List[str]):
        """添加词典"""
        self.lexicon[word] = pos_tags
    
    def parse(self, words: List[str]) -> List[TreeNode]:
        """分析句子"""
        stack: List[TreeNode] = []
        buffer = [TreeNode(label=pos, word=word, children=[]) 
                  for word in words for pos in self.lexicon.get(word, ['UNK'])]
        
        while buffer or len(stack) > 1:
            reduced = False
            
            for lhs, rules in self.grammar.items():
                for rhs in rules:
                    if len(stack) >= len(rhs):
                        match = True
                        for i, symbol in enumerate(rhs):
                            if stack[-(len(rhs) - i)].label != symbol:
                                match = False
                                break
                        
                        if match:
                            children = stack[-len(rhs):]
                            stack = stack[:-len(rhs)]
                            stack.append(TreeNode(label=lhs, children=children))
                            reduced = True
                            break
                if reduced:
                    break
            
            if not reduced and buffer:
                stack.append(buffer.pop(0))
            elif not reduced and not buffer:
                break
        
        return stack

@dataclass
class Dependency:
    """依存关系"""
    head: int
    dependent: int
    relation: str

class DependencyParser:
    """依存句法分析器"""
    
    def __init__(self):
        self.relations = ['nsubj', 'dobj', 'iobj', 'root', 'amod', 'advmod', 'det']
    
    def parse(self, words: List[str], pos_tags: List[str]) -> List[Dependency]:
        """分析依存关系"""
        n = len(words)
        dependencies = []
        
        root_idx = None
        for i, pos in enumerate(pos_tags):
            if pos == 'VV' or pos == 'VC':
                root_idx = i
                break
        
        if root_idx is None:
            root_idx = n // 2
        
        dependencies.append(Dependency(head=-1, dependent=root_idx, relation='root'))
        
        for i, (word, pos) in enumerate(zip(words, pos_tags)):
            if i == root_idx:
                continue
            
            if pos == 'PN':
                dependencies.append(Dependency(head=root_idx, dependent=i, relation='nsubj'))
            elif pos == 'NN':
                if i < root_idx:
                    dependencies.append(Dependency(head=root_idx, dependent=i, relation='dobj'))
                else:
                    dependencies.append(Dependency(head=root_idx, dependent=i, relation='dobj'))
            elif pos == 'DT':
                if i + 1 < n and pos_tags[i + 1] == 'NN':
                    dependencies.append(Dependency(head=i + 1, dependent=i, relation='det'))
            elif pos == 'JJ':
                if i + 1 < n and pos_tags[i + 1] == 'NN':
                    dependencies.append(Dependency(head=i + 1, dependent=i, relation='amod'))
            else:
                dependencies.append(Dependency(head=root_idx, dependent=i, relation='dep'))
        
        return dependencies
    
    def visualize(self, words: List[str], dependencies: List[Dependency]) -> str:
        """可视化依存关系"""
        lines = [f"{' '.join(words)}"]
        lines.append(" ".join(f"{i:^5}" for i in range(len(words))))
        lines.append(" ".join(f"{w:^5}" for w in words))
        
        for dep in dependencies:
            if dep.head >= 0:
                lines.append(f"  {words[dep.dependent]} --{dep.relation}--> {words[dep.head]}")
        
        return "\n".join(lines)

parser = ShiftReduceParser()
parser.add_rule('NP', ['DT', 'NN'])
parser.add_rule('NP', ['JJ', 'NN'])
parser.add_rule('VP', ['VV', 'NP'])
parser.add_rule('S', ['NP', 'VP'])

parser.add_lexicon('我', ['PN'])
parser.add_lexicon('爱', ['VV'])
parser.add_lexicon('自然语言', ['NN'])
parser.add_lexicon('处理', ['NN'])

words = ['我', '爱', '自然语言', '处理']
result = parser.parse(words)
print("句法分析结果:")
for tree in result:
    print(tree)

dep_parser = DependencyParser()
pos_tags = ['PN', 'VV', 'NN', 'NN']
deps = dep_parser.parse(words, pos_tags)
print("\n依存分析结果:")
print(dep_parser.visualize(words, deps))
```

### 2. 语义分析

#### [概念] 概念解释

语义分析理解句子的深层含义，包括词义消歧、语义角色标注、语义相似度计算等。语义分析是自然语言理解的核心。

#### [代码] 代码示例

```python
from typing import List, Dict, Tuple
from collections import defaultdict
from dataclasses import dataclass

@dataclass
class WordSense:
    """词义"""
    word: str
    sense_id: int
    definition: str
    examples: List[str]

class WordSenseDisambiguation:
    """词义消歧"""
    
    def __init__(self):
        self.senses: Dict[str, List[WordSense]] = defaultdict(list)
        self.context_weights: Dict[str, Dict[str, float]] = defaultdict(lambda: defaultdict(float))
    
    def add_sense(self, word: str, sense_id: int, definition: str, examples: List[str]):
        """添加词义"""
        self.senses[word].append(WordSense(word, sense_id, definition, examples))
    
    def train(self, annotated_data: List[Tuple[str, int, List[str]]]):
        """训练"""
        for word, sense_id, context in annotated_data:
            for ctx_word in context:
                key = f"{word}_{sense_id}"
                self.context_weights[key][ctx_word] += 1
    
    def disambiguate(self, word: str, context: List[str]) -> int:
        """消歧"""
        if word not in self.senses:
            return 0
        
        best_sense = 0
        best_score = -1
        
        for sense in self.senses[word]:
            key = f"{word}_{sense.sense_id}"
            score = sum(self.context_weights[key].get(w, 0) for w in context)
            
            if score > best_score:
                best_score = score
                best_sense = sense.sense_id
        
        return best_sense

@dataclass
class SemanticRole:
    """语义角色"""
    predicate: str
    role: str
    argument: str

class SemanticRoleLabeler:
    """语义角色标注器"""
    
    def __init__(self):
        self.role_patterns = {
            'nsubj': 'Agent',
            'dobj': 'Patient',
            'iobj': 'Recipient',
        }
    
    def label(self, words: List[str], pos_tags: List[str], dependencies: List['Dependency']) -> List[SemanticRole]:
        """标注语义角色"""
        roles = []
        
        predicates = []
        for i, pos in enumerate(pos_tags):
            if pos == 'VV':
                predicates.append(i)
        
        for pred_idx in predicates:
            for dep in dependencies:
                if dep.head == pred_idx:
                    role = self.role_patterns.get(dep.relation, 'Argument')
                    roles.append(SemanticRole(
                        predicate=words[pred_idx],
                        role=role,
                        argument=words[dep.dependent]
                    ))
        
        return roles

class SemanticSimilarity:
    """语义相似度计算"""
    
    def __init__(self):
        self.word_vectors: Dict[str, List[float]] = {}
    
    def load_vectors(self, vectors: Dict[str, List[float]]):
        """加载词向量"""
        self.word_vectors = vectors
    
    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """余弦相似度"""
        dot = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = sum(a ** 2 for a in vec1) ** 0.5
        norm2 = sum(b ** 2 for b in vec2) ** 0.5
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot / (norm1 * norm2)
    
    def word_similarity(self, word1: str, word2: str) -> float:
        """词语相似度"""
        if word1 not in self.word_vectors or word2 not in self.word_vectors:
            return 0.0
        
        return self.cosine_similarity(
            self.word_vectors[word1],
            self.word_vectors[word2]
        )
    
    def sentence_similarity(self, sent1: List[str], sent2: List[str]) -> float:
        """句子相似度"""
        vec1 = self._sentence_vector(sent1)
        vec2 = self._sentence_vector(sent2)
        
        return self.cosine_similarity(vec1, vec2)
    
    def _sentence_vector(self, words: List[str]) -> List[float]:
        """计算句子向量"""
        vectors = [self.word_vectors[w] for w in words if w in self.word_vectors]
        
        if not vectors:
            return [0.0] * 10
        
        dim = len(vectors[0])
        result = [0.0] * dim
        
        for vec in vectors:
            for i, v in enumerate(vec):
                result[i] += v
        
        return [v / len(vectors) for v in result]

wsd = WordSenseDisambiguation()
wsd.add_sense('bank', 1, '金融机构', ['money', 'deposit', 'loan'])
wsd.add_sense('bank', 2, '河岸', ['river', 'water', 'flow'])

wsd.train([
    ('bank', 1, ['money', 'deposit', 'account']),
    ('bank', 1, ['loan', 'credit', 'interest']),
    ('bank', 2, ['river', 'water', 'flow']),
    ('bank', 2, ['fishing', 'river', 'sit']),
])

print(f"bank (money context) -> sense {wsd.disambiguate('bank', ['money', 'deposit'])}")
print(f"bank (river context) -> sense {wsd.disambiguate('bank', ['river', 'water'])}")

vectors = {
    'king': [0.8, 0.2, 0.1],
    'queen': [0.7, 0.3, 0.2],
    'man': [0.6, 0.1, 0.3],
    'woman': [0.5, 0.2, 0.4],
}

sim = SemanticSimilarity()
sim.load_vectors(vectors)

print(f"\nking-queen similarity: {sim.word_similarity('king', 'queen'):.4f}")
print(f"man-woman similarity: {sim.word_similarity('man', 'woman'):.4f}")
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| MaxEnt | 最大熵模型 |
| CRF | 条件随机场 |
| Perceptron | 感知器算法 |
| Beam Search | 束搜索 |
| CKY Algorithm | CKY 句法分析算法 |
| Earley Parser | Earley 句法分析器 |
| PCFG | 概率上下文无关文法 |
| WordNet | 词语语义网络 |
| FrameNet | 框架语义学 |
| PropBank | 命题库 |
| Coreference | 指代消解 |
| SRL | 语义角色标注 |
| AMR | 抽象语义表示 |
| Semantic Parsing | 语义解析 |
| Textual Entailment | 文本蕴含 |

---

## [实战] 核心实战清单

### 实战任务 1：中文分词与词性标注系统

构建一个中文分词与词性标注系统。要求：
1. 实现基于词典的正向最大匹配分词
2. 实现 HMM 词性标注器
3. 在测试数据上评估分词和标注准确率
4. 分析错误案例，提出改进方案
