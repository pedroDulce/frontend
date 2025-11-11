import { Component, OnInit } from '@angular/core';
import { QaApiService, RankingDTO } from '../../services/qa-api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css'],
  standalone: true,
  imports: [CommonModule]
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
    if (cobertura >= 80) return 'cobertura-excelente';
    if (cobertura >= 60) return 'cobertura-buena';
    return 'cobertura-regular';
  }

}