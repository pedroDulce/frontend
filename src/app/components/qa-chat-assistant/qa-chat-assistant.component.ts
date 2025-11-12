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
  messages: any[] = [];
  loading = false;
  userInput = '';
  isCollapsed = false; // ← AÑADIDO
  serverAvailable = true;
  private isProcessing = false;

  constructor(private qaService: QaApiService) {}

  ngOnInit() {
    this.checkServerConnection();
    // Mensaje de bienvenida inicial
    this.addWelcomeMessage();
  }

  // ← AÑADIDO: Método para alternar chat
  toggleChat() {
    this.isCollapsed = !this.isCollapsed;
    //console.log('💬 Chat ' + (this.isCollapsed ? 'minimizado' : 'expandido'));
  }

  // ← AÑADIDO: Método para trackBy
  trackByFn(index: number, item: any): any {
    return item.timestamp + index; // Identificador único
  }

  // Mensaje de bienvenida
  private addWelcomeMessage() {
    const welcomeMessage = {
      text: '¡Hola! Soy tu asistente de QA. ¿En qué puedo ayudarte?',
      type: 'assistant',
      timestamp: new Date(),
      suggestions: [
        '¿Qué entidades principales tiene el sistema?',
        '¿Cómo se calcula el ranking de cobertura?',
        'Explicarme el modelo de datos',
        '¿Qué tipos de pruebas se realizan?'
      ]
    };
    this.messages = [welcomeMessage];
  }

  checkServerConnection() {
    this.qaService.checkServerStatus().subscribe({
      next: () => {
        console.log('✅ Servidor conectado');
        this.serverAvailable = true;
      },
      error: () => {
        console.error('❌ Servidor no disponible');
        this.serverAvailable = false;
        this.addSystemMessage('El servidor no está disponible. Verifica que el backend esté ejecutándose.');
      }
    });
  }

  sendMessage() {
    if (this.isProcessing || this.loading || !this.userInput.trim()) {
      return;
    }

    if (!this.serverAvailable) {
      this.addSystemMessage('El servidor no está disponible. No se pueden enviar mensajes.');
      return;
    }

    this.isProcessing = true;
    this.loading = true;

    const userMessage = {
      text: this.userInput,
      type: 'user',
      timestamp: new Date()
    };

    this.messages = [...this.messages, userMessage];
    const currentInput = this.userInput;
    this.userInput = '';

    console.log('📤 Enviando mensaje al servidor...');

    this.qaService.sendMessage(currentInput).subscribe({
      next: (response: ChatResponse) => {
        console.log('✅ Respuesta procesada correctamente:', response);
        
        let answerText = 'No se pudo generar una respuesta.';
        
        // Manejar diferentes formatos de respuesta
        if (typeof response === 'string') {
          answerText = response;
        } else if (response?.answer) {
          answerText = response.answer;
        }

        const assistantMessage = {
          text: answerText,
          type: 'assistant',
          timestamp: new Date(),
          suggestions: response?.suggestions || this.getDefaultSuggestions(),
          sources: response?.sources || []
        };

        this.messages = [...this.messages, assistantMessage];
        this.resetLoadingState();
      },
      error: (error: { userMessage: any; technicalError: { status: number; }; }) => {
        console.error('❌ Error en la comunicación:', error);
        
        const errorMessage = {
          text: error.userMessage || 'Error de conexión con el servidor.',
          type: 'assistant',
          timestamp: new Date(),
          suggestions: ['Reintentar', 'Verificar conexión'],
          isError: true
        };

        this.messages = [...this.messages, errorMessage];
        this.resetLoadingState();
        
        // Verificar si el servidor cayó
        if (error.technicalError?.status === 0) {
          this.serverAvailable = false;
        }
      }
    });
  }

  useSuggestion(suggestion: string) {
    if (this.isProcessing || this.loading) {
      return;
    }

    if (suggestion === 'Reintentar' && this.messages.length > 0) {
      // Reintentar el último mensaje del usuario
      const lastUserMessage = this.messages
        .filter(msg => msg.type === 'user')
        .pop();
      
      if (lastUserMessage) {
        this.userInput = lastUserMessage.text;
        setTimeout(() => this.sendMessage(), 100);
      }
      return;
    }

    if (suggestion === 'Verificar conexión') {
      this.checkServerConnection();
      return;
    }

    this.userInput = suggestion;
    setTimeout(() => this.sendMessage(), 100);
  }

  // ← AÑADIDO: Sugerencias por defecto
  private getDefaultSuggestions(): string[] {
    return [
      '¿Qué entidades principales tiene el sistema?',
      '¿Cómo se calcula el ranking de cobertura?',
      'Explicarme el modelo de datos',
      '¿Qué tipos de pruebas se realizan?'
    ];
  }

  private addSystemMessage(text: string) {
    const systemMessage = {
      text: text,
      type: 'system',
      timestamp: new Date()
    };
    this.messages = [...this.messages, systemMessage];
  }

  private resetLoadingState() {
    this.loading = false;
    this.isProcessing = false;
    //console.log('🔄 Estado resetado');
  }

  // ← AÑADIDO: Método clearChat completo
  clearChat() {
    this.messages = [];
    this.userInput = '';
    this.resetLoadingState();
    // Añadir mensaje de bienvenida después de limpiar
    setTimeout(() => this.addWelcomeMessage(), 100);
  }

  // ← AÑADIDO: Método para mostrar fuentes (si lo necesitas)
  getSourceDisplay(source: any): string {
    if (typeof source === 'string') {
      return source;
    }
    return source?.name || source?.title || 'Fuente desconocida';
  }
}