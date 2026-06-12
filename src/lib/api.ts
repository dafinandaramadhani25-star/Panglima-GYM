import { GymItem, MaintenanceEntry, StockLog, UserProfile } from '../types';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API Error on ${path}: ${response.status} - ${errText}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Status check
  async getStatus(): Promise<{ status: string; mode: string; database: string; host: string }> {
    return request<{ status: string; mode: string; database: string; host: string }>('/status');
  },

  // Gym items API
  async getItems(): Promise<GymItem[]> {
    return request<GymItem[]>('/items');
  },

  async saveItem(item: GymItem | Omit<GymItem, 'id' | 'qrCodeUrl' | 'updatedAt'>): Promise<{ success: boolean; item: GymItem }> {
    return request<{ success: boolean; item: GymItem }>('/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async deleteItem(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/items/${id}`, {
      method: 'DELETE',
    });
  },

  // Maintenance schedules API
  async getMaintenance(): Promise<MaintenanceEntry[]> {
    return request<MaintenanceEntry[]>('/maintenance');
  },

  async saveMaintenance(entry: MaintenanceEntry | Omit<MaintenanceEntry, 'id'>): Promise<{ success: boolean; entry: MaintenanceEntry }> {
    return request<{ success: boolean; entry: MaintenanceEntry }>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },

  // Stock logs API
  async getLogs(): Promise<StockLog[]> {
    return request<StockLog[]>('/logs');
  },

  async saveLog(log: StockLog | Omit<StockLog, 'id' | 'timestamp'>): Promise<{ success: boolean; log: StockLog }> {
    return request<{ success: boolean; log: StockLog }>('/logs', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  },

  async clearLogs(): Promise<{ success: boolean }> {
    return request<{ success: boolean }>('/logs', {
      method: 'DELETE',
    });
  },

  // Personnel / User profiles API
  async getUsers(): Promise<UserProfile[]> {
    return request<UserProfile[]>('/users');
  },

  async saveUser(user: UserProfile | Omit<UserProfile, 'uid'> & { password?: string }): Promise<{ success: boolean; user: UserProfile }> {
    return request<{ success: boolean; user: UserProfile }>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  async deleteUser(uid: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/users/${uid}`, {
      method: 'DELETE',
    });
  }
};
