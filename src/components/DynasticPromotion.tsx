import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react'; // Fixed import to use named export instead of default
import styles from './DynasticPromotion.module.css';
import { WebMobileIntegration } from '../../lib/mobile-integration';
import { Event as NostrEvent } from 'nostr-tools'; // Import the correct Event type

interface DynasticPromotionProps {
  className?: string;
}

export const DynasticPromotion: React.FC<DynasticPromotionProps> = ({ className }) => {
  const [showQR, setShowQR] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileIntegration, setMobileIntegration] = useState<WebMobileIntegration | null>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    
    // Initialize mobile integration if Nostr client is available
    if (window.nostrClient && window.userKeys) {
      setMobileIntegration(new WebMobileIntegration(window.nostrClient, window.userKeys));
    }
  }, []);

  const handleDownloadClick = () => {
    // Try to open mobile app first (deep linking)
    const appScheme = 'dynastic://open';
    const webFallback = 'https://dynastic.me';
    
    if (isMobile) {
      // Try app deep link, fallback to web
      window.location.href = appScheme;
      setTimeout(() => {
        window.location.href = webFallback;
      }, 1000);
    } else {
      // Desktop: show QR code or direct to website
      setShowQR(!showQR);
    }
  };

  const connectToMobile = async () => {
    // Web-to-mobile communication via Nostr
    try {
      if (mobileIntegration) {
        // Use the WebMobileIntegration class to sync with mobile
        await mobileIntegration.syncProgressToMobile('homepage-visit', 100);
      } else if (window.nostrClient && window.userKeys) {
        // Fallback to direct implementation if integration not available
        const connectionEvent: NostrEvent = {
          kind: 24133, // NIP-46 connection request
          created_at: Math.floor(Date.now() / 1000),
          tags: [
            ['p', window.userKeys.publicKey],
            ['relay', 'wss://relay.citadel.academy'],
            ['action', 'web_to_mobile_sync']
          ],
          content: JSON.stringify({
            action: 'sync_progress',
            webUrl: window.location.href,
            userAgent: navigator.userAgent
          }),
          pubkey: window.userKeys.publicKey,
          id: '', // Add a default empty string for id to satisfy the type requirement
          sig: '' // Add a default empty string for sig to satisfy the type requirement
        };
        await window.nostrClient.publishEvent(connectionEvent);
      }
    } catch (error) {
      console.log('Nostr connection available in mobile app');
    }
  };

  return (
    <section className={`${styles.dynasticPromo} ${className || ''}`}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.logoSection}>
            <img 
              src="/logos/dynastic-logo.png" 
              alt="Dynastic Mobile App"
              className={styles.logo}
            />
            <div className={styles.badges}>
              <span className={styles.badge}>Mobile Wallet</span>
              <span className={styles.badge}>Nostr Native</span>
              <span className={styles.badge}>Family First</span>
            </div>
          </div>
          
          <div className={styles.textSection}>
            <h3 className={styles.title}>Take Citadel Academy Everywhere</h3>
            <p className={styles.description}>
              Download the Dynastic.me mobile wallet, Nostr, and Academy interface.
            </p>
            <p className={styles.features}>
               Self-custodial Bitcoin & Lightning<br/>
               Family federation management<br/>
               Seamless course progress sync<br/>
               Encrypted family messaging
            </p>
          </div>
        </div>
        <div className={styles.actions}>
          <button 
            onClick={handleDownloadClick}
            className={styles.downloadBtn}
          >
            {isMobile ? ' Open Mobile App' : ' Get Mobile App'}
          </button>
          
          <button 
            onClick={connectToMobile}
            className={styles.connectBtn}
          >
             Sync with Mobile
          </button>
        </div>
        {showQR && (
          <div className={styles.qrSection}>
            <h4>Scan to Download</h4>
            <QRCodeSVG 
              value="https://dynastic.me" 
              size={150}
              bgColor="#FFFFFF"
              fgColor="#8B5CF6"
            />
            <p>Scan with your phone camera</p>
          </div>
        )}
        <div className={styles.storeButtons}>
          <a 
            href="https://play.google.com/store/apps/details?id=com.dynastic.family"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.storeBtn}
          >
            <img src="/images/google-play-badge.png" alt="Get it on Google Play" />
          </a>
          <a 
            href="https://apps.apple.com/app/dynastic-family-bitcoin/id123456789"
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.storeBtn}
          >
            <img src="/images/app-store-badge.png" alt="Download on App Store" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default DynasticPromotion;
