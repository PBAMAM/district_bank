import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { Account, Transaction, User } from '../../models/account.model';

@Component({
  selector: 'app-financial-planner',
  templateUrl: './financial-planner.component.html',
  styleUrls: ['./financial-planner.component.scss']
})
export class FinancialPlannerComponent implements OnInit {
  accounts: Account[] = [];
  transactions: Transaction[] = [];
  currentUser: User | null = null;
  isLoading = true;

  // Transaction analysis data
  monthlyIncome: number[] = [];
  monthlyExpenditure: number[] = [];
  monthlySurplus: number[] = [];
  totalIncome = 0;
  totalExpenditure = 0;
  totalSurplus = 0;
  averageMonthlyIncome = 0;
  averageMonthlyExpenditure = 0;
  averageMonthlySurplus = 0;

  // Chart data for income/expenditure
  incomeExpenditureData = {
    labels: ['July', 'August', 'September'],
    datasets: [
      {
        label: 'Income',
        data: [0, 0, 0],
        backgroundColor: '#28a745',
        borderColor: '#28a745',
        borderWidth: 1
      },
      {
        label: 'Expenditure',
        data: [0, 0, 0],
        backgroundColor: '#dc3545',
        borderColor: '#dc3545',
        borderWidth: 1
      }
    ]
  };

