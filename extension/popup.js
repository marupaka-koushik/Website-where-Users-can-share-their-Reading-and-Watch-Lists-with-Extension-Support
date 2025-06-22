// Popup script for the Chrome extension
class PopupManager {
    constructor() {
        this.apiUrl = 'http://localhost:3001/api'; // Backend API URL
        this.extractedContent = null; // Store extracted content
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        await this.checkLoginStatus();
        await this.updateStatus();
        await this.checkLocalSummarizerStatus();
    }
    
    setupEventListeners() {
        document.getElementById('extractBtn').addEventListener('click', () => this.extractContent());
        document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
        document.getElementById('sendBtn').addEventListener('click', () => this.sendContentToWebsite());
        document.getElementById('cancelBtn').addEventListener('click', () => this.cancelExtraction());
        // Note: Logout button listener is added dynamically in checkLoginStatus()
    }
    
    async updateStatus() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const statusText = document.getElementById('statusText');
        const extractBtn = document.getElementById('extractBtn');
        
        if (tab.url.includes('youtube.com/watch')) {
            statusText.textContent = '🎥 YouTube video detected';
            extractBtn.textContent = 'Extract Video Content';
            extractBtn.disabled = false;
        } else if (tab.url.startsWith('http')) {
            statusText.textContent = '📄 Website content detected';
            extractBtn.textContent = 'Extract Page Content';
            extractBtn.disabled = false;
        } else {
            statusText.textContent = '❌ No extractable content found';
            extractBtn.textContent = 'Cannot Extract';
            extractBtn.disabled = true;
        }
    }
    
    async extractContent() {
        const loading = document.getElementById('loading');
        const extractBtn = document.getElementById('extractBtn');
        const statusText = document.getElementById('statusText');
        const contentPreview = document.getElementById('contentPreview');
        
        loading.style.display = 'block';
        extractBtn.disabled = true;
        statusText.textContent = 'Extracting content...';
        contentPreview.style.display = 'none';
        
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Send message to content script
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'extractContent',
                url: tab.url
            });
            
            if (response && response.success) {
                this.extractedContent = response.data;
                this.showContentPreview(response.data, tab);
                statusText.textContent = '✅ Content extracted! Review below:';
            } else {
                throw new Error(response?.error || 'Failed to extract content');
            }
        } catch (error) {
            console.error('Extraction error:', error);
            statusText.textContent = '❌ Extraction failed';
            this.showError(error.message);
        } finally {
            loading.style.display = 'none';
            extractBtn.disabled = false;
        }
    }
    
    async sendToWebsite(content, tab) {
        try {
            const user = await this.getStoredUser();
            
            // First, summarize the content locally (privacy-first approach)
            console.log('📝 Summarizing content locally...');
            const summaryResponse = await chrome.runtime.sendMessage({
                action: 'summarizeContent',
                content: content.transcript || content.content || content.text || content.description || "No content extracted",
                title: content.title || document.title || "Untitled Content",
                url: tab.url
            });
            
            if (!summaryResponse.success) {
                throw new Error('Failed to summarize content: ' + summaryResponse.error);
            }
            
            // Send only the summary to the website (never the raw content)
            const payload = {
                title: content.title || document.title || "Untitled Content",
                // Send summary instead of raw content for privacy
                summary: {
                    text: summaryResponse.summary.text,
                    wordCount: summaryResponse.summary.wordCount,
                    originalLength: summaryResponse.summary.originalLength,
                    model: summaryResponse.summary.model,
                    timestamp: summaryResponse.summary.timestamp,
                    note: summaryResponse.summary.note
                },
                url: tab.url,
                siteName: this.getSiteName(tab.url),
                timestamp: new Date().toISOString(),
                userId: user?.id || 'anonymous',
                source: content.source || 'unknown',
                // Privacy note: Raw content is never sent to the server
                isPrivacyMode: true,
                // Add YouTube specific data if available
                ...(content.videoId && { videoId: content.videoId }),
                ...(content.channel && { channel: content.channel })
            };
            
            console.log('🔒 Sending privacy-safe summary to website:', payload);
            
            const response = await fetch(`${this.apiUrl}/content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': user?.token ? `Bearer ${user.token}` : ''
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Server response:', errorData);
                
                // Show specific validation errors
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    const errorList = errorData.errors.join(', ');
                    throw new Error(`Validation Error: ${errorList}`);
                }
                
                throw new Error(errorData.message || `HTTP ${response.status}: Failed to send content to website`);
            }
            
            const result = await response.json();
            console.log('Content sent successfully:', result);
            
        } catch (error) {
            console.error('Error sending to website:', error);
            // If it's a network error to localhost, show a helpful message
            if (error.message.includes('localhost') || error.message.includes('fetch')) {
                throw new Error('Website backend not running. Start your server first!');
            }
            throw error;
        }
    }
    
    async handleLogin() {
        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;
        
        if (!email || !password) {
            this.showError('Please enter both email and password');
            return;
        }
        
        try {
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                await chrome.storage.local.set({
                    user: {
                        id: data.user.id,
                        email: data.user.email,
                        token: data.token
                    }
                });
                
                await this.checkLoginStatus();
                this.clearInputs();
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError(error.message);
        }
    }
    
    async checkLoginStatus() {
        const result = await chrome.storage.local.get(['user']);
        const userInfo = document.getElementById('userInfo');
        const loginSection = document.getElementById('loginSection');
        const loginTitle = document.getElementById('loginTitle');
        const emailInput = document.getElementById('emailInput');
        const passwordInput = document.getElementById('passwordInput');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (result.user && result.user.token) {
            // User is logged in
            loginTitle.textContent = 'Account Status';
            userInfo.innerHTML = `<div>✅ Logged in as: ${result.user.email}</div>`;
            
            // Hide login elements
            emailInput.style.display = 'none';
            passwordInput.style.display = 'none';
            loginBtn.style.display = 'none';
            
            // Show logout button
            logoutBtn.style.display = 'block';
            
            // Add event listener for logout button if not already added
            if (!logoutBtn.hasAttribute('data-listener-added')) {
                logoutBtn.addEventListener('click', () => this.logout());
                logoutBtn.setAttribute('data-listener-added', 'true');
            }
        } else {
            // User is not logged in
            loginTitle.textContent = 'Login to Save Content';
            userInfo.innerHTML = '';
            
            // Show login elements
            emailInput.style.display = 'block';
            passwordInput.style.display = 'block';
            loginBtn.style.display = 'block';
            
            // Hide logout button
            logoutBtn.style.display = 'none';
        }
    }
    
    async logout() {
        await chrome.storage.local.remove(['user']);
        await this.checkLoginStatus();
    }
    
    async getStoredUser() {
        const result = await chrome.storage.local.get(['user']);
        return result.user || null;
    }
    
    getSiteName(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch {
            return 'unknown';
        }
    }
    
    clearInputs() {
        document.getElementById('emailInput').value = '';
        document.getElementById('passwordInput').value = '';
    }
    
    showError(message) {
        const statusText = document.getElementById('statusText');
        statusText.textContent = `❌ ${message}`;
        setTimeout(() => {
            this.updateStatus();
        }, 3000);
    }
    
    showContentPreview(content, tab) {
        const contentPreview = document.getElementById('contentPreview');
        const previewTitle = document.getElementById('previewTitle');
        const previewContent = document.getElementById('previewContent');
        const previewSource = document.getElementById('previewSource');
        const previewLength = document.getElementById('previewLength');
        
        // Display title
        previewTitle.textContent = `📝 ${content.title || 'Untitled'}`;
        
        // Display content (truncate if too long)
        const displayContent = content.transcript || content.content || content.text || 'No content extracted';
        const truncatedContent = displayContent.length > 1000 
            ? displayContent.substring(0, 1000) + '...\n\n[Content truncated for preview]'
            : displayContent;
        previewContent.textContent = truncatedContent;
        
        // Display metadata
        const sourceType = content.source || (tab.url.includes('youtube.com') ? 'YouTube' : 'Website');
        previewSource.textContent = `📍 ${sourceType}`;
        previewLength.textContent = `📊 ${displayContent.length} chars`;
        
        // Add additional info for YouTube
        if (content.channel) {
            previewSource.textContent += ` • ${content.channel}`;
        }
        
        // Show the preview
        contentPreview.style.display = 'block';
    }
    
    async sendContentToWebsite() {
        if (!this.extractedContent) {
            this.showError('No content to send');
            return;
        }
        
        const sendBtn = document.getElementById('sendBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const statusText = document.getElementById('statusText');
        
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';
        statusText.textContent = 'Sending to website...';
        
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await this.sendToWebsite(this.extractedContent, tab);
            statusText.textContent = '✅ Content sent successfully!';
            this.hideContentPreview();
        } catch (error) {
            console.error('Send error:', error);
            statusText.textContent = '❌ Failed to send content';
            this.showError(error.message);
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = '✓ Send to Website';
        }
    }
    
    cancelExtraction() {
        this.extractedContent = null;
        this.hideContentPreview();
        document.getElementById('statusText').textContent = 'Extraction cancelled';
        setTimeout(() => {
            this.updateStatus();
        }, 2000);
    }
    
    hideContentPreview() {
        document.getElementById('contentPreview').style.display = 'none';
    }
    
    async checkLocalSummarizerStatus() {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'checkLocalSummarizer'
            });
            
            const privacyStatus = document.getElementById('privacyStatus');
            const privacyBadge = document.querySelector('.privacy-badge');
            
            if (response.success && response.isRunning) {
                privacyStatus.textContent = '🔒 Privacy-First Mode';
                privacyBadge.style.background = 'rgba(76, 175, 80, 0.2)';
                privacyBadge.style.borderColor = 'rgba(76, 175, 80, 0.5)';
            } else {
                privacyStatus.textContent = '⚠️ Fallback Mode';
                privacyBadge.style.background = 'rgba(255, 193, 7, 0.2)';
                privacyBadge.style.borderColor = 'rgba(255, 193, 7, 0.5)';
            }
        } catch (error) {
            console.log('Could not check local summarizer status:', error);
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});
