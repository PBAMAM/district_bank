import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { User, Account, Transaction } from '../../models/account.model';
import { Subscription, filter } from 'rxjs';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.scss'],
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
    trigger('slideInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class ClientDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  accounts: Account[] = [];
  transactions: Transaction[] = [];
  isLoading = true;
  totalBalance = 0;
  private routerSubscription?: Subscription;
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Get current user and load data
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadClientData();
      }
    });

    // Reload data when navigating to this route
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/client/dashboard' && this.currentUser) {
          this.loadClientData();
        }
      });

    // Reload data when page becomes visible (user switches back to tab)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.currentUser) {
        this.loadClientData();
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async loadClientData() {
    try {
      this.isLoading = true;
      
      if (this.currentUser) {
        console.log('Loading data for user:', this.currentUser.id);
        
        // Load user's accounts
        this.accounts = await this.firebaseService.getAccounts(this.currentUser.id);
        console.log('Loaded accounts:', this.accounts);
        
        // Ensure all balances are valid numbers
        this.accounts = this.accounts.map(account => ({
          ...account,
          balance: typeof account.balance === 'number' && !isNaN(account.balance) 
            ? account.balance 
            : (parseFloat(account.balance as any) || 0)
        }));
        
        // Load transactions for all accounts
        if (this.accounts.length > 0) {
          const allTransactions: Transaction[] = [];
          for (const account of this.accounts) {
            const accountTransactions = await this.firebaseService.getTransactions(account.id);
            allTransactions.push(...accountTransactions);
          }
          // Sort by creation date (newest first)
          this.transactions = allTransactions.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        
        // Calculate total balance using the same method as individual account display
        if (this.accounts.length > 0) {
          this.totalBalance = this.accounts.reduce((total, account) => {
            const accountBalance = this.getAccountBalance(account);
            console.log('Processing account:', account.accountName, 'Balance:', accountBalance);
            return total + accountBalance;
          }, 0);
        } else {
          this.totalBalance = 0;
          console.log('No accounts found, setting total balance to 0');
        }
        
        console.log('Total balance calculated:', this.totalBalance);
      } else {
        console.log('No current user found');
      }
      
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      this.isLoading = false;
    }
  }


  formatCurrency(amount: number, currency: string = 'EUR'): string {
    // Ensure amount is a valid number
    let numericAmount = typeof amount === 'number' ? amount : parseFloat(amount as any) || 0;
    
    // Check for NaN or invalid values
    if (isNaN(numericAmount) || !isFinite(numericAmount)) {
      numericAmount = 0;
    }
    
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    }).format(numericAmount);
  }

  getRecentTransactions(): Transaction[] {
    return this.transactions.slice(0, 5);
  }

  getBalanceClass(balance: number): string {
    return balance >= 0 ? 'text-success' : 'text-danger';
  }

  getAccountBalance(account: Account): number {
    // Ensure balance is always a valid number
    let balance = typeof account.balance === 'number' ? account.balance : parseFloat(account.balance as any) || 0;
    
    // Check for NaN or invalid values
    if (isNaN(balance) || !isFinite(balance)) {
      balance = 0;
    }
    
    console.log('getAccountBalance for', account.accountName, ':', balance, 'from', account.balance);
    return balance;
  }
}
