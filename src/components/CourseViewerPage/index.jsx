import React from 'react';

const CourseViewerPage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>My First Bitcoin</h1>
      <div style={{ marginTop: '20px' }}>
        <h2>Chapter 1: Introduction</h2>
        <p>Welcome to My First Bitcoin! This course will guide you through the basics of Bitcoin.</p>
        <p>Bitcoin is a decentralized digital currency, without a central bank or single administrator, that can be sent from user to user on the peer-to-peer bitcoin network without the need for intermediaries.</p>
        
        <h3>What is Money?</h3>
        <p>To understand Bitcoin, it's helpful to first understand money. Money is a medium of exchange, a unit of account, and a store of value.</p>
        {/* More static content can be added here */}
      </div>
    </div>
  );
};

export default CourseViewerPage;
