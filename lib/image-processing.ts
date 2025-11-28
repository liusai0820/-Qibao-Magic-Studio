/**
 * 图片处理工具函数
 * 用于处理用户上传的图片和生成合成图片
 */

/**
 * 将图片转换为 Base64
 */
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // 提取 base64 部分（去掉 data:image/...;base64, 前缀）
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 获取图片的 MIME 类型
 */
export function getImageMimeType(file: File): string {
  return file.type || 'image/jpeg'
}

/**
 * 验证图片文件
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 20 * 1024 * 1024 // 20MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  if (file.size > maxSize) {
    return { valid: false, error: '图片大小不能超过 20MB' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: '仅支持 JPEG、PNG、GIF、WebP 格式' }
  }

  return { valid: true }
}

/**
 * 生成用户头像和卡通角色的合成提示词
 */
export function generateAvatarMergePrompt(
  userImageDescription: string,
  cartoonCharacters: string,
  scene: string
): string {
  return `
【用户头像与卡通角色合成】

【用户头像信息】
${userImageDescription}

【卡通角色】
${cartoonCharacters}

【场景环境】
${scene}

【合成要求】
1. 将用户的真实头像自然融入到皮克斯风格的3D动画场景中
2. 用户应该与卡通角色进行互动，展现出欢乐、温馨的氛围
3. 用户的面部特征应该清晰可见，但整体风格与卡通角色保持协调
4. 场景应该具有皮克斯电影级别的3D渲染效果
5. 整体画面充满活力、幽默、温馨的欢乐气息

【技术规格】
Pixar 3D animation style, movie-level rendering, user's real face integrated with cartoon characters, warm and soft lighting, bright and vibrant colors, cinematic composition, 8K ultra HD, joyful and heartwarming atmosphere.
  `.trim()
}
