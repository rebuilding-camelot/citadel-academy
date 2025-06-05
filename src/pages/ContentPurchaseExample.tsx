import React from 'react';
import { ContentPurchase } from '../components/ContentPurchase';
import '../styles/ContentPurchase.css';
import '../styles/ContentPurchaseExample.css';

const ContentPurchaseExample: React.FC = () => {
  return (
    <div className="content-purchase-example">
      <h1>Content Purchase Example</h1>
      <p>This page demonstrates the atomic swap purchase functionality for digital content.</p>
      
      <div className="content-item">
        <h2>Premium Article: "Advanced Bitcoin Lightning Network Techniques"</h2>
        <p>
          Learn about the latest advancements in Lightning Network technology, 
          including atomic swaps, submarine swaps, and multi-path payments.
        </p>
        <div className="content-preview">
          <p>
            The Lightning Network has evolved significantly since its inception...
            <span className="blur-text">
              This content is blurred and will be available after purchase.
            </span>
          </p>
        </div>
        <div className="purchase-section">
          <ContentPurchase 
            contentId="article-123" 
            priceSats={1000} 
          />
        </div>
      </div>
      
      <div className="content-item">
        <h2>Video Course: "Building on Nostr"</h2>
        <p>
          A comprehensive guide to building applications on the Nostr protocol,
          with practical examples and code samples.
        </p>
        <div className="content-preview">
          <div className="video-placeholder">
            <span>Video Preview (Locked)</span>
          </div>
        </div>
        <div className="purchase-section">
          <ContentPurchase 
            contentId="video-456" 
            priceSats={5000} 
          />
        </div>
      </div>
    </div>
  );
};

export default ContentPurchaseExample;