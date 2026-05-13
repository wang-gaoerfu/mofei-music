# 🎵 Mofei Music - 音乐创作小程序

人人都可以创作音乐的小程序，支持在线播放和下载。

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      微信小程序前端                           │
│          (原生开发 + Vant Weapp UI 组件)                     │
└─────────────────────────────────────────────────────────────┘
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI 后端服务                           │
│         (Python 3.11 + SQLite + JWT 认证)                     │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │  用户系统   │  │  音乐生成   │  │   支付模块  │           │
│  │  (注册/登录)│  │  (异步队列) │  │   (微信支付) │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   MiniMax API   │  │   本地存储      │  │    SQLite       │
│   (音乐生成)     │  │  (storage/)    │  │   (数据库)       │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## 📁 项目结构

```
music-creator/
├── backend/                      # FastAPI 后端
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py        # 配置管理
│   │   │   ├── database.py     # 数据库连接
│   │   │   └── auth.py         # JWT 认证中间件
│   │   ├── models/
│   │   │   └── database.py     # SQLModel 数据模型
│   │   ├── routers/
│   │   │   ├── user.py         # 用户路由
│   │   │   ├── music.py        # 音乐路由
│   │   │   └── examples.py    # 示例数据路由
│   │   ├── services/
│   │   │   └── music_service.py # 音乐生成服务（异步队列）
│   │   └── main.py             # FastAPI 入口
│   ├── music_studio/            # MiniMax API 客户端（复用）
│   │   └── providers/
│   │       └── minimax.py
│   ├── storage/                 # 音频文件存储
│   │   └── musics/
│   ├── requirements.txt
│   └── run.py                  # 启动入口
│
├── frontend/                    # 微信小程序前端
│   ├── miniprogram/
│   │   ├── app.js              # 应用入口
│   │   ├── app.json            # 应用配置
│   │   ├── app.wxss            # 全局样式
│   │   ├── pages/
│   │   │   ├── index/          # 首页（示例展示）
│   │   │   ├── create/         # 创作页
│   │   │   ├── library/        # 曲库页
│   │   │   └── user/           # 用户中心
│   │   ├── components/
│   │   │   ├── music-player/   # 播放器组件
│   │   │   ├── example-card/   # 示例卡片组件
│   │   │   └── tag-selector/   # 标签选择器组件
│   │   ├── utils/
│   │   │   ├── api.js          # API 封装
│   │   │   ├── auth.js         # 认证工具
│   │   │   └── util.js         # 工具函数
│   │   └── services/
│   │       └── music.js        # 音乐服务层
│   └── project.config.json     # 微信开发者工具配置
│
└── README.md                    # 项目文档
```

## 🚀 本地开发

### 前置条件

- Python 3.11+
- Node.js 18+（用于微信小程序开发）
- 微信开发者工具
- MiniMax API Key（用于音乐生成）

### 1. 克隆项目

```bash
git clone https://github.com/wang-gaoerfu/mofei-music.git
cd mofei-music
```

### 2. 后端启动

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置 API Key
# 编辑 app/core/config.py，设置 minimax_api_key
export MINIMAX_API_KEY="your-api-key-here"  # Linux/Mac
# 或在 config.py 中直接修改

# 启动服务
python run.py
# 或
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

服务启动后运行在 `http://localhost:8000`

API 文档：`http://localhost:8000/docs`

### 3. 前端启动（微信开发者工具）

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具
3. 点击「导入项目」
4. 选择 `frontend` 目录
5. AppID 填写你的小程序 AppID（如无，可选「测试号」）
6. 点击「确定」

### 4. 配置后端地址

在小程序中，修改 `miniprogram/utils/api.js`：

```javascript
const API_BASE = 'http://localhost:8000/api'  // 开发环境
// 或你的服务器地址
const API_BASE = 'https://your-server.com/api'  // 生产环境
```

**注意**：微信小程序请求需要后端支持 CORS，开发环境可在后端 `main.py` 中配置。

## 🖥️ 服务器部署

### Docker 部署（推荐）

```bash
# 构建镜像
cd music-creator
docker build -t mofei-music-backend -f backend/Dockerfile backend/

# 运行容器
docker run -d \
  --name mofei-music \
  -p 8000:8000 \
  -v $(pwd)/backend/storage:/app/storage \
  -e MINIMAX_API_KEY="your-api-key" \
  -e SECRET_KEY="your-secret-key" \
  mofei-music-backend
```

