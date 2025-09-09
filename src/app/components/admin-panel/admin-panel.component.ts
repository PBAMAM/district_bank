import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { AccountCreationService } from '../../services/account-creation.service';
import { Account, User, Transaction } from '../../models/account.model';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  // Forms
  createAccountForm: FormGroup;
  createUserForm: FormGroup;
  transferForm: FormGroup;

  // Data
  users: User[] = [];
  accounts: Account[] = [];
  transactions: Transaction[] = [];
  selectedUser: User | null = null;
  selectedFromAccount: Account | null = null;
  selectedToAccount: Account | null = null;

  // UI State
  activeTab = 'users';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Mock data for demonstration
  mockUsers: User[] = [
    {
      id: '1',
      email: 'max.mustermann@example.com',
      firstName: 'Max',
      lastName: 'Mustermann',
      role: 'customer',
      accounts: ['1', '2'],
      isActive: true,
      createdAt: new Date()
    },
    {
      id: '2',
      email: 'tina.test@example.com',
      firstName: 'Tina',
      lastName: 'Test',
      role: 'customer',
      accounts: ['3'],
      isActive: true,
      createdAt: new Date()
    },
    {
      id: '3',
      email: 'admin@bank.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      accounts: [],
      isActive: true,
      createdAt: new Date()
    }
  ];

  mockAccounts: Account[] = [
    {
      id: '1',
      accountNumber: '123456',
      iban: 'DE97 6605 0101 0000 1234 56',
      accountType: 'Privatgirokonto',
      accountName: 'Private Current Account',
      balance: 1000.00,
      currency: 'EUR',
      ownerName: 'Max Mustermann',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      accountNumber: '789012',
      iban: 'DE97 6605 0101 0000 7890 12',
      accountType: 'Savings Account',
      accountName: 'Savings Account',
      balance: 5000.00,
      currency: 'EUR',
      ownerName: 'Max Mustermann',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      accountNumber: '345678',
      iban: 'DE97 6605 0101 0000 3456 78',
      accountType: 'Business Account',
      accountName: 'Business Account',
      balance: 2500.00,
      currency: 'EUR',
      ownerName: 'Tina Test',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private accountCreationService: AccountCreationService
  ) {
    this.createAccountForm = this.fb.group({
      accountNumber: ['', [Validators.required]],
      iban: ['', [Validators.required]],
      accountType: ['', [Validators.required]],
      accountName: ['', [Validators.required]],
      initialBalance: [0, [Validators.required, Validators.min(0)]],
      currency: ['EUR', [Validators.required]],
      ownerId: ['', [Validators.required]]
    });

    this.createUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      role: ['customer', [Validators.required]]
    });

    this.transferForm = this.fb.group({
      fromAccountId: ['', [Validators.required]],
      toAccountId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    try {
      // For demo purposes, use mock data
      this.users = this.mockUsers;
      this.accounts = this.mockAccounts;
      
      // In a real app, you would load from Firebase:
      // this.users = await this.firebaseService.getAllUsers();
      // this.accounts = await this.firebaseService.getAllAccounts();
      // this.transactions = await this.firebaseService.getAllTransactions();
    } catch (error) {
      this.errorMessage = 'Failed to load data';
      console.error('Error loading data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.clearMessages();
  }

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }

  async createUser() {
    if (this.createUserForm.valid) {
      this.isLoading = true;
      this.clearMessages();

      try {
        const userData = this.createUserForm.value;
        
        // In a real app, you would create the user in Firebase Auth and Firestore
        // const newUser = await this.firebaseService.register(userData.email, 'defaultPassword', userData);
        
        // For demo, add to mock data
        const newUser: User = {
          id: Date.now().toString(),
          ...userData,
          accounts: [],
          isActive: true,
          createdAt: new Date()
        };
        
        this.users.push(newUser);
        this.createUserForm.reset();
        this.successMessage = 'User created successfully!';
        
      } catch (error) {
        this.errorMessage = 'Failed to create user';
        console.error('Error creating user:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  async createAccount() {
    if (this.createAccountForm.valid) {
      this.isLoading = true;
      this.clearMessages();

      try {
        const accountData = this.createAccountForm.value;
        const owner = this.users.find(u => u.id === accountData.ownerId);
        
        // In a real app, you would save to Firebase
        // const accountId = await this.firebaseService.createAccount(accountData);
        
        // For demo, add to mock data
        const newAccount: Account = {
          id: Date.now().toString(),
          ...accountData,
          ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        this.accounts.push(newAccount);
        this.createAccountForm.reset();
        this.successMessage = 'Account created successfully!';
        
      } catch (error) {
        this.errorMessage = 'Failed to create account';
        console.error('Error creating account:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  async processTransfer() {
    if (this.transferForm.valid) {
      this.isLoading = true;
      this.clearMessages();

      try {
        const transferData = this.transferForm.value;
        const fromAccount = this.accounts.find(a => a.id === transferData.fromAccountId);
        const toAccount = this.accounts.find(a => a.id === transferData.toAccountId);

        if (!fromAccount || !toAccount) {
          this.errorMessage = 'Invalid account selection';
          return;
        }

        if (fromAccount.balance < transferData.amount) {
          this.errorMessage = 'Insufficient funds';
          return;
        }

        // Create transaction
        const transaction: Omit<Transaction, 'id'> = {
          fromAccountId: transferData.fromAccountId,
          toAccountId: transferData.toAccountId,
          amount: transferData.amount,
          currency: fromAccount.currency,
          description: transferData.description,
          type: 'transfer',
          status: 'completed',
          createdAt: new Date(),
          processedAt: new Date()
        };

        // Update account balances
        fromAccount.balance -= transferData.amount;
        toAccount.balance += transferData.amount;

        // In a real app, you would save to Firebase
        // await this.firebaseService.createTransaction(transaction);
        // await this.firebaseService.updateAccountBalance(fromAccount.id, fromAccount.balance);
        // await this.firebaseService.updateAccountBalance(toAccount.id, toAccount.balance);

        this.transactions.unshift({ id: Date.now().toString(), ...transaction });
        this.transferForm.reset();
        this.successMessage = 'Transfer completed successfully!';

      } catch (error) {
        this.errorMessage = 'Transfer failed';
        console.error('Error processing transfer:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  getAccountOwner(accountId: string): string {
    const account = this.accounts.find(a => a.id === accountId);
    return account ? account.ownerName : 'Unknown';
  }

  // Quick method to create sample data for testing
  async createSampleData() {
    this.isLoading = true;
    this.clearMessages();

    try {
      const sampleData = await this.accountCreationService.createSampleUserWithAccounts();
      
      // Add sample user
      const newUser: User = {
        id: Date.now().toString(),
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer',
        accounts: [],
        isActive: true,
        createdAt: new Date()
      };
      
      this.users.push(newUser);
      
      // Add sample accounts
      sampleData.accounts.forEach((accountData, index) => {
        const newAccount: Account = {
          id: (Date.now() + index).toString(),
          ...accountData,
          ownerName: 'John Doe'
        };
        this.accounts.push(newAccount);
      });
      
      this.successMessage = 'Sample data created successfully!';
      
    } catch (error) {
      this.errorMessage = 'Failed to create sample data';
      console.error('Error creating sample data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Auto-fill form with sample data
  fillSampleAccountData() {
    this.createAccountForm.patchValue({
      accountNumber: this.accountCreationService.generateAccountNumber(),
      iban: this.accountCreationService.generateIBAN(),
      accountType: 'Privatgirokonto',
      accountName: 'Private Current Account',
      initialBalance: 1000.00,
      currency: 'EUR',
      ownerId: this.users.length > 0 ? this.users[0].id : ''
    });
  }
}
