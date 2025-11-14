import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { QuestionRequest, RankingDTO, UnifiedQueryResult } from '../models/chat.model';

// Interfaces para las fuentes de información

@Injectable({
  providedIn: 'root'
})
export class QaApiService {
  private apiUrl = 'http://localhost:8080/api/qa-assistant';
  private readonly CACHE_KEY = 'qa_query_cache';
  private readonly METRICS_KEY = 'qa_metrics';

  constructor(private http: HttpClient) {}

    sendMessage(message: string): Observable<any> {
      console.log('📨 Servicio - Enviando mensaje a:', `${this.apiUrl}/ask-enhanced`);
      console.log('📝 Mensaje:', message);

      return this.http.post(`${this.apiUrl}/ask-enhanced`, { question: message }).pipe(
        tap(() => {
          //console.log('✅ Respuesta del servidor:', response);
        }),
        timeout(60000),
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
    // Intentar con el endpoint /health primero, si falla probar con /ask-enhanced
    return this.http.get(`${this.apiUrl}/ranking-test`).pipe(
      catchError(() => {
        console.log('⚠️ Endpoint /health no disponible, probando con /ask-enhanced...');
        // Si no hay endpoint health, probamos con una llamada GET a /ask-enhanced
        return this.http.get(`${this.apiUrl}/ask-enhanced`).pipe(
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
    return this.http.get<RankingDTO[]>(`${this.apiUrl}/ranking`);
  }

  // En tu servicio del frontend (qa-chat-assistant.service.ts)
  getRankingData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ranking`).pipe(
      tap(() => {
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


  askQuestion(question: string): Observable<UnifiedQueryResult> {
    const startTime = performance.now();
    
    // Verificar cache local primero
    const cached = this.getFromCache(question);
    if (cached) {
      const executionTime = performance.now() - startTime;
      this.recordMetrics(question, true, executionTime, cached);
      return of(cached);
    }

    return this.http.post<UnifiedQueryResult>(`${this.apiUrl}/ask-enhanced`, { question }).pipe(
      tap(response => {
        const executionTime = performance.now() - startTime;
        
        // Guardar en cache si fue exitoso
        if (response.success) {
          this.saveToCache(question, response);
          this.recordSuccessfulQuery(question, response, executionTime);
        }
        
        this.recordMetrics(question, false, executionTime, response);
      }),
      catchError(error => {
        this.recordError(question, error);
        return throwError(() => error);
      })
    );
  }

  private saveToCache(question: string, result: UnifiedQueryResult): void {
    try {
      const cache = this.getCache();
      const cacheKey = this.generateCacheKey(question);
      
      // Mantener tamaño máximo del cache
      if (Object.keys(cache).length >= 100) {
        const firstKey = Object.keys(cache)[0];
        delete cache[firstKey];
      }
      
      cache[cacheKey] = {
        result: result,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.warn('Error guardando en cache:', e);
    }
  }

  private getFromCache(question: string): UnifiedQueryResult | null {
    try {
      const cache = this.getCache();
      const cacheKey = this.generateCacheKey(question);
      const cachedItem = cache[cacheKey];
      
      if (cachedItem) {
        // Verificar que no sea muy viejo (24 horas)
        const isExpired = Date.now() - cachedItem.timestamp > 24 * 60 * 60 * 1000;
        if (!isExpired) {
          return cachedItem.result;
        } else {
          delete cache[cacheKey];
          localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
        }
      }
    } catch (e) {
      console.warn('Error leyendo del cache:', e);
    }
    
    return null;
  }

  private getCache(): any {
    try {
      return JSON.parse(localStorage.getItem(this.CACHE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  private generateCacheKey(question: string): string {
    // Crear una clave simple basada en la pregunta
    return btoa(question).substring(0, 50);
  }

  private recordMetrics(question: string, fromCache: boolean, executionTime: number, response: UnifiedQueryResult) {
    const metrics = {
      question,
      fromCache,
      executionTime,
      success: response.success,
      resultCount: response.rawResults?.length || 0,
      intent: response.intent,
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Métrica:', metrics);
  }

  private recordSuccessfulQuery(question: string, response: UnifiedQueryResult, executionTime: number) {
    const successfulQuery = {
      question,
      executionTime,
      resultCount: response.rawResults?.length || 0,
      intent: response.intent,
      generatedSQL: response.generatedSQL,
      timestamp: new Date().toISOString()
    };
    
    this.saveSuccessfulQuery(successfulQuery);
  }

  private saveSuccessfulQuery(query: any) {
    const existing = this.getSuccessfulQueries();
    existing.push(query);
    
    // Mantener solo las últimas 50 consultas exitosas
    if (existing.length > 50) {
      existing.splice(0, existing.length - 50);
    }
    
    localStorage.setItem('qa_successful_queries', JSON.stringify(existing));
  }

  private getSuccessfulQueries(): any[] {
    try {
      return JSON.parse(localStorage.getItem('qa_successful_queries') || '[]');
    } catch {
      return [];
    }
  }

  private recordError(question: string, error: any) {
    console.error('❌ Error en consulta:', question, error);
    
    const errorRecord = {
      question,
      error: error.message || 'Error desconocido',
      timestamp: new Date().toISOString()
    };
    
    this.saveError(errorRecord);
  }

  private saveError(error: any) {
    const existing = this.getErrors();
    existing.push(error);
    
    if (existing.length > 100) {
      existing.splice(0, existing.length - 100);
    }
    
    localStorage.setItem('qa_errors', JSON.stringify(existing));
  }

  private getErrors(): any[] {
    try {
      return JSON.parse(localStorage.getItem('qa_errors') || '[]');
    } catch {
      return [];
    }
  }

  getAnalytics() {
    const successfulQueries = this.getSuccessfulQueries();
    const errors = this.getErrors();
    
    const totalQueries = successfulQueries.length + errors.length;
    const successRate = totalQueries > 0 ? (successfulQueries.length / totalQueries) * 100 : 0;
    
    const intents = successfulQueries.reduce((acc: any, query: any) => {
      acc[query.intent] = (acc[query.intent] || 0) + 1;
      return acc;
    }, {});
    
    const popularIntents = Object.entries(intents)
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 5);
    
    const averageExecutionTime = successfulQueries.length > 0 
      ? successfulQueries.reduce((sum: number, query: any) => sum + query.executionTime, 0) / successfulQueries.length
      : 0;
    
    return {
      totalQueries,
      successfulQueries: successfulQueries.length,
      errors: errors.length,
      successRate: Math.round(successRate),
      averageExecutionTime: Math.round(averageExecutionTime),
      popularIntents,
      recentQueries: successfulQueries.slice(-10).reverse(),
      recentErrors: errors.slice(-5).reverse()
    };
  }

  clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
    localStorage.removeItem('qa_successful_queries');
    localStorage.removeItem('qa_errors');
  }

}