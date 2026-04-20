# OpenCV 基础 三层深度学习教程

## [总览] 技术总览

OpenCV 是最流行的计算机视觉库，提供丰富的图像处理和计算机视觉算法。广泛应用于图像处理、视频分析、机器视觉等领域。

本教程采用三层漏斗学习法：**核心层**聚焦图像读写、基本操作、颜色转换三大基石；**重点层**深入图像滤波、边缘检测、特征检测；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 图像读写

#### [概念] 概念解释

OpenCV 使用 cv2.imread() 读取图像，cv2.imwrite() 保存图像。支持多种图像格式如 JPEG、PNG、BMP 等。

#### [代码] 代码示例

```python
import cv2
import numpy as np

# 读取图像
img = cv2.imread('image.jpg')  # BGR 格式
img_gray = cv2.imread('image.jpg', cv2.IMREAD_GRAYSCALE)
img_alpha = cv2.imread('image.png', cv2.IMREAD_UNCHANGED)  # 包含 alpha 通道

# 显示图像
cv2.imshow('Image', img)
cv2.waitKey(0)
cv2.destroyAllWindows()

# 保存图像
cv2.imwrite('output.jpg', img)
cv2.imwrite('output.png', img, [cv2.IMWRITE_PNG_COMPRESSION, 9])

# 获取图像属性
height, width, channels = img.shape
print(f"尺寸: {width}x{height}, 通道数: {channels}")
print(f"数据类型: {img.dtype}")
print(f"总像素: {img.size}")

# 从摄像头读取
cap = cv2.VideoCapture(0)
while True:
    ret, frame = cap.read()
    if not ret:
        break
    cv2.imshow('Camera', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
cap.release()
cv2.destroyAllWindows()

# 读取视频
cap = cv2.VideoCapture('video.mp4')
fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
```

### 2. 基本操作

#### [概念] 概念解释

图像基本操作包括裁剪、缩放、旋转、绘制图形等。这些是图像处理的基础操作。

#### [代码] 代码示例

```python
import cv2
import numpy as np

img = cv2.imread('image.jpg')

# 裁剪
cropped = img[100:300, 200:400]  # [y1:y2, x1:x2]

# 缩放
resized = cv2.resize(img, (800, 600))
resized = cv2.resize(img, None, fx=0.5, fy=0.5)  # 按比例

# 旋转
rows, cols = img.shape[:2]
M = cv2.getRotationMatrix2D((cols/2, rows/2), 45, 1)  # 中心, 角度, 缩放
rotated = cv2.warpAffine(img, M, (cols, rows))

# 翻转
flipped_h = cv2.flip(img, 1)  # 水平翻转
flipped_v = cv2.flip(img, 0)  # 垂直翻转
flipped_b = cv2.flip(img, -1)  # 双向翻转

# 绘制图形
# 直线
cv2.line(img, (0, 0), (100, 100), (0, 255, 0), 2)

# 矩形
cv2.rectangle(img, (50, 50), (200, 200), (255, 0, 0), 2)

# 圆形
cv2.circle(img, (150, 150), 50, (0, 0, 255), -1)  # -1 填充

# 文字
cv2.putText(img, 'Hello', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

# 像素操作
pixel = img[100, 100]  # BGR 值
img[100, 100] = [255, 255, 255]  # 设置像素

# ROI 操作
roi = img[100:200, 100:200]
img[200:300, 200:300] = roi  # 复制 ROI
```

### 3. 颜色转换

#### [概念] 概念解释

OpenCV 默认使用 BGR 格式，但图像处理常需要转换到其他颜色空间如 RGB、HSV、灰度等。

#### [代码] 代码示例

```python
import cv2
import numpy as np

img = cv2.imread('image.jpg')

# BGR to RGB
rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

# BGR to Gray
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# BGR to HSV
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

# BGR to LAB
lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)

# 颜色分割 (HSV)
lower_blue = np.array([100, 50, 50])
upper_blue = np.array([130, 255, 255])
mask = cv2.inRange(hsv, lower_blue, upper_blue)
result = cv2.bitwise_and(img, img, mask=mask)

# 颜色直方图
hist = cv2.calcHist([img], [0], None, [256], [0, 256])

# 直方图均衡化
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
equalized = cv2.equalizeHist(gray)

# 自适应直方图均衡化
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
clahe_result = clahe.apply(gray)
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 图像滤波

#### [代码] 代码示例

```python
import cv2
import numpy as np

