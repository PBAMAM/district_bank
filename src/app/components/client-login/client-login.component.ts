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
  showLoginForm = false;

  // Nav state
  modalOpen = false;
  mobileMenuOpen = false;
  navScrolled = false;
  activeSection = 'hero';

  // Particles
  particles = Array.from({ length: 22 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    d: Math.random() * 4,
    dur: 3 + Math.random() * 4
  }));

  // Social proof avatars
  proofAvatars = ['A', 'M', 'J', 'S', 'R'];

  // Hero stats
  heroStats = [
    { val: '€2.4B+', label: 'Assets Managed' },
    { val: '48K+', label: 'Clients Worldwide' },
    { val: '99.9%', label: 'Platform Uptime' },
    { val: '40+', label: 'Currencies' }
  ];

  // Trust strip
  trustItems = [
    { icon: '🔐', label: '256-bit Encryption' },
    { icon: '🇱🇺', label: 'Luxembourg Regulated' },
    { icon: '🏅', label: 'ISO 27001' },
    { icon: '⚡', label: 'Instant Transfers' },
    { icon: '🌍', label: '40+ Currencies' },
    { icon: '🛡️', label: 'GDPR Compliant' }
  ];

  // Features
  features = [
    { icon: '🔐', title: 'Bank-Grade Security', desc: '256-bit AES encryption, real-time fraud detection, and full regulatory compliance.' },
    { icon: '⚡', title: 'Instant Transfers', desc: 'Move funds across 40+ currencies in seconds with zero hidden fees.' },
    { icon: '🌍', title: 'Global Access', desc: 'Manage your portfolio from anywhere, on any device, 24/7.' },
    { icon: '📊', title: 'Smart Analytics', desc: 'Real-time dashboards, forecasts, and income/expenditure charts built in.' },
    { icon: '🏦', title: 'Multi-Account', desc: 'Manage checking, savings, investments, and securities in one portal.' },
    { icon: '💼', title: 'Private Advisory', desc: 'Dedicated relationship manager and private banking specialists.' }
  ];

  // Services
  services = [
    { icon: '💰', title: 'Deposits & Withdrawals', desc: 'Request deposits and withdrawals with full admin oversight and transparent status tracking.' },
    { icon: '💸', title: 'International Transfers', desc: 'Send money globally via SWIFT/SEPA with competitive exchange rates.' },
    { icon: '📈', title: 'Investment Accounts', desc: 'Grow your wealth with curated investment portfolios tailored to your goals.' },
    { icon: '🏛️', title: 'Wealth Management', desc: 'Expert management of your estate, securities, and asset portfolio.' },
    { icon: '🔒', title: 'Secured Loans', desc: 'Flexible lending solutions backed by your existing assets.' },
    { icon: '🎯', title: 'Tax Optimization', desc: 'Strategic planning to maximize after-tax returns within Luxembourg frameworks.' }
  ];

  // Security badges
  secBadges = [
    { icon: '🔒', label: 'SSL / TLS 1.3' },
    { icon: '🇱🇺', label: 'Luxembourg Regulated' },
    { icon: '🏅', label: 'ISO 27001 Certified' },
    { icon: '👁️', label: '24/7 Monitoring' },
    { icon: '🛡️', label: 'GDPR Compliant' }
  ];

  showLoginModal(mode: 'sign-in' | 'register') {
    this.isLoginMode = mode === 'sign-in';
    this.clearMessages();
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
    this.clearMessages();
  }

  scrollTo(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.activeSection = sectionId;
    }
  }

  private onScroll = () => {
    const y = window.scrollY;
    this.navScrolled = y > 40;
    const sections = ['hero', 'features', 'services', 'security'];
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom > 100) { this.activeSection = id; break; }
      }
    }
  };

  // Virtual Keyboard State
  showKeyboard = false;

  keyboardTarget: 'login-header' | 'login-modal' | 'register-modal' = 'login-header';
  keyboardControl: 'email' | 'password' = 'password';
  isShifted = false;
  isSymbols = false;

  // Keyboard Layouts
  keyboardLetters = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  keyboardSymbols = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
    ['-', '_', '=', '+', '[', ']', '{', '}', ';', ':'],
    ['\'', '"', ',', '.', '<', '>', '/', '?', '\\', '|']
  ];

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
        const payload = {
          email: this.loginForm.value.email,
          password: this.loginForm.value.password,
          role: 'customer' as const
        };
        const success = await this.authService.login(payload);
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

  // Virtual Keyboard Logic
  toggleKeyboard(target: 'login-header' | 'login-modal' | 'register-modal', control: 'email' | 'password', event: Event) {
    event.preventDefault(); // Prevent page scroll/jump
    if (this.showKeyboard && this.keyboardTarget === target && this.keyboardControl === control) {
      this.closeKeyboard();
    } else {
      this.keyboardTarget = target;
      this.keyboardControl = control;
      this.showKeyboard = true;
    }
  }

  closeKeyboard() {
    this.showKeyboard = false;
    this.isShifted = false;
    this.isSymbols = false;
  }

  handleKeyPress(key: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    // Determine target form and control
    let targetForm: FormGroup;
    let controlName = this.keyboardControl;

    if (this.keyboardTarget === 'login-header' || this.keyboardTarget === 'login-modal') {
      targetForm = this.loginForm;
    } else {
      targetForm = this.registerForm;
    }

    const control = targetForm.get(controlName);
    if (!control) return;

    let currentValue = control.value || '';

    // Handle special keys
    switch (key) {
      case 'BACKSPACE':
        control.setValue(currentValue.slice(0, -1));
        break;
      case 'CLEAR':
        control.setValue('');
        break;
      case 'SHIFT':
        this.isShifted = !this.isShifted;
        break;
      case 'SYMBOLS':
        this.isSymbols = !this.isSymbols;
        this.isShifted = false; // Reset shift when changing mode
        break;
      case 'SPACE':
        control.setValue(currentValue + ' ');
        break;
      case 'CLOSE':
        this.closeKeyboard();
        break;
      default:
        // Handle regular keys
        const charToAppend = this.isShifted ? key.toUpperCase() : key;
        control.setValue(currentValue + charToAppend);

        // Auto-unshift if shifted but not in symbol mode
        if (this.isShifted && !this.isSymbols) {
          this.isShifted = false;
        }
        break;
    }

    // Mark as dirty and touched so validation messages (if any) update
    control.markAsDirty();
    control.markAsTouched();
    targetForm.updateValueAndValidity();
  }
}
