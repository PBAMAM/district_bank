import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoginMode = true;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Check if user is already authenticated as admin
    this.authService.currentUser$.subscribe(user => {
      if (user && user.role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
    
    return null;
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.clearMessages();
  }

  async onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.clearMessages();

      try {
        console.log('Attempting admin login with:', this.loginForm.value);
        const success = await this.authService.login(this.loginForm.value);
        console.log('Login success:', success);
        
        if (success) {
          const user = this.authService.getCurrentUser();
          console.log('Current user after login:', user);
          
          if (user?.role === 'admin') {
            console.log('Admin user authenticated, navigating to dashboard');
            this.router.navigate(['/admin/dashboard']);
          } else {
            console.log('User is not admin, role:', user?.role);
            this.errorMessage = 'Access denied. Admin privileges required.';
            await this.authService.logout();
          }
        } else {
          this.errorMessage = 'Invalid credentials. Please try again.';
        }
      } catch (error) {
        this.errorMessage = 'Login failed. Please try again.';
        console.error('Login error:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  async onRegister() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.clearMessages();

      try {
        const formValue = this.registerForm.value;
        const userData = {
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          role: 'admin' as const
        };

        console.log('Attempting admin registration with:', { email: formValue.email, userData });
        const success = await this.authService.register(formValue.email, formValue.password, userData);
        console.log('Registration success:', success);
        
        if (success) {
          this.successMessage = 'Admin account created successfully! Please login.';
          this.isLoginMode = true;
          this.registerForm.reset();
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      } catch (error) {
        this.errorMessage = 'Registration failed: ' + (error as any).message;
        console.error('Registration error:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
