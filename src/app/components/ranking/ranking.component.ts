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
        console.log('Ranking cargado:', data); // ← Para debug
      },
      error: (err) => {
        console.error('Error cargando ranking:', err);
        this.error = 'Error al cargar el ranking';
        this.loading = false;
        
        // Datos de prueba si el backend falla
        this.ranking = [
          { aplicacion: { nombre: 'App Web', descripcion: 'Aplicación principal' }, cobertura: 85.5 },
          { aplicacion: { nombre: 'API Users', descripcion: 'Microservicio usuarios' }, cobertura: 72.3 },
          { aplicacion: { nombre: 'Mobile App', descripcion: 'App móvil' }, cobertura: 63.8 }
        ];
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