// Component: components/BookUploader.tsx
import React, { useState } from 'react';
import { useNostrWalletConnect } from '../hooks/useNostrWalletConnect';
import { 
  publishBookListing, 
  BookProduct, 
  calculateFileHash, 
  getFormatFromMimeType, 
  generateCoverImage 
} from '../lib/marketplace';
import { getEventHash, finalizeEvent } from 'nostr-tools/pure';
import { getPublicKey } from 'nostr-tools/pure';
import './AcademyStore.css';

interface FileMetadata {
  id: string;
  author: string;
}

interface UploadFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  file: File | null;
}

export function BookUploader() {
  const [upload, setUpload] = useState<UploadFormData>({
    title: '',
    description: '',
    price: 1000,
    category: 'textbook',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { connected, walletPubkey } = useNostrWalletConnect();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUpload({
        ...upload,
        file: e.target.files[0]
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpload({
      ...upload,
      [name]: name === 'price' ? parseInt(value) : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!upload.file || !connected || !walletPubkey) {
      alert('Please connect your wallet and select a file');
      return;
    }
    
    setUploading(true);
    
    try {
      // Upload the file to a storage service
      // In a real implementation, this would upload to IPFS, Arweave, or another storage service
      const fileUrl = URL.createObjectURL(upload.file);
      
      // Calculate file hash for verification
      const fileHash = await calculateFileHash(upload.file);
      
      // Create file metadata
      const fileMetadata: FileMetadata = {
        id: Math.random().toString(36).substring(2, 15),
        author: walletPubkey.substring(0, 8) // Using a portion of the walletPubkey as author for now
      };
      
      // Create NIP-15 marketplace listing
      const product: BookProduct = {
        id: fileMetadata.id,
        title: upload.title,
        author: fileMetadata.author,
        description: upload.description,
        price: upload.price,
        category: upload.category as any,
        format: getFormatFromMimeType(upload.file.type),
        fileUrl,
        coverImage: await generateCoverImage(upload.file, upload.title),
        isbn: undefined,
        fileHash,
        fileSize: upload.file.size
      };
      
      // In a real implementation, you would get the private key securely
      // For now, we'll use a placeholder
      const privateKeyHex = 'your-private-key-here'; // This should be replaced with actual private key
      
      // Publish the listing with enhanced metadata
      const { fileUrl: publishedFileUrl, productEvent, metadataEvent } = await publishBookListing(product, privateKeyHex);
      
      console.log('Published product event:', productEvent.id);
      console.log('Published metadata event:', metadataEvent.id);
      
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setUpload({
          title: '',
          description: '',
          price: 1000,
          category: 'textbook',
          file: null
        });
      }, 3000);
    } catch (error) {
      console.error('Error uploading book:', error);
      alert('Failed to upload book: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="book-uploader">
      <h2>Upload Book to Marketplace</h2>
      
      {!connected && (
        <div className="connect-wallet-message">
          Please connect your Nostr wallet to upload books
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={upload.title}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={upload.description}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Price (sats)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={upload.price}
            onChange={handleInputChange}
            min="100"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={upload.category}
            onChange={handleInputChange}
            required
          >
            <option value="textbook">Textbook</option>
            <option value="reference">Reference</option>
            <option value="course">Course</option>
            <option value="supplement">Supplement</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="file">File</label>
          <div className="file-upload-area">
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              accept=".pdf,.epub,.mp4,.mp3"
              required
            />
            <div className="file-info">
              {upload.file ? (
                <span>{upload.file.name} ({Math.round(upload.file.size / 1024)} KB)</span>
              ) : (
                <span>No file selected</span>
              )}
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={uploading || !connected || !upload.file}
          className="upload-btn"
        >
          {uploading ? 'Uploading...' : 'Upload Book'}
        </button>
        
        {uploadSuccess && (
          <div className="success-message">
            Book uploaded successfully!
          </div>
        )}
      </form>
    </div>
  );
}