import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { AuthService } from '../../../services/auth.service';
import { AccountCreationService } from '../../../services/account-creation.service';
import { Account, User, Transaction } from '../../../models/account.model';

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
  adminDepositForm: FormGroup;

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
      amount: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required]]
    });

    this.adminDepositForm = this.fb.group({
      toAccountId: ['', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    try {
      // Load real data from Firebase
      this.users = await this.firebaseService.getAllUsers();
      this.accounts = await this.firebaseService.getAllAccounts();
      this.transactions = await this.firebaseService.getAllTransactions();
      
      console.log('Loaded data:', {
        users: this.users.length,
        accounts: this.accounts.length,
        transactions: this.transactions.length
      });
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
        
        // Create user in Firebase Auth and Firestore
        const firebaseUser = await this.firebaseService.register(
          userData.email, 
          'defaultPassword123', // Default password for new users
          userData
        );
        
        if (firebaseUser) {
          // Create our custom User object
          const newUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            accounts: [],
            isActive: true,
            createdAt: new Date()
          };
          
          this.users.push(newUser);
          this.createUserForm.reset();
          this.successMessage = 'User created successfully! Password: defaultPassword123';
        } else {
          this.errorMessage = 'Failed to create user';
        }
        
      } catch (error) {
        this.errorMessage = 'Failed to create user: ' + (error as Error).message;
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
        
        if (!owner) {
          this.errorMessage = 'Selected user not found';
          return;
        }
        
        // Create account in Firebase
        const newAccount: Omit<Account, 'id'> = {
          ...accountData,
          ownerId: accountData.ownerId,
          ownerName: `${owner.firstName} ${owner.lastName}`,
          balance: accountData.initialBalance || 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const accountId = await this.firebaseService.createAccount(newAccount);
        
        if (accountId) {
          // Add to local array for immediate UI update
          this.accounts.push({ id: accountId, ...newAccount });
          this.createAccountForm.reset();
          this.successMessage = 'Account created successfully!';
        } else {
          this.errorMessage = 'Failed to create account';
        }
        
      } catch (error) {
        this.errorMessage = 'Failed to create account: ' + (error as Error).message;
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
        
        // Convert amount to number to prevent NaN issues
        const amount = parseFloat(transferData.amount);
        
        // Validate amount conversion
        if (isNaN(amount) || amount <= 0) {
          this.errorMessage = 'Please enter a valid amount';
          return;
        }
        
        const fromAccount = this.accounts.find(a => a.id === transferData.fromAccountId);
        const toAccount = this.accounts.find(a => a.id === transferData.toAccountId);

        if (!fromAccount || !toAccount) {
          this.errorMessage = 'Invalid account selection';
          return;
        }

        if (fromAccount.balance < amount) {
          this.errorMessage = 'Insufficient funds';
          return;
        }

        // Create transaction in Firebase
        const transaction: Omit<Transaction, 'id'> = {
          fromAccountId: transferData.fromAccountId,
          toAccountId: transferData.toAccountId,
          amount: amount,
          currency: fromAccount.currency,
          description: transferData.description,
          type: 'transfer',
          status: 'completed',
          createdAt: new Date(),
          processedAt: new Date()
        };

        // Save transaction to Firebase
        const transactionId = await this.firebaseService.createTransaction(transaction);
        
        if (transactionId) {
          // Update account balances in Firebase
          await this.firebaseService.updateAccountBalance(fromAccount.id, fromAccount.balance - amount);
          await this.firebaseService.updateAccountBalance(toAccount.id, toAccount.balance + amount);
          
          // Update local data for immediate UI update
          fromAccount.balance -= amount;
          toAccount.balance += amount;
          this.transactions.unshift({ id: transactionId, ...transaction });
          
          this.transferForm.reset();
          this.successMessage = 'Transfer completed successfully!';
        } else {
          this.errorMessage = 'Failed to create transaction';
        }

      } catch (error) {
        this.errorMessage = 'Transfer failed: ' + (error as Error).message;
        console.error('Error processing transfer:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  async processAdminDeposit() {
    if (this.adminDepositForm.valid) {
      this.isLoading = true;
      this.clearMessages();

      try {
        const depositData = this.adminDepositForm.value;
        
        // Convert amount to number to prevent NaN issues
        const amount = parseFloat(depositData.amount);
        
        // Validate amount conversion
        if (isNaN(amount) || amount <= 0) {
          this.errorMessage = 'Please enter a valid amount';
          return;
        }
        
        const toAccount = this.accounts.find(a => a.id === depositData.toAccountId);

        if (!toAccount) {
          this.errorMessage = 'Invalid account selection';
          return;
        }

        // Create admin deposit transaction
        const transaction: Omit<Transaction, 'id'> = {
          fromAccountId: 'admin-deposit', // Special ID for admin deposits
          toAccountId: depositData.toAccountId,
          amount: amount,
          currency: toAccount.currency,
          description: `Admin Deposit: ${depositData.description}`,
          type: 'deposit',
          status: 'completed',
          createdAt: new Date(),
          processedAt: new Date()
        };

        // Save transaction to Firebase
        const transactionId = await this.firebaseService.createTransaction(transaction);
        
        if (transactionId) {
          // Fetch current balance from Firebase to ensure we have the latest value
          const currentBalance = await this.firebaseService.getAccountBalance(toAccount.id);
          console.log(`Admin Deposit: Fetched current balance from Firebase: ${currentBalance}, Deposit amount: ${amount}`);
          
          const newBalance = currentBalance + amount;
          console.log(`Admin Deposit: New balance will be: ${newBalance}`);
          
          // Update account balance in Firebase
          await this.firebaseService.updateAccountBalance(toAccount.id, newBalance);
          
          // Update local data for immediate UI update
          toAccount.balance = newBalance;
          this.transactions.unshift({ id: transactionId, ...transaction });
          
          this.adminDepositForm.reset();
          this.successMessage = `Successfully deposited ${this.formatCurrency(amount)} to ${toAccount.ownerName}'s account!`;
        } else {
          this.errorMessage = 'Failed to create deposit transaction';
        }

      } catch (error) {
        this.errorMessage = 'Deposit failed: ' + (error as Error).message;
        console.error('Error processing deposit:', error);
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
      
      // Add sample accounts with correct ownerId
      sampleData.accounts.forEach((accountData, index) => {
        const newAccount: Account = {
          id: (Date.now() + index).toString(),
          ...accountData,
          ownerId: newUser.id, // Set the actual user ID
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
