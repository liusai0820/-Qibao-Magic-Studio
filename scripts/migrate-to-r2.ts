/**
 * 迁移脚本：将本地存储的图片上传到 R2
 * 使用方法：npx ts-node scripts/migrate-to-r2.ts
 */

import { uploadImageToR2 } from '../lib/r2-storage'

// 模拟从 localStorage 读取的图片数据
const localImages = [
  {
    id: '1',
    url: 'data:image/png;base64,...', // 你之前生成的 base64 图片
    theme: '恐龙世界',
    timestamp: Date.now(),
  },
  // 添加更多图片...
]

async function migrateImagesToR2() {
  console.log('🚀 开始迁移图片到 R2...')
  console.log(`📊 共需迁移 ${localImages.length} 张图片\n`)

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < localImages.length; i++) {
    const image = localImages[i]
    try {
      console.log(`⏳ 正在上传 [${i + 1}/${localImages.length}] ${image.theme}...`)

      const publicUrl = await uploadImageToR2(
        image.url,
        `migrated/${image.id}-${image.theme}.png`
      )

      console.log(`✅ 上传成功: ${publicUrl}\n`)
      successCount++
    } catch (error) {
      console.error(`❌ 上传失败 [${image.theme}]: ${error}\n`)
      failCount++
    }
  }

  console.log('\n📈 迁移完成！')
  console.log(`✅ 成功: ${successCount} 张`)
  console.log(`❌ 失败: ${failCount} 张`)
}

migrateImagesToR2().catch(console.error)
