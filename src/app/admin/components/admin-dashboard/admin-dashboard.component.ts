import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FirebaseService } from '../../../services/firebase.service';
import { User, Account, Transaction } from '../../../models/account.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;
  users: User[] = [];
  accounts: Account[] = [];
  transactions: Transaction[] = [];
  isLoading = true;
  stats = {
    totalUsers: 0,
    totalAccounts: 0,
    totalTransactions: 0,
    totalBalance: 0
  };

  constructor(
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Check if user is authenticated and is admin
    this.authService.currentUser$.subscribe(user => {
      if (!user || user.role !== 'admin') {
        this.router.navigate(['/admin']);
        return;
      }
      this.currentUser = user;
      this.loadDashboardData();
    });
  }

  async loadDashboardData() {
    try {
      this.isLoading = true;
      
      // Load all data from Firebase
      this.users = await this.firebaseService.getAllUsers();
      this.accounts = await this.firebaseService.getAllAccounts();
      this.transactions = await this.firebaseService.getAllTransactions();
      
      // Calculate stats
      this.stats.totalUsers = this.users.length;
      this.stats.totalAccounts = this.accounts.length;
      this.stats.totalTransactions = this.transactions.length;
      this.stats.totalBalance = this.accounts.reduce((total, account) => {
        return total + (account.balance || 0);
      }, 0);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/admin']);
  }

  formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  getRecentTransactions(): Transaction[] {
    return this.transactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }

  getRecentUsers(): User[] {
    return this.users
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }
}
