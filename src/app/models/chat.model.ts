// Versión simplificada - solo lo esencial
export interface UnifiedQueryResult {
  originalQuestion: string;
  intent: 'SQL' | 'RAG';
  suggestions?: string[];
  answer: string;
  generatedSQL?: string;
  rawResults?: any[];
  sources?: KnowledgeDocument[];
  success: boolean;
  errorMessage?: string;
}

export interface KnowledgeDocument {
  id: string;
  content: string;
  score?: number;
}

export interface QuestionRequest {
  question: string;
}


export interface ChatMessage {
  content: string;
  text: string;
  type: 'user' | 'assistant' | 'error';
  timestamp: Date;
  suggestions?: string[];
  sources?: SourceDTO[];
  isError?: boolean;
  response?: UnifiedQueryResult;
}


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


export interface RankingDTO {
  nombre?: string;        // ← debe coincidir con el JSON
  descripcion?: string;
  equipoResponsable?: string; 
  estado?: string;
  fechaCreacion?: Date; 
  cobertura: number;   
}