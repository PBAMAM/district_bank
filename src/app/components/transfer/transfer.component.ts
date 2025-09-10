import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { Account, Transaction, User } from '../../models/account.model';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss']
})
export class TransferComponent implements OnInit {
  transferForm: FormGroup;
  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  currentUser: User | null = null;
  isLoading = false;
  transferSuccess = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private router: Router
  ) {
    this.transferForm = this.fb.group({
      recipient: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required]],
      fromAccount: ['', [Validators.required]]
    });
  }

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
      if (this.currentUser) {
        this.accounts = await this.firebaseService.getAccounts(this.currentUser.id);
        this.selectDefaultAccount();
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      this.errorMessage = 'Failed to load accounts. Please try again.';
    }
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

        // Save transaction to Firebase
        await this.firebaseService.createTransaction(transaction);
        
        // Update account balance
        const newBalance = this.selectedAccount.balance - formValue.amount;
        await this.firebaseService.updateAccountBalance(this.selectedAccount.id, newBalance);
        
        // Update local account balance
        this.selectedAccount.balance = newBalance;
        
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
