import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseDebugService {
  private auth = inject(Auth);
  private db = inject(Firestore);

  constructor() {
    this.debugFirebaseConfiguration();
  }

  debugFirebaseConfiguration() {
    console.log('=== Firebase Configuration Debug ===');
    console.log('Environment config:', environment.firebase);
    
    try {
      console.log('Auth instance:', this.auth);
      console.log('Auth app:', this.auth.app);
      console.log('Auth app options:', this.auth.app.options);
      console.log('Project ID:', this.auth.app.options.projectId);
      console.log('Auth Domain:', this.auth.app.options.authDomain);
      console.log('API Key:', this.auth.app.options.apiKey);
      
      // Test if we can access the auth methods
      console.log('Auth methods available:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.auth)));
      
      // Test Firestore
      console.log('Firestore instance:', this.db);
      console.log('Firestore app:', this.db.app);
      console.log('Firestore app options:', this.db.app.options);
      
    } catch (error) {
      console.error('Firebase configuration debug failed:', error);
    }
    
    console.log('=== End Firebase Configuration Debug ===');
  }

  async testAuthConnection() {
    try {
      console.log('Testing auth connection...');
      // Try to get the current user (should be null if not logged in)
      const currentUser = this.auth.currentUser;
      console.log('Current user:', currentUser);
      
      // Test if auth is properly configured by checking the auth state
      return new Promise((resolve, reject) => {
        const unsubscribe = this.auth.onAuthStateChanged((user) => {
          console.log('Auth state changed:', user);
          unsubscribe();
          resolve(user);
        }, (error) => {
          console.error('Auth state error:', error);
          unsubscribe();
          reject(error);
        });
      });
    } catch (error) {
      console.error('Auth connection test failed:', error);
      throw error;
    }
  }
}
