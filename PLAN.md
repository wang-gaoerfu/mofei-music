# 音乐创作小程序 - 开发计划

## 项目仓库
https://github.com/wang-gaoerfu/mofei-music.git

## 技术栈
- 前端：微信原生小程序 + Vant Weapp + TypeScript
- 后端：FastAPI + SQLite + Python 3.11
- 音乐 API：MiniMax (复用 music-studio providers)
- 存储：本地文件 + CDN（后期）

## 开发阶段

### Phase 1: 后端核心（FastAPI + SQLite）
- [x] 项目初始化
- [ ] 数据库模型（users, musics, recharges）
- [ ] 配置管理（config.py）
- [ ] MiniMax API 接入（复用 providers）
- [ ] 任务队列实现

### Phase 2: 用户系统
- [ ] 注册接口（微信 openid）
- [ ] 登录接口（JWT token）
- [ ] 用户信息查询
- [ ] 次数管理（free_count, balance）

### Phase 3: 音乐生成
- [ ] POST /api/music/create - 创建生成任务
- [ ] GET /api/music/status/{task_id} - 状态轮询
- [ ] GET /api/music/{uuid} - 获取音乐详情
- [ ] GET /api/music/list - 曲库列表
- [ ] GET /api/music/download/{uuid} - 下载音频
- [ ] 后台 worker 处理生成任务

### Phase 4: 微信小程序前端
- [ ] 项目初始化（微信开发者工具）
- [ ] Vant Weapp 引入
- [ ] 项目结构（pages/components）
- [ ] 工具函数封装
- [ ] API 封装

### Phase 5: 页面开发
- [ ] 首页（示例展示 + 创作入口）
- [ ] 创作页（表单 + 标签）
- [ ] 播放器组件
- [ ] 曲库页（列表 + 播放）
- [ ] 用户中心（次数 + 充值预留）

### Phase 6: 支付预留
- [ ] 充值套餐设计
- [ ] 微信支付接口预留
- [ ] 订单管理

## 目录结构
```
music-creator/
├── backend/                 # FastAPI 后端
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI 入口
│   │   ├── routers/         # 路由
│   │   ├── services/        # 业务逻辑
│   │   ├── models/          # 数据模型
│   │   └── core/            # 核心配置
│   ├── music_studio/        # 复用 music-studio
│   ├── storage/             # 文件存储
│   ├── requirements.txt
│   └── run.py
│
├── frontend/                # 微信小程序
│   ├── pages/
│   ├── components/
│   ├── styles/
│   ├── utils/
│   ├── app.js
│   ├── app.json
│   └── app.wxss
│
└── docs/                    # 文档
```

## API 设计

### 用户模块
- POST /api/user/register - 注册
- POST /api/user/login - 登录
- GET /api/user/info - 用户信息

### 音乐模块
- POST /api/music/create - 创建任务
- GET /api/music/status/{task_id} - 状态
- GET /api/music/{uuid} - 详情
- GET /api/music/list - 列表
- GET /api/music/download/{uuid} - 下载

### 示例模块
- GET /api/examples - 示例列表

### 支付模块（预留）
- POST /api/payment/create - 创建订单
- POST /api/payment/callback - 回调

## 数据库设计

### users
- id, openid, nickname, free_count, balance, created_at, updated_at

### musics
- id, uuid, user_id, title, prompt, lyrics, style_tags
- status (generating/completed/failed)
- audio_url, local_path, model
- created_at, completed_at, error

### recharges
- id, user_id, amount, price, status, transaction_id, created_at

## 示例数据
预设 8 个音乐示例（主歌/副歌/情绪/风格分类）