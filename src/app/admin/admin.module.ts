import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Admin Components
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { AdminSetupComponent } from './components/admin-setup/admin-setup.component';

// Admin Routing
import { AdminRoutingModule } from './admin-routing.module';

// Shared Services
import { AuthService } from '../services/auth.service';
import { FirebaseService } from '../services/firebase.service';
import { AccountCreationService } from '../services/account-creation.service';

@NgModule({
  declarations: [
    AdminLoginComponent,
    AdminDashboardComponent,
    AdminPanelComponent,
    AdminSetupComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AdminRoutingModule
  ],
  providers: [
    AuthService,
    FirebaseService,
    AccountCreationService,
    DatePipe
  ]
})
export class AdminModule { }
