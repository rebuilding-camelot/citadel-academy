/**
 * IPFS Knowledge Vault Service
 * 
 * Provides functionality for storing and retrieving files using IPFS (InterPlanetary File System)
 * and storing metadata in Nostr using NIP-78 application-specific data.
 */
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { CID } from 'multiformats/cid';
import type { Helia } from '@helia/interface';

// Reference to the window.d.ts file
/// <reference path="../types/window.d.ts" />

/**
 * Represents a file stored in the Knowledge Vault
 */
export interface KnowledgeVaultItem {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'audio' | 'image' | 'family_story';
  ipfsHash: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  tags: string[];
  familyId?: string;
  encrypted: boolean;
}

export class IPFSKnowledgeVault {
  private helia: Helia | null = null;
  private fs: any;
  private initialized = false;

  /**
   * Initializes the IPFS node using Helia
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      this.helia = await createHelia();
      this.fs = unixfs(this.helia);
      this.initialized = true;
      console.log('IPFS Helia node initialized');
    } catch (error) {
      console.error('Failed to initialize IPFS:', error);
      throw error;
    }
  }

  /**
   * Uploads a file to IPFS and stores its metadata in Nostr
   * 
   * @param file - The file to upload
   * @param metadata - Metadata about the file
   * @returns The created vault item
   */
  async uploadFile(
    file: File, 
    metadata: Partial<KnowledgeVaultItem>
  ): Promise<KnowledgeVaultItem> {
    await this.initialize();
    try {
      // Convert file to Uint8Array
      const fileBuffer = new Uint8Array(await file.arrayBuffer());
      
      // Add file to IPFS
      const cid = await this.fs.add(fileBuffer);

      // Create vault item with metadata
      const vaultItem: KnowledgeVaultItem = {
        id: `vault-${Date.now()}`,
        title: metadata.title || file.name,
        description: metadata.description || '',
        type: this.getFileType(file.type),
        ipfsHash: cid.toString(),
        size: file.size,
        uploadedBy: metadata.uploadedBy || 'anonymous',
        uploadedAt: new Date(),
        tags: metadata.tags || [],
        familyId: metadata.familyId,
        encrypted: metadata.encrypted || false
      };

      // Store metadata in Nostr
      await this.storeMetadataInNostr(vaultItem);
      return vaultItem;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  /**
   * Retrieves a file from IPFS by its hash
   * 
   * @param ipfsHash - The IPFS CID of the file
   * @returns The file data as a Uint8Array
   */
  async retrieveFile(ipfsHash: string): Promise<Uint8Array> {
    await this.initialize();
    try {
      const cid = CID.parse(ipfsHash);
      const chunks: Uint8Array[] = [];
      
      // Collect chunks from the IPFS stream
      for await (const chunk of this.fs.cat(cid)) {
        chunks.push(chunk);
      }

      // Combine chunks into a single Uint8Array
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }

      return result;
    } catch (error) {
      console.error('File retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Gets a public URL for accessing the file via an IPFS gateway
   * 
   * @param ipfsHash - The IPFS CID of the file
   * @returns A URL that can be used to access the file
   */
  async getFileUrl(ipfsHash: string): Promise<string> {
    return `https://ipfs.io/ipfs/${ipfsHash}`;
  }

  /**
   * Determines the file type based on MIME type
   * 
   * @param mimeType - The MIME type of the file
   * @returns The corresponding vault item type
   */
  private getFileType(mimeType: string): KnowledgeVaultItem['type'] {
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('image/')) return 'image';
    return 'document';
  }

  /**
   * Stores the vault item metadata in Nostr using NIP-78
   * 
   * @param item - The vault item to store
   */
  private async storeMetadataInNostr(item: KnowledgeVaultItem): Promise<void> {
    // Create an unsigned event for NIP-78 application-specific data
    const unsignedEvent = {
      kind: 30078,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['d', item.id],
        ['title', item.title],
        ['type', item.type],
        ['ipfs', item.ipfsHash],
        ['size', item.size.toString()],
        ['academy', 'citadel'],
        ...item.tags.map(tag => ['t', tag]),
        ...(item.familyId ? [['family', item.familyId]] : [])
      ],
      content: JSON.stringify({
        description: item.description,
        uploadedAt: item.uploadedAt.toISOString(),
        encrypted: item.encrypted
      }),
      pubkey: item.uploadedBy
    };

    // Publish to Nostr if client is available
    if (typeof window !== 'undefined' && window.nostrClient) {
      try {
        const signedEvent = await window.nostrClient.signEvent(unsignedEvent as any);
        await window.nostrClient.publishEvent(signedEvent);
      } catch (error) {
        console.error('Failed to publish to Nostr:', error);
      }
    } else {
      console.warn('Nostr client not available, metadata not stored');
    }
  }
}