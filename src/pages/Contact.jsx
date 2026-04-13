import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, Send, CheckCircle, Ticket, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar'; // Added Navbar to match Home
import Footer from '../components/Footer'; // Added Footer to match Home
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    query: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API Call
    setTimeout(() => {
      const randomTicket = "TKT-" + Math.random().toString(36).substring(2, 7).toUpperCase();
      setTicketId(randomTicket);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({ email: '', phone: '', query: '' });
    setTicketId('');
  };

  return (
    <div className="premium-contact-wrapper">
      <Navbar />
      
      {/* Animated Background Blobs matching Home */}
      <div className="bg-blob blob-purple"></div>
      <div className="bg-blob blob-blue"></div>

      <main className="contact-main-container">
        
        <div className="contact-header">
          <div className="premium-badge">Support 24/7</div>
          <h1 className="hero-title">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="hero-subtitle">
            Have questions about SafeStay? We're here to help. Fill out the form and our team will resolve your queries instantly.
          </p>
        </div>

        <div className="contact-glass-container">
          
          {/* Left Side: Contact Information */}
          <div className="contact-info-dark">
            <div className="info-cards-dark">
              <div className="feature-card-mini">
                <div className="f-icon-box"><Mail size={22} /></div>
                <div>
                  <h4>Email Us</h4>
                  <p>support@safestay.com</p>
                </div>
              </div>
              
              <div className="feature-card-mini">
                <div className="f-icon-box"><Phone size={22} /></div>
                <div>
                  <h4>Call Us</h4>
                  <p>+91 98765 43210</p>
                </div>
              </div>
              
              <div className="feature-card-mini">
                <div className="f-icon-box"><MapPin size={22} /></div>
                <div>
                  <h4>Office</h4>
                  <p>123 Startup Hub, Indore, MP, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: The Form / Success State */}
          <div className="contact-form-dark">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="query-form">
                <h3 className="form-title">Send us a Message</h3>
                
                <div className="form-group-dark">
                  <label>Email Address</label>
                  <div className="input-glass-wrapper">
                    <Mail className="input-icon-dark" size={18} />
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="Enter your email" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group-dark">
                  <label>Phone Number</label>
                  <div className="input-glass-wrapper">
                    <Phone className="input-icon-dark" size={18} />
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      placeholder="Enter your phone number" 
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit mobile number"
                      required 
                    />
                  </div>
                </div>

                <div className="form-group-dark">
                  <label>Your Query</label>
                  <div className="input-glass-wrapper align-top">
                    <MessageSquare className="input-icon-dark text-icon" size={18} />
                    <textarea 
                      name="query" 
                      value={formData.query} 
                      onChange={handleChange} 
                      placeholder="How can we help you?" 
                      rows="4" 
                      required 
                    ></textarea>
                  </div>
                </div>

                <button type="submit" className="btn-gradient-submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="loader-text">Sending...</span>
                  ) : (
                    <>Send Message <Send size={18} /></>
                  )}
                </button>
              </form>
            ) : (
              // Success State
              <div className="success-glass-state">
                <div className="success-glow-icon">
                  <CheckCircle size={60} />
                </div>
                <h3>Query Submitted!</h3>
                <p>Our team will contact you soon. Please keep your Ticket ID safe for future reference.</p>
                
                <div className="ticket-glass-box">
                  <Ticket className="ticket-icon-neon" size={24} />
                  <div className="ticket-details-neon">
                    <span>Your Ticket ID</span>
                    <strong>{ticketId}</strong>
                  </div>
                </div>

                <button onClick={handleReset} className="btn-glass-outline">
                  Submit Another Query
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}