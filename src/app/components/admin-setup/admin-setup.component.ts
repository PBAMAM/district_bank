import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-admin-setup',
  template: `
    <div class="admin-setup-container">
      <div class="setup-card">
        <h1>Admin Setup</h1>
        <p>Create your first admin account to access the admin panel.</p>
        
        <form [formGroup]="setupForm" (ngSubmit)="createAdmin()" class="setup-form">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              formControlName="firstName"
              class="form-control"
              placeholder="Admin"
            >
          </div>
          
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              formControlName="lastName"
              class="form-control"
              placeholder="User"
            >
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              placeholder="admin@swissone.com"
            >
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="form-control"
              placeholder="Minimum 6 characters"
            >
          </div>
          
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="setupForm.invalid || isLoading"
          >
            {{ isLoading ? 'Creating Admin...' : 'Create Admin Account' }}
          </button>
        </form>
        
        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <div *ngIf="successMessage" class="success-message">
          {{ successMessage }}
        </div>
        
        <div class="setup-actions">
          <a routerLink="/admin" class="back-link">Back to Admin Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-setup-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .setup-card {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 400px;
    }
    
    .setup-card h1 {
      color: #333;
      margin-bottom: 10px;
      text-align: center;
    }
    
    .setup-card p {
      color: #666;
      text-align: center;
      margin-bottom: 30px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 5px;
      color: #333;
      font-weight: 500;
    }
    
    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid #e1e5e9;
      border-radius: 6px;
      font-size: 16px;
      transition: border-color 0.3s ease;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .btn {
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    
    .btn:hover:not(:disabled) {
      background: #5a6fd8;
    }
    
    .btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .error-message {
      background: #fee;
      color: #c33;
      padding: 10px;
      border-radius: 6px;
      margin-top: 15px;
      text-align: center;
    }
    
    .success-message {
      background: #efe;
      color: #3c3;
      padding: 10px;
      border-radius: 6px;
      margin-top: 15px;
      text-align: center;
    }
    
    .setup-actions {
      text-align: center;
      margin-top: 20px;
    }
    
    .back-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }
    
    .back-link:hover {
      text-decoration: underline;
    }
  `]
})
export class AdminSetupComponent implements OnInit {
  setupForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    this.setupForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Check if admin already exists
    this.checkExistingAdmin();
  }

  async checkExistingAdmin() {
    try {
      const users = await this.firebaseService.getAllUsers();
      const adminExists = users.some(user => user.role === 'admin');
      
      if (adminExists) {
        this.router.navigate(['/admin']);
      }
    } catch (error) {
      console.error('Error checking existing admin:', error);
    }
  }

  async createAdmin() {
    if (this.setupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const formValue = this.setupForm.value;
        const userData = {
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          role: 'admin' as const
        };

        console.log('Creating admin account:', { email: formValue.email, userData });
        const success = await this.authService.register(formValue.email, formValue.password, userData);
        
        if (success) {
          this.successMessage = 'Admin account created successfully! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 2000);
        } else {
          this.errorMessage = 'Failed to create admin account. Please try again.';
        }
      } catch (error) {
        this.errorMessage = 'Error creating admin account: ' + (error as any).message;
        console.error('Admin creation error:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }
}