### Docker Compose 部署

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend/storage:/app/storage
    environment:
      - MINIMAX_API_KEY=${MINIMAX_API_KEY}
      - SECRET_KEY=${SECRET_KEY}
      - DATABASE_URL=sqlite:///./music_creator.db
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: unless-stopped
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        # 微信小程序前端静态文件
        root /var/www/mofei-music/frontend;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /music-files {
        # 音频文件下载（需要认证）
        alias /path/to/storage/musics;
    }
}
```

### 系统服务（systemd）

创建 `/etc/systemd/system/mofei-music.service`：

```ini
[Unit]
Description=Mofei Music Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/music-creator/backend
ExecStart=/path/to/music-creator/backend/venv/bin/python run.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable mofei-music
sudo systemctl start mofei-music
```

## 📱 微信小程序发布

### 1. 发布前准备

1. 在 [微信公众平台](https://mp.weixin.qq.com/) 注册小程序
2. 获取 AppID 和 AppSecret
3. 配置服务器域名（在小程序后台 → 开发管理 → 开发设置）
   - request 合法域名：`https://your-domain.com`
   - downloadFile 合法域名：`https://your-domain.com`

### 2. 版本开发

1. 在微信开发者工具中开发调试
2. 点击「上传」按钮上传代码
3. 在微信公众平台后台提交审核

### 3. 审核与发布

1. 登录微信公众平台
2. 进入「版本管理」
3. 提交审核（通常 1-7 个工作日）
4. 审核通过后发布

### 4. 小程序类目

建议选择「工具」类目，可能需要提供：
- 营业执照（企业小程序）
- 《网络文化经营许可证》（如涉及音乐内容）

## 💰 支付配置

### 微信支付接入

1. 申请微信支付商户号
2. 在微信商户平台获取：
   - Merchant ID (mch_id)
   - API Key
   - API Secret

3. 配置环境变量或 `config.py`：

```python
WECHAT_PAY_MCH_ID = "your-mch-id"
WECHAT_PAY_API_KEY = "your-api-key"
WECHAT_PAY_API_SECRET = "your-api-secret"
```

支付接口（`app/routers/payment.py`）已预留，只需配置即可使用。

### 充值套餐

| 套餐 | 次数 | 价格 | 赠送 |
|------|------|------|------|
| 体验套餐 | 10次 | 5元 | - |
| 标准套餐 | 22次 | 10元 | +2次 |
| 高级套餐 | 55次 | 25元 | +5次 |
| 专业套餐 | 120次 | 50元 | +10次 |

## ⚙️ 配置说明

### 后端配置（app/core/config.py）

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `minimax_api_key` | MiniMax API Key | "" |
| `minimax_base_url` | MiniMax API 地址 | https://api.minimaxi.com/anthropic |
| `music_model` | 音乐生成模型 | music-2.6 |
| `secret_key` | JWT 密钥 | (需修改) |
| `database_url` | 数据库连接 | sqlite:///./music_creator.db |
| `storage_dir` | 音频文件存储路径 | storage/musics/ |

### 前端配置（miniprogram/utils/api.js）

| 配置项 | 说明 |
|--------|------|
| `API_BASE` | 后端 API 地址 |

## 🔧 API 接口文档

### 用户接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/user/register | 注册/登录 |
| GET | /api/user/info | 获取用户信息 |
| PUT | /api/user/update | 更新用户信息 |

### 音乐接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/music/create | 创建音乐生成任务 |
| GET | /api/music/status/{task_id} | 查询生成状态 |
| GET | /api/music/{uuid} | 获取音乐详情 |
| GET | /api/music/list | 获取音乐列表 |
| GET | /api/music/download/{uuid} | 下载音频文件 |

### 示例接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/examples | 获取示例列表 |

### 支付接口（预留）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/payment/create | 创建充值订单 |
| POST | /api/payment/callback | 微信支付回调 |
| GET | /api/payment/status/{order_id} | 查询订单状态 |

## 🛠️ 开发指南

### 添加新页面

1. 在 `miniprogram/pages/` 下创建目录
2. 创建 4 个文件：`index.js`, `index.wxml`, `index.wxss`, `index.json`
3. 在 `app.json` 的 `pages` 中注册

### 添加新组件

1. 在 `miniprogram/components/` 下创建目录
2. 创建 4 个文件：`index.js`, `index.wxml`, `index.wxss`, `index.json`
3. 在页面 `.json` 文件中引入

### API 调用示例

```javascript
import { api } from '../../utils/api.js'

// 创建音乐
const res = await api.createMusic({
  prompt: '轻快的钢琴曲',
  lyrics: null,
  style_tags: ['欢快', '钢琴']
})

// 轮询状态
const status = await api.getMusicStatus(res.task_id)
```

## 📝 更新日志

### v1.0.0 (2026-05-13)
- ✅ 后端 FastAPI + SQLite 完成
- ✅ JWT 用户认证完成
- ✅ MiniMax 音乐生成 API 集成
- ✅ 微信小程序前端完成
- ✅ 示例数据系统完成
- ✅ 播放器组件完成
- ✅ 支付接口预留完成

## 📧 联系方式

- GitHub: https://github.com/wang-gaoerfu/mofei-music
- 问题反馈: Issues

## 📄 License

MIT License