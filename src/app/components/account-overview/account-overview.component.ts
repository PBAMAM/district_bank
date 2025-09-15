import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { Account, Transaction, User } from '../../models/account.model';

@Component({
  selector: 'app-account-overview',
  templateUrl: './account-overview.component.html',
  styleUrls: ['./account-overview.component.scss']
})
export class AccountOverviewComponent implements OnInit {
  accounts: Account[] = [];
  transactions: Transaction[] = [];
  currentUser: User | null = null;
  totalBalance = 0;
  isLoading = true;

  // Account categories
  checkingAccounts: Account[] = [];
  savingsAccounts: Account[] = [];
  investmentAccounts: Account[] = [];
  securitiesAccounts: Account[] = [];
  loanAccounts: Account[] = [];
  assetAccounts: Account[] = [];

  // Totals for each category
  checkingTotal = 0;
  savingsTotal = 0;
  investmentTotal = 0;
  securitiesTotal = 0;
  loanTotal = 0;
  assetTotal = 0;
  grandTotal = 0;

  // Forecast data
  forecastData = {
    currentBalance: 0,
    futureBalance: 0,
    futureDate: ''
  };

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get current user and load accounts
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadAccounts();
      }
    });
  }

  async loadAccounts() {
    try {
      this.isLoading = true;
      
      if (this.currentUser) {
        // Load user's accounts from Firebase
        this.accounts = await this.firebaseService.getAccounts(this.currentUser.id);
        
        // Categorize accounts
        this.categorizeAccounts();
        
        // Calculate totals for each category
        this.calculateCategoryTotals();
        
        // Calculate grand total
        this.calculateGrandTotal();
        
        // Generate forecast data
        this.generateForecastData();
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      this.isLoading = false;
    }
  }

  categorizeAccounts() {
    this.checkingAccounts = [];
    this.savingsAccounts = [];
    this.investmentAccounts = [];
    this.securitiesAccounts = [];
    this.loanAccounts = [];
    this.assetAccounts = [];

    this.accounts.forEach(account => {
      const accountType = account.accountType.toLowerCase();
      
      if (accountType.includes('girokonto') || accountType.includes('checking') || accountType.includes('current')) {
        this.checkingAccounts.push(account);
      } else if (accountType.includes('sparkonto') || accountType.includes('savings') || accountType.includes('tagesgeld')) {
        this.savingsAccounts.push(account);
      } else if (accountType.includes('investment') || accountType.includes('termgeld') || accountType.includes('fixed deposit')) {
        this.investmentAccounts.push(account);
      } else if (accountType.includes('depot') || accountType.includes('securities') || accountType.includes('portfolio')) {
        this.securitiesAccounts.push(account);
      } else if (accountType.includes('kredit') || accountType.includes('loan') || accountType.includes('credit') || account.balance < 0) {
        this.loanAccounts.push(account);
      } else if (accountType.includes('asset') || accountType.includes('immobilie') || accountType.includes('fahrzeug')) {
        this.assetAccounts.push(account);
      } else {
        // Default to checking account for unknown types
        this.checkingAccounts.push(account);
      }
    });
  }

  calculateCategoryTotals() {
    this.checkingTotal = this.calculateCategoryTotal(this.checkingAccounts);
    this.savingsTotal = this.calculateCategoryTotal(this.savingsAccounts);
    this.investmentTotal = this.calculateCategoryTotal(this.investmentAccounts);
    this.securitiesTotal = this.calculateCategoryTotal(this.securitiesAccounts);
    this.loanTotal = this.calculateCategoryTotal(this.loanAccounts);
    this.assetTotal = this.calculateCategoryTotal(this.assetAccounts);
  }

  calculateCategoryTotal(accounts: Account[]): number {
    return accounts.reduce((total, account) => {
      // Ensure balance is a valid number
      const balance = typeof account.balance === 'number' ? account.balance : parseFloat(account.balance) || 0;
      
      // Convert to EUR if needed (simplified conversion)
      let amount = balance;
      if (account.currency === 'USD') {
        amount = balance * 0.85; // Simplified USD to EUR conversion
      }
      return total + amount;
    }, 0);
  }

  calculateGrandTotal() {
    this.grandTotal = this.checkingTotal + this.savingsTotal + this.investmentTotal + 
                     this.securitiesTotal + this.loanTotal + this.assetTotal;
  }

  generateForecastData() {
    // Use the main checking account for forecast
    const mainAccount = this.checkingAccounts[0] || this.accounts[0];
    if (mainAccount) {
      const balance = typeof mainAccount.balance === 'number' ? mainAccount.balance : parseFloat(mainAccount.balance) || 0;
      this.forecastData.currentBalance = balance;
      // Simple forecast: assume 5% growth over 6 months
      this.forecastData.futureBalance = balance * 1.05;
      
      // Set future date to 6 months from now
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      this.forecastData.futureDate = futureDate.toLocaleDateString('de-DE');
    }
  }

  calculateTotalBalance() {
    this.totalBalance = this.accounts.reduce((total, account) => {
      if (account.currency === 'EUR') {
        const balance = typeof account.balance === 'number' ? account.balance : parseFloat(account.balance) || 0;
        return total + balance;
      }
      return total;
    }, 0);
  }

  formatCurrency(amount: number, currency: string): string {
    // Ensure amount is a valid number
    const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    }).format(numericAmount);
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

  getAssetIcon(accountType: string): string {
    const type = accountType.toLowerCase();
    if (type.includes('immobilie') || type.includes('property') || type.includes('real estate')) {
      return '🏠';
    } else if (type.includes('fahrzeug') || type.includes('vehicle') || type.includes('car')) {
      return '🚗';
    } else if (type.includes('gold') || type.includes('precious metal')) {
      return '🥇';
    } else if (type.includes('art') || type.includes('collectible')) {
      return '🎨';
    } else {
      return '💼';
    }
  }
}
