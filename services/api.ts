const API_BASE_URL = 'http://localhost:3000/api';

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  enrollment_status?: string;
  created_at: string;
  updated_at: string;
}

export interface Church {
  id: number;
  name: string;
  senior_pastor: string;
  pastor?: string;
  assistant_pastor?: string;
  senior_pastor_avatar?: string;
  pastor_avatar?: string;
  assistant_pastor_avatar?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  contact_email: string;
  contact_phone: string;
  website?: string;
  logo_url?: string;
  banner_url?: string;
  description?: string;
  follower_count?: number;
}

export interface Announcement {
  id: number;
  church_id: number;
  title: string;
  description?: string;
  image_url?: string;
  posted_at?: string;
  type?: string;
  subcategory?: string;
  start_time?: string;
  end_time?: string;
  recurrence_rule?: string;
  is_special: boolean;
  church_name?: string;
  church_logo?: string;
  day?: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
}

export interface Event {
  id: number;
  church_id: number;
  title: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  start_datetime: string;
  end_datetime?: string;
  image_url?: string;
  price?: number;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  favorites_count?: number;
  like_count?: number;
  church_name?: string;
  church_logo?: string;
}

export interface Donation {
  id: number;
  church_id: number;
  method: string;
  contact_name?: string;
  contact_info: string;
  note?: string;
}

class ApiService {
  private getAuthHeaders(token?: string): Record<string, string> {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const defaultOptions: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options?.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Churches
  async getChurches(): Promise<Church[]> {
    return this.fetchApi<Church[]>('/churches');
  }

  async getChurch(id: number): Promise<Church> {
    return this.fetchApi<Church>(`/churches/${id}`);
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return this.fetchApi<Announcement[]>('/announcements');
  }

  async getFeaturedAnnouncements(): Promise<Announcement[]> {
    return this.fetchApi<Announcement[]>('/announcements?special=true');
  }

  async getAnnouncementsByType(type: string): Promise<Announcement[]> {
    return this.fetchApi<Announcement[]>(`/announcements?type=${type}`);
  }

  async getAnnouncementsByChurch(churchId: number): Promise<Announcement[]> {
    return this.fetchApi<Announcement[]>(`/announcements?church_id=${churchId}`);
  }

  async getWeeklyAnnouncementsByChurch(churchId: number): Promise<Announcement[]> {
    return this.fetchApi<Announcement[]>(`/announcements?church_id=${churchId}&weekly=true`);
  }

  // Events
  async getAllEvents(): Promise<Event[]> {
    return this.fetchApi<Event[]>('/events');
  }

  async getEventById(id: number): Promise<Event> {
    return this.fetchApi<Event>(`/events/${id}`);
  }

  async getEventsByChurch(churchId: number): Promise<Event[]> {
    return this.fetchApi<Event[]>(`/churches/${churchId}/events`);
  }

  // Donations
  async getDonationsByChurch(churchId: number): Promise<Donation[]> {
    return this.fetchApi<Donation[]>(`/churches/${churchId}/donations`);
  }

  // Profile Management
  async updateProfile(data: { name: string; avatar?: string }, token: string): Promise<User> {
    return this.fetchApi<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        ...this.getAuthHeaders(token),
      },
    });
  }

  async changePassword(data: { currentPassword: string; newPassword: string }, token: string): Promise<{ message: string }> {
    return this.fetchApi<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        ...this.getAuthHeaders(token),
      },
    });
  }

  async deleteAccount(token: string): Promise<{ message: string }> {
    return this.fetchApi<{ message: string }>('/auth/account', {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(token),
      },
    });
  }

  async uploadImage(imageUri: string, token: string): Promise<{ url: string }> {
    const formData = new FormData();
    
    // Handle different URI formats for web vs React Native
    if (imageUri.startsWith('data:')) {
      // Web: Convert base64 data URL to File object
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      formData.append('image', file);
    } else {
      // React Native: Use URI format
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);
    }

    const uploadResponse = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      body: formData,
      headers: {
        ...this.getAuthHeaders(token),
        // Let the browser/React Native set Content-Type automatically for FormData
      },
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    const data = await uploadResponse.json();
    // Backend returns imageUrl, but frontend expects url
    return { url: data.imageUrl };
  }
}

export const apiService = new ApiService();
