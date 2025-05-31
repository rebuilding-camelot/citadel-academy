import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import './citadel-theme.css';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { initialize, showAliasMenuMobile, windowResize, handleNostrPublish, openReplyModal } from './actions';
import { NAV_HEIGHT, COLORS } from './constants';
import { transition } from './helpers';

import ShadcnDemo from './components/ShadcnDemo';

import CommunityForks from './components/Nostr/CommunityForks';
import CommunityList from './components/Nostr/CommunityList';
import ComingSoon from './components/Nostr/ComingSoon';
import MediaHosting from './components/MediaHosting';
import PublicationsNav from './components/DirectoryPage/PublicationsNav';
import FrontPageFeed from './components/Nostr/FrontPageFeed';
import PostFeed from './components/Nostr/PostFeed';
import ProfileFeed from './components/Nostr/ProfileFeed';
import MobileEditor from './components/Nostr/MobileEditor';
import NewPostModal from './components/Nostr/NewPostModal';
import ZapRequest from './components/Nostr/ZapRequest';
import AliasMenuMobile from './components/Nav/AliasMenuMobile';
import LoadingText from './components/common/LoadingText';
import CommunityPage from './components/CommunityPage';
import DirectoryPage from './components/DirectoryPage';
import EpochsPage from './components/EpochsPage';
import SidePanel from './components/SidePanel';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import QRDisplay from './components/QRDisplay';
import MobileNav from './components/MobileNav';
import Nav from './components/Nav';
import CourseViewerPage from './components/CourseViewerPage';
import CoursePage from './components/CourseViewerPage/CoursePage';
import CourseModule from './components/CourseModule';
import CourseLesson from './components/CourseLesson';
import LessonCreator from './components/LessonCreator';
import BadgeGallery from './components/BadgeGallery';
import BadgeCreator from './components/BadgeCreator';
import BadgeAwarder from './components/BadgeAwarder';
import UserBadges from './components/UserBadges';
import DashboardPage from './components/DashboardPage';
import Dashboard from './components/Dashboard';
import AboutPage from './components/AboutPage';
import SupportPage from './components/SupportPage';
import MembersOnlyPage from './components/MembersOnlyPage';
import NostrWalletConnectPage from './components/NostrWalletConnectPage';
import Footer from './components/Footer';


