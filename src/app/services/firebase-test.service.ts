import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class FirebaseTestService {
  private auth = inject(Auth);

  constructor() {
    this.testFirebaseConnection();
  }

  testFirebaseConnection() {
    try {
      console.log('Testing Firebase connection...');
      console.log('Firebase auth initialized:', this.auth);
      console.log('Auth domain:', this.auth.app.options.authDomain);
      console.log('Project ID:', this.auth.app.options.projectId);
    } catch (error) {
      console.error('Firebase connection test failed:', error);
    }
  }
}
