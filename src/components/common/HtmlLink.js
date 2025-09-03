import React from 'react';
import './HtmlLink.css';

const HtmlLink = ({ href, text }) => {
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='html-link'
    >
      {text}
    </a>
  );
};

export default HtmlLink;
