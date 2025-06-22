// YouTube content extractor - specialized for YouTube videos
class YouTubeExtractor {
    constructor() {
        this.init();
    }
    
    init() {
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'extractContent') {
                this.extractContent()
                    .then(data => sendResponse({ success: true, data }))
                    .catch(error => sendResponse({ success: false, error: error.message }));
                return true; // Keep message channel open
            }
        });
        
        console.log('YouTube extractor loaded');
    }
    
    async extractContent() {
        try {
            const videoData = await this.extractVideoData();
            const transcript = await this.extractTranscript();
            
            return {
                title: videoData.title,
                transcript: transcript,
                duration: videoData.duration,
                channel: videoData.channel,
                videoId: videoData.videoId,
                url: window.location.href
            };
        } catch (error) {
            console.error('YouTube extraction error:', error);
            throw error;
        }
    }
    
    async extractVideoData() {
        // Wait for page to load completely
        await this.waitForElement('h1.ytd-video-primary-info-renderer');
        
        const title = this.getVideoTitle();
        const channel = this.getChannelName();
        const duration = this.getVideoDuration();
        const videoId = this.getVideoId();
        
        if (!title) {
            throw new Error('Could not extract video title');
        }
        
        return { title, channel, duration, videoId };
    }
    
    getVideoTitle() {
        // Multiple selectors for different YouTube layouts
        const selectors = [
            'h1.ytd-video-primary-info-renderer',
            'h1.title.style-scope.ytd-video-primary-info-renderer',
            'h1[class*="title"]',
            '.ytd-video-primary-info-renderer h1'
        ];
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                return element.textContent.trim();
            }
        }
        
        // Fallback to page title
        const pageTitle = document.title;
        return pageTitle.replace(' - YouTube', '');
    }
    
    getChannelName() {
        const selectors = [
            '#channel-name a',
            '.ytd-channel-name a',
            '#owner-name a'
        ];
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                return element.textContent.trim();
            }
        }
        
        return 'Unknown Channel';
    }
    
    getVideoDuration() {
        const selectors = [
            '.ytp-time-duration',
            '.ytd-thumbnail-overlay-time-status-renderer'
        ];
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                return element.textContent.trim();
            }
        }
        
        return null;
    }
    
    getVideoId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('v');
    }
    
    async extractTranscript() {
        try {
            // Method 1: Try to get transcript from the page
            const pageTranscript = await this.getTranscriptFromPage();
            if (pageTranscript) {
                return pageTranscript;
            }
            
            // Method 2: Try background script method
            const videoId = this.getVideoId();
            if (videoId) {
                const response = await chrome.runtime.sendMessage({
                    action: 'extractYouTubeTranscript',
                    videoId: videoId
                });
                
                if (response.success && response.transcript) {
                    return response.transcript;
                }
            }
            
            // Method 3: Try to extract captions/subtitles
            const captions = await this.extractCaptions();
            if (captions) {
                return captions;
            }
            
            throw new Error('No transcript available');
            
        } catch (error) {
            console.warn('Transcript extraction failed:', error);
            return null; // Don't fail the entire extraction if transcript fails
        }
    }
    
    async getTranscriptFromPage() {
        try {
            // Look for transcript button and click it
            const transcriptButton = document.querySelector('button[aria-label*="transcript" i], button[aria-label*="captions" i]');
            
            if (transcriptButton) {
                transcriptButton.click();
                await this.sleep(1000); // Wait for transcript to load
                
                // Try to find transcript container
                const transcriptContainer = document.querySelector('#segments-container, .ytd-transcript-segment-renderer');
                
                if (transcriptContainer) {
                    const segments = transcriptContainer.querySelectorAll('.ytd-transcript-segment-renderer');
                    let transcript = '';
                    
                    segments.forEach(segment => {
                        const text = segment.querySelector('.segment-text');
                        if (text) {
                            transcript += text.textContent + ' ';
                        }
                    });
                    
                    return transcript.trim();
                }
            }
            
            return null;
        } catch (error) {
            console.error('Page transcript extraction failed:', error);
            return null;
        }
    }
    
    async extractCaptions() {
        try {
            // This is a more complex method that would need to access YouTube's player
            // For now, we'll return null and rely on other methods
            return null;
        } catch (error) {
            console.error('Caption extraction failed:', error);
            return null;
        }
    }
    
    async waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize YouTube extractor
new YouTubeExtractor();
