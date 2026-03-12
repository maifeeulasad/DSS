/**
 * API client for DSS backend
 */

export interface SequenceFile {
  filename: string;
  content: string; // base64 encoded
}

export interface AnalysisRequest {
  files: SequenceFile[];
  method: string;
  parameters?: Record<string, any>;
}

export interface AnalysisResponse {
  success: boolean;
  message: string;
  tree_newick?: string;
  distance_matrix?: number[][];
  sequence_names: string[];
  metadata: Record<string, any>;
  execution_time?: number;
}

export interface MethodInfo {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface SequenceData {
  name: string;
  sequence: string;
  length: number;
}

export interface RegisterPayload {
  name: string;
  email: string;
  institute: string;
  password: string;
}

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

const TOKEN_KEY = 'dss_access_token';

export const AuthToken = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
  isPresent: (): boolean => !!localStorage.getItem(TOKEN_KEY),
  /** Decode the JWT payload (client-side only, no verification) and return the role claim. */
  getRole: (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role ?? null;
    } catch {
      return null;
    }
  },
};

// ---------------------------------------------------------------------------
// API Client
// ---------------------------------------------------------------------------

class DSSApiClient {
  private static baseUrl: string = 'http://107.175.17.233:30000';

  constructor(baseUrl = 'http://107.175.17.233:30000') {
    DSSApiClient.baseUrl = baseUrl;
  }

  private static authHeaders(): Record<string, string> {
    const token = AuthToken.get();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // ---- Auth ----------------------------------------------------------------

  static async register(payload: RegisterPayload): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }
  }

  static async login(email: string, password: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    const data = await response.json();
    AuthToken.set(data.access_token);
  }

  static logout(): void {
    AuthToken.clear();
  }

  static async getUsers(): Promise<{ name: string; email: string; institute: string; role?: string }[]> {
    const response = await fetch(`${this.baseUrl}/admin/users`, {
      headers: this.authHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as any).detail || 'Failed to fetch users');
    }
    return response.json();
  }

  static async updateUser(email: string, fields: { name?: string; institute?: string; role?: string }): Promise<void> {
    const response = await fetch(`${this.baseUrl}/admin/users`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
      body: JSON.stringify({ email, ...fields }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as any).detail || 'Failed to update user');
    }
  }

  // ---- Public endpoints ----------------------------------------------------

  static async getMethods(): Promise<MethodInfo[]> {
    const response = await fetch(`${this.baseUrl}/methods`);
    if (!response.ok) {
      throw new Error(`Failed to fetch methods: ${response.statusText}`);
    }
    return response.json();
  }

  static async getMethodInfo(methodName: string): Promise<MethodInfo> {
    const response = await fetch(`${this.baseUrl}/methods/${methodName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch method info: ${response.statusText}`);
    }
    return response.json();
  }

  static async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  }

  // ---- Protected endpoints -------------------------------------------------

  static async uploadAndParse(files: File[]): Promise<SequenceData[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload files: ${response.statusText}`);
    }
    return response.json();
  }

  static async analyzeSequences(request: AnalysisRequest): Promise<AnalysisResponse> {
    const response = await fetch(`${this.baseUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.authHeaders(),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Analysis failed: ${response.statusText}`);
    }
    return response.json();
  }

  // Utility method to convert File to base64
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:*;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  }

  // Helper method to prepare files for analysis
  static async prepareFilesForAnalysis(files: File[]): Promise<SequenceFile[]> {
    const sequenceFiles: SequenceFile[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      const base64Content = await DSSApiClient.fileToBase64(file);
      sequenceFiles.push({
        filename: file.name,
        content: base64Content,
      });
    }

    return sequenceFiles;
  }
}

export { DSSApiClient };
