#!/usr/bin/env python3
"""
Local Privacy-First Summarization Service
Uses llama-cpp-python to summarize content locally without sending data to external APIs
"""

import os
import re
import logging
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Local Summarizer",
    description="Privacy-first local content summarization using llama-cpp-python",
    version="1.0.0"
)

# Enable CORS for browser extension and local website
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instance
llm = None

def load_model():
    """Load the llama model once at startup"""
    global llm
    try:
        from llama_cpp import Llama
        
        # Try to find a model file (prioritize available models)
        model_paths = [
            "./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",  # Use TinyLLaMA first since it's available
            "./models/gemma-2b-it-q4_k_m.gguf",
            "./models/mistral-7b-instruct-v0.1.Q4_K_M.gguf",
            # Add more model paths as needed
        ]
        
        model_path = None
        for path in model_paths:
            if os.path.exists(path):
                model_path = path
                break
        
        if not model_path:
            logger.warning("No model found. Please download a model to ./models/")
            logger.info("You can download models from:")
            logger.info("- https://huggingface.co/microsoft/DialoGPT-medium/resolve/main/pytorch_model.bin")
            logger.info("- https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGML")
            return None
        
        logger.info(f"Loading model from: {model_path}")
        llm = Llama(
            model_path=model_path,
            n_ctx=2048,  # Context window
            n_threads=4,  # Number of CPU threads
            verbose=False
        )
        logger.info("Model loaded successfully!")
        return llm
        
    except ImportError:
        logger.error("llama-cpp-python not installed. Please run: pip install llama-cpp-python")
        return None
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        return None

class ContentRequest(BaseModel):
    content: str
    title: Optional[str] = None
    url: Optional[str] = None
    max_length: Optional[int] = 150
    
class SummaryResponse(BaseModel):
    summary: str
    word_count: int
    original_length: int
    method: str  # "ai_model" or "fallback"

def clean_content(content: str) -> str:
    """Clean and prepare content for summarization"""
    # Remove excessive whitespace
    content = re.sub(r'\s+', ' ', content)
    # Remove special characters that might confuse the model
    content = re.sub(r'[^\w\s\.\,\!\?\-\:\;]', ' ', content)
    # Limit length to prevent context overflow
    max_words = 1000
    words = content.split()
    if len(words) > max_words:
        content = ' '.join(words[:max_words])
    return content.strip()

def create_prompt(content: str, title: str = None, max_length: int = 150) -> str:
    """Create a structured prompt for summarization optimized for TinyLLaMA"""
    # Truncate content if too long for context
    words = content.split()
    if len(words) > 400:  # Keep it shorter for better focus
        content = ' '.join(words[:400])
    
    # Try a different approach - give examples and be very explicit
    prompt = f"""Below is an instruction that describes a task. Write a response that appropriately completes the request.

### Instruction:
Read the following text and write a concise summary that captures the main ideas in about {max_length} words.

### Input:
{content}

### Response:
The main points are: """
    return prompt

def calculate_word_overlap(text1: str, text2: str) -> float:
    """Calculate word overlap between two texts"""
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())
    if not words1 or not words2:
        return 0.0
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    return len(intersection) / len(union) if union else 0.0

def fallback_summarize(content: str, max_length: int = 150) -> str:
    """Improved fallback summarization when model is not available"""
    logger.info("Using fallback summarization method")
    
    # Split into sentences and score them by position and length
    sentences = re.split(r'[.!?]+', content)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
    
    if not sentences:
        # If no good sentences, take first max_length words
        words = content.split()[:max_length]
        return ' '.join(words) + ('...' if len(content.split()) > max_length else '')
    
    # Select key sentences (first, middle, important ones)
    selected_sentences = []
    total_words = 0
    
    # Always include first sentence if it's reasonable
    if sentences and len(sentences[0].split()) <= max_length // 2:
        selected_sentences.append(sentences[0])
        total_words += len(sentences[0].split())
    
    # Add middle sentences if space allows
    if len(sentences) > 2:
        middle_idx = len(sentences) // 2
        middle_sentence = sentences[middle_idx]
        if total_words + len(middle_sentence.split()) <= max_length:
            selected_sentences.append(middle_sentence)
            total_words += len(middle_sentence.split())
    
    # Add last sentence if space allows and it's different from first
    if len(sentences) > 1 and total_words < max_length * 0.8:
        last_sentence = sentences[-1]
        if (last_sentence != sentences[0] and 
            total_words + len(last_sentence.split()) <= max_length):
            selected_sentences.append(last_sentence)
    
    # If we still don't have enough content, add more sentences
    for sentence in sentences[1:-1]:
        if total_words >= max_length * 0.9:
            break
        if sentence not in selected_sentences:
            words_needed = max_length - total_words
            sentence_words = sentence.split()
            if len(sentence_words) <= words_needed:
                selected_sentences.append(sentence)
                total_words += len(sentence_words)
    
    summary = '. '.join(selected_sentences)
    if summary and not summary.endswith('.'):
        summary += '.'
    
    # Ensure we don't exceed max_length
    words = summary.split()
    if len(words) > max_length:
        summary = ' '.join(words[:max_length]) + '...'
    
    return summary

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    logger.info("Starting Local Summarizer Service...")
    load_model()

