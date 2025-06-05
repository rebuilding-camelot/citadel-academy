// Component: components/AcademyStore.tsx
import React, { useState, useEffect } from 'react';
import { Event } from 'nostr-tools';
import { fetchBookListings } from '../lib/marketplace';
import { useNostrWalletConnect } from '../hooks/useNostrWalletConnect';
import { nostrClient } from '../lib/nostr-helpers';
import { purchaseMarketplaceItem } from '../lib/marketplace-payments';
import { trackFileInteraction, getStudentProgress } from '../lib/progress';
import { fetchPurchaseOrders } from '../lib/marketplace';
import { fetchLibraryFiles } from '../lib/library';
import { useCitadelEventManager } from '../hooks/useCitadelEventManager';
import { MentorMarketplaceComponent } from './MentorMarketplace';
import '../styles/academy-store.css';
import '../styles/academystore-library.css';
import '../styles/unified-bookstore.css';

// Helper function to query relays (wrapper around actual implementation)
async function queryRelays(filters: any[]): Promise<Event[]> {
  // This is a wrapper around the actual implementation
  // Using the first filter for simplicity
  if (filters[0].kinds && filters[0].kinds.includes(30017)) {
    // For marketplace listings
    return await fetchBookListings();
  } else if (filters[0].kinds && filters[0].kinds.includes(30078)) {
    // For progress data - placeholder implementation
    return [];
  } else {
    // For library files
    return await fetchLibraryFiles(
      filters[0]['#category']?.[0],
      filters[0].limit
    );
  }
}

