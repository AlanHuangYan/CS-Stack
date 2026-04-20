# 计算机图形学 三层深度学习教程

## [总览] 技术总览

计算机图形学研究图像的生成和渲染，包括几何建模、光照计算、渲染算法等。计算机图形学是游戏开发、动画制作、可视化等领域的基础。

本教程采用三层漏斗学习法：**核心层**聚焦图形管线、坐标变换、光照模型三大基石；**重点层**深入渲染技术和纹理映射；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 图形管线

#### [概念] 概念解释

图形管线描述从 3D 场景到 2D 图像的渲染过程，包括顶点处理、图元装配、光栅化、片段处理等阶段。理解图形管线是学习计算机图形学的基础。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class Vertex:
    """顶点"""
    position: np.ndarray
    color: np.ndarray
    normal: Optional[np.ndarray] = None
    tex_coord: Optional[np.ndarray] = None

@dataclass
class Triangle:
    """三角形"""
    v0: Vertex
    v1: Vertex
    v2: Vertex

@dataclass
class Fragment:
    """片段"""
    x: int
    y: int
    depth: float
    color: np.ndarray

class GraphicsPipeline:
    """图形管线"""
    
    def __init__(self, width: int, height: int):
        self.width = width
        self.height = height
        self.framebuffer = np.zeros((height, width, 3), dtype=np.uint8)
        self.depth_buffer = np.full((height, width), float('inf'))
    
    def clear(self, color: Tuple[int, int, int] = (0, 0, 0)):
        """清空缓冲区"""
        self.framebuffer[:] = color
        self.depth_buffer[:] = float('inf')
    
    def vertex_shader(self, vertex: Vertex, mvp_matrix: np.ndarray) -> Vertex:
        """顶点着色器"""
        pos = np.append(vertex.position, 1.0)
        transformed = mvp_matrix @ pos
        
        transformed /= transformed[3]
        
        return Vertex(
            position=transformed[:3],
            color=vertex.color.copy(),
            normal=vertex.normal,
            tex_coord=vertex.tex_coord
        )
    
    def primitive_assembly(self, vertices: List[Vertex]) -> List[Triangle]:
        """图元装配"""
        triangles = []
        
        for i in range(0, len(vertices) - 2, 3):
            triangles.append(Triangle(
                v0=vertices[i],
                v1=vertices[i + 1],
                v2=vertices[i + 2]
            ))
        
        return triangles
    
    def rasterize(self, triangle: Triangle) -> List[Fragment]:
        """光栅化"""
        fragments = []
        
        v0 = triangle.v0.position
        v1 = triangle.v1.position
        v2 = triangle.v2.position
        
        min_x = max(0, int(min(v0[0], v1[0], v2[0])))
        max_x = min(self.width - 1, int(max(v0[0], v1[0], v2[0])))
        min_y = max(0, int(min(v0[1], v1[1], v2[1])))
        max_y = min(self.height - 1, int(max(v0[1], v1[1], v2[1])))
        
        for y in range(min_y, max_y + 1):
            for x in range(min_x, max_x + 1):
                px, py = x + 0.5, y + 0.5
                
                bary = self._barycentric(v0[:2], v1[:2], v2[:2], np.array([px, py]))
                
                if all(b >= 0 for b in bary):
                    depth = bary[0] * v0[2] + bary[1] * v1[2] + bary[2] * v2[2]
                    
                    color = (bary[0] * triangle.v0.color + 
                            bary[1] * triangle.v1.color + 
                            bary[2] * triangle.v2.color)
                    
                    fragments.append(Fragment(x, y, depth, color.astype(np.uint8)))
        
        return fragments
    
    def _barycentric(self, a: np.ndarray, b: np.ndarray, 
                     c: np.ndarray, p: np.ndarray) -> np.ndarray:
        """计算重心坐标"""
        v0 = b - a
        v1 = c - a
        v2 = p - a
        
        d00 = np.dot(v0, v0)
        d01 = np.dot(v0, v1)
        d11 = np.dot(v1, v1)
        d20 = np.dot(v2, v0)
        d21 = np.dot(v2, v1)
        
        denom = d00 * d11 - d01 * d01
        
        if abs(denom) < 1e-10:
            return np.array([-1, -1, -1])
        
        v = (d11 * d20 - d01 * d21) / denom
        w = (d00 * d21 - d01 * d20) / denom
        u = 1 - v - w
        
        return np.array([u, v, w])
    
    def fragment_shader(self, fragment: Fragment) -> Fragment:
        """片段着色器"""
        return fragment
    
    def depth_test(self, fragment: Fragment) -> bool:
        """深度测试"""
        if fragment.depth < self.depth_buffer[fragment.y, fragment.x]:
            self.depth_buffer[fragment.y, fragment.x] = fragment.depth
            return True
        return False
    
    def output_merger(self, fragment: Fragment):
        """输出合并"""
        if self.depth_test(fragment):
            self.framebuffer[fragment.y, fragment.x] = fragment.color
    
    def render(self, vertices: List[Vertex], mvp_matrix: np.ndarray):
        """渲染"""
        transformed = [self.vertex_shader(v, mvp_matrix) for v in vertices]
        
        triangles = self.primitive_assembly(transformed)
        
        for triangle in triangles:
            fragments = self.rasterize(triangle)
            
            for fragment in fragments:
                processed = self.fragment_shader(fragment)
                self.output_merger(processed)
    
    def get_framebuffer(self) -> np.ndarray:
        """获取帧缓冲"""
        return self.framebuffer

