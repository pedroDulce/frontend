import { Component, OnInit } from '@angular/core';
import { QaApiService, ChatResponse, SourceDTO } from '../../services/qa-api.service';

interface QAMessage {
  text: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  suggestions?: string[];
  sources?: SourceDTO[];
}

@Component({
  selector: 'app-qa-chat-assistant',
  templateUrl: './qa-chat-assistant.component.html',
  styleUrls: ['./qa-chat-assistant.component.css']
})
export class QaChatAssistantComponent implements OnInit {
  isCollapsed = false;
  messages: QAMessage[] = [];
  loading = false;
  userInput = '';
  backendStatus: 'checking' | 'connected' | 'error' = 'checking';

  // Preguntas rápidas predefinidas
  quickQuestions = [
    '¿Cómo se calcula el ranking de cobertura?',
    'Explícame la estructura de pruebas unitarias',
    '¿Qué tipos de actividades QA existen en el catálogo?',
    '¿Cuáles son las mejores prácticas para testing?'
  ];

  constructor(private qaApi: QaApiService) {}

  ngOnInit() {
    this.checkBackendConnection();
  }

  // Función para expandir/colapsar el chat
  toggleChat() {
    this.isCollapsed = !this.isCollapsed;
  }

  // Función para preguntas rápidas
  quickQuestion(question: string) {
    this.userInput = question;
    this.sendMessage();
  }

  // Función para usar sugerencias
  useSuggestion(suggestion: string) {
    this.userInput = suggestion;
    this.sendMessage();
  }

  // Función para formatear mensajes con HTML
  formatMessage(text: string): string {
    if (!text) return '';
    // Convierte saltos de línea en <br> y URLs en enlaces
    return text
      .replace(/\n/g, '<br>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-500 underline">$1</a>');
  }

  // Verificar conexión con backend
  checkBackendConnection() {
    this.backendStatus = 'checking';
    
    this.qaApi.checkHealth().subscribe({
      next: (health) => {
        console.log('✅ Backend conectado:', health);
        this.backendStatus = 'connected';
        this.addSystemMessage('✅ Sistema conectado y listo para responder preguntas sobre QA');
      },
      error: (err) => {
        console.warn('⚠️ Health check falló, pero probando endpoints principales...');
        this.testMainEndpoints();
      }
    });
  }

  private testMainEndpoints() {
    this.qaApi.getRanking().subscribe({
      next: (ranking) => {
        console.log('✅ Backend respondiendo en endpoints principales');
        this.backendStatus = 'connected';
        this.addSystemMessage('✅ Sistema conectado y listo para responder preguntas sobre QA');
        
        // Mensaje de bienvenida con sugerencias
        this.addWelcomeMessage();
      },
      error: (err) => {
        console.error('❌ Backend no disponible:', err);
        this.backendStatus = 'error';
        this.addSystemMessage('❌ No se pudo conectar con el backend. Verifica que Spring Boot esté ejecutándose en http://localhost:8080');
      }
    });
  }

  private addWelcomeMessage() {
    const welcomeMessage: QAMessage = {
      text: '¡Hola! Soy tu asistente de QA. Puedo ayudarte con:',
      type: 'assistant',
      timestamp: new Date(),
      suggestions: [
        'Mostrar el ranking de aplicaciones',
        'Explicar métricas de calidad',
        'Revisar procedimientos de testing',
        'Analizar cobertura de pruebas'
      ]
    };
    
    // Solo agregar mensaje de bienvenida si no hay mensajes previos
    if (this.messages.length === 0) {
      this.messages.push(welcomeMessage);
    }
  }

  private addSystemMessage(text: string) {
    this.messages.push({
      text,
      type: 'assistant',
      timestamp: new Date()
    });
  }

  // En la función sendMessage, cambia esta parte:
async sendMessage() {
  if (!this.userInput.trim() || this.loading) return;

  const userMessage: QAMessage = {
    text: this.userInput,
    type: 'user',
    timestamp: new Date()
  };

  this.messages.push(userMessage);
  const currentInput = this.userInput;
  this.userInput = '';
  this.loading = true;

  try {
    // SOLUCIÓN: Usa .subscribe() en lugar de .toPromise()
    this.qaApi.sendMessage(currentInput).subscribe({
      next: (response: ChatResponse) => {
        const assistantMessage: QAMessage = {
          text: response.answer,
          type: 'assistant',
          timestamp: new Date(),
          suggestions: response.suggestions,
          sources: response.sources
        };

        this.messages.push(assistantMessage);
        this.loading = false;
        this.scrollToBottom();
      },
      error: (error: any) => {
        console.error('Error enviando mensaje:', error);
        this.messages.push({
          text: `❌ Error: ${error.message || 'No se pudo procesar la pregunta'}`,
          type: 'assistant',
          timestamp: new Date()
        });
        this.loading = false;
        this.scrollToBottom();
      }
    });

  } catch (error: any) {
    console.error('Error inesperado:', error);
    this.messages.push({
      text: `❌ Error inesperado: ${error.message}`,
      type: 'assistant',
      timestamp: new Date()
    });
    this.loading = false;
    this.scrollToBottom();
  }
}

  // Auto-scroll para ver los últimos mensajes
  private scrollToBottom() {
    setTimeout(() => {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }

  // Función auxiliar para mostrar el tipo de fuente
  getSourceType(source: SourceDTO): string {
    return source.title ? 'Documentación' : 
           source.url ? 'Enlace' : 
           'Referencia';
  }

  // Función para obtener nombre del archivo de una URL
  getFileName(url: string): string {
    if (!url) return 'Archivo';
    return url.split('/').pop() || 'Documento';
  }

  trackByFn(index: number, item: QAMessage): number {
    return index;
  }

  // Limpiar conversación
  clearChat() {
    this.messages = [];
    this.addWelcomeMessage();
  }
}