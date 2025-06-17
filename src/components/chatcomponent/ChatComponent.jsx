import React, { useState, useEffect } from "react";
import { InferenceClient } from "@huggingface/inference";
import "../chatcomponent/ChatComponent.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const client = new InferenceClient("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");
const LOADING_MESSAGES = [
  "Just a few more seconds...",
  "Unleashing creativity...",
  "Crafting your story...",
  "Almost there...",
  "Final touches..."
];

export default function ChatComponent() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetch('http://localhost:5000/api/mystories', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setConversations(data.map(story => ({
            id: story._id,
            title: story.prompt.substring(0, 30) + (story.prompt.length > 30 ? "..." : ""),
            prompt: story.prompt,
            story: story.story,
            date: new Date(story.createdAt).toLocaleString()
          })));
        } else {
          console.error('Unexpected response:', data);
        }
      })
      .catch(err => {
        console.error('Error fetching stories:', err);
      });
  }, []);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const chatCompletion = await client.chatCompletion({
        provider: "novita",
        model: "deepseek-ai/DeepSeek-R1",
        messages: [
          {
            role: "system",
            content: "You are a story-writing assistant. Only generate stories. If the user asks anything else, say: 'Sorry, I can only help with story generation.'",
          },
          {
            role: "user",
            content: input,
          },
        ],
      });

      let rawStory = chatCompletion.choices[0].message.content;
      let cleanedStory = rawStory
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/\*{2}([^*]+)\*{2}/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/---[\s\S]*/g, "")
        .trim();

      const botMessage = { role: 'assistant', content: cleanedStory };
      setMessages(prev => [...prev, botMessage]);

      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: input,
          story: cleanedStory
        })
      });

      const newConversation = {
        id: Date.now(),
        title: input.substring(0, 30) + (input.length > 30 ? "..." : ""),
        prompt: input,
        story: cleanedStory,
        date: new Date().toLocaleString()
      };
      
      const updatedConversations = [newConversation, ...conversations];
      setConversations(updatedConversations);
      localStorage.setItem('storyConversations', JSON.stringify(updatedConversations));
      setActiveConversation(newConversation.id);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = { role: 'assistant', content: "Something went wrong. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generateVideoFromStory = async () => {
    if (!messages.length || messages[messages.length - 1].role !== 'assistant') return;
    
    setVideoLoading(true);
    setGeneratedVideo(null);
    
    try {
      const lastStory = messages[messages.length - 1].content;
      const videoPrompt = lastStory.split('.')[0] || "A scene from the story";
      
      const videoResponse = await client.textToVideo({
        provider: "replicate",
        model: "Lightricks/LTX-Video",
        inputs: {
          prompt: videoPrompt,
        },
      });
      
      setGeneratedVideo(videoResponse);
    } catch (error) {
      console.error("Video generation error:", error);
      alert("Failed to generate video. Please try again.");
    } finally {
      setVideoLoading(false);
    }
  };

  const startNewConversation = () => {
    setInput("");
    setMessages([]);
    setGeneratedVideo(null);
    setActiveConversation(null);
    if (window.innerWidth < 768) {
      setMobileSidebarOpen(false);
    }
  };

  const loadConversation = (id) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setMessages([
        { role: 'user', content: conversation.prompt },
        { role: 'assistant', content: conversation.story }
      ]);
      setActiveConversation(id);
      setGeneratedVideo(null);
    }
    if (window.innerWidth < 768) {
      setMobileSidebarOpen(false);
    }
  };

  const deleteConversation = (id, e) => {
    e.stopPropagation();
    const updatedConversations = conversations.filter(c => c.id !== id);
    setConversations(updatedConversations);
    localStorage.setItem('storyConversations', JSON.stringify(updatedConversations));
    
    if (activeConversation === id) {
      startNewConversation();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Story copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <div className="app-container">
      {/* Sidebar/Navbar */}
      <div className={`sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={startNewConversation}>
            <svg viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            New Story
          </button>
          <button className="mobile-close-btn" onClick={() => setMobileSidebarOpen(false)}>
            <svg viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <div className="conversation-list">
          {conversations.map(conv => (
            <div 
              key={conv.id}
              className={`conversation-item ${activeConversation === conv.id ? 'active' : ''}`}
              onClick={() => loadConversation(conv.id)}
            >
              <div className="conversation-title">{conv.title}</div>
              <div className="conversation-date">{conv.date}</div>
              <button 
                className="delete-conversation"
                onClick={(e) => deleteConversation(conv.id, e)}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
        
        <div className="sidebar-footer">
          <Link to="/profile" className="profile-link">
            <button className="profile-btn">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
              My Profile
            </button>
          </Link>
          <button className="logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24">
              <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="chat-container">
        {/* Mobile sidebar toggle */}
        <button 
          className="mobile-sidebar-toggle"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <svg viewBox="0 0 24 24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
        
        {/* Chat Header */}
        <div className="chat-header">
          <h1 className="chat-title">BOT TALES</h1>
          <Link to="/profile" className="user-profile-mobile">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </Link>
        </div>
        
        {/* Chat Messages Area */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="magic-wand-icon">
                <span className="material-symbols-outlined robo-icon">
                  smart_toy
                </span>
              </div>
              <h3>Create Your First Story</h3>
              <p>Enter a prompt below to generate a magical story</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-content">
                  {message.content}
                  {message.role === 'assistant' && (
                    <div className="message-actions">
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard(message.content)}
                        title="Copy story"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="message assistant">
              <div className="message-content">
                {LOADING_MESSAGES[loadingMessageIndex]}
                <div className="loading-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </div>
              </div>
            </div>
          )}
          {generatedVideo && (
            <div className="video-container">
              <video controls width="100%">
                <source src={generatedVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="input-section">
          <div className="input-container">
            <textarea
              className="story-input"
              placeholder="Once upon a time..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              rows="1"
            />
            <button 
              className={`send-btn ${loading ? 'loading' : ''}`} 
              onClick={handleSubmit} 
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}