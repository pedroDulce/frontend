

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

// models.ts
export interface UnifiedQueryResult {
  originalQuestion: string;
  intent: 'SQL' | 'RAG' | 'WELCOME';  // Añadir WELCOME
  suggestions?: string[];
  answer: string;
  generatedSQL?: string;
  rawResults?: any[];
  sources?: KnowledgeDocument[];  // Cambiar de SourceDTO a KnowledgeDocument
  success: boolean;
  errorMessage?: string;
}

export interface KnowledgeDocument {
  id: string;
  content: string;
  metadata?: DocumentMetadata;
  score?: number;
  source?: string;
}

// Añade esta interfaz que falta
export interface DocumentMetadata {
  title?: string;
  author?: string;
  createdDate?: string;
  lastModified?: string;
  documentType?: string;
  tags?: string[];
  sourceFile?: string;
  pageNumber?: number;
}


export interface ChatMessage {
  text: string;
  type: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isError?: boolean;
  suggestions?: string[];
  response?: UnifiedQueryResult;
}

export interface QuestionRequest {
  question: string;
}