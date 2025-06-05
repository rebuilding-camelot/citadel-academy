// Component: components/LivingryLibrary.tsx
import React, { useState, useEffect } from 'react';
import { Event } from 'nostr-tools';
import { fetchLibraryFiles } from '../lib/library';
import { getStudentProgress, trackFileInteraction, LibraryInteraction } from '../lib/progress';
import { fetchPurchaseOrders } from '../lib/marketplace';
import './LivingryLibrary.css';
import '../styles/academystore-library.css';

// Helper function to query relays (placeholder for actual implementation)
async function queryRelays(filters: any[]): Promise<Event[]> {
  // This is a wrapper around the actual implementation
  // Using the first filter for simplicity
  return await fetchLibraryFiles(
    filters[0]['#category']?.[0],
    filters[0].limit
  );
}

// Helper function to publish an event (placeholder for actual implementation)
async function publishEvent(event: Event): Promise<void> {
  // In a real implementation, this would use the user's private key
  // For now, we're just logging the event
  console.log('Publishing event:', event);
  // Actual implementation would call nostrClient.publishEvent(event)
}

// Helper function to check if user has premium access
function userHasPremiumAccess(): boolean {
  // Implement your premium access check
  return true; // Placeholder
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function LivingryLibrary() {
  const [libraryFiles, setLibraryFiles] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [readingProgress, setReadingProgress] = useState<Map<string, number>>(new Map());
  const [enhancedProgress, setEnhancedProgress] = useState<any>(null);
  const [purchasedItems, setPurchasedItems] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState('library');

  useEffect(() => {
    const fetchLibrary = async () => {
      // Get user's public key (this should be replaced with actual user's pubkey)
      const userPubkey = 'current-user-pubkey';
      
      // Fetch library files
      const filter = {
        kinds: [1063], // NIP-94 file metadata
        '#category': selectedCategory === 'all' ? undefined : [selectedCategory],
        limit: 100
      };
      
      const events = await queryRelays([filter]);
      setLibraryFiles(events);
      
      // Fetch enhanced progress data
      try {
        const progressData = await getStudentProgress(userPubkey, 'library');
        setEnhancedProgress(progressData);
        
        // Convert to the old progress map format for backward compatibility
        const progressMap = new Map();
        progressData.filesAccessed.forEach(fileId => {
          // Find the most recent interaction for this file
          const interactions = progressData.libraryInteractions
            .filter((i: LibraryInteraction) => i.fileEventId === fileId)
            .sort((a: LibraryInteraction, b: LibraryInteraction) => 
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          if (interactions.length > 0) {
            progressMap.set(fileId, interactions[0].progress || 50); // Default to 50% if no progress specified
          }
        });
        setReadingProgress(progressMap);
      } catch (error) {
        console.error('Error fetching enhanced progress:', error);
      }
      
      // Fetch purchase orders
      try {
        const orders = await fetchPurchaseOrders(userPubkey);
        setPurchasedItems(orders);
      } catch (error) {
        console.error('Error fetching purchase orders:', error);
      }
    };
    
    fetchLibrary();
  }, [selectedCategory, activeTab]);

  const filteredFiles = libraryFiles.filter(file => {
    const title = file.tags.find(tag => tag[0] === 'title')?.[1] || '';
    const author = file.tags.find(tag => tag[0] === 'author')?.[1] || '';
    return title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           author.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const openFile = async (file: Event) => {
    const url = file.tags.find(tag => tag[0] === 'url')?.[1];
    const accessLevel = file.tags.find(tag => tag[0] === 'access')?.[1];
    
    // Check access permissions
    if (accessLevel === 'premium' && !userHasPremiumAccess()) {
      alert('Premium access required');
      return;
    }
    
    if (url) {
      window.open(url, '_blank');
      
      // Track file interaction using enhanced progress tracking
      try {
        const currentProgress = readingProgress.get(file.id) || 0;
        const newProgress = Math.min(currentProgress + 5, 100);
        
        await trackFileInteraction(
          file,
          'view',
          'current-user-pubkey', // This should be replaced with actual user's pubkey
          0, // Duration starts at 0
          newProgress // Pass the progress percentage
        );
        
        // Update local state
        setReadingProgress(prev => new Map(prev.set(file.id, newProgress)));
        
        // Update enhanced progress state
        if (enhancedProgress) {
          const updatedProgress = {
            ...enhancedProgress,
            filesAccessed: [...new Set([...enhancedProgress.filesAccessed, file.id])],
            libraryInteractions: [
              ...enhancedProgress.libraryInteractions,
              {
                fileEventId: file.id,
                interactionType: 'view',
                timestamp: new Date(),
                progress: newProgress
              }
            ]
          };
          setEnhancedProgress(updatedProgress);
        }
      } catch (error) {
        console.error('Error tracking file interaction:', error);
      }
    }
  };
  
  const downloadFile = async (file: Event) => {
    const url = file.tags.find(tag => tag[0] === 'url')?.[1];
    const accessLevel = file.tags.find(tag => tag[0] === 'access')?.[1];
    
    // Check access permissions
    if (accessLevel === 'premium' && !userHasPremiumAccess()) {
      alert('Premium access required');
      return;
    }
    
    if (url) {
      window.open(url, '_blank');
      
      // Track download interaction
      try {
        await trackFileInteraction(
          file,
          'download',
          'current-user-pubkey' // This should be replaced with actual user's pubkey
        );
        
        // Update enhanced progress state
        if (enhancedProgress) {
          const updatedProgress = {
            ...enhancedProgress,
            filesAccessed: [...new Set([...enhancedProgress.filesAccessed, file.id])],
            libraryInteractions: [
              ...enhancedProgress.libraryInteractions,
              {
                fileEventId: file.id,
                interactionType: 'download',
                timestamp: new Date()
              }
            ]
          };
          setEnhancedProgress(updatedProgress);
        }
      } catch (error) {
        console.error('Error tracking download:', error);
      }
    }
  };

  return (
    <div className="livingry-library">
      <h1>📖 Livingry Library</h1>
      <p>Buckminster Fuller's concept of "livingry" - technology that supports life</p>
      
      <div className="library-tabs">
        <button 
          className={activeTab === 'library' ? 'active' : ''} 
          onClick={() => setActiveTab('library')}
        >
          Library
        </button>
        <button 
          className={activeTab === 'purchases' ? 'active' : ''} 
          onClick={() => setActiveTab('purchases')}
        >
          Purchases
        </button>
        <button 
          className={activeTab === 'activity' ? 'active' : ''} 
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
      </div>
      
      {activeTab === 'library' && (
        <>
          <div className="library-controls">
            <input
              type="text"
              placeholder="Search books, papers, courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
            >
              <option value="all">All Categories</option>
              <option value="book">Books</option>
              <option value="paper">Research Papers</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="course">Courses</option>
            </select>
          </div>
          <div className="library-grid">
            {filteredFiles.map(file => {
              const title = file.tags.find(tag => tag[0] === 'title')?.[1];
              const author = file.tags.find(tag => tag[0] === 'author')?.[1];
              const category = file.tags.find(tag => tag[0] === 'category')?.[1];
              const size = file.tags.find(tag => tag[0] === 'size')?.[1];
              const progress = readingProgress.get(file.id) || 0;
              
              return (
                <div key={file.id} className="library-item">
                  <div className="file-icon">
                    {category === 'book' && '📚'}
                    {category === 'paper' && '📄'}
                    {category === 'video' && '🎥'}
                    {category === 'audio' && '🎧'}
                    {category === 'course' && '🎓'}
                  </div>
                  
                  <div className="file-info">
                    <h3>{title}</h3>
                    <p>by {author}</p>
                    <p className="file-size">{formatFileSize(parseInt(size || '0'))}</p>
                    
                    {progress > 0 && (
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${progress}%` }}
                        />
                        <span>{progress}% complete</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="file-actions">
                    <button 
                      onClick={() => openFile(file)}
                      className="open-file-btn"
                    >
                      📖 Read
                    </button>
                    <button 
                      onClick={() => downloadFile(file)}
                      className="download-btn"
                    >
                      ⬇️ Download
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      
      {activeTab === 'purchases' && (
        <div className="purchases-container">
          <h2>Your Purchases</h2>
          {purchasedItems.length === 0 ? (
            <p>You haven't made any purchases yet.</p>
          ) : (
            <div className="purchases-grid">
              {purchasedItems.map(order => {
                // Get the product ID from the order
                const productId = order.tags.find(tag => tag[0] === 'e')?.[1];
                
                // Check if this product has been accessed
                const hasAccessed = enhancedProgress?.filesAccessed?.includes(productId);
                
                return (
                  <div key={order.id} className="purchase-item">
                    <div className="purchase-header">
                      <h3>{order.tags.find(tag => tag[0] === 'title')?.[1] || 'Untitled Product'}</h3>
                      <span className="purchase-date">
                        Purchased: {new Date(order.created_at * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="purchase-actions">
                      <button 
                        onClick={() => openFile(order)}
                        className="view-btn"
                      >
                        👁️ View
                      </button>
                      <button 
                        onClick={() => downloadFile(order)}
                        className="download-btn"
                      >
                        ⬇️ Download
                      </button>
                    </div>
                    
                    {hasAccessed && (
                      <div className="access-indicator">
                        ✓ Accessed
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'activity' && (
        <div className="activity-container">
          <h2>Recent Activity</h2>
          {!enhancedProgress || enhancedProgress.libraryInteractions.length === 0 ? (
            <p>No activity recorded yet.</p>
          ) : (
            <ul className="activity-list">
              {enhancedProgress.libraryInteractions.slice().reverse().map((interaction: LibraryInteraction, index: number) => (
                <li key={index} className="activity-item">
                  <span className="activity-type">
                    {interaction.interactionType === 'download' ? '⬇️ Downloaded' : 
                     interaction.interactionType === 'view' ? '👁️ Viewed' : 
                     interaction.interactionType === 'bookmark' ? '🔖 Bookmarked' : 
                     '✏️ Highlighted'}
                  </span>
                  <span className="activity-file">
                    {interaction.fileEventId.substring(0, 8)}...
                  </span>
                  <span className="activity-time">
                    {new Date(interaction.timestamp).toLocaleString()}
                  </span>
                  {interaction.duration && (
                    <span className="activity-duration">
                      Duration: {Math.floor(interaction.duration / 60)}m {interaction.duration % 60}s
                    </span>
                  )}
                  {interaction.progress && (
                    <span className="activity-progress">
                      Progress: {interaction.progress}%
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}