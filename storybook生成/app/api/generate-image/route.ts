import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouterImage, getConfiguredModel } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
  try {
    const { prompt, style, characterName } = await request.json();

    // 验证必填参数
    if (!prompt || !style) {
      return NextResponse.json(
        { error: '缺少必填参数' },
        { status: 400 }
      );
    }

    // 增强提示词，确保风格统一和质量
    const fullPrompt = `
      Masterpiece children's book illustration.
      Style: ${style}.
      Subject: ${prompt}.
      ${characterName ? `Character: The main character is ${characterName}. Ensure consistent character appearance.` : ''}
      Details: High resolution, professional color grading, soft lighting, clear focus. 
      Composition: Cinematic, rule of thirds, storytelling composition.
      Negative prompt: Text, watermark, blurry, distorted, ugly, extra limbs.
    `.trim();

    // 调用 OpenRouter 图像生成模型
    const model = getConfiguredModel('image');
    const imageUrl = await callOpenRouterImage(model, fullPrompt, {
      aspectRatio: '1:1',
      imageSize: '1K',
    });

    console.log('Generated image URL type:', typeof imageUrl);
    console.log('Generated image URL length:', imageUrl?.length);
    console.log('Generated image URL prefix:', imageUrl?.substring(0, 50));

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error('Generate image error:', error);
    return NextResponse.json(
      { error: error.message || '生成图像失败' },
      { status: 500 }
    );
  }
}
