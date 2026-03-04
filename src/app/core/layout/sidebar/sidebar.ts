import { Component, EventEmitter, Input, Output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../auth/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private readonly router = inject(Router);
  public readonly auth = inject(AuthService);

  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  readonly isAdmin = computed(() => this.auth.isAdmin());

  go(url: string) {
    this.router.navigateByUrl(url);
    this.close.emit();
  }
}