function AcademyStore() {
  const [books, setBooks] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('marketplace');
  const [userProgress, setUserProgress] = useState<Map<string, number>>(new Map());
  const [purchaseHistory, setPurchaseHistory] = useState<string[]>([]);
  const [mainView, setMainView] = useState<'books' | 'mentors'>('books');
  const { connected, payInvoice, walletPubkey } = useNostrWalletConnect();
  const { purchaseProduct, loading: eventManagerLoading, error: eventManagerError } = useCitadelEventManager();

  useEffect(() => {
    loadAcademystoreData();
    if (connected && walletPubkey) {
      loadUserProgress();
    }
  }, [activeTab, connected, walletPubkey]);

  const loadAcademystoreData = async () => {
    setLoading(true);
    try {
      // Fetch NIP-15 marketplace listings
      const marketplaceFilter = {
        kinds: [30017],
        '#category': ['textbook', 'reference', 'course'],
        limit: 50
      };
      
      const marketplaceEvents = await queryRelays([marketplaceFilter]);
      setBooks(marketplaceEvents);
    } catch (error) {
      console.error('Error loading marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    if (!connected || !walletPubkey) return;

    try {
      // Fetch NIP-78 progress data
      const progressFilter = {
        kinds: [30078],
        authors: [walletPubkey],
        '#d': ['enhanced-progress-']
      };
      
      const progressEvents = await queryRelays([progressFilter]);
      const progressMap = new Map();
      
      progressEvents.forEach(event => {
        const courseId = event.tags.find(tag => tag[0] === 'course')?.[1];
        const progress = event.tags.find(tag => tag[0] === 'progress')?.[1];
        const purchases = event.tags.filter(tag => tag[0] === 'purchase').map(tag => tag[1]);
        
        if (courseId && progress) {
          progressMap.set(courseId, parseInt(progress));
          setPurchaseHistory(prev => [...new Set([...prev, ...purchases])]);
        }
      });
      
      setUserProgress(progressMap);

      // Also fetch purchase history
      const orders = await fetchPurchaseOrders(walletPubkey);
      const purchasedIds = orders.map(order => 
        order.tags.find(tag => tag[0] === 'e')?.[1]
      ).filter(Boolean) as string[];
      
      setPurchaseHistory(prev => [...new Set([...prev, ...purchasedIds])]);
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const purchaseBook = async (bookEvent: Event) => {
    if (!connected || !walletPubkey) {
      alert('Please connect your Nostr wallet first');
      return;
    }

    try {
      // Use the unified event manager for purchase flow
      await purchaseProduct(bookEvent, 'lightning');
      
      // Refresh user progress data
      await loadUserProgress();
      
      alert('Purchase successful! Check your library.');
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed: ' + (error as Error).message);
    }
  };

  const openFile = async (bookEvent: Event) => {
    if (!connected || !walletPubkey) return;

    // Check if user has purchased this item
    const hasPurchased = purchaseHistory.includes(bookEvent.id);
    const accessLevel = bookEvent.tags.find(tag => tag[0] === 'access')?.[1];
    
    if (accessLevel === 'premium' && !hasPurchased) {
      alert('Purchase required to access this content');
      return;
    }
    // Get file URL from NIP-94 metadata
    const fileUrl = bookEvent.tags.find(tag => tag[0] === 'url')?.[1];
    if (fileUrl) {
      window.open(fileUrl, '_blank');
      
      // Track interaction using enhanced NIP-78
      await trackFileInteraction(
        bookEvent,
        'view',
        walletPubkey
      );

      // Update local progress state
      const currentProgress = userProgress.get(bookEvent.id) || 0;
      const newProgress = Math.min(currentProgress + 5, 100);
      setUserProgress(prev => new Map(prev.set(bookEvent.id, newProgress)));
    }
  };

  if (loading) {
    return <div className="loading">Loading books...</div>;
  }

  return (
    <div className="academy-store">
      <div className="store-header">
        <h1>🏪 Citadel Academy Store</h1>
        <p>Books, courses, and expert mentorship for your Bitcoin journey</p>
      </div>
      
      <div className="store-navigation">
        <button 
          className={`store-tab ${mainView === 'books' ? 'active' : ''}`}
          onClick={() => setMainView('books')}
        >
          📚 Books & Courses
        </button>
        <button 
          className={`store-tab ${mainView === 'mentors' ? 'active' : ''}`}
          onClick={() => setMainView('mentors')}
        >
          🎓 Mentor Sessions
        </button>
      </div>

      <div className="store-content">
        {mainView === 'mentors' ? (
          <MentorMarketplaceComponent />
        ) : (
          <>
            <div className="store-tabs">
              <button 
                className={activeTab === 'marketplace' ? 'active' : ''} 
                onClick={() => setActiveTab('marketplace')}
              >
                Marketplace
              </button>
              <button 
                className={activeTab === 'library' ? 'active' : ''} 
                onClick={() => setActiveTab('library')}
              >
                My Library
              </button>
              <button 
                className={activeTab === 'progress' ? 'active' : ''} 
                onClick={() => setActiveTab('progress')}
              >
                Progress
              </button>
            </div>

            {!connected && (
              <div className="connect-wallet-message">
                Please connect your Nostr wallet to access all features
              </div>
            )}
            
            <div className="book-grid">
              {books.map(book => {
            const title = book.tags.find(tag => tag[0] === 'title')?.[1];
            const price = book.tags.find(tag => tag[0] === 'price')?.[1];
            const author = book.tags.find(tag => tag[0] === 'author')?.[1];
            const image = book.tags.find(tag => tag[0] === 'image')?.[1];
            const accessLevel = book.tags.find(tag => tag[0] === 'access')?.[1];
            
            const progress = userProgress.get(book.id) || 0;
            const isPurchased = purchaseHistory.includes(book.id);
            const isFree = accessLevel === 'free' || parseInt(price || '0') === 0;
            
            // Only show purchased items in library tab
            if (activeTab === 'library' && !isPurchased && !isFree) {
              return null;
            }

            // Only show items with progress in progress tab
            if (activeTab === 'progress' && progress === 0) {
              return null;
            }
            
            return (
              <div key={book.id} className="book-card">
                {isPurchased && <div className="purchased-indicator">Purchased</div>}
                <img src={image} alt={title} className="book-cover" />
                <h3>{title}</h3>
                <p>by {author}</p>
                
                {activeTab !== 'marketplace' && progress > 0 && (
                  <div className="progress-indicator">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span>{progress}% complete</span>
                  </div>
                )}
                
                {activeTab === 'marketplace' && (
                  <p className="price">{parseInt(price || '0').toLocaleString()} sats</p>
                )}
                
                <div className="book-actions">
                  {isFree || isPurchased ? (
                    <button 
                      onClick={() => openFile(book)}
                      className="access-btn"
                    >
                      📖 {isPurchased ? 'Read' : 'Access'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => purchaseBook(book)}
                      className="purchase-btn"
                      disabled={!connected}
                    >
                      ⚡ Buy Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {activeTab === 'library' && purchaseHistory.length === 0 && (
            <div className="empty-state">
              <p>Your library is empty. Purchase books from the marketplace to see them here.</p>
            </div>
          )}

          {activeTab === 'progress' && ![...userProgress.values()].some(progress => progress > 0) && (
            <div className="empty-state">
              <p>No progress data available. Start reading books to track your progress.</p>
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}

export { AcademyStore };
export default AcademyStore;