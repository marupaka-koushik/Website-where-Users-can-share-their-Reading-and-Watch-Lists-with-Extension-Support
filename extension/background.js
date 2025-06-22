// Background script for the Chrome extension
class BackgroundManager {
    constructor() {
        this.LOCAL_SUMMARIZER_URL = 'http://localhost:8000';
        this.init();
    }
    
    init() {
        // Handle extension installation
        chrome.runtime.onInstalled.addListener(() => {
            console.log('Content Summarizer extension installed');
        });
        
        // Handle messages from content scripts
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async response
        });
    }
    
    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'extractYouTubeTranscript':
                    const transcript = await this.fetchYouTubeTranscript(request.videoId);
                    sendResponse({ success: true, transcript });
                    break;
                    
                case 'checkPermissions':
                    const hasPermissions = await this.checkRequiredPermissions();
                    sendResponse({ success: true, hasPermissions });
                    break;
                    
                case 'summarizeContent':
                    const summary = await this.summarizeWithLocalService(request.content, request.title, request.url);
                    sendResponse({ success: true, summary });
                    break;
                    
                case 'checkLocalSummarizer':
                    const isRunning = await this.checkLocalSummarizerStatus();
                    sendResponse({ success: true, isRunning });
                    break;
                    
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Background script error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }
    
    async summarizeWithLocalService(content, title = null, url = null) {
        try {
            console.log('Sending content to local summarizer...');
            
            const response = await fetch(`${this.LOCAL_SUMMARIZER_URL}/summarize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: content,
                    title: title,
                    url: url,
                    max_length: 150
                })
            });
            
            if (!response.ok) {
                throw new Error(`Local summarizer error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Summary generated locally:', data);
            
            return {
                text: data.summary,
                wordCount: data.word_count,
                originalLength: data.original_length,
                model: 'local-llama',
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Local summarization failed:', error);
            
            // Fallback to basic client-side summarization
            const fallbackSummary = this.createFallbackSummary(content);
            return {
                text: fallbackSummary,
                wordCount: fallbackSummary.split(' ').length,
                originalLength: content.split(' ').length,
                model: 'fallback',
                timestamp: new Date().toISOString(),
                note: 'Generated using fallback method - local service unavailable'
            };
        }
    }
    
    createFallbackSummary(content, maxWords = 150) {
        // Simple extractive summarization fallback
        const sentences = content.match(/[^\.!?]+[\.!?]+/g) || [content];
        const words = [];
        
        for (const sentence of sentences) {
            const sentenceWords = sentence.trim().split(/\s+/);
            if (words.length + sentenceWords.length <= maxWords) {
                words.push(...sentenceWords);
            } else {
                const remaining = maxWords - words.length;
                words.push(...sentenceWords.slice(0, remaining));
                break;
            }
        }
        
        return words.join(' ') + (content.split(' ').length > maxWords ? '...' : '');
    }
    
    async checkLocalSummarizerStatus() {
        try {
            const response = await fetch(`${this.LOCAL_SUMMARIZER_URL}/health`, {
                method: 'GET',
                timeout: 2000
            });
            return response.ok;
        } catch (error) {
            console.log('Local summarizer not available:', error.message);
            return false;
        }
    }
    
    async fetchYouTubeTranscript(videoId) {
        try {
            // Method 1: Try to get transcript from YouTube's internal API
            const transcriptUrl = `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`;
            
            const response = await fetch(transcriptUrl);
            if (response.ok) {
                const xmlText = await response.text();
                return this.parseTranscriptXML(xmlText);
            }
            
            // Method 2: If direct API fails, try alternative approach
            // This would need to be implemented based on YouTube's current structure
            throw new Error('Transcript not available via API');
            
        } catch (error) {
            console.log('Background transcript fetch failed:', error);
            throw new Error('Could not fetch transcript in background');
        }
    }
    
    parseTranscriptXML(xmlText) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            const textElements = xmlDoc.getElementsByTagName('text');
            
            let transcript = '';
            for (let element of textElements) {
                const text = element.textContent || element.innerText || '';
                transcript += text.replace(/&quot;/g, '"').replace(/&amp;/g, '&') + ' ';
            }
            
            return transcript.trim();
        } catch (error) {
            throw new Error('Failed to parse transcript XML');
        }
    }
    
    async checkRequiredPermissions() {
        try {
            const permissions = await chrome.permissions.getAll();
            const requiredPermissions = ['activeTab', 'storage', 'scripting'];
            
            return requiredPermissions.every(permission => 
                permissions.permissions.includes(permission)
            );
        } catch (error) {
            console.error('Permission check failed:', error);
            return false;
        }
    }
}

// Initialize background manager
new BackgroundManager();
