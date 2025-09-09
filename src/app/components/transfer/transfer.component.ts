import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { Account, Transaction } from '../../models/account.model';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss']
})
export class TransferComponent implements OnInit {
  transferForm: FormGroup;
  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  isLoading = false;
  transferSuccess = false;
  errorMessage = '';

  // Mock accounts for demo
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
      balance: 5000.00,
      currency: 'EUR',
      ownerName: 'Test, Tina',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) {
    this.transferForm = this.fb.group({
      recipient: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required]],
      fromAccount: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadAccounts();
    this.selectDefaultAccount();
  }

  loadAccounts() {
    // For demo purposes, use mock data
    this.accounts = this.mockAccounts;
  }

  selectDefaultAccount() {
    if (this.accounts.length > 0) {
      this.selectedAccount = this.accounts[0];
      this.transferForm.patchValue({
        fromAccount: this.accounts[0].id
      });
    }
  }

  onAccountChange(accountId: string) {
    this.selectedAccount = this.accounts.find(acc => acc.id === accountId) || null;
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  async onSubmit() {
    if (this.transferForm.valid && this.selectedAccount) {
      this.isLoading = true;
      this.errorMessage = '';
      this.transferSuccess = false;

      try {
        const formValue = this.transferForm.value;
        
        // Create transaction record
        const transaction: Omit<Transaction, 'id'> = {
          fromAccountId: formValue.fromAccount,
          toAccountId: 'external', // For external transfers
          amount: formValue.amount,
          currency: this.selectedAccount.currency,
          description: formValue.description,
          type: 'transfer',
          status: 'completed',
          createdAt: new Date(),
          processedAt: new Date()
        };

        // In a real app, you would save to Firebase
        // await this.firebaseService.createTransaction(transaction);
        
        // Update account balance
        const newBalance = this.selectedAccount.balance - formValue.amount;
        // await this.firebaseService.updateAccountBalance(this.selectedAccount.id, newBalance);
        
        this.transferSuccess = true;
        this.transferForm.reset();
        this.selectDefaultAccount();
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.transferSuccess = false;
        }, 3000);
        
      } catch (error) {
        this.errorMessage = 'Transfer failed. Please try again.';
        console.error('Transfer error:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  applyFormData() {
    // This would typically load data from a form or template
    this.transferForm.patchValue({
      recipient: 'John Doe',
      amount: 100.00,
      description: 'Payment for services'
    });
  }
}