@app.get("/")
async def root():
    """Health check endpoint"""
    model_status = "loaded" if llm else "not loaded"
    return {
        "service": "Local Summarizer",
        "status": "running",
        "model": model_status,
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_loaded": llm is not None,
        "endpoints": ["/", "/health", "/summarize"]
    }

@app.post("/summarize", response_model=SummaryResponse)
async def summarize_content(request: ContentRequest):
    """Summarize content using local model"""
    try:
        if not request.content or len(request.content.strip()) < 10:
            raise HTTPException(status_code=400, detail="Content too short or empty (minimum 10 characters required)")
        
        # Clean the content
        clean_text = clean_content(request.content)
        original_length = len(request.content.split())
        
        # Handle very short content specially
        if len(clean_text.strip()) < 50:
            logger.info(f"Content is very short ({len(clean_text)} chars), using minimal processing")
            return SummaryResponse(
                summary=clean_text.strip(),
                word_count=len(clean_text.split()),
                original_length=original_length,
                method="minimal"
            )
        
        logger.info(f"Summarizing content: {original_length} words -> target: {request.max_length} words")
        
        method_used = "fallback"  # Default to fallback
        
        if llm:
            # Use the loaded model for summarization
            logger.info("Using AI model for summarization")
            prompt = create_prompt(clean_text, request.title, request.max_length)
            
            try:
                logger.info("Calling model inference...")
                response = llm(
                    prompt,
                    max_tokens=request.max_length + 20,  # Smaller buffer
                    temperature=0.1,  # Very low temperature for focused output
                    top_p=0.7,
                    stop=["### Instruction:", "### Input:", "### Response:", "\n\n\n"],
                    echo=False
                )
                
                summary = response['choices'][0]['text'].strip()
                logger.info(f"Raw model response: {summary[:150]}...")
                
                # Clean up the summary - remove any prompt echoes or formatting
                summary = re.sub(r'^(The main points are:?|Here is.*?summary:?|Summary:?)', '', summary, flags=re.IGNORECASE).strip()
                summary = re.sub(r'\s+', ' ', summary).strip()
                
                # Remove any remaining instructional text
                summary = re.sub(r'^(The text|This text|In summary|To summarize)', '', summary, flags=re.IGNORECASE).strip()
                
                # If it starts with numbers or bullet points, that's good - it's likely a real summary
                if re.match(r'^\d+\.|\-|\*', summary):
                    logger.info("Detected structured summary format")
                
                # Ensure reasonable length
                summary = summary[:request.max_length * 10]  # Character limit safety
                
                if not summary or len(summary.strip()) < 30:
                    logger.warning("Model returned empty or very short summary, using fallback")
                    raise Exception("Model returned insufficient summary")
                
                # More strict check for text continuation vs summarization
                # Check if the summary starts exactly like the original text
                original_start = clean_text[:100].lower()
                summary_start = summary[:100].lower()
                
                if summary_start in original_start or original_start in summary_start:
                    logger.warning("Model output appears to be text continuation rather than summary, using fallback")
                    raise Exception("Model output is not a proper summary")
                
                logger.info("Successfully used AI model for summarization")
                method_used = "ai_model"
                    
            except Exception as e:
                logger.warning(f"Model inference failed: {e}, using fallback")
                summary = fallback_summarize(clean_text, request.max_length)
        else:
            # Use fallback summarization
            logger.info("No model loaded, using fallback summarization")
            summary = fallback_summarize(clean_text, request.max_length)
        
        word_count = len(summary.split())
        
        logger.info(f"Summary generated: {word_count} words using {method_used}")
        
        return SummaryResponse(
            summary=summary,
            word_count=word_count,
            original_length=original_length,
            method=method_used
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Summarization error: {e}")
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")

if __name__ == "__main__":
    logger.info("Starting Local Summarizer on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
