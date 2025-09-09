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
    // Listen for auth state changes
    this.firebaseService.getCurrentUser();
  }

  async login(credentials: LoginCredentials): Promise<boolean> {
    try {
      const firebaseUser = await this.firebaseService.login(credentials);
      // Here you would typically fetch user data from Firestore
      // For now, we'll create a mock user
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        firstName: 'Max',
        lastName: 'Mustermann',
        role: 'customer',
        accounts: [],
        isActive: true,
        createdAt: new Date()
      };
      this.currentUserSubject.next(user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
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
