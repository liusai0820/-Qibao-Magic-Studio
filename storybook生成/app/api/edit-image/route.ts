import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouterImage, getConfiguredModel } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
  try {
    const { originalPrompt, editInstruction, style, characterName } = await request.json();

    // 验证必填参数
    if (!originalPrompt || !editInstruction || !style) {
      return NextResponse.json(
        { error: '缺少必填参数' },
        { status: 400 }
      );
    }

    // 使用重新生成策略: 结合原始提示词和编辑指令
    // 这是因为 OpenRouter 对图像编辑支持有限，重新生成更可靠
    const enhancedPrompt = `
      ${originalPrompt}
      
      Modifications requested: ${editInstruction}
      
      Style: ${style}.
      ${characterName ? `Character: The main character is ${characterName}. Maintain consistent character appearance.` : ''}
      Details: High resolution, professional color grading, soft lighting, clear focus. 
      Composition: Cinematic, rule of thirds, storytelling composition.
      Negative prompt: Text, watermark, blurry, distorted, ugly, extra limbs.
    `.trim();

    // 调用 OpenRouter 图像生成模型 (使用编辑专用模型或同一模型)
    const model = getConfiguredModel('image-edit');
    const imageUrl = await callOpenRouterImage(model, enhancedPrompt, {
      aspectRatio: '1:1',
      imageSize: '1K',
    });

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error('Edit image error:', error);
    return NextResponse.json(
      { error: error.message || '编辑图像失败' },
      { status: 500 }
    );
  }
}
