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
  GENERATING_STORY = 'GENERATING_STORY',
  GENERATING_IMAGES = 'GENERATING_IMAGES',
  VIEWING = 'VIEWING',
}

export type StyleType = 'claymation' | 'realistic' | 'pixar'

export interface GenerateRequest {
  theme: string
}

export interface EditRequest {
  imageData: string
  instruction: string
}

// Storybook 相关类型
export interface StoryParams {
  childName: string
  age: number
  theme: string
  specificNeeds: string
  artStyle: string
  characterDescription?: string // 角色外观描述
  referenceImageUrl?: string // 参考图URL，用于保持角色一致性
}

export interface StoryPage {
  pageNumber: number
  text: string
  imagePrompt: string
  imageUrl?: string
  isGeneratingImage?: boolean
}

export interface Story {
  id?: string
  title: string
  params: StoryParams
  pages: StoryPage[]
  createdAt?: number
}
