const API_BASE_URL = 'http://localhost:3000/api';

export interface FavoritesApiService {
  // Church following methods
  followChurch: (churchId: number, token: string) => Promise<{ success: boolean; error?: string }>;
  unfollowChurch: (churchId: number, token: string) => Promise<{ success: boolean; error?: string }>;
  checkFollowStatus: (churchId: number, token: string) => Promise<{ isFollowing: boolean; error?: string }>;
  
  // Event liking methods
  likeEvent: (eventId: number, token: string) => Promise<{ success: boolean; error?: string }>;
  unlikeEvent: (eventId: number, token: string) => Promise<{ success: boolean; error?: string }>;
  checkLikeStatus: (eventId: number, token: string) => Promise<{ isLiked: boolean; error?: string }>;
}

// Church following methods
export const followChurch = async (churchId: number, token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/churches/${churchId}/follow`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Failed to follow church' };
    }
  } catch (error) {
    console.error('Error following church:', error);
    return { success: false, error: 'Network error' };
  }
};

export const unfollowChurch = async (churchId: number, token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/churches/${churchId}/follow`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Failed to unfollow church' };
    }
  } catch (error) {
    console.error('Error unfollowing church:', error);
    return { success: false, error: 'Network error' };
  }
};

export const checkFollowStatus = async (churchId: number, token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/churches/${churchId}/follow/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return { isFollowing: data.isFollowing };
    } else {
      return { isFollowing: false, error: data.error || 'Failed to check follow status' };
    }
  } catch (error) {
    console.error('Error checking follow status:', error);
    return { isFollowing: false, error: 'Network error' };
  }
};

// Event liking methods
export const likeEvent = async (eventId: number, token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/events/${eventId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Failed to like event' };
    }
  } catch (error) {
    console.error('Error liking event:', error);
    return { success: false, error: 'Network error' };
  }
};

export const unlikeEvent = async (eventId: number, token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/events/${eventId}/like`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Failed to unlike event' };
    }
  } catch (error) {
    console.error('Error unliking event:', error);
    return { success: false, error: 'Network error' };
  }
};

export const checkLikeStatus = async (eventId: number, token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/events/${eventId}/like/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return { isLiked: data.isLiked };
    } else {
      return { isLiked: false, error: data.error || 'Failed to check like status' };
    }
  } catch (error) {
    console.error('Error checking like status:', error);
    return { isLiked: false, error: 'Network error' };
  }
};
