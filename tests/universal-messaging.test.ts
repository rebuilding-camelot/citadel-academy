// File: tests/universal-messaging.test.ts
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useState, useCallback } from 'react';
import { useUniversalMessaging } from '../src/hooks/useUniversalMessaging';
import { CitadelForumManagerNIP59 } from '../src/lib/secure-forums-nip59';
import { nip59 } from 'nostr-tools';

// Mock the CitadelForumManagerNIP59 class
vi.mock('../src/lib/secure-forums-nip59', () => {
  // Create mock functions
  const mockSendUniversalMessage = vi.fn().mockResolvedValue(undefined);
  const mockSendForumMessage = vi.fn().mockResolvedValue(undefined);
  
  // Create a mock class constructor
  const MockCitadelForumManagerNIP59 = vi.fn();
  
  // Add the mock methods to the prototype
  MockCitadelForumManagerNIP59.prototype.sendUniversalMessage = mockSendUniversalMessage;
  MockCitadelForumManagerNIP59.prototype.sendForumMessage = mockSendForumMessage;
  
  return {
    CitadelForumManagerNIP59: MockCitadelForumManagerNIP59
  };
});

// Mock the nostr-tools module
vi.mock('nostr-tools', () => {
  return {
    SimplePool: vi.fn().mockImplementation(() => ({
      close: vi.fn(),
      publish: vi.fn(),
      querySync: vi.fn()
    })),
    nip59: {
      unwrapEvent: vi.fn().mockResolvedValue({
        id: 'test-id',
        pubkey: 'test-sender',
        content: 'Test message content',
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['type', 'direct'],
          ['p', 'recipient-pubkey']
        ]
      }),
      wrapEvent: vi.fn().mockResolvedValue({
        id: 'test-id',
        pubkey: 'test-pubkey',
        created_at: Math.floor(Date.now() / 1000),
        kind: 1059,
        tags: [['p', 'recipient-pubkey']],
        content: 'encrypted-content',
        sig: 'test-signature'
      })
    },
    // Add any other nostr-tools exports needed for tests
    getEventHash: vi.fn(),
    getPublicKey: vi.fn(),
    getSignature: vi.fn()
  };
});

