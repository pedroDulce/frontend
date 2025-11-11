import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QaApiService, ChatResponse, SourceDTO } from '../../services/qa-api.service';

// Interface corregida con SourceDTO
interface QAMessage {
  text: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  suggestions?: string[];
  sources?: SourceDTO[];  // ← Usar SourceDTO importado
}

@Component({
  selector: 'app-qa-chat-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qa-chat-assistant.component.html',
  styleUrls: ['./qa-chat-assistant.component.css']
})
export class QaChatAssistantComponent implements OnInit {
  isCollapsed = false;
  messages: QAMessage[] = [];
  loading = false;
  userInput = '';
  backendStatus: 'checking' | 'connected' | 'error' = 'checking';

  constructor(private qaApi: QaApiService) {}

  ngOnInit() {
    this.checkBackendConnection();
  }

  toggleChat() {
    this.isCollapsed = !this.isCollapsed;
  }

  useSuggestion(suggestion: string) {
    this.userInput = suggestion;
  }


  clearChat() {
    // Limpiar los mensajes del chat
    this.messages = [];
    
    // LIMPIAR TAMBIÉN EL INPUT DEL USUARIO
    this.userInput = '';
    
    // Opcional: también podrías limpiar el estado de loading por si acaso
    this.loading = false;
    
    // Si usas algún servicio de almacenamiento, también limpiarlo ahí
    // this.chatService.clearChat();
  }

  // Función para mostrar fuentes en el template
  getSourceDisplay(source: SourceDTO): string {
    return source.title || source.description || source.type || 'Fuente';
  }

  sendMessage() {
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

    this.qaApi.sendMessage(currentInput).subscribe({
      next: (response: ChatResponse) => {
        const assistantMessage: QAMessage = {
          text: response.answer,
          type: 'assistant',
          timestamp: new Date(),
          suggestions: response.suggestions,
          sources: response.sources  // ← Ahora SourceDTO está definido
        };

        this.messages.push(assistantMessage);
        this.loading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error:', error);
        const errorMessage: QAMessage = {
          text: '❌ Error conectando con el servidor: ' + error.message,
          type: 'assistant',
          timestamp: new Date()
        };
        this.messages.push(errorMessage);
        this.loading = false;
        this.scrollToBottom();
      }
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  private checkBackendConnection() {
    this.backendStatus = 'checking';
    this.qaApi.getRanking().subscribe({
      next: () => {
        this.backendStatus = 'connected';
        this.addWelcomeMessage();
      },
      error: (err) => {
        console.error('Error conectando al backend:', err);
        this.backendStatus = 'error';
        this.addWelcomeMessage();
      }
    });
  }

  private addWelcomeMessage() {
    if (this.messages.length === 0) {
      const welcomeMessage: QAMessage = {
        text: '¡Hola! Soy tu asistente de QA. ¿En qué puedo ayudarte?',
        type: 'assistant',
        timestamp: new Date(),
        suggestions: [
          '¿Qué entidades principales tiene el sistema?',
          '¿Cómo se calcula el ranking de cobertura?',
          'Explícame el modelo de datos',
          '¿Qué tipos de pruebas se realizan?'
        ]
      };
      this.messages.push(welcomeMessage);
    }
  }

  trackByFn(index: number, item: QAMessage): number {
    return index;
  }
}