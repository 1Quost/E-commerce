import { Component, Input, computed, signal } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.scss',
})
export class StarRatingComponent {
  @Input() rating: number | null | undefined = 0;
  @Input() reviewsCount: number | null | undefined = null;

  safeRating = computed(() => {
    const r = Number(this.rating ?? 0);
    if (Number.isNaN(r)) return 0;
    return Math.max(0, Math.min(5, r));
  });
}