import { Relay } from 'nostr-tools';
import * as nip05 from 'nostr-tools/nip05';
import * as nip19 from 'nostr-tools/nip19';
import { getPublicKey, getEventHash, finalizeEvent } from 'nostr-tools/pure';

import Feed from './Feed';


class Client {

	constructor (env) {

		// Save reference to env interface (i.e. window)
		this.env = env;

		// Pool of connected relays
		this.relays = [];

		// Registered feeds
		this.subscriptions = {};
	}


	/* Core API */

	async disconnectFromRelay (params) {
		
		const url = params.url[params.url.length - 1] === '/' ? params.url.slice(0, -1) : params.url;

		// Prevent opening duplicate connection
		for (let _relay of this.relays) {

			if (_relay.url === url) {

				_relay.close();

				this.relays = this.relays.filter(item => {
					return url !== item.url;
				});

				if (this.relayStatusListener) {

					this.relayStatusListener({ url: params.url }, {
						close: true
					});
				}

				return;
			}
		}

	}

	/**
	 * Connect to a Nostr relay
	 * 
	 * This method handles connecting to a relay, with proper URL normalization
	 * to prevent duplicate connections and implements reconnection logic
	 * with exponential backoff.
	 * 
	 * @param {Object} params - Connection parameters
	 * @param {string} params.url - The relay URL to connect to
	 * @param {boolean} params.maintain - Whether to maintain the connection
	 * @returns {Promise<void>}
	 */
	async connectToRelay (params) {

		// Normalize URL by removing trailing slash for consistency
		const url = params.url[params.url.length - 1] === '/' ? params.url.slice(0, -1) : params.url;

		// Prevent opening duplicate connections by checking existing relays
		for (let _relay of this.relays) {
			// Normalize existing relay URL for accurate comparison
			const relayUrl = _relay.url[_relay.url.length - 1] === '/' ? _relay.url.slice(0, -1) : _relay.url;

			if (relayUrl === url) {
				// If already connected, just update the status if needed
				if (this.relayStatusListener && params.maintain) {
					this.relayStatusListener({ url: params.url }, { maintain: true });
				}

				return;
			}
		}

		let relay;

		try {
			console.log(`Attempting to connect to relay: ${url}`);
			// Create a relay instance
			relay = new Relay(url);
			
			// Add custom properties for reconnection logic
			relay._encounteredError = false;
			relay._reconnectMillsecs = 500;
			relay._pendingReconnect = false;
			relay._failedAttempts = 0;
			relay._maxReconnectAttempts = 10; // Increased maximum number of reconnect attempts
			
			// Set up event handlers using the new API
			relay.onconnect = () => {
				clearTimeout(relay._reconnectTimeout);
				relay._encounteredError = false;
				relay._reconnectMillsecs = 500;
				relay._failedAttempts = 0; // Reset failed attempts on successful connection
				console.log(`Successfully connected to relay: ${url}`);

				if (this.relayStatusListener) {
					const onConnectStatus = {
						error: false,
						connected: true,
						connecting: false
					};

					if (params.maintain) {
						onConnectStatus.maintain = true;
					}

					this.relayStatusListener(relay, onConnectStatus);
				}

				Object.keys(this.subscriptions).forEach(name => {
					const { feed, filters, options } = this.subscriptions[name];
					feed.subscribe(name, relay, filters, options);
				});
			};

			relay.onerror = () => {
				relay._encounteredError = true;
				relay._failedAttempts++;
				console.log(`Error on relay ${url}, attempt ${relay._failedAttempts}`);

				if (this.relayStatusListener) {
					this.relayStatusListener(relay, {
						connecting: false,
						connected: false,
						error: true
					});
				}

				// If we've exceeded the maximum number of reconnect attempts, don't try again
				if (relay._failedAttempts > relay._maxReconnectAttempts) {
					console.log(`Giving up on connecting to ${relay.url} after ${relay._failedAttempts} attempts`);
					return;
				}

				if (relay._pendingReconnect) { return; }

				if (!relay._reconnectMillsecs) {
					relay._reconnectMillsecs = 500;
				}

				relay._reconnectMillsecs = Math.min(relay._reconnectMillsecs * 2, 30000); // Cap at 30 seconds

				clearTimeout(relay._reconnectTimeout);

				relay._pendingReconnect = true;

				// Attempt reconnect with an exponential backoff to avoid DDOSing relays
				relay._reconnectTimeout = setTimeout(async () => {
					relay._pendingReconnect = false;

					try {
						console.log(`Attempting to reconnect to ${relay.url} (attempt ${relay._failedAttempts})`);
						await relay.connect();
					} catch (err) {
						console.log(`Failed to reconnect to ${relay.url}: ${err.message || 'Unknown error'}`);
					}

					relay._pendingReconnect = false;
				}, relay._reconnectMillsecs);

				console.log(`${relay.url} reconnecting after ${relay._reconnectMillsecs} ms...`);
			};

			relay.onclose = async () => {
				if (this.relayStatusListener) {
					this.relayStatusListener(relay, {
						connected: false,
						connecting: true
					});
				}

				// Only attempt to reconnect if we haven't exceeded the maximum attempts
				// and we haven't encountered a serious error
				if (!relay._encounteredError && relay._failedAttempts <= relay._maxReconnectAttempts) {
					try {
						console.log(`${relay.url} connection closed, attempting to reconnect...`);
						
						// Add a small delay before reconnecting to avoid rapid reconnection attempts
						await new Promise(resolve => setTimeout(resolve, 1000));
						
						await relay.connect();
					} catch (err) {
						console.log(`Error reconnecting to ${relay.url}: ${err.message || 'Unknown error'}`);
						relay._failedAttempts++;
					}
				}
			};

			// Connect to the relay
			await relay.connect();

		} catch (err) {
			console.error('Error connecting to relay:', url, err.message || err);
		}

		if (relay && relay.status === 1) { // Only add successfully connected relays
			this.relays.push(relay);
			console.log(`Added relay to pool: ${url}`);
		}
	}

