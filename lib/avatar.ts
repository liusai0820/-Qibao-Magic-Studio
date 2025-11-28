/**
 * 使用 DiceBear 生成用户头像
 * @param seed - 用户标识（如用户名或ID），相同的 seed 会生成相同的头像
 * @param style - 头像风格，默认为 'avataaars'（卡通人物风格）
 * @returns 头像 URL
 */
export function getDiceBearAvatarUrl(
  seed: string,
  style: 'pixel-art' | 'avataaars' | 'lorelei' | 'notionists' = 'avataaars'
): string {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`
}

/**
 * 获取用户的头像 URL
 * 优先使用 Clerk 提供的头像，如果没有则使用 DiceBear 生成
 */
export function getUserAvatarUrl(
  clerkImageUrl: string | null | undefined,
  userId: string
): string {
  // 如果用户已上传头像，使用 Clerk 的头像
  if (clerkImageUrl) {
    return clerkImageUrl
  }
  
  // 否则使用 DiceBear 生成头像
  return getDiceBearAvatarUrl(userId)
}
