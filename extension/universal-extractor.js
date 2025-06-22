// Enhanced Universal Content Extractor
class UniversalContentExtractor {
    constructor() {
        this.isReadabilityLoaded = false;
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
        
        console.log('Universal content extractor loaded for:', window.location.hostname);
    }
    
    async extractContent() {
        const hostname = window.location.hostname;
        
        try {
            if (hostname.includes("youtube.com") && window.location.href.includes("watch")) {
                return await this.extractYouTubeContent();
            } else {
                return await this.extractArticleContent();
            }
        } catch (error) {
            console.warn('Primary content extraction failed, using universal fallback:', error);
            // Always provide fallback - never completely fail
            return this.extractUniversalContent();
        }
    }
    
    // === YouTube Content Extractor ===
    async extractYouTubeContent() {
        const videoId = new URLSearchParams(window.location.search).get('v');
        
        // Try to wait for title to load, but don't fail if it doesn't
        try {
            await this.waitForElement('h1', 3000); // Shorter timeout
        } catch (e) {
            console.warn('Title element not found quickly, proceeding anyway');
        }
        
        const title = this.getYouTubeTitle() || this.generateFallbackTitle('YouTube Video');
        
        // Try to get transcript
        let transcript = await this.getYouTubeTranscript(videoId);
        
        // If no transcript, extract description or any available text
        if (!transcript) {
            transcript = this.getYouTubeDescription() || 'Video content available - transcript not accessible';
        }
        
        return {
            source: 'youtube',
            title: title,
            content: transcript,
            url: window.location.href,
            site: window.location.hostname,
            timestamp: new Date().toISOString(),
            videoId: videoId,
            channel: this.getChannelName() || 'Unknown Channel'
        };
    }
    
