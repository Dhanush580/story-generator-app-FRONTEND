import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Signup.css';
import { useNavigate,useLocation } from 'react-router-dom'; 
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners'; // Import the spinner component

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Add loading state
    const navigate = useNavigate();
    const location = useLocation();
    const [securityQuestion, setSecurityQuestion] = useState({
    question: '',
    answer: ''
    });
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const securityQuestions = [
        "What was your childhood nickname?",
        "What is the name of your first pet?",
        "What city were you born in?",
        "What is your mother's maiden name?",
        "What was the name of your elementary school?", 
        "What is your favorite teacher name?",
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        if (formData.password) {
            let strength = 0;
            if (formData.password.length > 5) strength += 1;
            if (formData.password.length > 8) strength += 1;
            if (/[A-Z]/.test(formData.password)) strength += 1;
            if (/[0-9]/.test(formData.password)) strength += 1;
            if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
            setPasswordStrength((strength / 5) * 100);
        } else {
            setPasswordStrength(0);
        }
    }, [formData.password]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        if (!securityQuestion.answer.trim()) {
        alert("Please answer the security question");
        return;
    }

        setIsLoading(true); // Start loading

        try {
            const response = await fetch('https://story-generator-app-backend.onrender.com/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    securityQuestion: securityQuestion.question,
                    securityAnswer: securityQuestion.answer
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Signup failed");
                return;
            }
            navigate('/story-generation',{state:location.state});
        } catch (err) {
            alert("Server error");
            console.error(err);
        } finally {
            setIsLoading(false); // Stop loading regardless of success/failure
        }
    };

    const getStrengthColor = () => {
        if (passwordStrength < 30) return '#ff4d4d';
        if (passwordStrength < 70) return '#ffcc00';
        return '#00cc66';
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };
    const handleQuestionChange = () => {
        setCurrentQuestionIndex((prevIndex) => 
            (prevIndex + 1) % securityQuestions.length
        );
        setSecurityQuestion(prev => ({
            ...prev,
            question: securityQuestions[(currentQuestionIndex + 1) % securityQuestions.length],
            answer: '' // Clear answer when changing question
        }));
    };

    const handleSecurityAnswerChange = (e) => {
        setSecurityQuestion(prev => ({
            ...prev,
            answer: e.target.value
        }));
    };

    // Initialize question on component mount
    useEffect(() => {
        setSecurityQuestion({
            question: securityQuestions[0],
            answer: ''
        });
    }, []);
    

    return (
        <div className="signup-container">
            <div className="signup-holder">
                <h2 className='signup-heading'>Signup to get started</h2>
                <form className="signup-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="signup-input"
                            placeholder=" "
                            required
                        />
                        <label className="input-label">Full Name</label>
                    </div>

                    <div className="input-group">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="signup-input"
                            placeholder=" "
                            required
                        />
                        <label className="input-label">Email Address</label>
                    </div>

                    <div className="password-fields-container">
             <div className="input-group password-input-group">
                    {/* Password input field */}
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="signup-input"
                            placeholder=" "
                            required
                        />
                        <label className="input-label">Password</label>
                        <button 
                            type="button" 
                            className="password-toggle"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <div className="input-group password-input-group">
                        {/* Confirm Password input field */}
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="signup-input"
                            placeholder=" "
                            required
                        />
                        <label className="input-label">Confirm Password</label>
                        <button 
                            type="button" 
                            className="password-toggle"
                            onClick={toggleConfirmPasswordVisibility}
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>
                {/* Add this after your confirm password field */}
                <div className="security-question-group">
                    <div className="question-header">
                        <label>Security Question (For password recovery)</label>
                        <button 
                            type="button" 
                            className="change-question-btn"
                            onClick={handleQuestionChange}
                        >
                            Change Question
                        </button>
                    </div>
                    
                    <div className="question-text">
                        {securityQuestion.question}
                    </div>
                    
                    <div className="input-group">
                        <input
                            type="text"
                            name="securityAnswer"
                            value={securityQuestion.answer}
                            onChange={handleSecurityAnswerChange}
                            className="signup-input"
                            placeholder=""
                            required
                        />
                        <label className="input-label">Your Answer</label>
                    </div>
                </div>

                    <button type="submit" className="signup-btn" disabled={isLoading}>
                        {isLoading ? (
                            <ClipLoader color="#ffffff" size={20} />
                        ) : (
                            'Sign Up'
                        )}
                    </button>
                </form>

                <p className="login-link">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
                <p className='login-link'><Link to="/">Go Back to Home</Link></p>
            </div>
        </div>
    );
};

export default Signup;