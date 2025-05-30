import React, { Component } from 'react';
import { Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { setMobileNavMode, navigate, viewSidePanel, showAliasMenuMobile, loadActiveNostr, setLocalPublicKey } from '../../actions';
import { COLORS } from '../../constants';
import svgcommunities from '../../assets/communities.svg';
import svgcommunitiesoutline from '../../assets/communities-outline.svg';


class MobileNav extends Component {

	handleAuthActionFallback = async () => {

		if (window.nostr) {

			let pubkey;

			try {

				pubkey = await window.nostr.getPublicKey();

			} catch (err) {}

			if (!pubkey) { return; }

			setLocalPublicKey(pubkey);

			this.props.loadActiveNostr();

			return true;

		} else {

			this.props.navigate('/register');
		}
	};

	handleMenuSelect = async (selected) => {

		let connected;

		if (selected === 'home') {

			this.props.setMobileNavMode('network');
			//window.history.back();
			this.props.navigate('/');

		} else if (selected === 'communities') {

			this.props.setMobileNavMode('communities');
			//window.history.back();
			this.props.navigate('/');

		} else if (selected === 'learn') {
			
			this.props.navigate('/courses');
			
		} else if (selected === 'dashboard') {
			
			if (!this.props.pubkey) {
				connected = await this.handleAuthActionFallback();
				if (!connected) {
					return;
				}
			}
			
			this.props.navigate('/dashboard');
			
		} else if (selected === 'conversations') {

			if (!this.props.pubkey) {

				connected = await this.handleAuthActionFallback();

				if (connected) {
					
					setTimeout(() => {
						this.props.viewSidePanel('notifications');
					}, 1000);

					return;

				} else {
					return;
				}
			}

			this.props.viewSidePanel('notifications');

		} else if (selected === 'messages') {

			if (!this.props.pubkey) {

				connected = await this.handleAuthActionFallback();

				if (!connected) {
					return;
				}
			}

			this.props.viewSidePanel('dm');

		} else if (selected === 'menu') {

			if (!this.props.pubkey) {

				connected = await this.handleAuthActionFallback();

				if (!connected) {
					return;
				}
			}

			this.props.showAliasMenuMobile(true);
		}
	};

	render = () => {

		const { route, mobileNavMode } = this.props;

		if (route === '/auth' || route === 'register') { return null; }

		return (
			<div
				style={{
					position: 'fixed',
					bottom: -1,
					height: 52,
					borderTop: `1px solid ${COLORS.secondary}`,
					width: this.props.clientWidth,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-evenly',
					WebkitBackdropFilter: 'blur(12px)',
					backdropFilter: 'blur(12px)',
					background: '#2a0066', /* Changed to dark purple to match header */
					color: 'white !important'
				}}
			>
				<div
					onClick={() => this.handleMenuSelect('home')}
					style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
				>
					<Icon
						name={route === '/' && mobileNavMode === 'network' ? 'home' : 'home'}
						style={{
							marginRight: 0,
							fontSize: 20,
							color: route === '/' ? '#ffa500' : '#fff'
						}}
					/>
					<span style={{ fontSize: 10, marginTop: 2, color: route === '/' ? '#ffa500' : '#fff' }}>Home</span>
				</div>
				
				<div
					onClick={() => this.handleMenuSelect('learn')}
					style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
				>
					<Icon
						name='book'
						style={{
							marginRight: 0,
							fontSize: 20,
							color: route === '/courses' ? '#ffa500' : '#fff'
						}}
					/>
					<span style={{ fontSize: 10, marginTop: 2, color: route === '/courses' ? '#ffa500' : '#fff' }}>Learn</span>
				</div>
				
				<div
					onClick={() => this.handleMenuSelect('dashboard')}
					style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
				>
					<Icon
						name='user'
						style={{
							marginRight: 0,
							fontSize: 20,
							color: route === '/dashboard' ? '#ffa500' : '#fff'
						}}
					/>
					<span style={{ fontSize: 10, marginTop: 2, color: route === '/dashboard' ? '#ffa500' : '#fff' }}>My Academy</span>
				</div>
				
				<div
					onClick={() => this.handleMenuSelect('communities')}
					style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
				>
					<Icon
						name='users'
						style={{
							marginRight: 0,
							fontSize: 20,
							color: (route === '/' && mobileNavMode === 'communities') ? '#ffa500' : '#fff'
						}}
					/>
					<span style={{ 
						fontSize: 10, 
						marginTop: 2, 
						color: (route === '/' && mobileNavMode === 'communities') ? '#ffa500' : '#fff' 
					}}>Communities</span>
				</div>
				
				<div
					onClick={() => this.handleMenuSelect('menu')}
					style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
				>
					<Icon
						name='bars'
						style={{
							marginRight: 0,
							fontSize: 20,
							color: '#fff'
						}}
					/>
					<span style={{ fontSize: 10, marginTop: 2, color: '#fff' }}>Menu</span>
				</div>
			</div>
		);
	};
}

const mapState = ({ app, nostr }) => {

	return {
		mobileNavMode: app.mobileNavMode,
		clientWidth: app.clientWidth,
		route: app.route,
		pubkey: nostr.pubkey
		//topMode: menu.topMode
	};
};

export default connect(mapState, { setMobileNavMode, navigate, viewSidePanel, showAliasMenuMobile, loadActiveNostr })(MobileNav);
