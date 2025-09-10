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
  }

  async login(credentials: LoginCredentials): Promise<boolean> {
    try {
      const firebaseUser = await this.firebaseService.login(credentials);
      
      // Fetch user data from Firestore
      const userDoc = await this.firebaseService.getUser(firebaseUser.uid);
      if (userDoc) {
        this.currentUserSubject.next(userDoc);
        return true;
      } else {
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
        return true;
      }
    } catch (error) {
      console.error('Login failed:', error);
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
}
