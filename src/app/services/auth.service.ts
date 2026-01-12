import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { User, LoginCredentials } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private firebaseService: FirebaseService) {
    // Initialize with null user
    this.currentUserSubject.next(null);
    
    // Restore authentication state on app initialization
    this.restoreAuthState();
  }

  private async restoreAuthState() {
    // Listen to Firebase auth state changes
    this.firebaseService.onAuthStateChanged().subscribe(async (firebaseUser) => {
      if (firebaseUser) {
        // User is authenticated, fetch user data from Firestore
        try {
          const userDoc = await this.firebaseService.getUser(firebaseUser.uid);
          if (userDoc) {
            this.currentUserSubject.next(userDoc);
            console.log('AuthService: User session restored:', userDoc.role);
          } else {
            // User exists in Firebase Auth but not in Firestore, create basic user
            const user: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              firstName: 'User',
              lastName: 'Name',
              role: 'customer',
              accounts: [],
              isActive: true,
              createdAt: new Date()
            };
            await this.firebaseService.createUser(user);
            this.currentUserSubject.next(user);
            console.log('AuthService: Basic user created from restored session');
          }
        } catch (error) {
          console.error('AuthService: Error restoring user session:', error);
          this.currentUserSubject.next(null);
        }
      } else {
        // User is not authenticated
        this.currentUserSubject.next(null);
        console.log('AuthService: No user session found');
      }
    });
  }

  async login(credentials: LoginCredentials): Promise<boolean> {
    try {
      console.log('AuthService: Starting login process');
      const firebaseUser = await this.firebaseService.login(credentials);
      console.log('AuthService: Firebase user obtained:', firebaseUser.uid);
      
      // Fetch user data from Firestore
      const userDoc = await this.firebaseService.getUser(firebaseUser.uid);
      console.log('AuthService: User document from Firestore:', userDoc);
      
      if (userDoc) {
        this.currentUserSubject.next(userDoc);
        console.log('AuthService: User logged in successfully:', userDoc.role);
        return true;
      } else {
        console.log('AuthService: User not found in Firestore, creating basic user');
        // If user doesn't exist in Firestore, create a basic user
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          firstName: 'User',
          lastName: 'Name',
          role: 'customer',
          accounts: [],
          isActive: true,
          createdAt: new Date()
        };
        await this.firebaseService.createUser(user);
        this.currentUserSubject.next(user);
        console.log('AuthService: Basic user created and logged in');
        return true;
      }
    } catch (error) {
      console.error('AuthService: Login failed:', error);
      return false;
    }
  }

  async register(email: string, password: string, userData: Partial<User>): Promise<boolean> {
    try {
      console.log('Starting registration for:', email);
      const firebaseUser = await this.firebaseService.register(email, password, userData);
      console.log('Firebase user created:', firebaseUser.uid);
      
      // Fetch the created user data
      const user = await this.firebaseService.getUser(firebaseUser.uid);
      console.log('User data fetched:', user);
      
      if (user) {
        this.currentUserSubject.next(user);
        console.log('User registered successfully');
        return true;
      }
      console.log('User data not found after creation');
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    await this.firebaseService.logout();
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await this.firebaseService.sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
}
