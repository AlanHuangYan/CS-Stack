# AR/VR 基础 三层深度学习教程

## [总览] 技术总览

AR（增强现实）和 VR（虚拟现实）技术创造沉浸式体验，包括 3D 渲染、交互设计、空间定位等。AR/VR 是元宇宙和沉浸式计算的基础技术。

本教程采用三层漏斗学习法：**核心层**聚焦 AR/VR 概念、3D 空间、交互基础三大基石；**重点层**深入追踪技术和渲染优化；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. AR/VR 概念

#### [概念] 概念解释

AR 将虚拟内容叠加到现实世界，VR 创造完全虚拟的沉浸环境。两者都涉及 3D 渲染、空间感知、用户交互等核心技术。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

class RealityType(Enum):
    """现实类型"""
    VR = "virtual_reality"
    AR = "augmented_reality"
    MR = "mixed_reality"

@dataclass
class XRDevice:
    """XR 设备"""
    name: str
    type: RealityType
    resolution: Tuple[int, int]
    fov: float
    refresh_rate: int
    tracking_type: str

@dataclass
class XRSession:
    """XR 会话"""
    device: XRDevice
    is_active: bool
    frame_count: int

class XRManager:
    """XR 管理器"""
    
    def __init__(self):
        self.devices: Dict[str, XRDevice] = {}
        self.active_session: Optional[XRSession] = None
    
    def register_device(self, device: XRDevice):
        """注册设备"""
        self.devices[device.name] = device
    
    def start_session(self, device_name: str) -> Optional[XRSession]:
        """开始会话"""
        device = self.devices.get(device_name)
        if device is None:
            return None
        
        self.active_session = XRSession(
            device=device,
            is_active=True,
            frame_count=0
        )
        
        return self.active_session
    
    def end_session(self):
        """结束会话"""
        if self.active_session:
            self.active_session.is_active = False
            self.active_session = None
    
    def get_frame(self) -> Optional[Dict]:
        """获取帧数据"""
        if self.active_session is None or not self.active_session.is_active:
            return None
        
        self.active_session.frame_count += 1
        
        return {
            'frame_number': self.active_session.frame_count,
            'timestamp': self.active_session.frame_count / self.active_session.device.refresh_rate,
            'device': self.active_session.device.name
        }

class ARContentManager:
    """AR 内容管理器"""
    
    def __init__(self):
        self.anchors: Dict[str, np.ndarray] = {}
        self.virtual_objects: Dict[str, Dict] = {}
    
    def place_anchor(self, anchor_id: str, position: np.ndarray, 
                     orientation: np.ndarray = None):
        """放置锚点"""
        self.anchors[anchor_id] = {
            'position': position,
            'orientation': orientation or np.eye(3)
        }
    
    def add_virtual_object(self, object_id: str, anchor_id: str, 
                           model_data: Dict):
        """添加虚拟对象"""
        if anchor_id in self.anchors:
            self.virtual_objects[object_id] = {
                'anchor_id': anchor_id,
                'model': model_data,
                'visible': True
            }
    
    def get_visible_objects(self, camera_position: np.ndarray, 
                            camera_direction: np.ndarray) -> List[Dict]:
        """获取可见对象"""
        visible = []
        
        for obj_id, obj in self.virtual_objects.items():
            if not obj['visible']:
                continue
            
            anchor = self.anchors.get(obj['anchor_id'])
            if anchor is None:
                continue
            
            to_object = anchor['position'] - camera_position
            distance = np.linalg.norm(to_object)
            
            if distance < 100:
                visible.append({
                    'object_id': obj_id,
                    'position': anchor['position'],
                    'distance': distance
                })
        
        return visible