  // Chart options
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#ffffff'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: '#444'
        }
      },
      y: {
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: '#444'
        }
      }
    }
  };

  // Forecast data
  forecastData = {
    labels: ['Today', 'Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025', 'Jul 2025', 'Aug 2025', 'Sep 2025'],
    datasets: [{
      label: 'Account Balance',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      borderColor: '#28a745',
      backgroundColor: 'rgba(40, 167, 69, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  // Fixed costs data
  fixedCostsData = {
    labels: ['September', 'October', 'Expected Monthly Avg'],
    datasets: [{
      label: 'Fixed Costs',
      data: [0, 0, 0],
      backgroundColor: '#6c757d',
      borderColor: '#6c757d',
      borderWidth: 1
    }]
  };

  // Budget data
  budgetData = {
    labels: ['Posted', 'Remaining'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#28a745', '#6c757d'],
      borderWidth: 0
    }]
  };

  // Budget analysis
  monthlyBudget = 1800;
  postedAmount = 0;
  remainingAmount = 0;

  budgetOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  // Keywords and transaction analysis
  keywords: string[] = [];
  transactionKeywords: { [key: string]: number } = {};
  topCategories: { category: string; amount: number; count: number }[] = [];
  recentTransactions: Transaction[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // Get current user and load data
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadFinancialData();
      }
    });
  }

  async loadFinancialData() {
    try {
      this.isLoading = true;
      
      if (this.currentUser) {
        // Load user's accounts and transactions
        this.accounts = await this.firebaseService.getAccounts(this.currentUser.id);
        
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
        
        // Update chart data with real transaction data
        this.updateChartData();
        
        // Perform comprehensive transaction analysis
        this.analyzeTransactions();
        
        // Generate keywords from transactions
        this.generateKeywords();
        
        // Calculate budget analysis
        this.calculateBudgetAnalysis();
        
        // Generate forecast data
        this.generateForecastData();
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  updateChartData() {
    // Calculate income and expenditure from transactions
    const last3Months = this.getLast3MonthsTransactions();
    const income = this.calculateMonthlyAmounts(last3Months, 'income');
    const expenditure = this.calculateMonthlyAmounts(last3Months, 'expenditure');
    
    this.incomeExpenditureData = {
      labels: ['July', 'August', 'September'],
      datasets: [
        {
          label: 'Income',
          data: income,
          backgroundColor: '#28a745',
          borderColor: '#28a745',
          borderWidth: 1
        },
        {
          label: 'Expenditure',
          data: expenditure,
          backgroundColor: '#dc3545',
          borderColor: '#dc3545',
          borderWidth: 1
        }
      ]
    };
  }

  getLast3MonthsTransactions(): Transaction[] {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    return this.transactions.filter(transaction => 
      new Date(transaction.createdAt) >= threeMonthsAgo
    );
  }

  calculateMonthlyAmounts(transactions: Transaction[], type: 'income' | 'expenditure'): number[] {
    const months = [7, 8, 9]; // July, August, September
    return months.map(month => {
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate.getMonth() + 1 === month;
      });
      
      return monthTransactions.reduce((total, t) => {
        if (type === 'income' && t.amount > 0) {
          return total + t.amount;
        } else if (type === 'expenditure' && t.amount < 0) {
          return total + Math.abs(t.amount);
        }
        return total;
      }, 0);
    });
  }

  analyzeTransactions() {
    // Calculate totals
    this.totalIncome = this.transactions
      .filter(t => t.amount > 0)
      .reduce((total, t) => total + t.amount, 0);
    
    this.totalExpenditure = this.transactions
      .filter(t => t.amount < 0)
      .reduce((total, t) => total + Math.abs(t.amount), 0);
    
    this.totalSurplus = this.totalIncome - this.totalExpenditure;

    // Calculate monthly averages
    const months = this.getLast3Months();
    this.averageMonthlyIncome = this.totalIncome / months.length;
    this.averageMonthlyExpenditure = this.totalExpenditure / months.length;
    this.averageMonthlySurplus = this.totalSurplus / months.length;

    // Get recent transactions
    this.recentTransactions = this.transactions.slice(0, 10);

    // Analyze transaction categories
    this.analyzeTransactionCategories();
  }

  getLast3Months(): string[] {
    const months = [];
    const now = new Date();
    for (let i = 2; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toLocaleDateString('en-US', { month: 'long' }));
    }
    return months;
  }

  analyzeTransactionCategories() {
    const categories: { [key: string]: { amount: number; count: number } } = {};
    
    this.transactions.forEach(transaction => {
      // Extract category from description (simplified)
      const description = transaction.description.toLowerCase();
      let category = 'Other';
      
      if (description.includes('grocery') || description.includes('food') || description.includes('supermarket')) {
        category = 'Food & Groceries';
      } else if (description.includes('rent') || description.includes('mortgage') || description.includes('housing')) {
        category = 'Housing';
      } else if (description.includes('transport') || description.includes('gas') || description.includes('fuel')) {
        category = 'Transportation';
      } else if (description.includes('utility') || description.includes('electric') || description.includes('water')) {
        category = 'Utilities';
      } else if (description.includes('salary') || description.includes('income') || description.includes('wage')) {
        category = 'Income';
      } else if (description.includes('entertainment') || description.includes('movie') || description.includes('restaurant')) {
        category = 'Entertainment';
      }

      if (!categories[category]) {
        categories[category] = { amount: 0, count: 0 };
      }
      categories[category].amount += Math.abs(transaction.amount);
      categories[category].count++;
    });

    this.topCategories = Object.entries(categories)
      .map(([category, data]) => ({ category, amount: data.amount, count: data.count }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }

  generateKeywords() {
    const keywordCount: { [key: string]: number } = {};
    
    this.transactions.forEach(transaction => {
      const words = transaction.description.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3 && !this.isCommonWord(word));
      
      words.forEach(word => {
        keywordCount[word] = (keywordCount[word] || 0) + 1;
      });
    });

    this.keywords = Object.entries(keywordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => `#${word}`);
  }

  isCommonWord(word: string): boolean {
    const commonWords = ['the', 'and', 'for', 'with', 'from', 'this', 'that', 'have', 'been', 'they', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'there', 'could', 'other'];
    return commonWords.includes(word);
  }

  calculateBudgetAnalysis() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthTransactions = this.transactions.filter(t => {
      const transactionDate = new Date(t.createdAt);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    this.postedAmount = currentMonthTransactions
      .filter(t => t.amount < 0)
      .reduce((total, t) => total + Math.abs(t.amount), 0);
    
    this.remainingAmount = Math.max(0, this.monthlyBudget - this.postedAmount);

    // Update budget chart
    this.budgetData = {
      labels: ['Posted', 'Remaining'],
      datasets: [{
        data: [this.postedAmount, this.remainingAmount],
        backgroundColor: ['#28a745', '#6c757d'],
        borderWidth: 0
      }]
    };
  }

  generateForecastData() {
    if (this.accounts.length === 0) return;

    const mainAccount = this.accounts[0];
    const currentBalance = mainAccount.balance;
    const monthlyGrowth = this.averageMonthlySurplus;
    
    const forecastData = [currentBalance];
    for (let i = 1; i < 12; i++) {
      forecastData.push(currentBalance + (monthlyGrowth * i));
    }

    this.forecastData = {
      ...this.forecastData,
      datasets: [{
        ...this.forecastData.datasets[0],
        data: forecastData
      }]
    };
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}