	async createEvent (data, options = {}) {

		let event = {
			created_at: Math.floor(Date.now() / 1000),
			...data
		};

		if (options.privateKey) {

			const pubkey = getPublicKey(options.privateKey);

			if (event.pubkey && event.pubkey !== pubkey) {
				throw Error('Public key conflicts with existing');
			}

			// Use finalizeEvent instead of manually setting pubkey, id, and sig
			event = finalizeEvent(event, options.privateKey);

		} else if (this.env.nostr) {

			event = await this.env.nostr.signEvent(event);

		} else {

			throw Error('Expected private key or external interface');
		}

		return event;
	}

	/**
	 * Publish an event to all connected relays
	 * 
	 * This method handles publishing a Nostr event to all connected relays
	 * with proper error handling and status reporting.
	 * 
	 * @param {Object} event - The Nostr event to publish
	 * @param {Function} handleStatus - Callback function for status updates
	 * @returns {void}
	 */
	publishEvent (event, handleStatus) {

		// Send the event to each connected relay and
		// provide status updates through the callback
		this.relays.forEach(async relay => {
			try {
				// In the nostr-tools API, publish returns a promise that resolves when the event is published
				const pub = await relay.publish(event);
				
				// If we get here, the event was published successfully
				if (typeof handleStatus === 'function') {
					handleStatus('ok', relay);
				}
			} catch (error) {
				console.error(`Error publishing to ${relay.url}:`, error);
				// Report the error through the callback if provided
				if (typeof handleStatus === 'function') {
					handleStatus('failed', relay, error);
				}
			}
		});
	}

	// Create ephemeral auth event per NIP-42
	createAuth ({ relay, challenge }, options = {}) {

		return this.createEvent({
			kind: 22242,
			content: '',
			tags: [
				['relay', relay],
				['challenge', challenge]
			]
		}, options);
	}

	registerFeed (name, feed, filters, options) {

		this.subscriptions[name] = { feed, filters, options };
	}

	unregisterFeed ({ id }) {

		let name;

		for (let key of Object.keys(this.subscriptions)) {

			const { feed } = this.subscriptions[key];

			if (feed.id === id) {
				name = key;
				break;
			}
		}

		if (name) {

			delete this.subscriptions[name];
		}
	}

	listenForRelayStatus (handler) {

		this.relayStatusListener = handler;
	};