class VREnvironment:
    """VR 环境"""
    
    def __init__(self):
        self.scene_objects: List[Dict] = []
        self.lights: List[Dict] = []
        self.skybox: Optional[np.ndarray] = None
    
    def add_object(self, position: np.ndarray, rotation: np.ndarray, 
                   scale: np.ndarray, mesh: Dict):
        """添加对象"""
        self.scene_objects.append({
            'position': position,
            'rotation': rotation,
            'scale': scale,
            'mesh': mesh
        })
    
    def add_light(self, light_type: str, position: np.ndarray, 
                  color: np.ndarray, intensity: float):
        """添加光源"""
        self.lights.append({
            'type': light_type,
            'position': position,
            'color': color,
            'intensity': intensity
        })
    
    def set_skybox(self, skybox_data: np.ndarray):
        """设置天空盒"""
        self.skybox = skybox_data
    
    def get_render_data(self) -> Dict:
        """获取渲染数据"""
        return {
            'objects': self.scene_objects,
            'lights': self.lights,
            'skybox': self.skybox is not None
        }

xr_manager = XRManager()

vr_device = XRDevice(
    name="VR Headset",
    type=RealityType.VR,
    resolution=(2160, 2160),
    fov=110,
    refresh_rate=90,
    tracking_type="6DOF"
)

ar_device = XRDevice(
    name="AR Glasses",
    type=RealityType.AR,
    resolution=(1280, 720),
    fov=40,
    refresh_rate=60,
    tracking_type="3DOF"
)

xr_manager.register_device(vr_device)
xr_manager.register_device(ar_device)

session = xr_manager.start_session("VR Headset")
print(f"Session started: {session.is_active}")

for i in range(5):
    frame = xr_manager.get_frame()
    print(f"Frame {frame['frame_number']}: t={frame['timestamp']:.3f}s")

ar_manager = ARContentManager()
ar_manager.place_anchor("table", np.array([0.0, 0.0, -1.0]))
ar_manager.add_virtual_object("vase", "table", {'type': 'mesh', 'vertices': 100})

visible = ar_manager.get_visible_objects(
    np.array([0.0, 0.0, 0.0]),
    np.array([0.0, 0.0, -1.0])
)
print(f"\nVisible AR objects: {len(visible)}")

vr_env = VREnvironment()
vr_env.add_object(
    position=np.array([0.0, 0.0, -5.0]),
    rotation=np.eye(3),
    scale=np.ones(3),
    mesh={'type': 'cube'}
)
vr_env.add_light("point", np.array([0.0, 5.0, 0.0]), np.ones(3), 1.0)