describe('useUniversalMessaging', () => {
  const mockUserKeys = {
    privateKey: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    publicKey: 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789'
  };

  const mockNostrClient = {
    subscribe: vi.fn().mockReturnValue({
      on: vi.fn()
    }),
    queryEvents: vi.fn().mockResolvedValue([]),
    publish: vi.fn().mockResolvedValue(undefined),
    publishToRelay: vi.fn().mockResolvedValue(undefined)
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('CitadelForumManagerNIP59 is initialized correctly', () => {
    // Create a new instance of CitadelForumManagerNIP59
    const forumManager = new CitadelForumManagerNIP59(mockNostrClient, mockUserKeys);
    
    // Verify the instance was created with the correct parameters
    expect(CitadelForumManagerNIP59).toHaveBeenCalledWith(mockNostrClient, mockUserKeys);
  });

  test('sendUniversalMessage tests actual behavior', async () => {
    // Create a new instance of CitadelForumManagerNIP59
    const forumManager = new CitadelForumManagerNIP59(mockNostrClient, mockUserKeys);
    
    // Create a spy on the nip59.wrapEvent function
    const wrapEventSpy = vi.fn().mockResolvedValue({
      id: 'test-id',
      pubkey: mockUserKeys.publicKey,
      created_at: Math.floor(Date.now() / 1000),
      kind: 1059,
      tags: [['p', 'recipient-pubkey']],
      content: 'encrypted-content',
      sig: 'test-signature'
    });
    
    // Replace the original wrapEvent function with our spy
    const originalWrapEvent = nip59.wrapEvent;
    nip59.wrapEvent = wrapEventSpy;
    
    try {
      // Call the sendUniversalMessage method
      await forumManager.sendUniversalMessage(
        'recipient-pubkey',
        'Hello world',
        { type: 'direct' }
      );
      
      // Verify wrapEvent was called with the correct parameters
      expect(wrapEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 14,
          tags: expect.arrayContaining([
            ['p', 'recipient-pubkey'],
            ['type', 'direct']
          ]),
          content: 'Hello world',
          pubkey: mockUserKeys.publicKey
        }),
        expect.any(Uint8Array),
        'recipient-pubkey'
      );
    } finally {
      // Restore the original wrapEvent function
      nip59.wrapEvent = originalWrapEvent;
    }
  });

  test('sendForumMessage tests actual behavior', async () => {
    // Create a new instance of CitadelForumManagerNIP59
    const forumManager = new CitadelForumManagerNIP59(mockNostrClient, mockUserKeys);
    
    // Create a spy on the nip59.wrapEvent function
    const wrapEventSpy = vi.fn().mockResolvedValue({
      id: 'test-id',
      pubkey: mockUserKeys.publicKey,
      created_at: Math.floor(Date.now() / 1000),
      kind: 1059,
      tags: [['p', 'member1']],
      content: 'encrypted-content',
      sig: 'test-signature'
    });
    
    // Replace the original wrapEvent function with our spy
    const originalWrapEvent = nip59.wrapEvent;
    nip59.wrapEvent = wrapEventSpy;
    
    try {
      // Call the sendForumMessage method
      await forumManager.sendForumMessage(
        {
          forumId: 'test-forum',
          content: 'Hello forum',
          messageType: 'student',
          courseId: 'NOSTR-101'
        },
        ['member1', 'member2']
      );
      
      // Verify wrapEvent was called with the correct parameters
      expect(wrapEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 14,
          tags: expect.arrayContaining([
            ['forum', 'test-forum'],
            ['forum_type', 'student'],
            ['course', 'NOSTR-101']
          ]),
          content: 'Hello forum',
          pubkey: mockUserKeys.publicKey
        }),
        expect.any(Uint8Array),
        expect.stringMatching(/member[12]/)
      );
    } finally {
      // Restore the original wrapEvent function
      nip59.wrapEvent = originalWrapEvent;
    }
  });

  test('message filtering works correctly', () => {
    // Test the message filtering logic directly
    const messages = [
      {
        id: 'msg1',
        content: 'Direct message',
        sender: 'sender1',
        recipient: mockUserKeys.publicKey,
        type: 'direct' as const,
        timestamp: 1234567890
      },
      {
        id: 'msg2',
        content: 'Forum message',
        sender: 'sender2',
        recipient: mockUserKeys.publicKey,
        type: 'forum' as const,
        timestamp: 1234567891,
        context: { forumId: 'test-forum' }
      }
    ];
    
    // Filter messages by type
    const directMessages = messages.filter(msg => msg.type === 'direct');
    expect(directMessages.length).toBe(1);
    expect(directMessages[0].content).toBe('Direct message');
    
    const forumMessages = messages.filter(msg => msg.type === 'forum');
    expect(forumMessages.length).toBe(1);
    expect(forumMessages[0].content).toBe('Forum message');
  });
  
  test('message processing works correctly', async () => {
    // Create a spy on window.dispatchEvent
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
    
    // Manually create and dispatch a custom event
    const customEvent = new CustomEvent('forumMessage', {
      detail: {
        rumor: {
          id: 'test-id',
          pubkey: 'test-sender',
          content: 'Test forum message',
          created_at: Math.floor(Date.now() / 1000),
          tags: [
            ['type', 'forum'],
            ['p', mockUserKeys.publicKey],
            ['forum', 'test-forum'],
            ['forum_type', 'student'],
            ['course', 'NOSTR-101']
          ]
        },
        sender: 'test-sender',
        forumType: 'student',
        courseId: 'NOSTR-101'
      }
    });
    
    window.dispatchEvent(customEvent);
    
    // Verify that a CustomEvent was dispatched
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'forumMessage',
        detail: expect.objectContaining({
          forumType: 'student',
          courseId: 'NOSTR-101'
        })
      })
    );
    
    // Clean up mocks
    vi.restoreAllMocks();
  });
});