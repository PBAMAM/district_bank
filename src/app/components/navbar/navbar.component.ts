import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../models/account.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Input() currentUser: User | null = null;
  @Output() logout = new EventEmitter<void>();

  onLogout() {
    this.logout.emit();
  }
}