render_data = vr_env.get_render_data()
print(f"\nVR Environment: {len(render_data['objects'])} objects, {len(render_data['lights'])} lights")
```

### 2. 3D 空间

#### [概念] 概念解释

3D 空间是 AR/VR 的基础，包括坐标系、空间变换、空间音频等。理解 3D 空间对创建沉浸式体验至关重要。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class Transform3D:
    """3D 变换"""
    position: np.ndarray
    rotation: np.ndarray
    scale: np.ndarray
    
    @classmethod
    def identity(cls) -> 'Transform3D':
        """单位变换"""
        return cls(
            position=np.zeros(3),
            rotation=np.eye(3),
            scale=np.ones(3)
        )
    
    def get_matrix(self) -> np.ndarray:
        """获取变换矩阵"""
        matrix = np.eye(4)
        
        matrix[:3, :3] = self.rotation * self.scale
        
        matrix[:3, 3] = self.position
        
        return matrix
    
    def inverse(self) -> 'Transform3D':
        """逆变换"""
        inv_rotation = self.rotation.T
        inv_scale = 1.0 / self.scale
        inv_position = -inv_rotation @ (self.position * inv_scale)
        
        return Transform3D(inv_position, inv_rotation, inv_scale)
    
    def transform_point(self, point: np.ndarray) -> np.ndarray:
        """变换点"""
        scaled = point * self.scale
        rotated = self.rotation @ scaled
        return rotated + self.position
    
    def transform_direction(self, direction: np.ndarray) -> np.ndarray:
        """变换方向"""
        scaled = direction * self.scale
        return self.rotation @ scaled

class SpatialAnchor:
    """空间锚点"""
    
    def __init__(self, anchor_id: str, transform: Transform3D):
        self.anchor_id = anchor_id
        self.transform = transform
        self.persistent = False
    
    def get_world_position(self) -> np.ndarray:
        """获取世界坐标"""
        return self.transform.position
    
    def update(self, new_transform: Transform3D):
        """更新变换"""
        self.transform = new_transform

class SpatialMapping:
    """空间映射"""
    
    def __init__(self):
        self.mesh_vertices: List[np.ndarray] = []
        self.mesh_triangles: List[Tuple[int, int, int]] = []
        self.planes: List[Dict] = []
    
    def add_surface_point(self, point: np.ndarray):
        """添加表面点"""
        self.mesh_vertices.append(point)
    
    def detect_plane(self, min_points: int = 100) -> Optional[Dict]:
        """检测平面"""
        if len(self.mesh_vertices) < min_points:
            return None
        
        points = np.array(self.mesh_vertices[-min_points:])
        
        centroid = np.mean(points, axis=0)
        
        centered = points - centroid
        _, _, vh = np.linalg.svd(centered)
        normal = vh[-1]
        
        plane = {
            'center': centroid,
            'normal': normal,
            'extent': np.max(np.abs(centered), axis=0)[:2]
        }
        
        self.planes.append(plane)
        return plane
    
    def get_mesh_data(self) -> Dict:
        """获取网格数据"""
        return {
            'vertices': np.array(self.mesh_vertices),
            'triangles': self.mesh_triangles,
            'planes': self.planes
        }

class SpatialAudio:
    """空间音频"""
    
    def __init__(self):
        self.sources: List[Dict] = []
        self.listener_position = np.zeros(3)
        self.listener_orientation = np.eye(3)
    
    def add_source(self, source_id: str, position: np.ndarray, 
                   audio_data: np.ndarray):
        """添加音源"""
        self.sources.append({
            'id': source_id,
            'position': position,
            'audio': audio_data,
            'volume': 1.0
        })
    
    def update_listener(self, position: np.ndarray, orientation: np.ndarray):
        """更新听者位置"""
        self.listener_position = position
        self.listener_orientation = orientation
    
    def compute_spatial_mix(self) -> np.ndarray:
        """计算空间混音"""
        mix = np.zeros(2)
        
        for source in self.sources:
            to_source = source['position'] - self.listener_position
            distance = np.linalg.norm(to_source)
            
            distance_gain = 1.0 / (1.0 + distance)
            
            if distance > 0:
                direction = to_source / distance
                forward = self.listener_orientation[:, 2]
                
                dot = np.dot(direction, forward)
                pan = (dot + 1) / 2
            else:
                pan = 0.5
            
            left_gain = source['volume'] * distance_gain * (1 - pan)
            right_gain = source['volume'] * distance_gain * pan
            
            mix[0] += left_gain
            mix[1] += right_gain
        
        return mix

transform = Transform3D.identity()
transform.position = np.array([1.0, 2.0, 3.0])
transform.rotation = np.eye(3)
transform.scale = np.array([2.0, 2.0, 2.0])

point = np.array([1.0, 0.0, 0.0])
transformed = transform.transform_point(point)
print(f"Transformed point: {transformed}")

anchor = SpatialAnchor("anchor_1", transform)
print(f"Anchor position: {anchor.get_world_position()}")

mapping = SpatialMapping()
for i in range(100):
    point = np.array([
        np.random.randn() * 0.1,
        0.0,
        np.random.randn() * 0.1
    ])
    mapping.add_surface_point(point)

plane = mapping.detect_plane()
if plane:
    print(f"\nDetected plane: center={plane['center']}, normal={plane['normal']}")

audio = SpatialAudio()
audio.add_source("sound_1", np.array([5.0, 0.0, 0.0]), np.zeros(100))
audio.update_listener(np.zeros(3), np.eye(3))

mix = audio.compute_spatial_mix()
print(f"\nSpatial audio mix: left={mix[0]:.3f}, right={mix[1]:.3f}")
```

