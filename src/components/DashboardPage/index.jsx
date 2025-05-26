import React from 'react';

const DashboardPage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>User Dashboard</h1>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Completed Courses</h2>
        {/* Placeholder for completed courses */}
        <ul>
          <li>My First Bitcoin - Chapter 1: Introduction</li>
          <li>Understanding Digital Scarcity</li>
        </ul>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>My Badges</h2>
        {/* Placeholder for badges */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', width: '100px', textAlign: 'center' }}>
            <strong>Bitcoin Beginner</strong>
            <p><small>Completed MFB Ch1</small></p>
          </div>
          <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', width: '100px', textAlign: 'center' }}>
            <strong>Nostr Explorer</strong>
            <p><small>Joined the network</small></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