class App extends Component {
  componentDidMount = async () => {
    this.props.initialize(this.props.store);
    window.addEventListener('resize', this.onWindowResize);
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.onWindowResize);
  };

  onWindowResize = () => {
    this.props.windowResize();
  };

  handleNostrPublish = (post, replyTo) => {

    return handleNostrPublish(post, replyTo, [
      this.props.mobileEditor.feed
    ]);
  }

  renderContent = () => {

    const { mobile, routeComponents } = this.props;
    const r = routeComponents[0];

    if (!(r === 'thread' || r === '')) {
      return null;
    }

    if (!this.props.main) { return null; }

    if (r === 'thread') {
      return mobile ? <PostFeed /> : <DirectoryPage />;
    }

    return mobile ? (
      <div>
        <PublicationsNav hidden={r === 'thread'} onSelectSort={() => { return; }} />
        {this.props.mobileNavMode === 'network' ? <FrontPageFeed hidden={r === 'thread'} style={{ paddingTop: 60 }} /> : (
          <div style={{
            paddingTop: 72,
            paddingRight: 12,
            paddingLeft: 12
          }}>
            <CommunityList
              requireImage
              requireSubscribed={this.props.communitiesNavMode === 'subscribed'}
              // filter={this.props.communitiesNavMode === 'subscribed' ? (item) => {
              //   return this.props.followingList[`34550:${item.event.pubkey}:${item.name}`]
              // } : null}
            />
          </div>
        )}
      </div>
    ) : <DirectoryPage />;
  };

  renderMobileDimmer = () => {
    return (
      <div
        style={styles.mobileDimmer(this.props.mobileDimmer)}
        onClick={() => this.props.showAliasMenuMobile(false)}
      />
    );
  };

  render = () => {

    const { mobile, initialized, minHeight } = this.props;

    if (!initialized) {
      return <LoadingText style={styles.loadingText} />;
    }

    return (
      <div id="app-container" style={{
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        backgroundColor: 'var(--citadel-light-purple)',
        color: 'var(--citadel-text)',
        backgroundImage: 'none',
        background: 'var(--citadel-light-purple)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'relative'
      }}>
        {mobile ? null : <div id='media_graph' style={{ zIndex: 1, position: 'absolute', left: '50%', transform: `translate(-50%, ${NAV_HEIGHT * -1}px)`, visibility: 'hidden' }} />}
        {this.props.zapRequest ? <ZapRequest /> : null}
        <Switch>
          <Route path='/' component={Nav} />
        </Switch>
        
        <div style={{
          paddingTop: NAV_HEIGHT,
          pointerEvents: this.props.mobileEditor.open ? 'none' : 'auto',
          opacity: this.props.mobileEditor.open ? 0 : 1
        }}>
          <Route exact path='/epochs' component={EpochsPage} />
          {this.renderContent()}
          <Switch>
            <Route exact path='/register' component={SignUp} />
            <Route path='/register/:mode' component={SignUp} />
          </Switch>
          <Switch>
            <Route path='/n/:name/:founder/:note' component={CommunityPage} />
            <Route path='/n/:name/:founder' component={CommunityPage} />
            <Route path='/n/:name' component={CommunityForks} />
          </Switch>
          <Route exact path='/auth' component={SignIn} />
          <Route path='/auth/:mode' component={SignIn} />
          <Route path='/@:alias' component={ProfileFeed} />
        </div>
        <Route exact path='/courses' component={CourseViewerPage} />
        <Route exact path='/courses/:courseId' component={CoursePage} />
        <Route exact path='/courses/:courseId/module' component={CourseModule} />
        <Route exact path='/courses/:courseId/lessons/:lessonId' component={CourseLesson} />
        <Route exact path='/courses/:courseId/create-lesson' component={LessonCreator} />
        <Route exact path='/courses/:courseId/badges' component={BadgeGallery} />
        <Route exact path='/courses/:courseId/create-badge' component={BadgeCreator} />
        <Route exact path='/courses/:courseId/award-badge' component={BadgeAwarder} />
        <Route exact path='/dashboard' component={DashboardPage} />
        <Route exact path='/dashboard/courses' component={DashboardPage} />
        <Route exact path='/dashboard/family-progress' component={DashboardPage} />
        <Route exact path='/dashboard/achievements' component={DashboardPage} />
        <Route exact path='/dashboard/wallet' component={DashboardPage} />
        <Route exact path='/dashboard/settings' component={DashboardPage} />
        <Route exact path='/dashboard/add-family' component={DashboardPage} />
        <Route exact path='/dashboard/create-course' component={DashboardPage} />
        <Route exact path='/new-dashboard' component={Dashboard} />
        <Route exact path='/badges' component={BadgeGallery} />
        <Route exact path='/create-badge' component={BadgeCreator} />
        <Route exact path='/award-badge' component={BadgeAwarder} />
        <Route exact path='/my-badges' component={UserBadges} />
        <Route exact path='/user/:pubkey/badges' component={UserBadges} />
        <Route exact path='/cdn' component={MediaHosting} />
        <Route exact path='/verify' component={ComingSoon} />
        <Route exact path='/theory' component={ComingSoon} />
        <Route exact path='/ln' component={ComingSoon} />
        <Route exact path='/ui' component={ShadcnDemo} />
        <Route exact path='/about' component={AboutPage} />
        <Route exact path='/support' component={SupportPage} />
        <Route exact path='/members' component={MembersOnlyPage} />
        <Route exact path='/privacy' component={AboutPage} />
        <Route exact path='/terms' component={AboutPage} />
        <Route exact path='/contact' component={SupportPage} />
        <Route exact path='/wallet-connect' component={NostrWalletConnectPage} />
        {mobile ? <AliasMenuMobile /> : null}
        {this.props.sidePanelSection ? <SidePanel /> : null}
        {this.props.displayQR ? <QRDisplay /> : null}
        {this.renderMobileDimmer()}
        <MobileEditor
          metadata={this.props.metadata}
          clientHeight={this.props.clientHeight}
          clientWidth={this.props.clientWidth}
          innerHeight={this.props.innerHeight}
          onCancel={() => this.props.openReplyModal(null)}
          onResolve={() => this.props.openReplyModal(null)}
          handlePost={this.handleNostrPublish}
          {...this.props.mobileEditor}
        />
        <NewPostModal />
        {mobile ? <MobileNav /> : null}
        <Footer />
      </div>
    );
  };
}

const mapState = ({ app, menu, nostr, communities }) => {

  return {
    ...app,
    mode: nostr.mode,
    zapRequest: nostr.zapRequest,
    metadata: nostr.metadata || {},
    main: nostr.main,
    sidePanelSection: menu.topMode,
    routeComponents: app.routeComponents || [],
    mobileEditor: nostr.mobileEditor || {},
    mobileNavMode: app.mobileNavMode,
    communitiesNavMode: communities.navMode
  };
};

const styles = {

  mobileDimmer: (active) => {
    return {
      //position: 'absolute',
      position: 'fixed',
      background: 'rgba(0,0,0,0.85)',
      height: '100%',
      width: '100%',
      pointerEvents: active ? 'visible' : 'none',
      opacity: active ? 1 : 0,
      top: 0,
      left: 0,
      zIndex: 1112,
      ...transition(0.2, 'ease', [ 'opacity' ])
    };
  },

  loadingText: {
    transform: 'translate(-50%, -50%)',
    position: 'absolute',
    top: '50%',
    left: '50%'
  }
};

export default connect(mapState, { initialize, showAliasMenuMobile, windowResize, openReplyModal })(App);

