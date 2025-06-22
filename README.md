# 🔒 Reading and Watch-List Dashboard Web App

## 📋 Project Overview

**A comprehensive full-stack content summarization platform that revolutionizes how users consume and share digital content while maintaining absolute privacy.** Unlike existing online summarization tools that send your content to external servers, this system processes everything locally on your machine, ensuring your data never leaves your control.

## 🎬 Demo Video

[![Demo Video](https://img.shields.io/badge/▶️_Watch_Demo-Full_System_Walkthrough-red?style=for-the-badge&logo=googledrive)](https://drive.google.com/file/d/1g-qXzHKY2ZUzDyfm8hHJFCjRYo3Ye7n_/view?usp=sharing)


### 🎯 What Makes This Different from Existing Tools?

| Feature | This Project | Existing Online Tools | 
|---------|-------------|---------------------|
| **Privacy** | ✅ 100% Local Processing | ❌ Data sent to external servers |
| **Data Storage** | ✅ Only summaries stored | ❌ Full content often cached |
| **AI Model** | ✅ Local TinyLLaMA (offline) | ❌ Require internet/API keys |
| **Social Features** | ✅ Privacy-conscious sharing | ❌ Usually individual-focused |
| **Chrome Integration** | ✅ Seamless one-click extraction | ❌ Copy-paste required |
| **Cost** | ✅ Completely free | ❌ Often subscription-based |
| **Customization** | ✅ Full control over AI model | ❌ Fixed algorithms |

**Key Differentiators:**
- **Zero-Trust Architecture**: Raw content never transmitted over network
- **Local AI Processing**: 637MB TinyLLaMA model runs entirely on your machine  
- **Social Privacy**: Share summaries, not original content
- **Universal Extraction**: Works with any website, YouTube videos, and articles
- **Real-time Collaboration**: Follow users and get notified of new summaries

![Privacy-First Architecture](https://img.shields.io/badge/Privacy-First-green?style=for-the-badge) ![Local AI](https://img.shields.io/badge/AI-Local%20Processing-blue?style=for-the-badge) ![Full Stack](https://img.shields.io/badge/Stack-Full%20Stack-orange?style=for-the-badge) ![Zero Trust](https://img.shields.io/badge/Zero-Trust-red?style=for-the-badge)

## 🌟 Core Features & Technical Capabilities

### 🛡️ **Advanced Privacy & Security Features**
- **🔐 Zero-Knowledge Architecture**: Raw content never transmitted over network
- **🤖 Local AI Processing**: 1.1B parameter TinyLLaMA model runs entirely offline
- **📦 Minimal Data Storage**: Only AI-generated summaries stored on server
- **🛡️ Content Isolation**: Original content remains completely private on user's machine
- **🔒 Secure Authentication**: JWT-based user management with bcrypt password hashing
- **🌐 CORS Protection**: Configured security headers and middleware

### 🎯 **Intelligent Content Management**
- **🌍 Universal Content Extraction**: 
  - Websites and web articles (HTML parsing with content cleaning)
  - YouTube videos (transcript extraction and processing)
  - PDF documents and text files
  - Social media posts and blog articles
- **🎨 Chrome Extension Integration**: 
  - One-click content extraction from any webpage
  - Background processing with progress indicators
  - Automatic content type detection and optimization
- **🧠 Smart AI Summarization**: 
  - Context-aware summaries with configurable length (50-500 words)
  - Preserves key information and main themes
  - Handles multiple languages and content types
  - Fallback mechanisms for offline scenarios

### 👥 **Social & Collaboration Features**
- **🤝 Privacy-Conscious Social Network**: 
  - Follow system with pending request management
  - User discovery and search functionality
  - Profile management with post statistics
- **🔔 Real-Time Notification System**: 
  - Follow request notifications
  - New content alerts from followed users
  - WebSocket-based real-time updates
- **📊 Privacy-Focused Analytics**: 
  - Show post counts only (no follower counts)
  - Content engagement metrics
  - User activity tracking (local only)

### 🚀 **Technical Excellence & Performance**
- **⚡ High-Performance Architecture**:
  - React frontend with modern hooks and context management
  - Express.js backend with MongoDB optimization
  - FastAPI-based AI service for maximum efficiency
- **📱 Responsive Design**: Mobile-first approach with Progressive Web App capabilities
- **🔧 Developer-Friendly**: Comprehensive API documentation and extensible architecture
- **📈 Scalable Infrastructure**: Modular design supporting horizontal scaling

## 🏗️ System Architecture & Data Flow

```mermaid
graph TB
    subgraph "Local Machine (User's Computer)"
        CE[Chrome Extension] --> LE[Local Extractor]
        LE --> AI[TinyLLaMA AI Model<br/>637MB Local Processing]
        AI --> CS[Client Storage]
    end
    
    subgraph "Web Application"
        RF[React Frontend<br/>Port 3000] --> API[Express API<br/>Port 3001]
        API --> DB[(MongoDB<br/>Summaries Only)]
    end
    
    subgraph "Privacy Boundary"
        CE -.->|"Only Summaries<br/>(No Raw Content)"| RF
        AI -.->|"Processed Summary"| RF
    end
    
    CS -->|"Local AI Service<br/>Port 8000"| AI
    RF <--> API
    
    style AI fill:#e1f5fe
    style DB fill:#f3e5f5
    style CE fill:#e8f5e8
```

### 🔄 **Data Processing Pipeline**

1. **Content Extraction** (Chrome Extension)
   - User visits webpage/YouTube video
   - Extension extracts content using universal selectors
   - Content processed locally - never transmitted

2. **Local AI Processing** (Python Service)
   - TinyLLaMA model analyzes content structure
   - Generates contextual summary (100-200 words)
   - All processing happens offline

3. **Privacy-Safe Storage** (Web Application)
   - Only AI-generated summary transmitted to server
   - Original content never leaves user's machine
   - MongoDB stores summaries with metadata

4. **Social Sharing** (React Frontend)
   - Users share summaries, not original content
   - Follow system with real-time notifications
   - Privacy-conscious user interactions

## 🚀 Complete Setup & Installation Guide

### 📋 Prerequisites & System Requirements

Before starting, ensure your system meets these requirements:

| Component | Minimum | Recommended | Purpose |
|-----------|---------|-------------|---------|
| **Node.js** | v16.0.0 | v18.0.0+ | Backend & Frontend |
| **Python** | 3.8 | 3.9+ | AI Service |
| **RAM** | 8GB | 16GB+ | AI Model Loading |
| **Storage** | 2GB free | 5GB+ free | Models & Dependencies |
| **MongoDB** | 4.4+ | 5.0+ | Data Storage |
| **Chrome** | v90+ | Latest | Extension Support |

**Operating System Support:**
- ✅ macOS (Intel & Apple Silicon)
- ✅ Linux (Ubuntu 18.04+, CentOS 7+)
- ✅ Windows 10/11 (with WSL2 recommended)

### 🎯 Important Note About Repository Structure

**This repository uses `.gitignore` to exclude large files for optimal git performance:**

```gitignore
# Large AI Models (excluded from git)
local-summarizer/models/*.gguf
local-summarizer/models/*.bin
local-summarizer/models/*.safetensors

# Node dependencies
node_modules/
website/node_modules/
website/frontend/node_modules/

# Environment files
.env
.env.local
```

**Why these files are excluded:**
- **AI Models**: The TinyLLaMA model (637MB) is too large for git repositories
- **Node Modules**: Can be regenerated with `npm install`
- **Environment Files**: Contain sensitive configuration data

**What you need to download separately:**
1. AI model file (instructions in step 4 below)
2. Dependencies via package managers

### 1️⃣ Clone Repository & Initial Setup

```bash
# Clone the repository
git clone https://github.com/marupaka-koushik/Website-where-Users-can-share-their-Reading-and-Watch-Lists-with-Extension-Support.git

# Navigate to project directory
cd Website-where-Users-can-share-their-Reading-and-Watch-Lists-with-Extension-Support

# Create directory structure (if not exists)
mkdir -p website/frontend
mkdir -p local-summarizer/models
mkdir -p extension/icons
```

### 2️⃣ Environment Configuration

Create environment files with your specific configuration:

#### Backend Environment (`website/.env`)
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/content-summarizer
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/content-summarizer

# Server Configuration  
PORT=3001
NODE_ENV=development

# JWT Configuration (CHANGE IN PRODUCTION)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# API Configuration
API_URL=http://localhost:3001/api
FRONTEND_URL=http://localhost:3000

# Local AI Configuration
LOCAL_SUMMARIZER_URL=http://localhost:8000

# Security Configuration
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Environment (`website/frontend/.env`)
```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# Development Configuration
PORT=3000
BROWSER=none
GENERATE_SOURCEMAP=true

# Build Configuration
BUILD_PATH=build
INLINE_RUNTIME_CHUNK=false
```

#### AI Service Configuration (Optional: `local-summarizer/.env`)
```env
# Model Configuration
MODEL_PATH=./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf
MAX_TOKENS=512
TEMPERATURE=0.7

# Service Configuration
HOST=0.0.0.0
PORT=8000
WORKERS=1

# Performance Tuning
N_CTX=2048
N_THREADS=4
```

### 3️⃣ Install Dependencies

Install all required dependencies for each service:

#### Backend Dependencies
```bash
cd website
npm install

# Expected packages installed:
# - express (^4.18.0) - Web framework
# - mongoose (^6.6.0) - MongoDB ODM
# - jsonwebtoken (^8.5.1) - JWT authentication
# - bcryptjs (^2.4.3) - Password hashing
# - cors (^2.8.5) - Cross-origin requests
# - dotenv (^16.0.0) - Environment variables
# - express-rate-limit (^6.6.0) - Rate limiting
# - helmet (^6.0.0) - Security headers
```

#### Frontend Dependencies  
```bash
cd website/frontend
npm install

# Expected packages installed:
# - react (^18.2.0) - UI library
# - react-dom (^18.2.0) - React DOM
# - react-router-dom (^6.4.0) - Routing
# - axios (^0.27.0) - HTTP client
# - @emotion/react (^11.10.0) - CSS-in-JS
# - @emotion/styled (^11.10.0) - Styled components
```

#### Python AI Service Dependencies
```bash
cd local-summarizer

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Expected packages installed:
# - llama-cpp-python (^0.2.11) - LLaMA C++ bindings
# - fastapi (^0.104.0) - Web API framework
# - uvicorn (^0.24.0) - ASGI server
# - pydantic (^2.4.0) - Data validation
# - python-multipart (^0.0.6) - Form data
```

### 4️⃣ Download AI Model (Critical Step)

**⚠️ Important: This step is required as the AI model is excluded from git repository**

```bash
cd local-summarizer/models

# Option 1: Direct download (recommended)
wget https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf

# Option 2: Using curl (if wget not available)
curl -L -o tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf \
  "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"

# Option 3: Manual download
# Visit: https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF
# Download: tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf (637MB)
# Place in: local-summarizer/models/

# Verify download
ls -la tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf
# Should show: ~637MB file
```

**Model Specifications:**
- **Size**: 637MB (Q4_K_M quantization)
- **Parameters**: 1.1 billion
- **Format**: GGUF (GPT-Generated Unified Format)
- **Quantization**: 4-bit for optimal performance/quality balance

### 5️⃣ Database Setup

#### Option A: Local MongoDB Setup

**macOS (using Homebrew):**
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB service
brew services start mongodb-community@7.0

# Verify installation
mongosh --eval "db.adminCommand('listCollections')"
```

**Ubuntu/Debian:**
```bash
# Install MongoDB
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Option B: MongoDB Atlas (Cloud)

1. **Create Atlas Account**: Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create Cluster**: Follow setup wizard (free tier available)
3. **Get Connection String**: 
   ```
   mongodb+srv://username:password@cluster.mongodb.net/content-summarizer
   ```
4. **Update Environment**: Replace `MONGODB_URI` in `website/.env`

### 6️⃣ Chrome Extension Setup

1. **Open Chrome Extensions Page**:
   ```
   chrome://extensions/
   ```

2. **Enable Developer Mode**: Toggle switch in top-right corner

3. **Load Extension**:
   - Click "Load unpacked"
   - Navigate to project directory
   - Select the `extension` folder
   - Click "Select Folder"

4. **Pin Extension**: Click puzzle icon → pin Content Summarizer

5. **Verify Permissions**: Extension should request:
   - `activeTab` - Access current tab
   - `storage` - Local storage
   - `scripting` - Content script injection

### 7️⃣ Start All Services (Testing & Development)

**⚠️ Important: Start services in this specific order for proper functionality**

**🔧 Before Starting - Clear Any Port Conflicts:**
```bash
# Run this first to ensure clean startup (optional but recommended)
kill -9 $(lsof -ti:3000) 2>/dev/null || true  # Frontend
kill -9 $(lsof -ti:3001) 2>/dev/null || true  # Backend  
kill -9 $(lsof -ti:8000) 2>/dev/null || true  # AI service
```

#### Terminal 1: Database Service
```bash
# Option A: Local MongoDB
mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --fork

# Option B: MongoDB Atlas (no local service needed)
# Just ensure connection string is correct in .env file
```

#### Terminal 2: AI Service (Start First)
```bash
cd local-summarizer

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start AI service
python3 summarizer.py

# Expected output:
# INFO:     Started server process [xxxxx]
# INFO:     Waiting for application startup.
# INFO:     Loading model: ./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf
# INFO:     Model loaded successfully
# INFO:     Application startup complete.
# INFO:     Uvicorn running on http://0.0.0.0:8000
```

#### Terminal 3: Backend API
```bash
cd website

# Start backend server
npm start
# or for development with auto-reload:
npm run dev

# Expected output:
# Server running on port 3001
# Connected to MongoDB: content-summarizer
# API endpoints available at http://localhost:3001/api
```

#### Terminal 4: Frontend Application
```bash
cd website/frontend

# Start React development server
npm start

# Expected output:
# webpack compiled successfully
# Local:            http://localhost:3000
# On Your Network:  http://192.168.x.x:3000
```

### 8️⃣ Verification & Testing Steps

#### Step 1: Verify Individual Services

```bash
# Test AI Service Health
curl http://localhost:8000/health
# Expected: {"status": "healthy", "model_loaded": true}

# Test Backend API Health
curl http://localhost:3001/api/health
# Expected: {"status": "healthy", "database": "connected"}

# Test Frontend Access
curl http://localhost:3000
# Expected: HTML response with React app
```

#### Step 2: Test AI Summarization
```bash
# Test local AI summarization
curl -X POST http://localhost:8000/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a test article about artificial intelligence and machine learning. AI has revolutionized many industries including healthcare, finance, and technology. Machine learning algorithms can process vast amounts of data to identify patterns and make predictions.",
    "max_length": 50
  }'

# Expected response:
# {
#   "summary": "Brief summary of the content...",
#   "word_count": 25,
#   "original_length": 35,
#   "processing_time": 2.3
# }
```

#### Step 3: Test Complete Workflow

1. **Access Web Application**: Open http://localhost:3000
2. **Register Account**: Create new user account
3. **Install Extension**: Load Chrome extension
4. **Extract Content**: Visit any webpage, click extension icon
5. **Generate Summary**: Verify AI processing works
6. **Save Content**: Confirm summary saves to web app
7. **Test Social Features**: Follow users, check notifications

## 📁 Detailed Project Structure

```
Website-where-Users-can-share-their-Reading-and-Watch-Lists-with-Extension-Support/
├── 📄 .gitignore                    # Git ignore rules (includes model files)
├── 📄 README.md                     # Complete documentation (this file)
│
├── 📁 extension/                    # Chrome Extension (Client-side)
│   ├── 📄 manifest.json            # Extension configuration & permissions
│   ├── 📄 popup.html               # Extension popup UI
│   ├── 📄 popup.js                 # Extension main logic & API calls
│   ├── 📄 background.js            # Service worker & background tasks
│   ├── 📄 universal-extractor.js   # Content extraction algorithms
│   ├── 📄 youtube-extractor.js     # YouTube-specific transcript extraction
│   └── 📁 icons/                   # Extension icons (16px, 48px, 128px)
│       ├── 📄 icon16.svg
│       ├── 📄 icon48.svg
│       └── 📄 icon128.svg
│
├── 📁 website/                      # Backend API Server
│   ├── 📄 server.js                # Express.js main server file
│   ├── 📄 package.json             # Node.js dependencies & scripts
│   ├── 📄 nodemon.json             # Development auto-reload config
│   ├── 📄 .env                     # Environment variables (not in git)
│   │
│   ├── 📁 models/                  # MongoDB Schemas
│   │   ├── 📄 User.js              # User authentication & profile
│   │   ├── 📄 Content.js           # Summarized content storage
│   │   └── 📄 Notification.js      # User notifications
│   │
│   ├── 📁 routes/                  # API Route Handlers
│   │   ├── 📄 auth.js              # Authentication (login/register)
│   │   ├── 📄 users.js             # User management & social features
│   │   ├── 📄 content.js           # Content CRUD operations
│   │   └── 📄 summary.js           # Summary generation coordination
│   │
│   └── 📁 frontend/                # React.js Frontend
│       ├── 📄 package.json         # React dependencies
│       ├── 📄 .env                 # Frontend environment variables
│       │
│       ├── 📁 public/              # Static Assets
│       │   ├── 📄 index.html       # Main HTML template
│       │   ├── 📄 favicon.ico      # Browser favicon
│       │   ├── 📄 manifest.json    # PWA manifest
│       │   └── 📄 robots.txt       # SEO robots file
│       │
│       └── 📁 src/                 # React Source Code
│           ├── 📄 index.js         # React app entry point
│           ├── 📄 App.js           # Main app component
│           ├── 📄 App.css          # Global styles
│           ├── 📄 index.css        # Base CSS styles
│           │
│           ├── 📁 components/      # Reusable React Components
│           │   ├── 📄 Navigation.js        # App navigation bar
│           │   ├── 📄 Navigation.css       # Navigation styles
│           │   ├── 📄 ProtectedRoute.js    # Auth-protected routes
│           │   └── 📄 PublicRoute.js       # Public routes
│           │
│           ├── 📁 contexts/        # React Context Providers
│           │   └── 📄 AuthContext.js       # Authentication state
│           │
│           ├── 📁 hooks/           # Custom React Hooks
│           │   └── 📄 useUserRoutes.js     # User routing logic
│           │
│           └── 📁 pages/           # Main Application Pages
│               ├── 📄 HomePage.js          # Landing page
│               ├── 📄 HomePage.css         # Home page styles
│               ├── 📄 LoginPage.js         # User login
│               ├── 📄 RegisterPage.js      # User registration
│               ├── 📄 AuthPages.css        # Auth pages styles
│               ├── 📄 DashboardPage.js     # User dashboard
│               ├── 📄 DashboardPage.css    # Dashboard styles
│               ├── 📄 ExplorePage.js       # Content discovery
│               ├── 📄 SearchPage.js        # User/content search
│               ├── 📄 SearchPage.css       # Search page styles
│               ├── 📄 UserProfilePage.js   # User profiles
│               ├── 📄 NotificationsPage.js # User notifications
│               ├── 📄 NotificationsPage.css# Notifications styles
│               ├── 📄 FollowRequestsPage.js# Follow request management
│               └── 📄 FollowRequestsPage.css# Follow requests styles
│
└── 📁 local-summarizer/            # AI Processing Service
    ├── 📄 summarizer.py            # FastAPI AI service main file
    ├── 📄 requirements.txt         # Python dependencies
    ├── 📄 .env                     # AI service environment (optional)
    └── 📁 models/                  # AI Models Directory
        └── 📄 tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf  # (Download separately - 637MB)
```

### 🔒 Files Excluded from Git Repository (.gitignore)

```gitignore
# Large AI Models (Must download separately)
local-summarizer/models/*.gguf          # 637MB TinyLLaMA model
local-summarizer/models/*.bin           # Alternative model formats
local-summarizer/models/*.safetensors   # Hugging Face format

# Node.js Dependencies (Regenerated with npm install)
node_modules/                           # Backend dependencies
website/node_modules/                   # Backend node_modules
website/frontend/node_modules/          # Frontend dependencies

# Environment Configuration (Contains sensitive data)
.env                                    # Root environment
website/.env                            # Backend environment
website/frontend/.env                   # Frontend environment
local-summarizer/.env                   # AI service environment

# Development & Build Artifacts
website/frontend/build/                 # React build output
*.log                                   # Log files
.DS_Store                              # macOS system files

# Python Virtual Environment & Cache
local-summarizer/venv/                  # Python virtual environment
__pycache__/                           # Python cache files
*.pyc, *.pyo, *.pyd                    # Python compiled files

# IDE & Editor Files
.vscode/                               # VS Code settings
.idea/                                 # IntelliJ IDEA
*.swp, *.swo                          # Vim swap files
```

**Why These Files Are Excluded:**
- **Security**: Environment files contain database URLs, API keys, JWT secrets
- **Size Management**: AI model is 637MB (exceeds GitHub's 100MB limit)
- **Reproducibility**: Dependencies can be reinstalled from package.json/requirements.txt
- **Platform Independence**: Avoid platform-specific cache and build files

## 📱 Complete Usage Workflow

### 🎯 End-to-End User Journey

1. **🌐 Content Discovery**: User visits any webpage, article, or YouTube video
2. **🔌 Extension Activation**: Click Chrome extension icon in toolbar
3. **📄 Content Extraction**: Extension automatically detects and extracts content
4. **🤖 Local AI Processing**: Content sent to local TinyLLaMA model (never external)
5. **📝 Summary Generation**: AI creates intelligent 100-200 word summary
6. **💾 Privacy-Safe Storage**: Only summary (not original content) transmitted to server
7. **🤝 Social Sharing**: Share summaries with followers through web application
8. **🔔 Real-time Notifications**: Get notified when followers share new content

### 🔍 Detailed Feature Walkthrough

#### **Chrome Extension Features**
- **Universal Content Detection**: Automatically identifies article content, videos, PDFs
- **Smart Extraction**: Removes ads, navigation, and focuses on main content
- **YouTube Integration**: Extracts video transcripts for summarization
- **One-Click Operation**: Single button press for complete workflow
- **Progress Indicators**: Real-time feedback during processing
- **Offline Capability**: Works without internet after initial setup

#### **Web Application Features**
- **User Dashboard**: Personal content library with search and filtering
- **Social Discovery**: Find and follow other users based on interests
- **Notification Center**: Real-time updates on social interactions
- **Content Management**: Edit, delete, organize summaries
- **Privacy Controls**: Granular privacy settings for content sharing
- **Export Options**: Download summaries in various formats

## 🔧 Advanced Configuration & Assumptions

### 🎯 Key Assumptions & Design Decisions

#### **Privacy-First Architecture Assumptions**
- **Local Processing**: Users have sufficient RAM (8GB+) for AI model
- **Network Security**: Local services (ports 8000, 3001, 3000) are not exposed externally
- **Data Sovereignty**: Users prefer privacy over cloud-based processing speed
- **Storage Trade-off**: Users accept 637MB model download for offline capabilities

#### **Technical Architecture Assumptions**
- **Single Machine Deployment**: All services run on same machine for development
- **Chrome Browser**: Primary target browser (95%+ compatibility)
- **Modern Hardware**: CPU supports AVX instructions for optimal AI performance
- **Development Environment**: Users comfortable with terminal/command line

#### **Content Processing Assumptions**
- **Language**: Primary focus on English content (model supports multiple languages)
- **Content Size**: Optimal for articles 500-10,000 words
- **Format Support**: HTML, plain text, YouTube transcripts prioritized
- **Internet Connection**: Required for initial setup and social features (not for AI processing)

### 🚀 Additional Features & Competitive Advantages

#### **Planned Advanced Features** (Implementation Ready)
```typescript
// 1. Multi-Model Support
interface AIModelConfig {
  modelPath: string;
  quantization: 'Q4_K_M' | 'Q8_0' | 'F16';
  contextLength: number;
  temperature: number;
}

// 2. Custom Prompt Templates
interface SummaryTemplate {
  type: 'academic' | 'business' | 'news' | 'technical';
  promptTemplate: string;
  maxLength: number;
  keywordExtraction: boolean;
}

// 3. Batch Processing
interface BatchSummaryRequest {
  urls: string[];
  template: SummaryTemplate;
  priority: 'high' | 'normal' | 'low';
}
```

#### **Performance Optimizations**
- **Model Caching**: Keep model in memory between requests
- **Request Queuing**: Handle multiple summarization requests efficiently
- **Progressive Loading**: Stream summaries as they're generated
- **Background Processing**: Non-blocking UI during AI processing

#### **Security Enhancements**
- **Content Sandboxing**: Isolate content processing in separate process
- **Zero-Log Policy**: No content logging even for debugging
- **Encrypted Storage**: Optional local content encryption
- **VPN Detection**: Warn users if VPN might affect local processing

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Content Management  
- `GET /api/content` - Get user's content
- `POST /api/content` - Create new content
- `DELETE /api/content/:id` - Delete content

### User Management
- `GET /api/users/me` - Get current user profile
- `GET /api/users/search?q=query` - Search users
- `POST /api/users/:username/follow` - Send follow request
- `DELETE /api/users/:username/unfollow` - Unfollow user

### Notifications
- `GET /api/users/me/notifications` - Get notifications

### Summary Generation
- `POST /api/summary/generate` - Generate AI summary for content

## 🧪 Testing

### Verify Services
```bash
# Check backend health
curl http://localhost:3001/health

# Check AI service  
curl http://localhost:8000/health

# Check frontend
curl http://localhost:3000
```

## 🚨 Troubleshooting

### Common Issues

#### **Services Won't Start**

**If terminals ask to change ports or you get "port already in use" errors:**

```bash
# Quick port cleanup (recommended method)
kill -9 $(lsof -ti:3000) 2>/dev/null || true  # Frontend
kill -9 $(lsof -ti:3001) 2>/dev/null || true  # Backend  
kill -9 $(lsof -ti:8000) 2>/dev/null || true  # AI service

# Alternative: Kill by process name (if above doesn't work)
pkill -f "node.*server.js"      # Backend processes
pkill -f "react-scripts start"  # Frontend processes  
pkill -f "python.*summarizer.py" # AI service processes

# Check if ports are free after cleanup
lsof -i :3000  # Should show nothing if port is free
lsof -i :3001  # Should show nothing if port is free
lsof -i :8000  # Should show nothing if port is free

# If you see "Would you like to run the app on another port instead? (Y/n)"
# You can either:
# 1. Type 'n' and run the cleanup commands above, then restart
# 2. Type 'y' to use a different port (update .env files accordingly)
```

**Port Change Scenarios:**
- **Frontend (React)**: If moved from 3000 → 3001, update `FRONTEND_URL` in `website/.env`
- **Backend (Express)**: If moved from 3001 → 3002, update `REACT_APP_API_URL` in `website/frontend/.env` and `extension/popup.js`
- **AI Service**: If moved from 8000 → 8001, update `LOCAL_SUMMARIZER_URL` in `website/.env` and `local-summarizer/summarizer.py`

#### **MongoDB Connection Issues**
```bash
# Check MongoDB status
brew services list | grep mongodb  # macOS
sudo systemctl status mongod       # Linux

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

#### **Extension Issues**
1. Check developer console in extension popup
2. Verify API URL in `extension/popup.js`
3. Ensure backend is running on correct port
4. Check Chrome extension permissions

#### **AI Model Issues**  
```bash
# Verify model file exists
ls -la local-summarizer/models/

# Check Python dependencies
pip list | grep -E "(llama-cpp-python|fastapi|uvicorn)"

# Test AI service directly
curl -X POST http://localhost:8000/summarize \
  -H "Content-Type: application/json" \
  -d '{"content": "Test content", "max_length": 100}'
```

## 📊 Performance & Specifications

### System Requirements
- **RAM**: 4GB+ recommended (2GB for AI model)
- **Storage**: 1GB for model + dependencies
- **CPU**: Any modern processor (ARM64/x64 supported)
- **OS**: macOS, Linux, Windows

### Model Performance
- **Model**: TinyLLaMA 1.1B (quantized Q4_K_M)
- **Size**: ~637MB download
- **Memory Usage**: ~2GB RAM during inference
- **Speed**: 10-30 seconds per summary (depends on content length)
- **Quality**: Optimized for 100-200 word summaries

## 🔐 Security & Privacy

### Privacy Guarantees
- ✅ **Raw content never transmitted** over network
- ✅ **Local AI processing only** - no external API calls
- ✅ **Summary-only storage** on server
- ✅ **No tracking or analytics**
- ✅ **End-to-end privacy** for your content

### Security Features
- 🔒 **JWT-based authentication**
- 🔒 **Bcrypt password hashing**
- 🔒 **CORS protection**
- 🔒 **Input validation and sanitization**
- 🔒 **Secure headers and middleware**

### Production Considerations
- Change `JWT_SECRET` to a secure random string
- Use environment variables for sensitive data
- Enable HTTPS for all services
- Configure MongoDB authentication
- Set up proper firewall rules
- Use production MongoDB cluster

## 🔄 Future Enhancements

### Planned Features
- [ ] **Multiple AI model support** (Gemma, Mistral, Llama-2)
- [ ] **Custom prompt templates** for different content types
- [ ] **Batch processing** for multiple URLs
- [ ] **Export capabilities** (PDF, markdown)
- [ ] **Advanced privacy controls** and settings
- [ ] **Mobile app** for iOS/Android

### Technical Improvements
- [ ] **Model caching** for faster inference
- [ ] **Background processing** for large content
- [ ] **Progressive summarization** for very long content
- [ ] **Multi-language support**
- [ ] **Custom fine-tuning** options

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make your changes** following the coding standards
4. **Test thoroughly** including privacy compliance
5. **Submit a pull request** with detailed description

### Development Guidelines
- **Privacy-first** design principles
- **Local processing** wherever possible
- **Minimal data transmission**
- **Clear user consent** for any data sharing
- **Comprehensive testing** for new features

## 📝 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🙏 Acknowledgments

- **TinyLLaMA Team** - For the efficient local AI model
- **llama-cpp-python** - For excellent Python bindings
- **React Team** - For the frontend framework
- **Express.js** - For the backend framework
- **MongoDB** - For the database solution
- **Chrome Extensions API** - For browser integration

## 🆘 Support & Help

### Quick Fixes
1. **Model not loading** → Check `local-summarizer/models/` directory
2. **Extension not working** → Verify Chrome extension permissions
3. **Summarizer offline** → Ensure Python service is running
4. **Connection errors** → Verify all services are running on correct ports

### Getting Help
- **Bug Reports**: [GitHub Issues](https://github.com/your-repo/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Documentation**: Check this README and inline code comments
- **Community**: Join our discussions for tips and best practices

---

**🎯 Built with privacy as the #1 priority - Your content, your machine, your control.**

*Happy summarizing! 🚀*
