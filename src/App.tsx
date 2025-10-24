export default function App() {
  return (
    <div className="treasure-hunt-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="mirror-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-main">TREASURE</span>
            <span className="title-reflected">HUNT</span>
          </h1>
          <p className="hero-subtitle">Where Every Clue Reflects A New Reality</p>
          <div className="hero-cta">
            <a href="https://forms.google.com" target="_blank" rel="noopener noreferrer" className="cta-button primary">
              Register Your Team
            </a>
            <a href="#rules" className="cta-button secondary">
              Event Details
            </a>
          </div>
        </div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="content-wrapper">
          <div className="section-header">
            <h2 className="section-title">The Quest Awaits</h2>
            <div className="title-divider"></div>
          </div>
          <div className="about-grid">
            <div className="about-card">
              <div className="card-icon">🗺️</div>
              <h3>Epic Adventure</h3>
              <p>Navigate through mysterious locations across campus, solving intricate puzzles and uncovering hidden clues.</p>
            </div>
            <div className="about-card">
              <div className="card-icon">👥</div>
              <h3>Team Challenge</h3>
              <p>Gather your squad and work together. Collaboration and wit are your greatest assets in this hunt.</p>
            </div>
            <div className="about-card">
              <div className="card-icon">🏆</div>
              <h3>Win Big</h3>
              <p>The first team to decode all clues and reach the final destination claims victory and amazing prizes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section id="rules" className="rules-section">
        <div className="content-wrapper">
          <div className="section-header">
            <h2 className="section-title">Rules & Guidelines</h2>
            <div className="title-divider"></div>
          </div>
          <div className="rules-grid">
            <div className="rule-item">
              <div className="rule-number">01</div>
              <div className="rule-content">
                <h3>Team Formation</h3>
                <p>Form teams of 3-5 members. Register your team through the official form before the deadline.</p>
              </div>
            </div>
            <div className="rule-item">
              <div className="rule-number">02</div>
              <div className="rule-content">
                <h3>Physical Event</h3>
                <p>This is an offline treasure hunt. Navigate campus locations physically to find clues.</p>
              </div>
            </div>
            <div className="rule-item">
              <div className="rule-number">03</div>
              <div className="rule-content">
                <h3>No Smartphones</h3>
                <p>Smartphones and electronic devices are not allowed during the hunt. Bring your wits instead!</p>
              </div>
            </div>
            <div className="rule-item">
              <div className="rule-number">04</div>
              <div className="rule-content">
                <h3>Free Entry</h3>
                <p>No registration fee required. Open to all college students with valid ID cards.</p>
              </div>
            </div>
            <div className="rule-item">
              <div className="rule-number">05</div>
              <div className="rule-content">
                <h3>Fair Play</h3>
                <p>Play fairly and respect other teams. Any form of cheating will result in disqualification.</p>
              </div>
            </div>
            <div className="rule-item">
              <div className="rule-number">06</div>
              <div className="rule-content">
                <h3>Time Limit</h3>
                <p>Complete the hunt within the allocated time. The fastest team with correct answers wins!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Info Section */}
      <section className="info-section">
        <div className="content-wrapper">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-label">Date & Time</div>
              <div className="info-value">TBA</div>
            </div>
            <div className="info-card">
              <div className="info-label">Venue</div>
              <div className="info-value">Campus Wide</div>
            </div>
            <div className="info-card">
              <div className="info-label">Team Size</div>
              <div className="info-value">3-5 Members</div>
            </div>
            <div className="info-card">
              <div className="info-label">Entry Fee</div>
              <div className="info-value">FREE</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta-section">
        <div className="content-wrapper">
          <h2 className="cta-title">Ready to Begin Your Journey?</h2>
          <p className="cta-description">Register your team now and prepare for the ultimate treasure hunting experience</p>
          <a href="https://forms.google.com" target="_blank" rel="noopener noreferrer" className="cta-button large">
            Register Now
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="content-wrapper">
          <div className="footer-general-contact">
            <a href="mailto:treasurehunt@email.com" className="general-contact-item">
              <span className="contact-icon">✉️</span>
              <span>treasurehunt@email.com</span>
            </a>
            <a href="https://instagram.com/treasurehunt" target="_blank" rel="noopener noreferrer" className="general-contact-item">
              <span className="contact-icon">📷</span>
              <span>@treasurehunt</span>
            </a>
          </div>
          
          <h3 className="footer-title">Event Coordinators</h3>
          <div className="contact-grid">
            <div className="contact-card">
              <h4 className="contact-name">Coordinator Name 1</h4>
              <a href="tel:+919876543210" className="contact-phone">
                <span className="contact-icon">📞</span>
                <span>+91 98765 43210</span>
              </a>
            </div>
            
            <div className="contact-card">
              <h4 className="contact-name">Coordinator Name 2</h4>
              <a href="tel:+919876543211" className="contact-phone">
                <span className="contact-icon">📞</span>
                <span>+91 98765 43211</span>
              </a>
            </div>
            
            <div className="contact-card">
              <h4 className="contact-name">Coordinator Name 3</h4>
              <a href="tel:+919876543212" className="contact-phone">
                <span className="contact-icon">📞</span>
                <span>+91 98765 43212</span>
              </a>
            </div>
          </div>
          <p className="footer-copyright">© 2025 Treasure Hunt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
