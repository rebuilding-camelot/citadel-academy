/**
 * KnowledgeVault Component
 * 
 * Main component that combines the upload and browser functionality
 * for the family knowledge vault system.
 */
import React, { useState } from 'react';
import { KnowledgeVaultItem } from '../lib/ipfs-service';
import { KnowledgeVaultBrowser } from './KnowledgeVaultBrowser';
import { KnowledgeVaultUpload } from './KnowledgeVaultUpload';
import '../styles/knowledge-vault.css';

interface KnowledgeVaultProps {
  familyId?: string;
  userPubkey: string;
}

const KnowledgeVault: React.FC<KnowledgeVaultProps> = ({ familyId, userPubkey }) => {
  // State for handling item preview
  const [selectedItem, setSelectedItem] = useState<KnowledgeVaultItem | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  /**
   * Handles successful upload completion
   */
  const handleUploadComplete = (item: KnowledgeVaultItem) => {
    // In a real implementation, this would trigger a refresh of the browser component
    console.log('Upload complete:', item);
  };

  /**
   * Closes the file preview modal
   */
  const closePreview = () => {
    setSelectedItem(null);
    setFilePreviewUrl(null);
  };

  return (
    <div className="knowledge-vault-container">
      <h2>Family Knowledge Vault</h2>
      <p>Preserve and share your family's wisdom across generations</p>
      
      {/* File upload component */}
      <KnowledgeVaultUpload 
        familyId={familyId}
        onUploadComplete={handleUploadComplete}
      />
      
      {/* File browser component */}
      <KnowledgeVaultBrowser familyId={familyId} />
      
      {/* File preview modal (shown when an item is selected) */}
      {selectedItem && filePreviewUrl && (
        <div className="item-preview-modal">
          <div className="modal-content">
            <button className="close-button" onClick={closePreview}>×</button>
            <h3>{selectedItem.title}</h3>
            
            <div className="preview-container">
              {selectedItem.type === 'image' && (
                <img src={filePreviewUrl} alt={selectedItem.title} />
              )}
              {selectedItem.type === 'video' && (
                <video src={filePreviewUrl} controls />
              )}
              {selectedItem.type === 'audio' && (
                <audio src={filePreviewUrl} controls />
              )}
              {selectedItem.type === 'document' && (
                <div className="document-preview">
                  <a href={filePreviewUrl} target="_blank" rel="noopener noreferrer">
                    Open document in new tab
                  </a>
                </div>
              )}
            </div>
            
            <div className="item-details">
              {selectedItem.description && <p>{selectedItem.description}</p>}
              <div className="item-meta">
                <span>Added: {new Date(selectedItem.uploadedAt).toLocaleDateString()}</span>
                <span>Size: {(selectedItem.size / 1024 / 1024).toFixed(2)} MB</span>
                <span>Type: {selectedItem.type}</span>
                {selectedItem.encrypted && <span className="encrypted">🔒 Encrypted</span>}
              </div>
              {selectedItem.tags.length > 0 && (
                <div className="item-tags">
                  {selectedItem.tags.map(tag => (
                    <span key={tag} className="item-tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeVault;