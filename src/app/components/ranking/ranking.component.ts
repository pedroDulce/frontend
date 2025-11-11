import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QaApiService, RankingDTO } from '../../services/qa-api.service';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent implements OnInit {
  ranking: RankingDTO[] = [];
  loading = true;
  error = '';

  constructor(private qaApi: QaApiService) {}

  ngOnInit() {
    this.loadRanking();
  }

  loadRanking() {
    this.loading = true;
    this.qaApi.getRanking().subscribe({
      next: (data) => {
        this.ranking = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando ranking:', err);
        this.error = 'Error al cargar el ranking de aplicaciones';
        this.loading = false;
      }
    });
  }

  getCoberturaColor(cobertura: number): string {
    if (cobertura >= 80) return 'text-green-600';
    if (cobertura >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }
}