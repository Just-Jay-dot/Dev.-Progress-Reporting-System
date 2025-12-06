import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Scroll detection for auto-hiding scrollbars
let scrollTimeout;
const handleScroll = () => {
  document.body.classList.add('scrolling');
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    document.body.classList.remove('scrolling');
  }, 1000);
};

// Add scroll listeners to all scrollable elements
document.addEventListener('DOMContentLoaded', () => {
  const scrollableElements = document.querySelectorAll('*');
  scrollableElements.forEach(el => {
    if (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) {
      el.addEventListener('scroll', handleScroll, { passive: true });
    }
  });
  
  // Also listen on window for overall scroll
  window.addEventListener('scroll', handleScroll, { passive: true });
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