	/* Get pubkey's metadata and contacts */
	listenForProfile (pubkey, handlers) {

		const feed = new Feed();

		const profileFeedName = `profile_${pubkey}`;
		const messageFeedName = `message_${pubkey}`;
		const notificationsFeedName = `notifications_${pubkey}`;

		// Listen for user's metadata
		if (handlers.onMetadata) {
			feed.listenForMetadata(pubkey, handlers.onMetadata);
		}

		// Listen for DM metadata too
		if (handlers.onWildcardMetadata) {

			feed.listenForMetadata('*', handlers.onWildcardMetadata);
		}

		if (handlers.onDM) {

			feed.listenForDM(handlers.onDM);
		}

		if (handlers.onCommunity) {

			feed.listenForCommunity(handlers.onCommunity)
		}

		if (handlers.onLoadedCommunityFollowingList) {

			feed.listenForCommunityFollowingList(handlers.onLoadedCommunityFollowingList);
		}

		// Listen for user's contacts
		feed.listenForContacts(pubkey, ({ contacts, content }) => {

			// When contacts are received, maybe also listen for
			// the metadata for each contact so the app can display
			// a profile and name in following list instead of just a key
			if (contacts.length > 0 && handlers.onContactMetadata) {

				for (let contact of contacts) {

					if (contact === pubkey) { continue; }

					// Pass the contact and its metadata to the handler
					feed.listenForMetadata(contact, metadata => {
						handlers.onContactMetadata(contact, metadata);
					});
				}

				this.subscribe(`contacts_metadata_${pubkey}`, feed, [{
					kinds: [ 0 ],
					authors: contacts.filter(contact => {
						return contact !== pubkey;
					})
				}]);
			}

			// Pass contact list to handler
			if (handlers.onContacts) {
				handlers.onContacts({ contacts, content });
			}

		});

		let communityIds = [];

		const detectNotification = (event) => {

			if (event.pubkey === pubkey) {
				return false;
			}

			if (([ 1, 6, 7 ]).indexOf(event.kind) === -1) {
				return false;
			}

			let notify;

			for (let tag of event.tags) {

				if (tag[0] === 'p' && tag[1] === pubkey) {
					return true;
				}
			}

			return false;
		};

		const detectCommunityPost = (event, cids) => {

			if (event.kind === 1 || event.kind === 4550) {

				for (let tag of event.tags) {

					if (tag[0] === 'a' && cids.indexOf(tag[1]) !== -1) {
						return true;
					}
				}
			}

			return false;
		};

		// Listen for end of saved direct messages
		feed.listenForEose((relay, options) => {

			if (options.subscription === profileFeedName) {

				communityIds = feed.list().filter(item => {
					return item.event.kind === 34550;
				}).map(item => {
					for (let tag of item.event.tags) {
						if (tag[0] === 'd') {
							return `34550:${item.event.pubkey}:${tag[1]}`;
						}
					}
				}).filter(id => {
					return id;
				});

				const now = Math.floor(Date.now() / 1000);

				feed.subscribe(notificationsFeedName, relay, [{
					kinds: [ 1, 7 ],
					'#p': [ pubkey ],
					since: now - (86400 * 5)
				}, {
					kinds: [ 1, 6, 7 ],
					authors: [ pubkey ],
					since: now - (86400 * 5)
				}, {
					kinds: [ 1, 4550 ],
					'#a': communityIds,
					since: now - (86400 * 5)
				}]);

			} else if (options.subscription === 'notifications_context') {

				const filters = [];
				const uniqueE = {};
				const uniqueP = {};

				const assignPubkey = (p) => {

					if (p && !feed.metadata[p]) {
						uniqueP[p] = true;
					}
				};

				const assignEventId = (e) => {

					if (e && (!feed.items[e] || feed.items[e].phantom)) {
						uniqueE[e] = true;
					}
				};

				for (let item of feed.list()) {

					const { ereply } = item;

					assignEventId(ereply);

					assignPubkey(item.event.pubkey);

					if (item.event.tags) {

						for (let tag of item.event.tags) {

							if (tag[0] === 'p') {
								assignPubkey(tag[1]);
							} else if (tag[0] === 'e' || tag[0] === 'q') {
								assignEventId(tag[1]);
							}
						}
					}

					if (item.event.content) {

						for (let _e of Object.keys(this.parseContentRefs(item.event.content)['e'])) {
							assignEventId(_e);
						}
					}
				}

				if (Object.keys(uniqueE).length > 0) {

					filters.push({
						ids: Object.keys(uniqueE)
					});
				}

				if (Object.keys(uniqueP).length > 0) {

					filters.push({
						authors: Object.keys(uniqueP),
						kinds: [ 0 ]
					});
				}

				if (filters.length > 0) {

					feed.subscribe(`notifications_context_extra`, relay, filters);
				}

			} else if (options.subscription === notificationsFeedName) {

				/* After initial batch of notifications
				is loaded, listen for additional */

				setTimeout(() => {

					if (!feed.eventListener) {

						feed.listenForEvent(event => {

							if (feed.items[event.id]) { return; }

							if (detectNotification(event)) {
								handlers.onNotify([ event ]);
							}

							if (detectCommunityPost(event, communityIds)) {
								handlers.onCommunityPost([ event ]);
							}

						});

						const listed = feed.list().map(item => {
							return item.event;
						});

						handlers.onNotify(listed.filter(event => {
							return detectNotification(event);
						}));

						handlers.onCommunityPost(listed.filter(event => {
							return detectCommunityPost(event, communityIds);
						}));
					}

				}, 500);

			} else if (options.subscription === messageFeedName) {

				// this.subscribe(`dm_metadata_${pubkey}`, feed, [{
				// 	kinds: [ 0 ],
				// 	authors: Object.keys(feed.dmAuthors)
				// }]);

				feed.subscribe(`dm_metadata_${pubkey}`, relay, [{
					kinds: [ 0 ],
					authors: Object.keys(feed.dmAuthors)
				}]);
			}
		});

		this.subscribe(profileFeedName, feed, [{
			authors: [ pubkey ],
			kinds: [ 0, 3, 34550 ]
		}]);

		this.subscribe(messageFeedName, feed, [{
			'#p': [ pubkey ],
			kinds: [ 4 ]
		}, {
			authors: [ pubkey ],
			kinds: [ 4 ]
		}]);

		return feed;
	}