### 3. 交互基础

#### [概念] 概念解释

AR/VR 交互包括手势识别、视线追踪、控制器输入等。自然直观的交互是沉浸式体验的关键。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

class GestureType(Enum):
    """手势类型"""
    PINCH = "pinch"
    POINT = "point"
    GRAB = "grab"
    WAVE = "wave"
    THUMBS_UP = "thumbs_up"

@dataclass
class HandData:
    """手部数据"""
    landmarks: np.ndarray
    confidence: float
    handedness: str

@dataclass
class ControllerState:
    """控制器状态"""
    position: np.ndarray
    rotation: np.ndarray
    buttons: Dict[str, bool]
    triggers: Dict[str, float]

class GestureRecognizer:
    """手势识别器"""
    
    def __init__(self):
        self.gesture_threshold = 0.8
    
    def recognize(self, hand_data: HandData) -> Optional[GestureType]:
        """识别手势"""
        landmarks = hand_data.landmarks
        
        if self._is_pinch(landmarks):
            return GestureType.PINCH
        
        if self._is_point(landmarks):
            return GestureType.POINT
        
        if self._is_grab(landmarks):
            return GestureType.GRAB
        
        return None
    
    def _is_pinch(self, landmarks: np.ndarray) -> bool:
        """检测捏合"""
        if len(landmarks) < 9:
            return False
        
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        
        distance = np.linalg.norm(thumb_tip - index_tip)
        
        return distance < 0.05
    
    def _is_point(self, landmarks: np.ndarray) -> bool:
        """检测指向"""
        if len(landmarks) < 21:
            return False
        
        index_extended = landmarks[8][1] < landmarks[6][1]
        
        middle_bent = landmarks[12][1] > landmarks[10][1]
        ring_bent = landmarks[16][1] > landmarks[14][1]
        pinky_bent = landmarks[20][1] > landmarks[18][1]
        
        return index_extended and middle_bent and ring_bent and pinky_bent
    
    def _is_grab(self, landmarks: np.ndarray) -> bool:
        """检测抓取"""
        if len(landmarks) < 21:
            return False
        
        all_bent = True
        for tip_idx, pip_idx in [(8, 6), (12, 10), (16, 14), (20, 18)]:
            if landmarks[tip_idx][1] < landmarks[pip_idx][1]:
                all_bent = False
                break
        
        return all_bent

class GazeTracker:
    """视线追踪器"""
    
    def __init__(self):
        self.gaze_origin = np.zeros(3)
        self.gaze_direction = np.array([0.0, 0.0, -1.0])
    
    def update(self, eye_data: Dict):
        """更新视线"""
        if 'origin' in eye_data:
            self.gaze_origin = np.array(eye_data['origin'])
        if 'direction' in eye_data:
            self.gaze_direction = np.array(eye_data['direction'])
    
    def cast_ray(self, objects: List[Dict]) -> Optional[Tuple[int, float]]:
        """投射视线"""
        closest_object = None
        closest_distance = float('inf')
        
        for i, obj in enumerate(objects):
            distance = self._ray_sphere_intersect(
                self.gaze_origin,
                self.gaze_direction,
                obj.get('position', np.zeros(3)),
                obj.get('radius', 1.0)
            )
            
            if distance is not None and distance < closest_distance:
                closest_distance = distance
                closest_object = i
        
        if closest_object is not None:
            return closest_object, closest_distance
        return None
    
    def _ray_sphere_intersect(self, origin: np.ndarray, direction: np.ndarray,
                               center: np.ndarray, radius: float) -> Optional[float]:
        """射线球体相交"""
        oc = origin - center
        a = np.dot(direction, direction)
        b = 2 * np.dot(oc, direction)
        c = np.dot(oc, oc) - radius ** 2
        
        discriminant = b ** 2 - 4 * a * c
        
        if discriminant < 0:
            return None
        
        t = (-b - np.sqrt(discriminant)) / (2 * a)
        return t if t > 0 else None

