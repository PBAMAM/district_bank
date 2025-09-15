import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Admin Components
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { AdminSetupComponent } from './components/admin-setup/admin-setup.component';

const adminRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: AdminLoginComponent },
  { path: 'setup', component: AdminSetupComponent },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'users', component: AdminPanelComponent },
  { path: 'accounts', component: AdminPanelComponent },
  { path: 'transactions', component: AdminPanelComponent }
];

@NgModule({
  imports: [RouterModule.forChild(adminRoutes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
