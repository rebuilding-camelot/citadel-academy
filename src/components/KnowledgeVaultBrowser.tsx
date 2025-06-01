/**
 * KnowledgeVaultBrowser Component
 * 
 * A component for browsing and interacting with IPFS-stored knowledge vault items.
 * Provides filtering, searching, and file download/viewing capabilities.
 */
import React, { useState, useEffect } from 'react';
import { IPFSKnowledgeVault, KnowledgeVaultItem } from '../lib/ipfs-service';
import '../styles/knowledge-vault.css';

interface KnowledgeVaultBrowserProps {
  familyId?: string;
}

export const KnowledgeVaultBrowser: React.FC<KnowledgeVaultBrowserProps> = ({ familyId }) => {
  const [vaultItems, setVaultItems] = useState<KnowledgeVaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const ipfsVault = new IPFSKnowledgeVault();

  // Load vault items when component mounts or familyId changes
  useEffect(() => {
    loadVaultItems();
  }, [familyId]);

  /**
   * Fetches vault items from Nostr using NIP-78 application data
   */
  const loadVaultItems = async () => {
    setLoading(true);
    try {
      // Query Nostr for vault items
      const filter = {
        kinds: [30078], // NIP-78 application data
        '#academy': ['citadel'],
        ...(familyId ? { '#family': [familyId] } : {})
      };
      const events = await window.nostrClient?.queryEvents([filter]) || [];
      
      // Map Nostr events to KnowledgeVaultItem objects
      const items: KnowledgeVaultItem[] = events.map(event => {
        const content = JSON.parse(event.content || '{}');
        return {
          id: event.tags.find(tag => tag[0] === 'd')?.[1] || '',
          title: event.tags.find(tag => tag[0] === 'title')?.[1] || '',
          description: content.description || '',
          type: event.tags.find(tag => tag[0] === 'type')?.[1] as any || 'document',
          ipfsHash: event.tags.find(tag => tag[0] === 'ipfs')?.[1] || '',
          size: parseInt(event.tags.find(tag => tag[0] === 'size')?.[1] || '0'),
          uploadedBy: event.pubkey,
          uploadedAt: new Date(content.uploadedAt || event.created_at * 1000),
          tags: event.tags.filter(tag => tag[0] === 't').map(tag => tag[1]),
          familyId: event.tags.find(tag => tag[0] === 'family')?.[1],
          encrypted: content.encrypted || false
        };
      });
      
      // Sort by upload date (newest first)
      setVaultItems(items.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()));
    } catch (error) {
      console.error('Failed to load vault items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on selected type and search query
  const filteredItems = vaultItems.filter(item => {
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesType && matchesSearch;
  });

  /**
   * Downloads a file from IPFS
   */
  const handleDownload = async (item: KnowledgeVaultItem) => {
    try {
      const fileData = await ipfsVault.retrieveFile(item.ipfsHash);
      const blob = new Blob([fileData]);
      const url = URL.createObjectURL(blob);
      
      // Create and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = item.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  /**
   * Opens the file in a new tab using IPFS gateway
   */
  const handleView = async (item: KnowledgeVaultItem) => {
    try {
      const url = await ipfsVault.getFileUrl(item.ipfsHash);
      window.open(url, '_blank');
    } catch (error) {
      console.error('View failed:', error);
      alert('View failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  /**
   * Returns an emoji icon based on file type
   */
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'image': return '🖼️';
      case 'family_story': return '📖';
      default: return '📄';
    }
  };

  /**
   * Formats file size in human-readable format
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="knowledge-vault-loading">
        <div className="spinner"></div>
        <p>Loading Knowledge Vault...</p>
      </div>
    );
  }

  return (
    <div className="knowledge-vault-browser">
      <div className="vault-header">
        <h3>📚 Family Knowledge Vault</h3>
        <p>Decentralized storage for your family's wisdom and memories</p>
      </div>
      
      {/* Search and filter controls */}
      <div className="vault-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search vault items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="type-filter">
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="document">Documents</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="family_story">Family Stories</option>
          </select>
        </div>
      </div>
      
      {/* Vault statistics */}
      <div className="vault-stats">
        <span>📁 {filteredItems.length} items</span>
        <span>💾 {formatFileSize(filteredItems.reduce((acc, item) => acc + item.size, 0))}</span>
      </div>
      
      {/* Grid of vault items */}
      <div className="vault-grid">
        {filteredItems.map(item => (
          <div key={item.id} className="vault-item">
            <div className="item-header">
              <span className="file-icon">{getFileIcon(item.type)}</span>
              <div className="item-info">
                <h4>{item.title}</h4>
                <p className="item-meta">
                  {formatFileSize(item.size)} • {item.uploadedAt.toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {item.description && (
              <div className="item-description">{item.description}</div>
            )}
            
            {item.tags.length > 0 && (
              <div className="item-tags">
                {item.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            )}
            
            <div className="item-actions">
              <button onClick={() => handleView(item)} className="view-btn">
                👁️ View
              </button>
              <button onClick={() => handleDownload(item)} className="download-btn">
                📥 Download
              </button>
            </div>
            
            <div className="item-footer">
              <span className="ipfs-hash">
                IPFS: {item.ipfsHash.slice(0, 12)}...
              </span>
              {item.encrypted && <span className="encrypted-badge">🔒</span>}
            </div>
          </div>
        ))}
      </div>
      
      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div className="empty-vault">
          <div className="empty-icon">📚</div>
          <h4>No items found</h4>
          <p>
            {searchQuery 
              ? 'Try adjusting your search or filter criteria'
              : 'Start building your family\'s knowledge vault by uploading files'
            }
          </p>
        </div>
      )}
    </div>
  );
};