class XRInputManager:
    """XR 输入管理器"""
    
    def __init__(self):
        self.controllers: Dict[str, ControllerState] = {}
        self.hands: Dict[str, HandData] = {}
        self.gaze_tracker = GazeTracker()
        self.gesture_recognizer = GestureRecognizer()
    
    def update_controller(self, controller_id: str, state: ControllerState):
        """更新控制器状态"""
        self.controllers[controller_id] = state
    
    def update_hand(self, hand_id: str, data: HandData):
        """更新手部数据"""
        self.hands[hand_id] = data
    
    def get_input_events(self) -> List[Dict]:
        """获取输入事件"""
        events = []
        
        for controller_id, state in self.controllers.items():
            if state.buttons.get('trigger', False):
                events.append({
                    'type': 'trigger_press',
                    'controller': controller_id,
                    'position': state.position.copy()
                })
        
        for hand_id, hand_data in self.hands.items():
            gesture = self.gesture_recognizer.recognize(hand_data)
            if gesture:
                events.append({
                    'type': 'gesture',
                    'hand': hand_id,
                    'gesture': gesture.value
                })
        
        return events

landmarks = np.zeros((21, 3))
landmarks[4] = [0.02, 0.0, 0.0]
landmarks[8] = [0.03, 0.0, 0.0]

hand_data = HandData(landmarks=landmarks, confidence=0.9, handedness="right")

recognizer = GestureRecognizer()
gesture = recognizer.recognize(hand_data)
print(f"Recognized gesture: {gesture.value if gesture else 'None'}")

gaze = GazeTracker()
gaze.update({
    'origin': [0.0, 0.0, 0.0],
    'direction': [0.0, 0.0, -1.0]
})

objects = [
    {'position': np.array([0.0, 0.0, -2.0]), 'radius': 0.5},
    {'position': np.array([1.0, 0.0, -3.0]), 'radius': 0.3},
]

hit = gaze.cast_ray(objects)
if hit:
    print(f"Gaze hit object {hit[0]} at distance {hit[1]:.2f}")

input_manager = XRInputManager()
input_manager.update_controller("left", ControllerState(
    position=np.array([-0.3, 0.0, -0.5]),
    rotation=np.eye(3),
    buttons={'trigger': True, 'grip': False},
    triggers={'trigger': 0.8, 'grip': 0.0}
))