img = cv2.imread('image.jpg')

# 均值滤波
blur = cv2.blur(img, (5, 5))

# 高斯滤波
gaussian = cv2.GaussianBlur(img, (5, 5), 0)

# 中值滤波
median = cv2.medianBlur(img, 5)

# 双边滤波
bilateral = cv2.bilateralFilter(img, 9, 75, 75)

# 自定义卷积核
kernel = np.ones((5, 5), np.float32) / 25
filtered = cv2.filter2D(img, -1, kernel)

# 锐化
sharpen_kernel = np.array([[-1, -1, -1],
                           [-1,  9, -1],
                           [-1, -1, -1]])
sharpened = cv2.filter2D(img, -1, sharpen_kernel)

# 边缘增强
edge_kernel = np.array([[-1, -1, -1],
                        [-1,  8, -1],
                        [-1, -1, -1]])
edges = cv2.filter2D(img, -1, edge_kernel)
```

### 2. 边缘检测

#### [代码] 代码示例

```python
import cv2
import numpy as np

img = cv2.imread('image.jpg')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Canny 边缘检测
edges = cv2.Canny(gray, 100, 200)

# Sobel 边缘检测
sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
sobel = cv2.magnitude(sobel_x, sobel_y)

# Laplacian 边缘检测
laplacian = cv2.Laplacian(gray, cv2.CV_64F)

# Scharr 边缘检测
scharr_x = cv2.Scharr(gray, cv2.CV_64F, 1, 0)
scharr_y = cv2.Scharr(gray, cv2.CV_64F, 0, 1)

# 自适应阈值
adaptive_thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
```

### 3. 特征检测

#### [代码] 代码示例

```python
import cv2
import numpy as np

img = cv2.imread('image.jpg')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Harris 角点检测
dst = cv2.cornerHarris(gray, 2, 3, 0.04)
dst = cv2.dilate(dst, None)
img[dst > 0.01 * dst.max()] = [0, 0, 255]

# SIFT 特征检测
sift = cv2.SIFT_create()
keypoints, descriptors = sift.detectAndCompute(gray, None)
img_sift = cv2.drawKeypoints(gray, keypoints, img)

# ORB 特征检测
orb = cv2.ORB_create()
keypoints, descriptors = orb.detectAndCompute(gray, None)
img_orb = cv2.drawKeypoints(gray, keypoints, img)

# 特征匹配
img1 = cv2.imread('image1.jpg', cv2.IMREAD_GRAYSCALE)
img2 = cv2.imread('image2.jpg', cv2.IMREAD_GRAYSCALE)

orb = cv2.ORB_create()
kp1, des1 = orb.detectAndCompute(img1, None)
kp2, des2 = orb.detectAndCompute(img2, None)

bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
matches = bf.match(des1, des2)
matches = sorted(matches, key=lambda x: x.distance)

result = cv2.drawMatches(img1, kp1, img2, kp2, matches[:10], None, flags=2)
```

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| Image Segmentation | 需要图像分割时 |
| Contour Detection | 需要轮廓检测时 |
| Face Detection | 需要人脸检测时 |
| Object Tracking | 需要目标跟踪时 |
| Optical Flow | 需要光流估计时 |
| Camera Calibration | 需要相机标定时 |
| Perspective Transform | 需要透视变换时 |
| Morphological Operations | 需要形态学操作时 |
| Thresholding | 需要阈值处理时 |
| Histogram Backprojection | 需要直方图反向投影时 |

---

## [实战] 核心实战清单

### 实战任务 1：构建实时人脸检测应用

```python
import cv2

def detect_faces():
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
    
    cap = cv2.VideoCapture(0)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
            roi_gray = gray[y:y+h, x:x+w]
            roi_color = frame[y:y+h, x:x+w]
            
            eyes = eye_cascade.detectMultiScale(roi_gray)
            for (ex, ey, ew, eh) in eyes:
                cv2.rectangle(roi_color, (ex, ey), (ex+ew, ey+eh), (0, 255, 0), 2)
        
        cv2.imshow('Face Detection', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    detect_faces()
```
