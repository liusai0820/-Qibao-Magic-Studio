export interface GeneratedImage {
  id: string
  url: string
  prompt: string
  theme: string
  timestamp: number
}

export interface BrainstormResult {
  coreObjects: string[]
  detailedItems: string[]
  envElements: string[]
}

export enum AppState {
  IDLE = 'IDLE',
  BRAINSTORMING = 'BRAINSTORMING',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type StyleType = 'claymation' | 'realistic' | 'pixar'

export interface GenerateRequest {
  theme: string
}

export interface EditRequest {
  imageData: string
  instruction: string
}
