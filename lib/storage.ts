import { GeneratedImage } from './types'

const STORAGE_KEY = 'clay_magic_images_metadata'

/**
 * 保存图片元数据到本地存储（只保存 URL 和元信息，不保存 base64）
 */
export function saveImagesToStorage(images: GeneratedImage[]): void {
  if (typeof window === 'undefined') return

  try {
    // 只保存最近 50 张图片的元数据
    const recentImages = images.slice(0, 50).map((img) => ({
      id: img.id,
      url: img.url, // R2 URL，很小
      theme: img.theme,
      timestamp: img.timestamp,
    }))

    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentImages))
  } catch (error) {
    console.error('Failed to save images metadata to storage:', error)
  }
}

/**
 * 从本地存储加载图片元数据
 */
export function loadImagesFromStorage(): GeneratedImage[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const metadata = JSON.parse(stored)
    return metadata.map((item: any) => ({
      id: item.id,
      url: item.url,
      theme: item.theme,
      timestamp: item.timestamp,
      prompt: '', // 不保存完整 prompt
    }))
  } catch (error) {
    console.error('Failed to load images from storage:', error)
    return []
  }
}

/**
 * 清空本地存储
 */
export function clearImagesStorage(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear storage:', error)
  }
}

/**
 * 从存储中删除单张图片
 */
export function removeImageFromStorage(imageId: string): void {
  if (typeof window === 'undefined') return

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return

    const images = JSON.parse(stored)
    const filtered = images.filter((img: any) => img.id !== imageId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to remove image from storage:', error)
  }
}
