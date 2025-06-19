import React from 'react';
import { FaGithub, FaLinkedin, FaTwitter, FaDribbble, FaBehance, FaArrowLeft,FaInstagram } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import './OurTeam.css';
import girish from '../../assets/girish.jpg'; 
import ramesh from '../../assets/ramesh.jpg';
import prasad from '../../assets/prasad.jpg'; 
import dhanush from '../../assets/dhanush.jpg';
import tricky from '../../assets/tricky.jpg';

const Team = () => {
  const navigate = useNavigate();

  const teamMembers = [
    {
      id: 1,
      name: 'Nagaram Prasad Rao',
      role: 'Team Leader, UI/UX Designer, media generation, AI Tools specialist',
      image: prasad,
      social: {
        github: 'https://github.com/Prasadrao912',
        linkedin: 'https://www.linkedin.com/in/nagaram-prasad-rao-26a6b7280?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
        Instagram: 'https://www.instagram.com/nagaram.prasad_01?igsh=MTFxcnU4bDgwdmdjNw=='
      }
    },
    {
      id: 2,
      name: 'Dogiparthi venkata sai girish',
      role: 'Authentication,handling backend,tester, debugger',
      image: girish,
      social: {
        github: 'https://github.com/Girish1908',
        linkedin: 'http://www.linkedin.com/in/dogiparthi-girish-b0a4bb259',
        Instagram: 'https://www.instagram.com/sai_girish/'
      }
    },
    {
      id: 3,
      name: 'Veera Dhanush Kumar Pekala',
      role: 'Developed components, designed backend schema, desined backend routes',
      image: dhanush,
      social: {
        github: 'https://github.com/Dhanush580',
        linkedin: 'https://www.linkedin.com/in/dhanush-pekala-a531b52b1?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
        Instagram: 'https://www.instagram.com/dhanush_pekala/profilecard/?igsh=MXhudHd1cjkxOHVkYg=='
      }
    },
    {
      id: 4,
      name: 'Tippanaboina Ramesh',
      role: 'API Integration, debugging',
      image: ramesh,
      social: {
        github: 'https://github.com/tippanaboinaramesh',
        linkedin: 'https://www.linkedin.com/in/tippanaboina-ramesh-311b5024b/',
        Instagram: 'https://www.instagram.com/tippanaboina_ramesh?igsh=cWh5dW5qNDdnbWc2'
      }
    },
    {
      id: 5,
      name: 'Vattikuti hemanth',
      role: 'GitHub management, team coordination, Deployment of project',
      image: tricky,
      social: {
        github: 'https://github.com/hemanthvattikuti0143',
        linkedin: 'https://www.linkedin.com/in/hemanth-vattikuti-65a11a341/',
        Instagram: 'https://www.instagram.com/__.tricky.__?igsh=MjhyN3psamJ6dnc5'
      }
    }
  ];

  return (
    <section className="team-section">
      <Container>
        <Row className="justify-content-center back-btn-container">
          <Col xs="auto">
            <button 
              className="back-button-out"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft />
            </button>
          </Col>
        </Row>

        <h2 className="section-title">Meet Our Team</h2>
        <p className="section-subtitle">The talented people behind our success</p>
        
        <Row className="justify-content-center">
          {teamMembers.map((member) => (
            <Col key={member.id} xs={10} sm={6} lg={4} className="mb-4">
              <div className="team-card h-100">
                <div className="card-image">
                  <img src={member.image} alt={member.name} loading="lazy" />
                </div>
                <div className="card-content">
                  <h3>{member.name}</h3>
                  <p className="role">{member.role}</p>
                  <div className="social-links">
                    {member.social.github && (
                      <a href={member.social.github} aria-label="GitHub" target='_blank'>
                        <FaGithub />
                      </a>
                    )}
                    {member.social.linkedin && (
                      <a href={member.social.linkedin} aria-label="LinkedIn" target='_blank'>
                        <FaLinkedin />
                      </a>
                    )}
                    {member.social.Instagram && (
                      <a href={member.social.Instagram} aria-label="Instagram" target='_blank'>
                        <FaInstagram />
                      </a>
                    )}
                    
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Team;