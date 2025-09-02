import { MaterialsLink } from '@/app/types';

const API_BASE = '/api/materials';

export const materialsApi = {
  // Fetch all materials links
  async getAll(): Promise<MaterialsLink[]> {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error('Failed to fetch materials links');
    }
    return response.json();
  },

  // Create a new materials link
  async create(link: Omit<MaterialsLink, 'id' | 'lastUpdated'>): Promise<MaterialsLink> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(link),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create materials link');
    }
    
    return response.json();
  },

  // Update an existing materials link
  async update(link: Omit<MaterialsLink, 'lastUpdated'>): Promise<MaterialsLink> {
    const response = await fetch(API_BASE, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(link),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update materials link');
    }
    
    return response.json();
  },

  // Delete a materials link
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}?id=${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete materials link');
    }
  }
};

