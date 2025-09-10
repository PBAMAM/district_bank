import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AccountOverviewComponent } from './components/account-overview/account-overview.component';
import { TransferComponent } from './components/transfer/transfer.component';
import { FinancialPlannerComponent } from './components/financial-planner/financial-planner.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { ClientLoginComponent } from './components/client-login/client-login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ClientDashboardComponent } from './components/client-dashboard/client-dashboard.component';
import { AdminSetupComponent } from './components/admin-setup/admin-setup.component';

const routes: Routes = [
  { path: '', redirectTo: '/client', pathMatch: 'full' },
  
  // Admin routes
  { path: 'admin', component: AdminLoginComponent },
  { path: 'admin/setup', component: AdminSetupComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'admin/users', component: AdminPanelComponent },
  { path: 'admin/accounts', component: AdminPanelComponent },
  { path: 'admin/transactions', component: AdminPanelComponent },
  
  // Client routes
  { path: 'client', component: ClientLoginComponent },
  { path: 'client/dashboard', component: ClientDashboardComponent },
  { path: 'client/transfer', component: TransferComponent },
  { path: 'client/accounts', component: AccountOverviewComponent },
  { path: 'client/transactions', component: FinancialPlannerComponent },
  
  // Legacy routes (for backward compatibility)
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: AccountOverviewComponent },
      { path: 'transfer', component: TransferComponent },
      { path: 'planner', component: FinancialPlannerComponent },
      { path: 'admin', component: AdminPanelComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }