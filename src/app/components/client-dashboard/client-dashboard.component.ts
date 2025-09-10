import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { User, Account, Transaction } from '../../models/account.model';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.scss']
})
export class ClientDashboardComponent implements OnInit {
  currentUser: User | null = null;
  accounts: Account[] = [];
  transactions: Transaction[] = [];
  isLoading = true;
  totalBalance = 0;

  constructor(
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Get current user and load data
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadClientData();
      }
    });
  }

  async loadClientData() {
    try {
      this.isLoading = true;
      
      if (this.currentUser) {
        // Load user's accounts and transactions
        this.accounts = await this.firebaseService.getAccounts(this.currentUser.id);
        this.transactions = await this.firebaseService.getTransactions(this.accounts[0]?.id || '');
        
        // Calculate total balance
        this.totalBalance = this.accounts.reduce((total, account) => {
          return total + (account.balance || 0);
        }, 0);
      }
      
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      this.isLoading = false;
    }
  }


  formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  getRecentTransactions(): Transaction[] {
    return this.transactions.slice(0, 5);
  }

  getBalanceClass(balance: number): string {
    return balance >= 0 ? 'text-success' : 'text-danger';
  }
}
