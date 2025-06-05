import React, { useState, useEffect } from 'react';
import { MentorMarketplace } from '../lib/mentor-marketplace';
import { MentorProfileManager } from '../lib/mentor-profile-manager';
import { MentorService, MentorProfile } from '../lib/types/mentor-marketplace-types';
import '../styles/mentor-marketplace.css';

// Type assertion for window object to avoid TypeScript errors
declare const window: Window & {
  nostrClient?: any;
  userKeys?: {
    publicKey: string;
    privateKey?: string;
  };
  payInvoice?: (invoice: string) => Promise<void>;
};

export const MentorMarketplaceComponent: React.FC = () => {
  const [mentorServices, setMentorServices] = useState<MentorService[]>([]);
  const [mentorProfiles, setMentorProfiles] = useState<Map<string, MentorProfile>>(new Map());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Create a properly typed user keys object with default values if window.userKeys is undefined
  const userKeys = {
    publicKey: window.userKeys?.publicKey || '',
    privateKey: window.userKeys?.privateKey || ''  // Provide empty string as fallback
  };

  const marketplace = new MentorMarketplace(window.nostrClient, userKeys);
  const profileManager = new MentorProfileManager(window.nostrClient, userKeys);

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    setLoading(true);
    try {
      // Load mentor services
      const services = await marketplace.getMentorServices();
      setMentorServices(services);

      // Load mentor profiles
      const profiles = await profileManager.getMentorProfiles();
      const profileMap = new Map();
      profiles.forEach(profile => {
        profileMap.set(profile.pubkey, profile);
      });
      setMentorProfiles(profileMap);
    } catch (error) {
      console.error('Failed to load marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = mentorServices.filter(service => {
    const matchesCategory = selectedCategory === 'all' || 
      service.categories.includes(selectedCategory);
    const matchesSearch = !searchQuery || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const handleBookSession = async (service: MentorService) => {
    // Integration with your existing payment system
    try {
      const invoice = await createMentorInvoice({
        serviceId: service.id,
        amount: service.price,
        description: `Mentor Session: ${service.name}`,
        mentorPubkey: service.mentorPubkey
      });
      // Process payment (integrate with your NWC implementation)
      if (window.payInvoice) {
        await window.payInvoice(invoice);
        alert('Session booked successfully! You will receive booking details shortly.');
      } else {
        throw new Error('Payment method not available');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert('Booking failed: ' + errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="mentor-marketplace-loading">
        <div className="spinner"></div>
        <p>Loading Mentor Marketplace...</p>
      </div>
    );
  }

  return (
    <div className="mentor-marketplace">
      <div className="marketplace-header">
        <h2>🎓 Mentor Marketplace</h2>
        <p>Connect with expert Bitcoin mentors for personalized guidance</p>
      </div>

      <div className="marketplace-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search mentors and services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="category-filter">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="bitcoin-basics">Bitcoin Basics</option>
            <option value="lightning">Lightning Network</option>
            <option value="security">Security & Privacy</option>
            <option value="trading">Trading & Investment</option>
            <option value="development">Development</option>
            <option value="family-planning">Family Planning</option>
          </select>
        </div>
      </div>

      <div className="services-grid">
        {filteredServices.map(service => {
          const mentorProfile = mentorProfiles.get(service.mentorPubkey);
          
          return (
            <div key={service.id} className="service-card">
              <div className="service-header">
                <h3>{service.name}</h3>
                <div className="price">
                  {service.price.toLocaleString()} sats
                  {service.duration && <span className="duration">/{service.duration}min</span>}
                </div>
              </div>
              <div className="mentor-info">
                {mentorProfile && (
                  <>
                    <div className="mentor-name">
                      👨‍🏫 {mentorProfile.name}
                    </div>
                    <div className="mentor-rating">
                      ⭐ {mentorProfile.rating.toFixed(1)} ({mentorProfile.totalSessions} sessions)
                    </div>
                    <div className="mentor-specialties">
                      {mentorProfile.specialties.slice(0, 3).map(specialty => (
                        <span key={specialty} className="specialty-tag">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="service-description">
                {service.description}
              </div>
              <div className="service-details">
                {service.availability && (
                  <div className="availability">
                    📅 {service.availability}
                  </div>
                )}
                {mentorProfile?.timezone && (
                  <div className="timezone">
                    🌍 {mentorProfile.timezone}
                  </div>
                )}
              </div>
              <div className="service-categories">
                {service.categories.map(category => (
                  <span key={category} className="category-tag">
                    {category}
                  </span>
                ))}
              </div>
              <button 
                onClick={() => handleBookSession(service)}
                className="book-session-btn"
              >
                ⚡ Book Session
              </button>
            </div>
          );
        })}
      </div>
      {filteredServices.length === 0 && (
        <div className="no-services">
          <div className="no-services-icon">🎓</div>
          <h3>No mentors found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

// Helper function for creating mentor invoices
async function createMentorInvoice(params: {
  serviceId: string;
  amount: number;
  description: string;
  mentorPubkey: string;
}): Promise<string> {
  // Integrate with your existing invoice creation system
  const response = await fetch('/api/mentor/create-invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await response.json();
  return data.payment_request;
}