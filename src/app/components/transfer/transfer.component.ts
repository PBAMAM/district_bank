import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { Account, Transaction, User } from '../../models/account.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
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
      amount: [0, [Validators.required, Validators.min(0.01)]],
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
        
        // Convert amount to number to prevent NaN issues
        const amount = parseFloat(formValue.amount);
        
        // Validate amount conversion
        if (isNaN(amount) || amount <= 0) {
          this.errorMessage = 'Please enter a valid amount';
          return;
        }
        
        // Check if sufficient funds
        if (this.selectedAccount.balance < amount) {
          this.errorMessage = 'Insufficient funds for this transfer';
          return;
        }
        
        // Create transaction record
        const transaction: Omit<Transaction, 'id'> = {
          fromAccountId: formValue.fromAccount,
          toAccountId: 'external', // For external transfers
          amount: amount,
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
        const newBalance = this.selectedAccount.balance - amount;
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