events = input_manager.get_input_events()
print(f"\nInput events: {len(events)}")
for event in events:
    print(f"  {event['type']}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 追踪技术

#### [概念] 概念解释

追踪技术确定用户在空间中的位置和方向，包括 Inside-Out 追踪、Outside-In 追踪、SLAM 等。精确的追踪是 AR/VR 体验的基础。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from collections import deque

@dataclass
class TrackingState:
    """追踪状态"""
    position: np.ndarray
    rotation: np.ndarray
    velocity: np.ndarray
    angular_velocity: np.ndarray
    confidence: float

class SLAMTracker:
    """SLAM 追踪器"""
    
    def __init__(self):
        self.map_points: List[np.ndarray] = []
        self.keyframes: List[Dict] = []
        self.current_pose = np.eye(4)
        self.feature_detector = FeatureDetector()
    
    def process_frame(self, image: np.ndarray, 
                      imu_data: Dict = None) -> TrackingState:
        """处理帧"""
        features = self.feature_detector.detect(image)
        
        if len(self.map_points) < 100:
            self._initialize_map(features)
        else:
            self._track_features(features)
        
        if imu_data:
            self._fuse_imu(imu_data)
        
        position = self.current_pose[:3, 3]
        rotation = self.current_pose[:3, :3]
        
        return TrackingState(
            position=position,
            rotation=rotation,
            velocity=np.zeros(3),
            angular_velocity=np.zeros(3),
            confidence=0.9
        )
    
    def _initialize_map(self, features: List):
        """初始化地图"""
        for feature in features[:50]:
            self.map_points.append(feature['position'])
    
    def _track_features(self, features: List):
        """追踪特征"""
        pass
    
    def _fuse_imu(self, imu_data: Dict):
        """融合 IMU 数据"""
        pass

class FeatureDetector:
    """特征检测器"""
    
    def __init__(self):
        pass
    
    def detect(self, image: np.ndarray) -> List[Dict]:
        """检测特征"""
        features = []
        
        h, w = image.shape[:2]
        
        for _ in range(50):
            x = np.random.randint(0, w)
            y = np.random.randint(0, h)
            
            features.append({
                'position': np.array([x, y]),
                'descriptor': np.random.randn(128)
            })
        
        return features

class IMUTracker:
    """IMU 追踪器"""
    
    def __init__(self):
        self.position = np.zeros(3)
        self.velocity = np.zeros(3)
        self.rotation = np.eye(3)
        self.gravity = np.array([0.0, -9.81, 0.0])
        self.bias_acc = np.zeros(3)
        self.bias_gyro = np.zeros(3)
    
    def update(self, acc: np.ndarray, gyro: np.ndarray, dt: float):
        """更新状态"""
        corrected_acc = acc - self.bias_acc - self.rotation.T @ self.gravity
        
        self.velocity += corrected_acc * dt
        self.position += self.velocity * dt + 0.5 * corrected_acc * dt ** 2
        
        corrected_gyro = gyro - self.bias_gyro
        angle = np.linalg.norm(corrected_gyro) * dt
        
        if angle > 1e-6:
            axis = corrected_gyro / np.linalg.norm(corrected_gyro)
            delta_rotation = self._axis_angle_to_matrix(axis, angle)
            self.rotation = self.rotation @ delta_rotation
    
    def _axis_angle_to_matrix(self, axis: np.ndarray, angle: float) -> np.ndarray:
        """轴角转旋转矩阵"""
        c, s = np.cos(angle), np.sin(angle)
        t = 1 - c
        x, y, z = axis
        
        return np.array([
            [t*x*x + c, t*x*y - s*z, t*x*z + s*y],
            [t*x*y + s*z, t*y*y + c, t*y*z - s*x],
            [t*x*z - s*y, t*y*z + s*x, t*z*z + c]
        ])
    
    def get_state(self) -> TrackingState:
        """获取状态"""
        return TrackingState(
            position=self.position.copy(),
            rotation=self.rotation.copy(),
            velocity=self.velocity.copy(),
            angular_velocity=np.zeros(3),
            confidence=0.7
        )

class SensorFusion:
    """传感器融合"""
    
    def __init__(self):
        self.visual_tracker = SLAMTracker()
        self.imu_tracker = IMUTracker()
        self.position_buffer = deque(maxlen=10)
        self.rotation_buffer = deque(maxlen=10)
    
    def update(self, image: np.ndarray, acc: np.ndarray, 
               gyro: np.ndarray, dt: float) -> TrackingState:
        """更新融合状态"""
        visual_state = self.visual_tracker.process_frame(image)
        
        self.imu_tracker.update(acc, gyro, dt)
        imu_state = self.imu_tracker.get_state()
        
        alpha = 0.7
        fused_position = alpha * visual_state.position + (1 - alpha) * imu_state.position
        
        fused_rotation = visual_state.rotation
        
        self.position_buffer.append(fused_position)
        self.rotation_buffer.append(fused_rotation)
        
        fused_position = self._smooth_position()
        
        return TrackingState(
            position=fused_position,
            rotation=fused_rotation,
            velocity=imu_state.velocity,
            angular_velocity=np.zeros(3),
            confidence=min(visual_state.confidence, imu_state.confidence) + 0.1
        )
    
    def _smooth_position(self) -> np.ndarray:
        """平滑位置"""
        if len(self.position_buffer) == 0:
            return np.zeros(3)
        
        positions = np.array(self.position_buffer)
        weights = np.exp(np.linspace(-1, 0, len(positions)))
        weights = weights / weights.sum()
        
        return np.average(positions, axis=0, weights=weights)

slam = SLAMTracker()
image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
state = slam.process_frame(image)
print(f"SLAM position: {state.position}")

imu = IMUTracker()
for _ in range(10):
    acc = np.array([0.0, 0.1, 0.0])
    gyro = np.array([0.0, 0.01, 0.0])
    imu.update(acc, gyro, dt=0.01)

imu_state = imu.get_state()
print(f"IMU position: {imu_state.position}")

fusion = SensorFusion()
fused_state = fusion.update(image, acc, gyro, dt=0.01)
print(f"Fused position: {fused_state.position}, confidence: {fused_state.confidence:.2f}")
```

### 2. 渲染优化

#### [概念] 概念解释

AR/VR 渲染需要高帧率和低延迟。优化技术包括单通道立体渲染、注视点渲染、异步时间扭曲等。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass

@dataclass
class RenderConfig:
    """渲染配置"""
    target_fps: int = 90
    resolution: Tuple[int, int] = (2160, 2160)
    fov: float = 90.0
    msaa_samples: int = 4

class SinglePassStereo:
    """单通道立体渲染"""
    
    def __init__(self, config: RenderConfig):
        self.config = config
        self.ipd = 0.064
    
    def render(self, scene: Dict, left_eye: np.ndarray, 
               right_eye: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """渲染立体视图"""
        left_view = self._render_eye(scene, left_eye, -self.ipd / 2)
        right_view = self._render_eye(scene, right_eye, self.ipd / 2)
        
        return left_view, right_view
    
    def _render_eye(self, scene: Dict, view_matrix: np.ndarray, 
                    eye_offset: float) -> np.ndarray:
        """渲染单眼视图"""
        width, height = self.config.resolution
        
        image = np.zeros((height, width, 3), dtype=np.uint8)
        
        for obj in scene.get('objects', []):
            self._render_object(image, obj, view_matrix, eye_offset)
        
        return image
    
    def _render_object(self, image: np.ndarray, obj: Dict, 
                       view_matrix: np.ndarray, eye_offset: float):
        """渲染对象"""
        pass

class FoveatedRenderer:
    """注视点渲染"""
    
    def __init__(self, config: RenderConfig):
        self.config = config
        self.fovea_center = (0.5, 0.5)
        self.fovea_radius = 0.2
        self.periphery_quality = 0.5
    
    def set_gaze_point(self, x: float, y: float):
        """设置注视点"""
        self.fovea_center = (x, y)
    
    def render(self, scene: Dict, view_matrix: np.ndarray) -> np.ndarray:
        """渲染"""
        width, height = self.config.resolution
        
        high_res = self._render_region(
            scene, view_matrix,
            self.fovea_center, self.fovea_radius, 1.0
        )
        
        low_res = self._render_region(
            scene, view_matrix,
            (0.5, 0.5), 1.0, self.periphery_quality
        )
        
        return self._blend_regions(high_res, low_res)
    
    def _render_region(self, scene: Dict, view_matrix: np.ndarray,
                       center: Tuple[float, float], radius: float, 
                       quality: float) -> np.ndarray:
        """渲染区域"""
        width = int(self.config.resolution[0] * quality)
        height = int(self.config.resolution[1] * quality)
        
        return np.zeros((height, width, 3), dtype=np.uint8)
    
    def _blend_regions(self, high_res: np.ndarray, 
                       low_res: np.ndarray) -> np.ndarray:
        """混合区域"""
        target_size = self.config.resolution
        result = np.zeros((target_size[1], target_size[0], 3), dtype=np.uint8)
        
        return result

class AsynchronousTimeWarp:
    """异步时间扭曲"""
    
    def __init__(self):
        self.last_frame: Optional[np.ndarray] = None
        self.last_pose: Optional[np.ndarray] = None
        self.current_pose: Optional[np.ndarray] = None
    
    def submit_frame(self, frame: np.ndarray, pose: np.ndarray):
        """提交帧"""
        self.last_frame = frame
        self.last_pose = pose.copy()
    
    def update_pose(self, pose: np.ndarray):
        """更新姿态"""
        self.current_pose = pose.copy()
    
    def warp(self) -> np.ndarray:
        """时间扭曲"""
        if self.last_frame is None or self.last_pose is None:
            return np.zeros((100, 100, 3), dtype=np.uint8)
        
        if self.current_pose is None:
            return self.last_frame.copy()
        
        delta_rotation = self.current_pose[:3, :3] @ self.last_pose[:3, :3].T
        
        warped = self._apply_warp(self.last_frame, delta_rotation)
        
        return warped
    
    def _apply_warp(self, frame: np.ndarray, delta_rotation: np.ndarray) -> np.ndarray:
        """应用扭曲"""
        return frame.copy()

class LatencyCompensator:
    """延迟补偿器"""
    
    def __init__(self, target_latency_ms: float = 20.0):
        self.target_latency = target_latency_ms / 1000.0
        self.pose_history: List[Tuple[float, np.ndarray]] = []
    
    def record_pose(self, timestamp: float, pose: np.ndarray):
        """记录姿态"""
        self.pose_history.append((timestamp, pose.copy()))
        
        while len(self.pose_history) > 100:
            self.pose_history.pop(0)
    
    def predict_pose(self, current_time: float) -> np.ndarray:
        """预测姿态"""
        target_time = current_time + self.target_latency
        
        if len(self.pose_history) < 2:
            return np.eye(4)
        
        t0, p0 = self.pose_history[-2]
        t1, p1 = self.pose_history[-1]
        
        dt = t1 - t0
        if dt < 1e-6:
            return p1
        
        velocity = (p1[:3, 3] - p0[:3, 3]) / dt
        
        predicted_position = p1[:3, 3] + velocity * (target_time - t1)
        
        predicted = p1.copy()
        predicted[:3, 3] = predicted_position
        
        return predicted

config = RenderConfig(target_fps=90, resolution=(100, 100))
stereo = SinglePassStereo(config)

scene = {'objects': []}
left_view, right_view = stereo.render(scene, np.eye(4), np.eye(4))
print(f"Stereo render: left={left_view.shape}, right={right_view.shape}")

foveated = FoveatedRenderer(config)
foveated.set_gaze_point(0.5, 0.5)
result = foveated.render(scene, np.eye(4))
print(f"Foveated render: {result.shape}")

atw = AsynchronousTimeWarp()
atw.submit_frame(np.zeros((100, 100, 3), dtype=np.uint8), np.eye(4))
atw.update_pose(np.eye(4))
warped = atw.warp()
print(f"Time warped frame: {warped.shape}")

compensator = LatencyCompensator(target_latency_ms=20.0)
compensator.record_pose(0.0, np.eye(4))
compensator.record_pose(0.01, np.eye(4))
predicted = compensator.predict_pose(0.02)
print(f"Predicted pose position: {predicted[:3, 3]}")
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| Unity XR | Unity XR 开发 |
| Unreal XR | Unreal XR 开发 |
| ARCore | Google AR 平台 |
| ARKit | Apple AR 平台 |
| OpenXR | 开放 XR 标准 |
| WebXR | Web XR API |
| Oculus SDK | Oculus 开发套件 |
| SteamVR | SteamVR 开发 |
| Inside-Out Tracking | 内向外追踪 |
| Outside-In Tracking | 外向内追踪 |
| Passthrough | 透视模式 |
| Hand Tracking | 手部追踪 |
| Eye Tracking | 眼动追踪 |
| Haptic Feedback | 触觉反馈 |
| Room Setup | 房间设置 |

---

## [实战] 核心实战清单

### 实战任务 1：简易 AR 应用

构建一个简易 AR 应用。要求：
1. 实现基本的平面检测
2. 放置虚拟物体到检测的平面
3. 支持手势交互（点击、拖动）
4. 实现简单的光照效果
5. 优化渲染性能
