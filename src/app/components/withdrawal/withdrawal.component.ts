import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { Account, Transaction, User } from '../../models/account.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'app-withdrawal',
    templateUrl: './withdrawal.component.html',
    styleUrls: ['./withdrawal.component.scss'],
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
export class WithdrawalComponent implements OnInit {
    withdrawalForm: FormGroup;
    accounts: Account[] = [];
    selectedAccount: Account | null = null;
    currentUser: User | null = null;
    isLoading = false;
    withdrawalSuccess = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private firebaseService: FirebaseService,
        private authService: AuthService,
        private router: Router
    ) {
        this.withdrawalForm = this.fb.group({
            amount: [0, [Validators.required, Validators.min(0.01)]],
            description: ['', [Validators.required]],
            fromAccount: ['', [Validators.required]]
        });
    }

    ngOnInit() {
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
            this.withdrawalForm.patchValue({
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
        if (this.withdrawalForm.valid && this.selectedAccount) {
            this.isLoading = true;
            this.errorMessage = '';
            this.withdrawalSuccess = false;

            try {
                const formValue = this.withdrawalForm.value;
                const amount = parseFloat(formValue.amount);

                if (isNaN(amount) || amount <= 0) {
                    this.errorMessage = 'Please enter a valid amount';
                    return;
                }

                if (this.selectedAccount.balance < amount) {
                    this.errorMessage = 'Insufficient funds for this withdrawal limit.';
                    return;
                }

                const transaction: Omit<Transaction, 'id'> = {
                    fromAccountId: formValue.fromAccount,
                    toAccountId: 'external', // Withdrawal leaves the ecosystem
                    amount: -amount, // Negative for withdrawal
                    currency: this.selectedAccount.currency,
                    description: formValue.description,
                    type: 'withdrawal',
                    status: 'pending', // IMPORTANT: Status is pending, no funds deducted yet!
                    adminMessage: 'Your withdrawal is pending review.',
                    createdAt: new Date(),
                    processedAt: new Date()
                };

                await this.firebaseService.createTransaction(transaction);

                // *WE ARE NOT DEDUCTING FUNDS HERE!* Only when Admin Approves.

                this.withdrawalSuccess = true;
                this.withdrawalForm.reset();
                this.selectDefaultAccount();

                setTimeout(() => {
                    this.withdrawalSuccess = false;
                }, 5000);

            } catch (error) {
                this.errorMessage = 'Withdrawal request failed. Please try again.';
                console.error('Withdrawal error:', error);
            } finally {
                this.isLoading = false;
            }
        }
    }
}