    getYouTubeTitle() {
        const selectors = [
            'h1.ytd-video-primary-info-renderer',
            'h1.title.style-scope.ytd-video-primary-info-renderer',
            'h1[class*="title"]',
            '.ytd-video-primary-info-renderer h1',
            'h1'
        ];
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                return element.textContent.trim();
            }
        }
        
        // Fallback to page title, cleaned
        return document.title.replace(' - YouTube', '').trim();
    }
    
    getChannelName() {
        const selectors = [
            '#channel-name a',
            '.ytd-channel-name a',
            '#owner-name a',
            'a[href*="/channel/"]',
            'a[href*="/@"]'
        ];
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                return element.textContent.trim();
            }
        }
        
        return 'Unknown Channel';
    }
    
    async getYouTubeTranscript(videoId) {
        try {
            // Method 1: Try YouTube's timedtext API
            const response = await fetch(`https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`);
            if (response.ok) {
                const xml = await response.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xml, "text/xml");
                const texts = xmlDoc.querySelectorAll("text");
                
                if (texts.length > 0) {
                    return Array.from(texts).map(t => t.textContent).join(' ');
                }
            }
        } catch (err) {
            console.warn("Direct transcript fetch failed:", err);
        }
        
        try {
            // Method 2: Try to extract from page transcript
            return await this.extractTranscriptFromPage();
        } catch (err) {
            console.warn("Page transcript extraction failed:", err);
        }
        
        return null;
    }
    
    async extractTranscriptFromPage() {
        // Look for transcript/show transcript buttons
        const transcriptButtons = document.querySelectorAll('button[aria-label*="ranscript" i], button[aria-label*="Show transcript" i]');
        
        for (const button of transcriptButtons) {
            try {
                button.click();
                await this.sleep(2000); // Wait for transcript to load
                
                const transcriptContainer = document.querySelector('#segments-container, .ytd-transcript-segment-list-renderer');
                if (transcriptContainer) {
                    const segments = transcriptContainer.querySelectorAll('.ytd-transcript-segment-renderer');
                    if (segments.length > 0) {
                        return Array.from(segments)
                            .map(segment => {
                                const textEl = segment.querySelector('.segment-text');
                                return textEl ? textEl.textContent.trim() : '';
                            })
                            .filter(text => text.length > 0)
                            .join(' ');
                    }
                }
            } catch (err) {
                console.warn("Transcript button click failed:", err);
            }
        }
        
        return null;
    }
    
    // === Article Content Extractor (Using Readability) ===
    async extractArticleContent() {
        // Load Readability if not already loaded
        if (!this.isReadabilityLoaded) {
            await this.loadReadability();
        }
        
        // Wait a bit for Readability to be available
        await this.sleep(100);
        
        if (typeof Readability !== 'undefined') {
            try {
                const docClone = document.cloneNode(true);
                const reader = new Readability(docClone);
                const article = reader.parse();
                
                if (article && article.textContent && article.textContent.trim().length > 50) {
                    return {
                        source: 'article',
                        title: article.title || this.generateFallbackTitle('Article'),
                        content: article.textContent,
                        url: window.location.href,
                        site: window.location.hostname,
                        timestamp: new Date().toISOString(),
                        byline: article.byline || null,
                        siteName: article.siteName || window.location.hostname
                    };
                }
            } catch (error) {
                console.warn('Readability extraction failed:', error);
            }
        }
        
        // Fallback to basic extraction
        return this.extractBasicContent();
    }
    
    async loadReadability() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@mozilla/readability@0.4.4/Readability.js';
            script.onload = () => {
                this.isReadabilityLoaded = true;
                resolve();
            };
            script.onerror = () => {
                console.warn('Failed to load Readability, using fallback');
                resolve(); // Don't reject, just use fallback
            };
            document.head.appendChild(script);
        });
    }
    
    extractBasicContent() {
        // Enhanced fallback content extraction
        const title = document.title || this.generateFallbackTitle('Web Page');
        
        // Try multiple strategies to get content
        let content = '';
        
        // Strategy 1: Look for common content selectors
        const contentSelectors = [
            'article',
            'main',
            '[role="main"]',
            '.content',
            '.post-content',
            '.article-content',
            '.entry-content',
            '.page-content',
            '.post-body',
            '.story-body'
        ];
        
        for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                const text = element.textContent || element.innerText || '';
                if (text.trim().length > 100) {
                    content = text;
                    break;
                }
            }
        }
        
        // Strategy 2: Look for paragraphs if no content found
        if (!content || content.trim().length < 100) {
            const paragraphs = document.querySelectorAll('p');
            const textParts = [];
            for (const p of paragraphs) {
                const text = (p.textContent || p.innerText || '').trim();
                if (text.length > 20) {
                    textParts.push(text);
                }
            }
            if (textParts.length > 0) {
                content = textParts.join('\n\n');
            }
        }
        
        // Strategy 3: Last resort - extract from body, but filter out navigation/footer
        if (!content || content.trim().length < 50) {
            const body = document.body.cloneNode(true);
            
            // Remove common non-content elements
            const elementsToRemove = ['nav', 'header', 'footer', 'aside', '.menu', '.navigation', '.sidebar'];
            elementsToRemove.forEach(selector => {
                const elements = body.querySelectorAll(selector);
                elements.forEach(el => el.remove());
            });
            
            content = body.textContent || body.innerText || '';
        }
        
        // If still no content, use URL as minimal content
        if (!content || content.trim().length < 10) {
            content = `Web page content from ${window.location.hostname}. URL: ${window.location.href}`;
        }
        
        return {
            source: 'basic',
            title: title,
            content: this.cleanText(content),
            url: window.location.href,
            site: window.location.hostname,
            timestamp: new Date().toISOString(),
            siteName: window.location.hostname
        };
    }
    
    // Universal extractor that never fails
    extractUniversalContent() {
        console.log('Using universal fallback extractor');
        
        // Generate a meaningful title
        let title = document.title;
        if (!title || title.trim().length === 0) {
            title = this.generateFallbackTitle('Web Content');
        }
        
        // Extract any text we can find
        let content = '';
        
        // Try to get some content from meta descriptions first
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && metaDesc.content) {
            content = metaDesc.content + '\n\n';
        }
        
        // Get text from body
        const bodyText = document.body ? (document.body.textContent || document.body.innerText || '') : '';
        content += bodyText;
        
        // Clean and ensure minimum content
        content = this.cleanText(content);
        if (!content || content.trim().length < 10) {
            content = `Content extracted from ${window.location.hostname}. This page may contain dynamic content or require special handling.`;
        }
        
        return {
            source: 'universal',
            title: title,
            content: content,
            url: window.location.href,
            site: window.location.hostname,
            timestamp: new Date().toISOString(),
            siteName: window.location.hostname,
            note: 'Extracted using universal fallback method'
        };
    }
    
    // === Utility Methods ===
    async waitForElement(selector, timeout = 5000) {
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
                // Don't reject harshly, just resolve with null
                console.warn(`Element ${selector} not found within ${timeout}ms`);
                resolve(null);
            }, timeout);
        });
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    cleanText(text) {
        if (!text) return '';
        
        return text
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 10000); // Limit content length
    }
    
    // Generate fallback title when none is available
    generateFallbackTitle(prefix = 'Content') {
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        
        // Try to create a meaningful title from URL
        if (pathname && pathname !== '/') {
            const pathParts = pathname.split('/').filter(part => part);
            if (pathParts.length > 0) {
                const lastPart = pathParts[pathParts.length - 1];
                const cleanedPart = lastPart.replace(/[-_]/g, ' ').replace(/\.\w+$/, '');
                if (cleanedPart.length > 2) {
                    return `${cleanedPart} - ${hostname}`;
                }
            }
        }
        
        return `${prefix} from ${hostname}`;
    }
    
    // Get YouTube video description
    getYouTubeDescription() {
        const descriptionSelectors = [
            '#description-text',
            '.ytd-video-secondary-info-renderer #description',
            '.watch-video-desc',
            '.ytd-expandable-video-description-body-renderer'
        ];
        
        for (const selector of descriptionSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                const text = (element.textContent || element.innerText || '').trim();
                if (text.length > 20) {
                    return text;
                }
            }
        }
        
        return null;
    }
}

// Initialize the universal extractor
new UniversalContentExtractor();
