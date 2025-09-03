import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className='page-container'>
      <div className='about-center-container'>
        <div className='about-container'>
          <section className='intro-section'>
            <h1 className='title'>Tool UI for Linux Command Execution</h1>
            <p className='description'>
              A web-based tool that provides an intuitive user interface for
              executing Linux commands within a Linux environment. Built using{' '}
              <strong>React.js</strong> for the frontend and{' '}
              <strong>Node.js</strong> for the backend, this tool aims to
              replace traditional terminal usage with a modern, user-friendly
              web UI.
            </p>
          </section>

          <section className='features-section'>
            <h2 className='section-title'>Key Features</h2>
            <ul className='features-list'>
              <li>
                <strong>Real-time Command Execution:</strong> Run Linux commands
                directly from the web UI with immediate results.
              </li>
              <li>
                <strong>Customizable Interface:</strong> Easily navigate and
                execute frequently used commands with a clean, interactive
                design.
              </li>
              <li>
                <strong>Error Handling & Output Display:</strong> Get detailed
                command output and error messages in a structured format.
              </li>
              <li>
                <strong>Responsive Design:</strong> Fully optimized for desktop
                use.
              </li>
              <li>
                <strong>Secure Integration:</strong> Ensures secure access to
                the Linux environment and protects sensitive data.
              </li>
            </ul>
          </section>

          <section className='technologies-section'>
            <h2 className='section-title'>Technologies</h2>
            <div className='technologies-list'>
              <span className='tech-item'>Frontend: React.js</span>
              <span className='tech-item'>Backend: Node.js</span>
              <span className='tech-item'>Environment: Linux</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
