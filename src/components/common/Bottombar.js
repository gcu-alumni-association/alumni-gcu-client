import React from 'react';
import "../components.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';
import GCUImage from '../../assets/GCU-Logo-White-footer.png';

const Bottombar = () => {
  return (
    <>
    <div className="bottombar">
      <div className="university-info">
        <img src={GCUImage} alt="GCU Logo" />
        <p>
          <strong>Main Campus:</strong><br />
          Hathkhowapara, Azara, Guwahati, Assam 781017
        </p>
        <p>
          <strong>Constituent Campus:</strong><br />
          Kunderbari Rd, Dekargaon, Tezpur, Assam 784501
        </p>
      </div>
      <div className="important-links">
        <h4>Important Information</h4>
        <ul>
          <li><a href="/contactus">Contact Us</a></li>
          <li><a href="/feedback">Feedback Form</a></li>
          <li><a href="/copyright">© Copyright 2024</a></li>
          <li><a href="/disclaimer">Disclaimer</a></li>
          <li><a href="/termsofuse">Terms of Use</a></li>
          <li><a href="/privacypolicy">Privacy Policy</a></li>
        </ul>
      </div>
      <div className="contact-info">
        <h4>Contact Us</h4>
        <p>Email: <a href="mailto:info@gcuniversity.ac.in">info@gcuniversity.ac.in</a></p>
        <p>Phone: 7099034050</p>
        <p>Women Helpline: 7099004706</p>
      </div>
      <div className="social-links">
        <h4>Follow Us</h4>
        <a href="https://www.facebook.com/gcuniversityassam" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faFacebook} style={{ color: "#0851af" }} /> Facebook
        </a>
        <a href="https://x.com/GCUniversityA" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faTwitter} style={{ color: "#31b2f2" }} /> Twitter
        </a>
        <a href="https://in.linkedin.com/school/girijananda-chowdhury-university" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faLinkedin} style={{ color: "#1e67e6" }} /> LinkedIn
        </a>
        <a href="https://www.instagram.com/gcu_assam" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faInstagram} /> Instagram
        </a>
      </div>
    </div>
    <div className="developer-info">
      <p>© Girijananda Chowdhury University (GCU) 2024, All right reserved.</p>
      <p>Proudly Designed & Developed by <strong>Priyanuj,</strong><strong>Nishant,</strong><strong>Jyotirmoy,</strong><strong>Fahim,</strong><strong>Manav.</strong></p>
    </div>
    </>
  );
};

export default Bottombar;
