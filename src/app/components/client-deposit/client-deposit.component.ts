import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { Account, Transaction, User } from '../../models/account.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'app-client-deposit',
    templateUrl: './client-deposit.component.html',
    styleUrls: ['./client-deposit.component.scss'],
    animations: [
        trigger('fadeInUp', [transition(':enter', [
            style({ opacity: 0, transform: 'translateY(24px)' }),
            animate('500ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'translateY(0)' }))
        ])]),
        trigger('fadeIn', [transition(':enter', [
            style({ opacity: 0 }), animate('400ms ease-in', style({ opacity: 1 }))
        ])]),
        trigger('slideInRight', [transition(':enter', [
            style({ opacity: 0, transform: 'translateX(-20px)' }),
            animate('500ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'translateX(0)' }))
        ])]),
        trigger('scaleIn', [transition(':enter', [
            style({ opacity: 0, transform: 'scale(0.93)' }),
            animate('400ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'scale(1)' }))
        ])])
    ]
})
export class ClientDepositComponent implements OnInit {
    depositForm: FormGroup;
    accounts: Account[] = [];
    selectedAccount: Account | null = null;
    currentUser: User | null = null;
    isLoading = false;
    depositSuccess = false;
    errorMessage = '';

    depositMethods = [
        { id: 'bank_transfer', label: 'Bank Transfer', icon: '🏦', desc: 'Transfer from another bank account' },
        { id: 'crypto', label: 'Cryptocurrency', icon: '₿', desc: 'BTC, ETH, USDT and more' },
        { id: 'wire', label: 'International Wire', icon: '🌍', desc: 'SWIFT / SEPA international transfer' },
        { id: 'cash', label: 'Cash Deposit', icon: '💵', desc: 'Physical branch deposit' }
    ];

    selectedMethod = 'bank_transfer';

    constructor(
        private fb: FormBuilder,
        private firebaseService: FirebaseService,
        private authService: AuthService
    ) {
        this.depositForm = this.fb.group({
            amount: [0, [Validators.required, Validators.min(0.01)]],
            description: ['', [Validators.required]],
            toAccount: ['', [Validators.required]],
            method: ['bank_transfer']
        });
    }

    ngOnInit() {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            if (user) this.loadAccounts();
        });
    }

    async loadAccounts() {
        try {
            if (this.currentUser) {
                this.accounts = await this.firebaseService.getAccounts(this.currentUser.id);
                if (this.accounts.length > 0) {
                    this.selectedAccount = this.accounts[0];
                    this.depositForm.patchValue({ toAccount: this.accounts[0].id });
                }
            }
        } catch (e) {
            this.errorMessage = 'Failed to load accounts.';
        }
    }

    onAccountChange(id: string) {
        this.selectedAccount = this.accounts.find(a => a.id === id) || null;
    }

    selectMethod(id: string) {
        this.selectedMethod = id;
        this.depositForm.patchValue({ method: id });
    }

    formatCurrency(amount: number, currency = 'EUR'): string {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(amount);
    }

    async onSubmit() {
        if (this.depositForm.valid && this.selectedAccount) {
            this.isLoading = true;
            this.errorMessage = '';
            this.depositSuccess = false;

            try {
                const v = this.depositForm.value;
                const amount = parseFloat(v.amount);
                if (isNaN(amount) || amount <= 0) { this.errorMessage = 'Please enter a valid amount.'; return; }

                const transaction: Omit<Transaction, 'id'> = {
                    fromAccountId: 'external',
                    toAccountId: v.toAccount,
                    amount: amount,
                    currency: this.selectedAccount.currency,
                    description: `Deposit request (${this.selectedMethod}): ${v.description}`,
                    type: 'deposit',
                    status: 'pending',
                    adminMessage: 'Your deposit is pending admin confirmation.',
                    createdAt: new Date(),
                    processedAt: new Date()
                };

                await this.firebaseService.createTransaction(transaction);
                this.depositSuccess = true;
                this.depositForm.reset({ amount: 0, description: '', toAccount: this.accounts[0]?.id || '', method: 'bank_transfer' });
                this.selectedMethod = 'bank_transfer';
                setTimeout(() => this.depositSuccess = false, 6000);
            } catch (e) {
                this.errorMessage = 'Deposit request failed. Please try again.';
                console.error(e);
            } finally {
                this.isLoading = false;
            }
        }
    }
}
