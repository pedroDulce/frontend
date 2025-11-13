export interface ChatRequest {
  question: string;
}

export interface RagResponse {
  answer: string;
  suggestions: string[];
  sources: SourceDTO[];
}

export interface SourceDTO {
  type: string;
  description: string;
}

export interface RankingDTO {
  aplicacion: {
    id: number;
    nombre: string;
    descripcion: string;
    equipoResponsable: string;
    estado: string;
  };
  cobertura: number;
}

export interface ChatMessage {
  content: string;
  type: 'user' | 'assistant' | 'error';
  timestamp: Date;
  suggestions?: string[];
  sources?: SourceDTO[];
}