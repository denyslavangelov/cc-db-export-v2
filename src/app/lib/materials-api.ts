import { MaterialsLink } from '@/app/types'

const API_BASE = '/api/materials'

export const materialsApi = {
  async getAll(): Promise<MaterialsLink[]> {
    try {
      const response = await fetch(API_BASE)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching materials:', error)
      throw new Error('Failed to fetch materials')
    }
  },

  async create(link: Omit<MaterialsLink, 'id' | 'lastUpdated' | 'updatedBy'>): Promise<MaterialsLink> {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(link),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating material:', error)
      throw error
    }
  },

  async update(id: string, link: Partial<MaterialsLink>): Promise<MaterialsLink> {
    try {
      const response = await fetch(API_BASE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...link }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error updating material:', error)
      throw error
    }
  },

  async delete(id: string): Promise<MaterialsLink> {
    try {
      const response = await fetch(`${API_BASE}?id=${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error deleting material:', error)
      throw error
    }
  },
}

