import React from 'react';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const QuickActions = ({ mobile }) => {
  const quickActionStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: mobile ? 20 : 0,
    flexWrap: mobile ? 'wrap' : 'nowrap',
    gap: mobile ? 10 : 0
  };

  const actionButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'rgba(245, 158, 11, 0.2)',
    color: '#F59E0B',
    padding: '8px 16px',
    borderRadius: 6,
    marginLeft: mobile ? 0 : 12,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    textDecoration: 'none',
    fontSize: mobile ? 13 : 14,
    width: mobile ? 'calc(50% - 5px)' : 'auto',
    justifyContent: mobile ? 'center' : 'flex-start'
  };

  return (
    <div style={quickActionStyle}>
      <Link to="/dashboard/add-family" style={actionButtonStyle}>
        <Icon name="user plus" style={{ marginRight: 8 }} />
        <span>Add Family Member</span>
      </Link>
      
      <Link to="/dashboard/create-course" style={actionButtonStyle}>
        <Icon name="plus" style={{ marginRight: 8 }} />
        <span>Create Course</span>
      </Link>
      
      <Link to="/support" style={actionButtonStyle}>
        <Icon name="question circle" style={{ marginRight: 8 }} />
        <span>Help & Support</span>
      </Link>
    </div>
  );
};

export default QuickActions;