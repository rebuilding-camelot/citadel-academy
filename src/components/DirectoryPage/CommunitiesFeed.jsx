import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import CommunityList from '../Nostr/CommunityList';
import HomePage from '../HomePage';


class CommunitiesFeed extends Component {

	render = () => {
		// Use the new HomePage component for the main route
		return (
			<div
				style={{
					paddingLeft: 0,
					paddingRight: 0,
					paddingTop: 0,
					width: '100%'
				}}
			>
				<HomePage />
				
				{/* Community list is now integrated into the HomePage component */}
				{/* 
				<CommunityList
					overflowContainer={this.props.overflowContainer}
					requireSubscribed={this.props.navMode === 'subscribed'}
				/>
				*/}
			</div>
		);
	};
}

const mapState = ({ app, communities }) => {
	return {
		clientWidth: app.clientWidth,
		navMode: communities.navMode,
		//followingList: communities.followingList
	};
};

export default connect(mapState)(CommunitiesFeed);
