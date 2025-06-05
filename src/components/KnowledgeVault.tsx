/**
 * KnowledgeVault Component
 * 
 * Placeholder component for the family knowledge vault system.
 * IPFS functionality has been removed.
 */
import React from 'react';

interface KnowledgeVaultProps {
  familyId?: string;
  userPubkey: string;
}

const KnowledgeVault: React.FC<KnowledgeVaultProps> = ({ familyId, userPubkey }) => {
  return (
    <div className="knowledge-vault-container">
      <h2>Family Knowledge Vault</h2>
      <p>Preserve and share your family's wisdom across generations</p>
      
      <div className="knowledge-vault-placeholder">
        <div className="placeholder-icon">📚</div>
        <h3>Knowledge Vault Coming Soon</h3>
        <p>We're updating our storage system to better serve you.</p>
        <p>The Knowledge Vault functionality is currently being redesigned.</p>
        <p>Check back soon for the new and improved version!</p>
      </div>
    </div>
  );
};

export default KnowledgeVault;