pipeline = GraphicsPipeline(200, 200)
pipeline.clear((50, 50, 50))

vertices = [
    Vertex(position=np.array([100.0, 50.0, 0.0]), color=np.array([255.0, 0.0, 0.0])),
    Vertex(position=np.array([50.0, 150.0, 0.0]), color=np.array([0.0, 255.0, 0.0])),
    Vertex(position=np.array([150.0, 150.0, 0.0]), color=np.array([0.0, 0.0, 255.0])),
]

mvp = np.eye(4)

pipeline.render(vertices, mvp)

framebuffer = pipeline.get_framebuffer()
print(f"Framebuffer shape: {framebuffer.shape}")
print(f"Non-zero pixels: {np.sum(framebuffer.sum(axis=2) > 0)}")
```

### 2. 坐标变换

#### [概念] 概念解释

坐标变换将 3D 场景中的物体转换到屏幕空间，包括模型变换、视图变换、投影变换。坐标变换是 3D 渲染的核心。

#### [代码] 代码示例

```python
import numpy as np
from typing import Tuple
from dataclasses import dataclass

@dataclass
class Transform:
    """变换"""
    matrix: np.ndarray
    
    @classmethod
    def identity(cls) -> 'Transform':
        """单位变换"""
        return cls(np.eye(4))
    
    @classmethod
    def translation(cls, x: float, y: float, z: float) -> 'Transform':
        """平移变换"""
        matrix = np.eye(4)
        matrix[0, 3] = x
        matrix[1, 3] = y
        matrix[2, 3] = z
        return cls(matrix)
    
    @classmethod
    def rotation_x(cls, angle: float) -> 'Transform':
        """绕 X 轴旋转"""
        rad = np.radians(angle)
        c, s = np.cos(rad), np.sin(rad)
        matrix = np.array([
            [1, 0, 0, 0],
            [0, c, -s, 0],
            [0, s, c, 0],
            [0, 0, 0, 1]
        ])
        return cls(matrix)
    
    @classmethod
    def rotation_y(cls, angle: float) -> 'Transform':
        """绕 Y 轴旋转"""
        rad = np.radians(angle)
        c, s = np.cos(rad), np.sin(rad)
        matrix = np.array([
            [c, 0, s, 0],
            [0, 1, 0, 0],
            [-s, 0, c, 0],
            [0, 0, 0, 1]
        ])
        return cls(matrix)
    
    @classmethod
    def rotation_z(cls, angle: float) -> 'Transform':
        """绕 Z 轴旋转"""
        rad = np.radians(angle)
        c, s = np.cos(rad), np.sin(rad)
        matrix = np.array([
            [c, -s, 0, 0],
            [s, c, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ])
        return cls(matrix)
    
    @classmethod
    def scale(cls, x: float, y: float, z: float) -> 'Transform':
        """缩放变换"""
        matrix = np.eye(4)
        matrix[0, 0] = x
        matrix[1, 1] = y
        matrix[2, 2] = z
        return cls(matrix)
    
    def compose(self, other: 'Transform') -> 'Transform':
        """组合变换"""
        return Transform(self.matrix @ other.matrix)
    
    def inverse(self) -> 'Transform':
        """逆变换"""
        return Transform(np.linalg.inv(self.matrix))
    
    def apply(self, point: np.ndarray) -> np.ndarray:
        """应用变换"""
        p = np.append(point, 1.0)
        result = self.matrix @ p
        return result[:3] / result[3]

class Camera:
    """相机"""
    
    def __init__(self, position: np.ndarray, target: np.ndarray, up: np.ndarray):
        self.position = position
        self.target = target
        self.up = up
    
    def get_view_matrix(self) -> np.ndarray:
        """获取视图矩阵"""
        forward = self.target - self.position
        forward = forward / np.linalg.norm(forward)
        
        right = np.cross(forward, self.up)
        right = right / np.linalg.norm(right)
        
        up = np.cross(right, forward)
        
        view = np.eye(4)
        view[0, :3] = right
        view[1, :3] = up
        view[2, :3] = -forward
        view[0, 3] = -np.dot(right, self.position)
        view[1, 3] = -np.dot(up, self.position)
        view[2, 3] = np.dot(forward, self.position)
        
        return view

class Projection:
    """投影"""
    
    @staticmethod
    def perspective(fov: float, aspect: float, near: float, far: float) -> np.ndarray:
        """透视投影"""
        rad = np.radians(fov)
        tan_half_fov = np.tan(rad / 2)
        
        matrix = np.zeros((4, 4))
        matrix[0, 0] = 1 / (aspect * tan_half_fov)
        matrix[1, 1] = 1 / tan_half_fov
        matrix[2, 2] = -(far + near) / (far - near)
        matrix[2, 3] = -(2 * far * near) / (far - near)
        matrix[3, 2] = -1
        
        return matrix
    
    @staticmethod
    def orthographic(left: float, right: float, bottom: float, 
                     top: float, near: float, far: float) -> np.ndarray:
        """正交投影"""
        matrix = np.eye(4)
        matrix[0, 0] = 2 / (right - left)
        matrix[1, 1] = 2 / (top - bottom)
        matrix[2, 2] = -2 / (far - near)
        matrix[0, 3] = -(right + left) / (right - left)
        matrix[1, 3] = -(top + bottom) / (top - bottom)
        matrix[2, 3] = -(far + near) / (far - near)
        
        return matrix

class Viewport:
    """视口"""
    
    def __init__(self, x: int, y: int, width: int, height: int):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
    
    def transform(self, ndc: np.ndarray) -> np.ndarray:
        """NDC 到屏幕坐标"""
        screen = np.zeros(3)
        screen[0] = (ndc[0] + 1) * 0.5 * self.width + self.x
        screen[1] = (1 - ndc[1]) * 0.5 * self.height + self.y
        screen[2] = ndc[2]
        return screen

translation = Transform.translation(1, 2, 3)
rotation = Transform.rotation_y(45)
scale = Transform.scale(2, 2, 2)

combined = translation.compose(rotation).compose(scale)

point = np.array([1.0, 0.0, 0.0])
transformed = combined.apply(point)
print(f"Original point: {point}")
print(f"Transformed point: {transformed}")

camera = Camera(
    position=np.array([0.0, 0.0, 5.0]),
    target=np.array([0.0, 0.0, 0.0]),
    up=np.array([0.0, 1.0, 0.0])
)

view_matrix = camera.get_view_matrix()
print(f"\nView matrix:\n{view_matrix}")

proj_matrix = Projection.perspective(fov=60, aspect=16/9, near=0.1, far=100)
print(f"\nPerspective projection matrix:\n{proj_matrix[:2, :2]}...")

viewport = Viewport(0, 0, 800, 600)
ndc = np.array([0.0, 0.0, 0.5])
screen = viewport.transform(ndc)
print(f"\nNDC {ndc} -> Screen {screen}")
```

### 3. 光照模型

#### [概念] 概念解释

光照模型模拟光线与物体的交互，包括环境光、漫反射、镜面反射等。常用模型有 Phong、Blinn-Phong 等。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Tuple
from dataclasses import dataclass

@dataclass
class Light:
    """光源"""
    position: np.ndarray
    color: np.ndarray
    intensity: float

@dataclass
class Material:
    """材质"""
    ambient: np.ndarray
    diffuse: np.ndarray
    specular: np.ndarray
    shininess: float

class PhongLighting:
    """Phong 光照模型"""
    
    def __init__(self):
        pass
    
    def compute(self, position: np.ndarray, normal: np.ndarray, 
                view_dir: np.ndarray, light: Light, 
                material: Material) -> np.ndarray:
        """计算光照"""
        normal = normal / np.linalg.norm(normal)
        view_dir = view_dir / np.linalg.norm(view_dir)
        
        ambient = material.ambient * light.color * light.intensity * 0.1
        
        light_dir = light.position - position
        light_dir = light_dir / np.linalg.norm(light_dir)
        
        diff = max(np.dot(normal, light_dir), 0)
        diffuse = diff * material.diffuse * light.color * light.intensity
        
        reflect_dir = 2 * np.dot(normal, light_dir) * normal - light_dir
        reflect_dir = reflect_dir / np.linalg.norm(reflect_dir)
        
        spec = max(np.dot(view_dir, reflect_dir), 0) ** material.shininess
        specular = spec * material.specular * light.color * light.intensity
        
        return ambient + diffuse + specular

class BlinnPhongLighting:
    """Blinn-Phong 光照模型"""
    
    def __init__(self):
        pass
    
    def compute(self, position: np.ndarray, normal: np.ndarray, 
                view_dir: np.ndarray, light: Light, 
                material: Material) -> np.ndarray:
        """计算光照"""
        normal = normal / np.linalg.norm(normal)
        view_dir = view_dir / np.linalg.norm(view_dir)
        
        ambient = material.ambient * light.color * light.intensity * 0.1
        
        light_dir = light.position - position
        light_dir = light_dir / np.linalg.norm(light_dir)
        
        diff = max(np.dot(normal, light_dir), 0)
        diffuse = diff * material.diffuse * light.color * light.intensity
        
        half_dir = light_dir + view_dir
        half_dir = half_dir / np.linalg.norm(half_dir)
        
        spec = max(np.dot(normal, half_dir), 0) ** material.shininess
        specular = spec * material.specular * light.color * light.intensity
        
        return ambient + diffuse + specular

class MultipleLights:
    """多光源"""
    
    def __init__(self, lighting_model):
        self.lighting_model = lighting_model
    
    def compute(self, position: np.ndarray, normal: np.ndarray, 
                view_dir: np.ndarray, lights: List[Light], 
                material: Material) -> np.ndarray:
        """计算多光源光照"""
        result = np.zeros(3)
        
        for light in lights:
            contribution = self.lighting_model.compute(
                position, normal, view_dir, light, material
            )
            result += contribution
        
        return np.clip(result, 0, 1)

class Shadow:
    """阴影"""
    
    def __init__(self):
        pass
    
    def compute_shadow_factor(self, point: np.ndarray, light_pos: np.ndarray, 
                               objects: List) -> float:
        """计算阴影因子"""
        direction = light_pos - point
        distance = np.linalg.norm(direction)
        direction = direction / distance
        
        for obj in objects:
            t = self._ray_intersect(point, direction, obj)
            if t is not None and t < distance:
                return 0.3
        
        return 1.0
    
    def _ray_intersect(self, origin: np.ndarray, direction: np.ndarray, 
                       obj: dict) -> float:
        """射线相交检测"""
        if obj.get('type') == 'sphere':
            center = obj['center']
            radius = obj['radius']
            
            oc = origin - center
            a = np.dot(direction, direction)
            b = 2 * np.dot(oc, direction)
            c = np.dot(oc, oc) - radius ** 2
            
            discriminant = b ** 2 - 4 * a * c
            
            if discriminant > 0:
                t = (-b - np.sqrt(discriminant)) / (2 * a)
                if t > 0:
                    return t
        
        return None

position = np.array([0.0, 0.0, 0.0])
normal = np.array([0.0, 1.0, 0.0])
view_dir = np.array([0.0, 1.0, 1.0])

light = Light(
    position=np.array([5.0, 5.0, 5.0]),
    color=np.array([1.0, 1.0, 1.0]),
    intensity=1.0
)

material = Material(
    ambient=np.array([0.1, 0.1, 0.1]),
    diffuse=np.array([0.7, 0.2, 0.2]),
    specular=np.array([1.0, 1.0, 1.0]),
    shininess=32.0
)

phong = PhongLighting()
color = phong.compute(position, normal, view_dir, light, material)
print(f"Phong lighting color: {color}")

blinn_phong = BlinnPhongLighting()
color_bp = blinn_phong.compute(position, normal, view_dir, light, material)
print(f"Blinn-Phong lighting color: {color_bp}")

lights = [
    Light(np.array([5.0, 5.0, 5.0]), np.array([1.0, 1.0, 1.0]), 1.0),
    Light(np.array([-5.0, 3.0, 2.0]), np.array([0.5, 0.5, 1.0]), 0.5),
]

multi_light = MultipleLights(phong)
color_multi = multi_light.compute(position, normal, view_dir, lights, material)
print(f"Multiple lights color: {color_multi}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 渲染技术

#### [概念] 概念解释

渲染技术将 3D 场景转换为 2D 图像，包括光线追踪、路径追踪、光子映射等。现代渲染追求真实感和效率的平衡。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class Ray:
    """射线"""
    origin: np.ndarray
    direction: np.ndarray

@dataclass
class HitRecord:
    """碰撞记录"""
    t: float
    point: np.ndarray
    normal: np.ndarray
    material: Material

class Sphere:
    """球体"""
    
    def __init__(self, center: np.ndarray, radius: float, material: Material):
        self.center = center
        self.radius = radius
        self.material = material
    
    def intersect(self, ray: Ray) -> Optional[HitRecord]:
        """射线相交"""
        oc = ray.origin - self.center
        a = np.dot(ray.direction, ray.direction)
        b = 2 * np.dot(oc, ray.direction)
        c = np.dot(oc, oc) - self.radius ** 2
        
        discriminant = b ** 2 - 4 * a * c
        
        if discriminant < 0:
            return None
        
        t = (-b - np.sqrt(discriminant)) / (2 * a)
        
        if t < 0:
            t = (-b + np.sqrt(discriminant)) / (2 * a)
            if t < 0:
                return None
        
        point = ray.origin + t * ray.direction
        normal = (point - self.center) / self.radius
        
        return HitRecord(t, point, normal, self.material)

class RayTracer:
    """光线追踪器"""
    
    def __init__(self, max_depth: int = 5):
        self.max_depth = max_depth
        self.objects: List = []
        self.lights: List[Light] = []
    
    def add_object(self, obj):
        """添加物体"""
        self.objects.append(obj)
    
    def add_light(self, light: Light):
        """添加光源"""
        self.lights.append(light)
    
    def trace(self, ray: Ray, depth: int = 0) -> np.ndarray:
        """追踪射线"""
        if depth >= self.max_depth:
            return np.zeros(3)
        
        hit = self._find_closest_hit(ray)
        
        if hit is None:
            return np.array([0.1, 0.1, 0.2])
        
        color = np.zeros(3)
        
        for light in self.lights:
            light_dir = light.position - hit.point
            light_dir = light_dir / np.linalg.norm(light_dir)
            
            shadow_ray = Ray(hit.point + hit.normal * 0.001, light_dir)
            if self._is_in_shadow(shadow_ray, light):
                continue
            
            diff = max(np.dot(hit.normal, light_dir), 0)
            color += diff * hit.material.diffuse * light.color * light.intensity
            
            view_dir = -ray.direction
            reflect_dir = 2 * np.dot(hit.normal, light_dir) * hit.normal - light_dir
            spec = max(np.dot(view_dir, reflect_dir), 0) ** hit.material.shininess
            color += spec * hit.material.specular * light.color * light.intensity
        
        if hit.material.specular.sum() > 0:
            reflect_dir = ray.direction - 2 * np.dot(ray.direction, hit.normal) * hit.normal
            reflect_ray = Ray(hit.point + hit.normal * 0.001, reflect_dir)
            reflect_color = self.trace(reflect_ray, depth + 1)
            color += 0.3 * reflect_color * hit.material.specular
        
        return color
    
    def _find_closest_hit(self, ray: Ray) -> Optional[HitRecord]:
        """查找最近碰撞"""
        closest_hit = None
        closest_t = float('inf')
        
        for obj in self.objects:
            hit = obj.intersect(ray)
            if hit and hit.t < closest_t:
                closest_t = hit.t
                closest_hit = hit
        
        return closest_hit
    
    def _is_in_shadow(self, ray: Ray, light: Light) -> bool:
        """检测阴影"""
        light_dist = np.linalg.norm(light.position - ray.origin)
        
        for obj in self.objects:
            hit = obj.intersect(ray)
            if hit and hit.t < light_dist:
                return True
        
        return False

class Renderer:
    """渲染器"""
    
    def __init__(self, width: int, height: int):
        self.width = width
        self.height = height
        self.tracer = RayTracer(max_depth=3)
    
    def render(self, camera: Camera) -> np.ndarray:
        """渲染"""
        image = np.zeros((self.height, self.width, 3))
        
        aspect = self.width / self.height
        fov = np.radians(60)
        tan_fov = np.tan(fov / 2)
        
        view_matrix = camera.get_view_matrix()
        
        for y in range(self.height):
            for x in range(self.width):
                ndc_x = (2 * (x + 0.5) / self.width - 1) * aspect * tan_fov
                ndc_y = (1 - 2 * (y + 0.5) / self.height) * tan_fov
                
                direction = np.array([ndc_x, ndc_y, -1])
                direction = direction / np.linalg.norm(direction)
                
                ray = Ray(camera.position.copy(), direction)
                
                color = self.tracer.trace(ray)
                image[y, x] = np.clip(color, 0, 1)
        
        return (image * 255).astype(np.uint8)

material_red = Material(
    ambient=np.array([0.1, 0.0, 0.0]),
    diffuse=np.array([0.8, 0.2, 0.2]),
    specular=np.array([1.0, 1.0, 1.0]),
    shininess=32.0
)

material_blue = Material(
    ambient=np.array([0.0, 0.0, 0.1]),
    diffuse=np.array([0.2, 0.2, 0.8]),
    specular=np.array([1.0, 1.0, 1.0]),
    shininess=64.0
)

tracer = RayTracer(max_depth=3)
tracer.add_object(Sphere(np.array([0.0, 0.0, -5.0]), 1.0, material_red))
tracer.add_object(Sphere(np.array([2.0, 0.0, -6.0]), 1.0, material_blue))
tracer.add_light(Light(np.array([5.0, 5.0, 0.0]), np.array([1.0, 1.0, 1.0]), 1.0))

ray = Ray(np.array([0.0, 0.0, 0.0]), np.array([0.0, 0.0, -1.0]))
color = tracer.trace(ray)
print(f"Traced ray color: {color}")

renderer = Renderer(100, 100)
camera = Camera(
    position=np.array([0.0, 0.0, 0.0]),
    target=np.array([0.0, 0.0, -1.0]),
    up=np.array([0.0, 1.0, 0.0])
)

image = renderer.render(camera)
print(f"Rendered image shape: {image.shape}")
```

### 2. 纹理映射

#### [概念] 概念解释

纹理映射将图像映射到 3D 表面，增加细节和真实感。常用技术包括 UV 映射、法线贴图、环境映射等。

#### [代码] 代码示例

```python
import numpy as np
from typing import Tuple, Optional
from dataclasses import dataclass

@dataclass
class Texture:
    """纹理"""
    data: np.ndarray
    
    @classmethod
    def create_checkerboard(cls, width: int, height: int, 
                            block_size: int = 16) -> 'Texture':
        """创建棋盘格纹理"""
        data = np.zeros((height, width, 3), dtype=np.uint8)
        
        for y in range(height):
            for x in range(width):
                if ((x // block_size) + (y // block_size)) % 2 == 0:
                    data[y, x] = [255, 255, 255]
                else:
                    data[y, x] = [0, 0, 0]
        
        return cls(data)
    
    @classmethod
    def create_gradient(cls, width: int, height: int) -> 'Texture':
        """创建渐变纹理"""
        data = np.zeros((height, width, 3), dtype=np.uint8)
        
        for y in range(height):
            for x in range(width):
                data[y, x] = [
                    int(255 * x / width),
                    int(255 * y / height),
                    int(255 * (x + y) / (width + height))
                ]
        
        return cls(data)
    
    def sample(self, u: float, v: float) -> np.ndarray:
        """采样纹理"""
        u = u % 1.0
        v = v % 1.0
        
        x = int(u * (self.data.shape[1] - 1))
        y = int(v * (self.data.shape[0] - 1))
        
        return self.data[y, x].astype(float) / 255.0
    
    def sample_bilinear(self, u: float, v: float) -> np.ndarray:
        """双线性采样"""
        u = u % 1.0
        v = v % 1.0
        
        height, width = self.data.shape[:2]
        
        x = u * (width - 1)
        y = v * (height - 1)
        
        x0, y0 = int(x), int(y)
        x1, y1 = min(x0 + 1, width - 1), min(y0 + 1, height - 1)
        
        fx, fy = x - x0, y - y0
        
        c00 = self.data[y0, x0].astype(float)
        c01 = self.data[y0, x1].astype(float)
        c10 = self.data[y1, x0].astype(float)
        c11 = self.data[y1, x1].astype(float)
        
        color = (1 - fx) * (1 - fy) * c00 + \
                fx * (1 - fy) * c01 + \
                (1 - fx) * fy * c10 + \
                fx * fy * c11
        
        return color / 255.0

class UVMapping:
    """UV 映射"""
    
    def __init__(self):
        pass
    
    def sphere_uv(self, point: np.ndarray, center: np.ndarray, 
                  radius: float) -> Tuple[float, float]:
        """球体 UV 映射"""
        relative = point - center
        
        theta = np.arctan2(relative[0], relative[2])
        phi = np.arcsin(relative[1] / radius)
        
        u = (theta + np.pi) / (2 * np.pi)
        v = (phi + np.pi / 2) / np.pi
        
        return u, v
    
    def plane_uv(self, point: np.ndarray, scale: float = 1.0) -> Tuple[float, float]:
        """平面 UV 映射"""
        u = (point[0] * scale) % 1.0
        v = (point[2] * scale) % 1.0
        
        return u, v
    
    def cylinder_uv(self, point: np.ndarray, center: np.ndarray, 
                    radius: float, height: float) -> Tuple[float, float]:
        """圆柱 UV 映射"""
        relative = point - center
        
        theta = np.arctan2(relative[0], relative[2])
        u = (theta + np.pi) / (2 * np.pi)
        v = (relative[1] + height / 2) / height
        
        return u, v

class NormalMap:
    """法线贴图"""
    
    def __init__(self, texture: Texture, strength: float = 1.0):
        self.texture = texture
        self.strength = strength
    
    def sample_normal(self, u: float, v: float) -> np.ndarray:
        """采样法线"""
        color = self.texture.sample(u, v)
        
        normal = np.array([
            (color[0] - 0.5) * 2 * self.strength,
            (color[1] - 0.5) * 2 * self.strength,
            color[2]
        ])
        
        norm = np.linalg.norm(normal)
        if norm > 0:
            normal = normal / norm
        
        return normal

class EnvironmentMap:
    """环境映射"""
    
    def __init__(self, texture: Texture):
        self.texture = texture
    
    def sample(self, direction: np.ndarray) -> np.ndarray:
        """采样环境"""
        direction = direction / np.linalg.norm(direction)
        
        u = 0.5 + np.arctan2(direction[0], direction[2]) / (2 * np.pi)
        v = 0.5 - np.arcsin(direction[1]) / np.pi
        
        return self.texture.sample(u, v)

checkerboard = Texture.create_checkerboard(64, 64, block_size=8)
color = checkerboard.sample(0.25, 0.25)
print(f"Checkerboard sample at (0.25, 0.25): {color}")

gradient = Texture.create_gradient(64, 64)
color_bi = gradient.sample_bilinear(0.5, 0.5)
print(f"Gradient bilinear sample at (0.5, 0.5): {color_bi}")

uv_mapping = UVMapping()

point = np.array([1.0, 0.0, 0.0])
center = np.array([0.0, 0.0, 0.0])
u, v = uv_mapping.sphere_uv(point, center, 1.0)
print(f"Sphere UV for point {point}: ({u:.3f}, {v:.3f})")

env_map = EnvironmentMap(gradient)
direction = np.array([1.0, 0.5, 0.0])
env_color = env_map.sample(direction)
print(f"Environment map sample: {env_color}")
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| OpenGL | 跨平台图形 API |
| DirectX | Windows 图形 API |
| Vulkan | 底层图形 API |
| WebGL | Web 图形 API |
| Shader | 着色器编程 |
| PBR | 基于物理的渲染 |
| Global Illumination | 全局光照 |
| Path Tracing | 路径追踪 |
| Ray Marching | 射线步进 |
| Deferred Shading | 延迟渲染 |
| Shadow Mapping | 阴影映射 |
| Ambient Occlusion | 环境光遮蔽 |
| Subsurface Scattering | 次表面散射 |
| Particle System | 粒子系统 |
| Skeletal Animation | 骨骼动画 |

---

## [实战] 核心实战清单

### 实战任务 1：简易 3D 渲染器

构建一个简易 3D 渲染器。要求：
1. 实现基本的图形管线
2. 支持模型、视图、投影变换
3. 实现 Phong 光照模型
4. 添加纹理映射支持
5. 渲染一个简单场景
