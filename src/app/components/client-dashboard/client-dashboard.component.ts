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
        console.log('Loading data for user:', this.currentUser.id);
        
        // Load user's accounts
        this.accounts = await this.firebaseService.getAccounts(this.currentUser.id);
        console.log('Loaded accounts:', this.accounts);
        
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
        
        // Calculate total balance - ensure balance is a number
        if (this.accounts.length > 0) {
          this.totalBalance = this.accounts.reduce((total, account) => {
            console.log('Processing account:', account.accountName, 'Balance:', account.balance, 'Type:', typeof account.balance);
            const balance = typeof account.balance === 'number' ? account.balance : parseFloat(account.balance) || 0;
            console.log('Converted balance:', balance);
            return total + balance;
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
    const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
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
    const balance = typeof account.balance === 'number' ? account.balance : parseFloat(account.balance) || 0;
    console.log('getAccountBalance for', account.accountName, ':', balance, 'from', account.balance);
    return balance;
  }

  // Method to create sample account for testing
  async createSampleAccount() {
    if (this.currentUser) {
      try {
        const sampleAccount: Omit<Account, 'id'> = {
          accountNumber: '123456',
          iban: 'DE97 6605 0101 0000 1234 56',
          accountType: 'Privatgirokonto',
          accountName: 'Private Current Account',
          balance: 1000.00,
          currency: 'EUR',
          ownerName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const accountId = await this.firebaseService.createAccount(sampleAccount);
        console.log('Sample account created with ID:', accountId);
        
        // Reload data
        await this.loadClientData();
      } catch (error) {
        console.error('Error creating sample account:', error);
      }
    }
  }
}
