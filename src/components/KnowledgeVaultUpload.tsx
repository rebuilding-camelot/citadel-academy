/**
 * KnowledgeVaultUpload Component
 * 
 * A component for uploading files to IPFS and storing metadata in Nostr.
 * Features drag-and-drop file selection, metadata editing, and progress tracking.
 */
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { IPFSKnowledgeVault, KnowledgeVaultItem } from '../lib/ipfs-service';
import '../styles/knowledge-vault.css';

interface KnowledgeVaultUploadProps {
  familyId?: string;
  onUploadComplete: (item: KnowledgeVaultItem) => void;
}

export const KnowledgeVaultUpload: React.FC<KnowledgeVaultUploadProps> = ({
  familyId,
  onUploadComplete
}) => {
  // State management
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const ipfsVault = new IPFSKnowledgeVault();
  
  /**
   * Handles file drop/selection
   */
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      // Use filename as default title if no title is set
      if (!title) {
        setTitle(acceptedFiles[0].name);
      }
    }
  }, [title]);
  
  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 100 * 1024 * 1024, // 100MB limit
    accept: {
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.webm'],
      'audio/*': ['.mp3', '.wav', '.ogg']
    }
  });
  
  /**
   * Uploads the selected file to IPFS and stores metadata in Nostr
   */
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      // Upload file to IPFS
      const vaultItem = await ipfsVault.uploadFile(selectedFile, {
        title,
        description,
        tags,
        familyId,
        uploadedBy: window.userKeys?.publicKey || 'anonymous',
        encrypted: false
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset form
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      setTags([]);
      
      // Notify parent component
      onUploadComplete(vaultItem);
      alert('File uploaded to Knowledge Vault successfully!');
    } catch (error: unknown) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Upload failed: ' + errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  
  /**
   * Adds a tag to the list if it's not already present
   */
  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
    }
  };
  
  /**
   * Removes a tag from the list
   */
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  /**
   * Gets the appropriate icon for the file type
   */
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    return '📁';
  };
  
  return (
    <div className="knowledge-vault-upload">
      <h3>📚 Upload to Knowledge Vault</h3>
      
      {/* File drop zone */}
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${selectedFile ? 'has-file' : ''}`}
      >
        <input {...getInputProps()} />
        {selectedFile ? (
          <div className="file-selected">
            <div className="file-icon">
              {getFileIcon(selectedFile.type)}
            </div>
            <div className="file-info">
              <strong>{selectedFile.name}</strong>
              <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
        ) : (
          <div className="dropzone-content">
            <div className="dropzone-icon">📁</div>
            <p>
              {isDragActive
                ? 'Drop the file here...'
                : 'Drag & drop a file here, or click to select'}
            </p>
            <p className="file-types">
              Supports: PDF, Images, Videos, Audio, Text files (max 100MB)
            </p>
          </div>
        )}
      </div>
      
      {/* Metadata form (only shown when a file is selected) */}
      {selectedFile && (
        <div className="upload-metadata">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your file a descriptive title"
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this file contains and why it's valuable"
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label>Tags</label>
            <div className="tags-input">
              <input
                type="text"
                placeholder="Add tags (press Enter)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addTag(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <div className="tags-list">
                {tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                    <button onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Upload progress indicator */}
          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span>{uploadProgress}% uploaded</span>
            </div>
          )}
          
          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={uploading || !title.trim()}
            className="upload-btn"
          >
            {uploading ? '📤 Uploading...' : '📤 Upload to IPFS'}
          </button>
        </div>
      )}
    </div>
  );
};