	subscribe (name, feed, filters, options = {}) {

		this.registerFeed(name, feed, filters, options);

		for (let relay of this.relays) {

			feed.subscribe(name, relay, filters, options);
		}
	}

	parseContentRefs (content) {

		const refs = {
			'e': {},
			'p': {},
			'nprofile': {},
			'nevent': {},
			'note': {},
			'npub': {}
		};

		if (!content) { return refs; }

		// Match nostr: protocol links
		const nostrMatches = content.match(/nostr:(npub|note|nevent|nprofile)[a-zA-Z0-9]+/g) || [];

		for (let match of nostrMatches) {

			try {

				const decoded = nip19.decode(match.slice(6));
				const type = decoded.type;

				if (type === 'npub') {

					refs.npub[decoded.data] = true;
					refs.p[decoded.data] = true;

				} else if (type === 'note') {

					refs.note[decoded.data] = true;
					refs.e[decoded.data] = true;

				} else if (type === 'nevent') {

					refs.nevent[decoded.data.id] = true;
					refs.e[decoded.data.id] = true;

				} else if (type === 'nprofile') {

					refs.nprofile[decoded.data.pubkey] = true;
					refs.p[decoded.data.pubkey] = true;
				}

			} catch (err) {}
		}

		// Match bech32 encoded entities
		const bech32Matches = content.match(/(npub|note|nevent|nprofile)[a-zA-Z0-9]+/g) || [];

		for (let match of bech32Matches) {

			try {

				const decoded = nip19.decode(match);
				const type = decoded.type;

				if (type === 'npub') {

					refs.npub[decoded.data] = true;
					refs.p[decoded.data] = true;

				} else if (type === 'note') {

					refs.note[decoded.data] = true;
					refs.e[decoded.data] = true;

				} else if (type === 'nevent') {

					refs.nevent[decoded.data.id] = true;
					refs.e[decoded.data.id] = true;

				} else if (type === 'nprofile') {

					refs.nprofile[decoded.data.pubkey] = true;
					refs.p[decoded.data.pubkey] = true;
				}

			} catch (err) {}
		}

		// Match hex encoded entities
		const hexMatches = content.match(/(#\[([0-9]+)\])/g) || [];
		const hexTags = {};

		for (let match of hexMatches) {

			const tagIndex = match.slice(2, -1);

			hexTags[tagIndex] = true;
		}

		return refs;
	}

	getThreadRefs (item, options = {}) {

		const refs = {
			parsed: {},
			events: {}
		};

		if (!item || !item.event) { return refs; }

		const { event } = item;

		if (options.includeEventIds) {
			refs.events[event.id] = true;
		}

		if (options.includeParsedIds && event.content) {

			const parsed = this.parseContentRefs(event.content);

			for (let id of Object.keys(parsed.e)) {
				refs.parsed[id] = true;
			}
		}

		if (event.tags) {

			for (let tag of event.tags) {

				if (tag[0] === 'e') {
					refs.events[tag[1]] = true;
				}
			}
		}

		return refs;
	}

	/* Utility methods */

	async verifyNip05 (pubkey, nip05Id) {

		try {

			const res = await nip05.queryProfile(nip05Id);

			return res && res.pubkey === pubkey;

		} catch (err) {

			return false;
		}
	}

	async nip05LookupByName (name, domain) {

		try {

			const res = await nip05.searchDomain(domain);

			return res.names[name];

		} catch (err) {

			return null;
		}
	}

	async nip05LookupByPubkey (pubkey, domain) {

		try {

			const res = await nip05.searchDomain(domain);

			for (let name of Object.keys(res.names)) {

				if (res.names[name] === pubkey) {
					return name;
				}
			}

			return null;

		} catch (err) {

			return null;
		}
	}

	async nip05Lookup (query) {

		if (!query || query.indexOf('@') === -1) {
			return null;
		}

		const [ name, domain ] = query.split('@');

		if (!name || !domain) {
			return null;
		}

		try {

			const res = await nip05.queryProfile(query);

			return res;

		} catch (err) {

			return null;
		}
	}

	async nip05Search (domain) {

		try {

			const res = await nip05.searchDomain(domain);

			return res;

		} catch (err) {

			return null;
		}
	}
}

export default Client;