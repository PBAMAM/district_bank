import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-client-login',
  templateUrl: './client-login.component.html',
  styleUrls: ['./client-login.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class ClientLoginComponent implements OnInit {
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
      lastName: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Check if user is already authenticated as client
    this.authService.currentUser$.subscribe(user => {
      if (user && user.role === 'customer') {
        this.router.navigate(['/client/dashboard']);
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
        const success = await this.authService.login(this.loginForm.value);
        if (success) {
          const user = this.authService.getCurrentUser();
          if (user?.role === 'customer') {
            this.router.navigate(['/client/dashboard']);
          } else {
            this.errorMessage = 'Access denied. Client privileges required.';
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
          phone: formValue.phone,
          address: formValue.address,
          role: 'customer' as const
        };

        const success = await this.authService.register(formValue.email, formValue.password, userData);
        if (success) {
          this.successMessage = 'Account created successfully! Please login.';
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
