// Placeholder types for future implementation
export interface VaultItem {
  id: string;
  title: string;
  description: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  tags: string[];
  familyId?: string;
  encrypted: boolean;
}