import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { retry, shareReplay, take, timeout } from 'rxjs/operators';

// Interfaces para las fuentes de información
export interface SourceDTO {
  type: string;
  description: string;
  title?: string;
  url?: string;
  content?: string;
}

export interface ChatRequest {
  question: string;
}

export interface ChatResponse {
  answer: string;
  suggestions?: string[];
  sources?: SourceDTO[];
}


export interface RankingDTO {
  nombre?: string;        // ← debe coincidir con el JSON
  descripcion?: string;
  equipoResponsable?: string; 
  estado?: string;
  fechaCreacion?: Date; 
  cobertura: number;   
}

@Injectable({
  providedIn: 'root'
})
export class QaApiService {
  private baseUrl = 'http://localhost:8080/api/qa-assistant';
  private activeRequest: Observable<any> | null = null;

  constructor(private http: HttpClient) {}


    sendMessage(message: string): Observable<any> {
    console.log('📨 Servicio - Enviando mensaje a:', `${this.baseUrl}/chat`);
    console.log('📝 Mensaje:', message);

    return this.http.post(`${this.baseUrl}/chat`, { question: message }).pipe(
      tap(response => {
        console.log('✅ Respuesta del servidor:', response);
      }),
      timeout(15000),
      catchError((error: HttpErrorResponse) => {
        console.error('💥 Error HTTP completo:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message,
          error: error.error
        });

        let userMessage = 'Lo siento, hubo un error procesando tu pregunta.';
        
        if (error.status === 0) {
          userMessage = 'Error de conexión: El servidor no está disponible.';
        } else if (error.status === 404) {
          userMessage = 'Error: Endpoint no encontrado. Verifica la URL.';
        } else if (error.status === 500) {
          userMessage = 'Error interno del servidor.';
        }

        return throwError(() => ({
          userMessage: userMessage,
          technicalError: error
        }));
      })
    );
  }

  // ← AÑADIDO: Método para verificar estado del servidor
  checkServerStatus(): Observable<any> {
    // Intentar con el endpoint /health primero, si falla probar con /chat
    return this.http.get(`${this.baseUrl}/ranking-test`).pipe(
      catchError(() => {
        console.log('⚠️ Endpoint /health no disponible, probando con /chat...');
        // Si no hay endpoint health, probamos con una llamada GET a /chat
        return this.http.get(`${this.baseUrl}/chat`).pipe(
          catchError(() => {
            // Si ambos fallan, el servidor no está disponible
            return throwError(() => 'Servidor no disponible');
          })
        );
      })
    );
  }

  // Endpoint de ranking
  getRanking(): Observable<RankingDTO[]> {
    return this.http.get<RankingDTO[]>(`${this.baseUrl}/ranking`);
  }

  // En tu servicio del frontend (qa-chat-assistant.service.ts)
  getRankingData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/ranking`).pipe(
      tap((response: any) => {
        //console.log('📊 Respuesta del ranking:', response);
        // Verifica que los datos tengan la estructura correcta
      }),
      catchError(error => {
        console.error('❌ Error fetching ranking:', error);
        return of(null);
      })
    );
  }

  // Verificar salud del backend
  checkHealth(): Observable<any> {
    return this.http.get('http://localhost:8080/actuator/health');
  }
}