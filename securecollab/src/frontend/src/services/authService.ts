import { AuthClient } from "@dfinity/auth-client";
import { Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { backendService } from './backendService';

export interface AuthState {
  isAuthenticated: boolean;
  identity: Identity | null;
  principal: Principal | null;
  authClient: AuthClient | null;
}

class AuthService {
  private authClient: AuthClient | null = null;
  private identity: Identity | null = null;
  private principal: Principal | null = null;
  private isAuthenticated: boolean = false;
  private listeners: ((state: AuthState) => void)[] = [];

  async init(): Promise<void> {
    this.authClient = await AuthClient.create();
    
    if (await this.authClient.isAuthenticated()) {
      this.identity = this.authClient.getIdentity();
      this.principal = this.identity.getPrincipal();
      this.isAuthenticated = true;
      this.notifyListeners();
    }
  }

  async login(): Promise<boolean> {
    if (!this.authClient) {
      await this.init();
    }

    return new Promise((resolve) => {
      this.authClient!.login({
        identityProvider: import.meta.env.DFX_NETWORK === "local" 
          ? `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`
          : "https://identity.ic0.app",
        onSuccess: async () => {
          this.identity = this.authClient!.getIdentity();
          this.principal = this.identity.getPrincipal();
          this.isAuthenticated = true;
          this.notifyListeners();
          resolve(true);
        },
        onError: (error: any) => {
          console.error("Login failed:", error);
          resolve(false);
        },
      });
    });
  }

  async logout(): Promise<void> {
    if (this.authClient) {
      await this.authClient.logout();
      this.identity = null;
      this.principal = null;
      this.isAuthenticated = false;
      this.notifyListeners();
    }
  }

  getState(): AuthState {
    return {
      isAuthenticated: this.isAuthenticated,
      identity: this.identity,
      principal: this.principal,
      authClient: this.authClient,
    };
  }

  getPrincipalText(): string {
    return this.principal?.toText() || "";
  }

  // Register user identity with backend
  async registerIdentity(permissions: string[] = ['read', 'write', 'compute']): Promise<any> {
    if (!this.isAuthenticated) {
      throw new Error("User not authenticated");
    }
    
    try {
      return await backendService.registerUserIdentity(permissions);
    } catch (error) {
      console.error('Failed to register identity:', error);
      throw error;
    }
  }

  // Get user identity from backend
  async getUserIdentity(): Promise<any> {
    if (!this.isAuthenticated) {
      throw new Error("User not authenticated");
    }
    
    try {
      return await backendService.getUserIdentity();
    } catch (error) {
      console.error('Failed to get user identity:', error);
      throw error;
    }
  }

  // Derive vetKD key for specific purpose
  async deriveVetKDKey(purpose: string, derivationPath?: Uint8Array): Promise<any> {
    if (!this.isAuthenticated) {
      throw new Error("User not authenticated");
    }
    
    const path = derivationPath || new TextEncoder().encode(purpose + this.principal!.toText());
    
    try {
      return await backendService.deriveUserVetkdKey(purpose, Array.from(path));
    } catch (error) {
      console.error('Failed to derive vetKD key:', error);
      throw error;
    }
  }

  // Encrypt data using vetKD
  async encryptWithVetKD(data: Uint8Array, purpose: string): Promise<Uint8Array> {
    if (!this.isAuthenticated) {
      throw new Error("User not authenticated");
    }
    
    try {
      const result = await backendService.encryptDataWithVetkd(Array.from(data), purpose);
      return new Uint8Array(result);
    } catch (error) {
      console.error('Failed to encrypt data:', error);
      throw error;
    }
  }

  // Decrypt data using vetKD
  async decryptWithVetKD(encryptedData: Uint8Array, purpose: string): Promise<Uint8Array> {
    if (!this.isAuthenticated) {
      throw new Error("User not authenticated");
    }
    
    try {
      const result = await backendService.decryptDataWithVetkd(Array.from(encryptedData), purpose);
      return new Uint8Array(result);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      throw error;
    }
  }

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  // Generate signature for multi-party computation
  async signData(data: string): Promise<string> {
    if (!this.identity) {
      throw new Error("User not authenticated");
    }
    
    // Create a signature using the identity
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    
    // For demonstration, we'll create a simple signature based on principal and data
    // In production, this would use proper cryptographic signing
    const principalBytes = this.principal!.toUint8Array();
    const combined = new Uint8Array(principalBytes.length + dataBytes.length);
    combined.set(principalBytes);
    combined.set(dataBytes, principalBytes.length);
    
    // Create a hash-based signature
    const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
    const hashArray = new Uint8Array(hashBuffer);
    return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Verify signature from another party
  async verifySignature(data: string, signature: string, principalText: string): Promise<boolean> {
    try {
      const principal = Principal.fromText(principalText);
      
      // Recreate the expected signature
      const encoder = new TextEncoder();
      const dataBytes = encoder.encode(data);
      const principalBytes = principal.toUint8Array();
      const combined = new Uint8Array(principalBytes.length + dataBytes.length);
      combined.set(principalBytes);
      combined.set(dataBytes, principalBytes.length);
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
      const hashArray = new Uint8Array(hashBuffer);
      const expectedSignature = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
      
      return signature === expectedSignature;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
