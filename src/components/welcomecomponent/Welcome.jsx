import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  const [prompt, setPrompt] = useState("");

  return (
    <main className='main-container'>
      <div className="holder">
        <h1 className='wel-heading'>Welcome to Bot Tales</h1>
        <h2 className='wel-subhead'>Unleash Your Imagination – Generate Stories in Just a Few Clicks!</h2>
        
        <form className='wel-form' onSubmit={(e) => e.preventDefault()}>
          <input
            type='text'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='Enter your story prompt...'
            className='prompt'
            aria-label="Enter story generation prompt"
          />
          <Link 
            to="/signup" 
            state={{ initialPrompt: prompt }}
          >
            <button 
              className='generatebtn'
            >
              <span>Generate Story</span>
            </button>
          </Link>
        </form>
      </div>
    </main>
  );
};

export default Welcome;