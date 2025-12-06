import React, { useState } from 'react';
import { alert, error, success } from '../utils/modal';
import './About.css';

function About() {
  const [coffeeAmount, setCoffeeAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const version = '1.0.0';
  const releaseDate = 'December 2025';

  const handleCoffeePayment = async () => {
    setIsProcessing(true);
    
    const amount = customAmount ? parseFloat(customAmount) : coffeeAmount;
    
    if (amount < 1) {
      await error('Minimum amount is $1', 'Invalid Amount');
      setIsProcessing(false);
      return;
    }

    try {
      const { stripeAPI } = await import('../utils/api');
      const { sessionId, url } = await stripeAPI.createCheckoutSession(amount, 'usd');
      
      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        await alert('Payment session created. Please check your Stripe configuration.', 'Payment Session', 'info');
      }
    } catch (err) {
      console.error('Payment error:', err);
      await error('Payment processing failed. ' + (err.message || 'Please check your Stripe configuration in the backend.'), 'Payment Error');
    } finally {
      setIsProcessing(false);
    }
  };

  const presetAmounts = [3, 5, 10, 20, 50];

  return (
    <div className="content-section">
      <div className="about-container">
        <div className="about-header">
          <div className="about-header-content">
            <img src="/cursor-logo.png" alt="Cursor" className="about-logo" />
            <div className="about-header-text">
              <h1 className="about-title">Cursor</h1>
              <p className="about-subtitle">Dev. Progress Report System</p>
            </div>
          </div>
        </div>

        <div className="about-content">
          <div className="about-section">
            <h2 className="about-section-title">
              <i className="fa-solid fa-lightbulb"></i> What is Dev. Progress Report System?
            </h2>
            <p className="about-description">
              <strong>Dev. Progress Report System</strong> is a comprehensive development progress report system designed to help developers 
              maintain clean, organized, and efficient project documentation. It provides a centralized dashboard 
              for tracking project progress, managing blueprints, monitoring activity logs, and collaborating 
              with AI-powered assistance.
            </p>
            <p className="about-description">
              Built with modern web technologies, it offers a beautiful, minimalist interface inspired 
              by professional design systems, making project management both functional and enjoyable.
            </p>
          </div>

          <div className="about-section">
            <h2 className="about-section-title">
              <i className="fa-solid fa-broom"></i> How It Helps Developers Stay Clean
            </h2>
            <div className="benefits-list">
              <div className="benefit-item">
                <i className="fa-solid fa-check-circle"></i>
                <div>
                  <h3>Single Source of Truth</h3>
                  <p>Maintains only two main documentation files (BLUEPRINT.md and PROGRESS.md), eliminating documentation chaos and duplication.</p>
                </div>
              </div>
              <div className="benefit-item">
                <i className="fa-solid fa-check-circle"></i>
                <div>
                  <h3>Structured Workflow</h3>
                  <p>Enforces a constitutional documentation workflow with clear rules, ensuring consistency across all project phases.</p>
                </div>
              </div>
              <div className="benefit-item">
                <i className="fa-solid fa-check-circle"></i>
                <div>
                  <h3>Centralized Progress Tracking</h3>
                  <p>Visual progress indicators, stepper UI, and percentage completion tracking keep you informed at a glance.</p>
                </div>
              </div>
              <div className="benefit-item">
                <i className="fa-solid fa-check-circle"></i>
                <div>
                  <h3>AI-Powered Assistance</h3>
                  <p>Context-aware AI assistant helps with documentation, planning, and project management tasks.</p>
                </div>
              </div>
              <div className="benefit-item">
                <i className="fa-solid fa-check-circle"></i>
                <div>
                  <h3>Activity Logging</h3>
                  <p>Real-time activity logs with timestamps and visual indicators for easy tracking of project changes.</p>
                </div>
              </div>
              <div className="benefit-item">
                <i className="fa-solid fa-check-circle"></i>
                <div>
                  <h3>GitHub Integration</h3>
                  <p>Seamless integration with GitHub for repository management, commit tracking, and branch monitoring.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="about-section">
            <h2 className="about-section-title">
              <i className="fa-solid fa-hand-holding-heart"></i> How It Helps
            </h2>
            <div className="help-list">
              <div className="help-item">
                <i className="fa-solid fa-clock"></i>
                <h3>Save Time</h3>
                <p>Reduce time spent on documentation management and focus on actual development work.</p>
              </div>
              <div className="help-item">
                <i className="fa-solid fa-users"></i>
                <h3>Team Collaboration</h3>
                <p>Improve team communication with clear progress visibility and shared documentation standards.</p>
              </div>
              <div className="help-item">
                <i className="fa-solid fa-chart-line"></i>
                <h3>Better Planning</h3>
                <p>Visual progress tracking helps identify bottlenecks and plan future development phases effectively.</p>
              </div>
              <div className="help-item">
                <i className="fa-solid fa-shield-halved"></i>
                <h3>Quality Assurance</h3>
                <p>Maintain documentation quality with enforced workflows and AI-powered assistance.</p>
              </div>
            </div>
          </div>

          <div className="about-section coffee-section">
            <h2 className="about-section-title">
              <i className="fa-solid fa-mug-hot"></i> Buy Me a Coffee
            </h2>
            <p className="coffee-description">
              Dev. Progress Report System is free and open for all developers. If you find this tool helpful and want to support 
              its continued development, consider buying me a coffee. Your support helps keep this project 
              free and enables new features and improvements.
            </p>
            
            <div className="coffee-amount-selector">
              <div className="preset-amounts">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    className={`preset-amount ${coffeeAmount === amount ? 'active' : ''}`}
                    onClick={() => {
                      setCoffeeAmount(amount);
                      setCustomAmount('');
                    }}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              
              <div className="custom-amount-input">
                <label>Custom Amount (USD)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    if (e.target.value) {
                      setCoffeeAmount(0);
                    }
                  }}
                />
              </div>
            </div>

            <div className="coffee-payment-info">
              <div className="payment-amount">
                <span>Total Amount:</span>
                <span className="amount-value">
                  ${customAmount ? parseFloat(customAmount || 0).toFixed(2) : coffeeAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              className="coffee-payment-button"
              onClick={handleCoffeePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fa-brands fa-stripe"></i>
                  Pay with Stripe
                </>
              )}
            </button>

            <p className="coffee-note">
              <i className="fa-solid fa-info-circle"></i>
              Secure payment processing powered by Stripe. Your payment information is never stored on our servers.
            </p>
          </div>

          <div className="about-footer">
            <p className="footer-version">
              Version {version} • {releaseDate} • <span className="footer-status">Active Development</span>
            </p>
            <p>Made with <i className="fa-solid fa-heart"></i> for developers</p>
            <p className="footer-links">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-github"></i> GitHub
              </a>
              <span>•</span>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-twitter"></i> Twitter
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;

