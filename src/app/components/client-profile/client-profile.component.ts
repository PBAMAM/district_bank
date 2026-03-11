import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/account.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'app-client-profile',
    templateUrl: './client-profile.component.html',
    styleUrls: ['./client-profile.component.scss'],
    animations: [
        trigger('fadeInUp', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(24px)' }),
                animate('500ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ]),
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('400ms ease-in', style({ opacity: 1 }))
            ])
        ]),
        trigger('scaleIn', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.93)' }),
                animate('400ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'scale(1)' }))
            ])
        ])
    ]
})
export class ClientProfileComponent implements OnInit {
    currentUser: User | null = null;
    profileForm: FormGroup;
    isLoading = false;
    isSaving = false;
    successMessage = '';
    errorMessage = '';

    constructor(
        private authService: AuthService,
        private fb: FormBuilder
    ) {
        this.profileForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            phone: [''],
            address: ['']
        });
    }

    ngOnInit() {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            if (user) {
                this.profileForm.patchValue({
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    phone: user.phone || '',
                    address: user.address || ''
                });
            }
        });
    }

    getInitials(): string {
        if (this.currentUser) {
            const f = this.currentUser.firstName?.charAt(0) || '';
            const l = this.currentUser.lastName?.charAt(0) || '';
            return (f + l).toUpperCase();
        }
        return 'U';
    }

    async onSave() {
        if (this.profileForm.valid && this.currentUser) {
            this.isSaving = true;
            this.successMessage = '';
            this.errorMessage = '';
            try {
                // Profile update stub — extend with a real service call as needed
                await new Promise(r => setTimeout(r, 800));
                this.successMessage = 'Profile updated successfully!';
                setTimeout(() => this.successMessage = '', 4000);
            } catch (e) {
                this.errorMessage = 'Failed to save changes. Please try again.';
            } finally {
                this.isSaving = false;
            }
        }
    }
}
