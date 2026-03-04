import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toast-host.html',
  styleUrl: './toast-host.scss',
})
export class ToastHost {
  constructor(public toast: ToastService) {}
}