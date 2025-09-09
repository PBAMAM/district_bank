import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { Account, Transaction } from '../../models/account.model';

@Component({
  selector: 'app-account-overview',
  templateUrl: './account-overview.component.html',
  styleUrls: ['./account-overview.component.scss']
})
export class AccountOverviewComponent implements OnInit {
  accounts: Account[] = [];
  transactions: Transaction[] = [];
  totalBalance = 0;
  isLoading = true;

  // Mock data for demonstration
  mockAccounts: Account[] = [
    {
      id: '1',
      accountNumber: '123456',
      iban: 'DE97 6605 0101 0000 1234 56',
      accountType: 'Privatgirokonto - Lebensmittel',
      accountName: 'Private Current Account - Groceries',
      balance: 1000.00,
      currency: 'EUR',
      ownerName: 'Max Mustermann',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      accountNumber: '129995',
      iban: 'DE84 6605 0101 0000 1299 95',
      accountType: 'Firmenkonto',
      accountName: 'Business Account',
      balance: -125.50,
      currency: 'EUR',
      ownerName: 'Test, Tina',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      accountNumber: '200905',
      iban: 'DE03 6605 0101 0000 2009 05',
      accountType: 'Tagesgeld - Rücklage',
      accountName: 'Savings Account - Reserve',
      balance: 18235.00,
      currency: 'EUR',
      ownerName: 'Mustermann, Max',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      accountNumber: '654321',
      iban: 'DE44 6605 0101 0000 6543 21',
      accountType: 'Girokonto (USD)',
      accountName: 'Current Account (USD)',
      balance: 1000.00,
      currency: 'USD',
      ownerName: 'Mustermann, Max',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '5',
      accountNumber: '0072',
      iban: '5149******0072',
      accountType: 'Goldkarte',
      accountName: 'Gold Credit Card',
      balance: -880.00,
      currency: 'EUR',
      ownerName: 'Mustermann, Max',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadAccounts();
  }

  async loadAccounts() {
    try {
      this.isLoading = true;
      const currentUser = this.authService.getCurrentUser();
      
      if (currentUser) {
        // For demo purposes, use mock data
        this.accounts = this.mockAccounts;
        this.calculateTotalBalance();
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      this.isLoading = false;
    }
  }

  calculateTotalBalance() {
    this.totalBalance = this.accounts.reduce((total, account) => {
      if (account.currency === 'EUR') {
        return total + account.balance;
      }
      return total;
    }, 0);
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  getAccountIcon(accountType: string): string {
    if (accountType.includes('Girokonto') || accountType.includes('Privatgirokonto')) {
      return 'S';
    } else if (accountType.includes('Tagesgeld') || accountType.includes('Savings')) {
      return 'S';
    } else if (accountType.includes('Goldkarte') || accountType.includes('Credit')) {
      return 'S';
    } else if (accountType.includes('Firmenkonto') || accountType.includes('Business')) {
      return 'S';
    }
    return 'S';
  }

  getBalanceClass(balance: number): string {
    return balance >= 0 ? 'text-success' : 'text-danger';
  }
}
