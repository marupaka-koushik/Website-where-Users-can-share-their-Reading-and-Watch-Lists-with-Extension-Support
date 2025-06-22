# 🔒 Website where users can share their reading and watch lists with extension support

video link:https://drive.google.com/file/d/1wRnWKnSuGAB5HOPPuaHwO9cpibaX-zVL/view?usp=sharing

A full-stack content summarization platform that prioritizes user privacy by processing content locally and storing only AI-generated summaries. Features a Chrome extension for seamless content extraction, local AI summarization, social following system, and real-time notifications.

![Privacy-First Architecture](https://img.shields.io/badge/Privacy-First-green?style=for-the-badge) ![Local AI](https://img.shields.io/badge/AI-Local%20Processing-blue?style=for-the-badge) ![Full Stack](https://img.shields.io/badge/Stack-Full%20Stack-orange?style=for-the-badge)

## 🌟 Key Features

### 🛡️ **Privacy-First Architecture**
- **Local Content Processing** - Raw content never leaves your machine  
- **AI Summarization** - Powered by local TinyLLaMA model
- **Summary-Only Storage** - Only AI summaries stored on server
- **Zero Content Exposure** - Original content remains completely private

### 🎯 **Content Management**
- **Universal Extraction** - Supports websites, articles, and YouTube videos
- **Chrome Extension** - One-click content extraction and summarization
- **Smart Summaries** - Contextual AI summaries with metadata
- **Clean Interface** - Modern, responsive web application

### 👥 **Social Features**
- **Follow System** - Follow other users with pending request states
- **Real-Time Notifications** - Get notified when follow requests are accepted
- **Privacy-Conscious Profiles** - Show post counts only, no follower counts
- **Secure Authentication** - JWT-based user management

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Chrome Ext.    │    │   React Frontend │    │  Node.js API    │
│  Content Extract│◄──►│   Modern SPA     │◄──►│  Express + Auth │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Local AI      │    │   User Interface │    │    MongoDB      │
│   TinyLLaMA     │    │   Notifications  │    │   Summaries     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or later)
- **Python 3.8+** 
- **MongoDB** (local or Atlas)
- **Chrome Browser** (for extension)

### 1️⃣ Clone the Repository
```bash
git clone <your-repository-url>
cd summarise
```

### 2️⃣ Environment Setup

Create these configuration files with your specific values:

#### Backend Environment (`website/.env`)
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/content-summarizer
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/content-summarizer

# Server Configuration  
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# API Configuration
API_URL=http://localhost:3001/api
FRONTEND_URL=http://localhost:3000

# Local AI Configuration
LOCAL_SUMMARIZER_URL=http://localhost:8000
```

#### Frontend Environment (`website/frontend/.env`)
```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# Development Configuration
PORT=3000
BROWSER=none
```

### 3️⃣ Install Dependencies

#### Backend Setup
```bash
cd website
npm install
```

#### Frontend Setup  
```bash
cd website/frontend
npm install
```

#### Local AI Setup
```bash
cd local-summarizer
pip install -r requirements.txt
```

### 4️⃣ Download AI Model

The system uses TinyLLaMA for local processing. Download the model:

```bash
cd local-summarizer/models
# Download TinyLLaMA model (about 637MB)
wget https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf
```

### 5️⃣ Start All Services

#### Terminal 1: Database
```bash
# If using local MongoDB
mongod
```

#### Terminal 2: Backend API
```bash
cd website
npm start
```

#### Terminal 3: Frontend
```bash
cd website/frontend  
npm start
```

#### Terminal 4: Local AI
```bash
cd local-summarizer
python3 summarizer.py
```

### 6️⃣ Load Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension` folder from this project
5. Pin the extension to your toolbar

## 📱 Usage Workflow

1. **Visit any webpage** (article, blog, YouTube video)
2. **Click extension icon** in Chrome toolbar
3. **Extract content** (processed locally, never transmitted)
4. **AI summarizes content** using local TinyLLaMA model
5. **Review summary** in extension popup
6. **Save to website** (only summary is transmitted, never raw content)
7. **Share with followers** through the social platform

## 🎛️ Configuration Variables

### 🔧 **Critical Variables to Change**

When forking this project, update these variables for your environment:

#### **Database Configuration**
```env
# In website/.env
MONGODB_URI=mongodb://localhost:27017/content-summarizer
# Change to your MongoDB connection string
```

#### **Security Configuration**
```env
# In website/.env  
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
# IMPORTANT: Generate a secure random string for production
```

#### **API URLs**
```env
# In website/.env
API_URL=http://localhost:3001/api
FRONTEND_URL=http://localhost:3000

# In website/frontend/.env
REACT_APP_API_URL=http://localhost:3001/api

# In extension/popup.js (line 7)
this.apiUrl = 'http://localhost:3001/api';
```

#### **Server Ports**
```env
# Backend port (website/.env)
PORT=3001

# Frontend port (website/frontend/.env)  
PORT=3000

# AI service port (local-summarizer/summarizer.py line 196)
uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 🎨 **Customization Options**

#### **AI Model Configuration**
```python
# In local-summarizer/summarizer.py (line 28)
MODEL_PATH = "./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
# Change to use different GGUF models
```

#### **Content Limits**
```javascript
// In website/routes/content.js (line 45)
const content = req.body.content || '';
const maxContentLength = 50000; // Adjust as needed
```

#### **Extension Settings**
```javascript
// In extension/popup.js (line 7)
this.apiUrl = 'http://localhost:3001/api'; // Your API URL
```

## 📁 Project Structure

```
summarise/
├── 📁 extension/                 # Chrome Extension
│   ├── manifest.json            # Extension configuration
│   ├── popup.html               # Extension UI
│   ├── popup.js                 # Extension logic
│   ├── background.js            # Service worker
│   ├── universal-extractor.js   # Content extraction
│   └── icons/                   # Extension icons
│
├── 📁 website/                   # Backend API
│   ├── server.js                # Express server
│   ├── package.json             # Dependencies
│   ├── models/                  # MongoDB models
│   │   ├── User.js              # User schema
│   │   ├── Content.js           # Content schema
│   │   └── Notification.js      # Notification schema
│   ├── routes/                  # API routes
│   │   ├── auth.js              # Authentication
│   │   ├── users.js             # User management
│   │   ├── content.js           # Content management
│   │   └── summary.js           # Summary generation
│   └── frontend/                # React Frontend
│       ├── src/
│       │   ├── pages/           # React pages
│       │   ├── components/      # React components
│       │   ├── contexts/        # React contexts
│       │   └── hooks/           # Custom hooks
│       └── public/              # Static assets
│
├── 📁 local-summarizer/          # AI Service
│   ├── summarizer.py            # FastAPI AI service
│   ├── requirements.txt         # Python dependencies
│   └── models/                  # AI models directory
│
└── 📄 README.md                  # This file
```

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
```bash
# Kill existing processes
pkill -f "node.*server.js"
pkill -f "react-scripts start"
pkill -f "python.*summarizer.py"

# Check ports
lsof -i :3000  # Frontend
lsof -i :3001  # Backend  
lsof -i :8000  # AI service
```

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
