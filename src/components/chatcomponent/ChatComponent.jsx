import React, { useState, useEffect } from "react";
import { InferenceClient } from "@huggingface/inference";
import "../chatcomponent/ChatComponent.css";
import { Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiPlus, FiUser, FiLogOut, FiCopy, FiSend, FiTrash2 } from "react-icons/fi";
import { FaRobot, FaMagic, FaVideo } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const client = new InferenceClient("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");
const LOADING_MESSAGES = [
  "Just a few more seconds",
  "Unleashing creativity",
  "Crafting your story",
  "Almost there",
  "Final touches"
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
  const [initialPromptProcessed, setInitialPromptProcessed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const initialPrompt = location.state?.initialPrompt;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetch('https://story-generator-app-backend.onrender.com/api/mystories', {
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
    if (initialPrompt && !initialPromptProcessed) {
      setInput(initialPrompt);
      setInitialPromptProcessed(true);
      setTimeout(() => {
        handleSubmit(initialPrompt);
      }, 500);
    }
  }, [initialPrompt, initialPromptProcessed]);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const handleBackButton = (e) => {
      e.preventDefault();
      setShowLogoutConfirm(true);
    };

    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, []);

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
      await fetch('https://story-generator-app-backend.onrender.com/api/story', {
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

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    handleLogout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
    window.history.pushState(null, null, window.location.pathname);
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
      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="logout-confirm-overlay">
          <div className="logout-confirm-dialog">
            <h3>Are you sure you want to logout?</h3>
            <div className="confirm-buttons">
              <button className="confirm-btn" onClick={confirmLogout}>Yes</button>
              <button className="cancel-btn" onClick={cancelLogout}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar/Navbar */}
      <div className={`sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={startNewConversation}>
            <FiPlus className="icon" />
            New Story
          </button>
          <button className="mobile-close-btn" onClick={() => setMobileSidebarOpen(false)}>
            <FiX className="icon" />
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
              {/* <button 
                className="delete-conversation"
                onClick={(e) => deleteConversation(conv.id, e)}
              >
                <FiTrash2 className="icon" />
              </button> */}
            </div>
          ))}
        </div>
        
        <div className="sidebar-footer">
          <Link to="/profile" className="profile-link">
            <button className="profile-btn">
              <FiUser className="icon" />
              My Profile
            </button>
          </Link>
          <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
            <FiLogOut className="icon" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="chat-container">
        {/* Mobile header */}
        <div className="mobile-header">
          <button 
            className="mobile-sidebar-toggle"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <FiMenu className="icon" />
          </button>
          <h1 className="chat-title">BOT TALES</h1>
          <Link to="/profile" className="user-profile-mobile">
            <FiUser className="icon" />
          </Link>
        </div>
        
        {/* Chat Messages Area */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="magic-wand-icon">
                <FaRobot className="robo-icon" />
              </div>
              <h3>Create Your Story</h3>
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
                        <FiCopy className="icon" />copy to clipboard
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
                <FiSend className="icon" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}