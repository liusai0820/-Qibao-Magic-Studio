import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouterText, getConfiguredModel } from '@/lib/openrouter';
import { StoryParams, StoryPage } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const params: StoryParams = await request.json();

    // 验证必填参数
    if (!params.childName || !params.age || !params.theme) {
      return NextResponse.json(
        { error: '缺少必填参数' },
        { status: 400 }
      );
    }

    // 构建提示词
    const prompt = `
      你是一位享誉世界的儿童绘本作家和儿童心理学专家。请为一位 ${params.age} 岁的孩子（名字叫 ${params.childName}）创作一本专业的儿童绘本。

      **故事主题**: ${params.theme}
      **核心教育目标**: ${params.specificNeeds}
      **艺术风格**: ${params.artStyle}

      **创作要求**:
      1. **语言风格**: 使用地道、优美、富有节奏感的中文。针对 ${params.age} 岁儿童的认知水平调整词汇难度。
      2. **结构完整**: 故事必须包含 15 到 20 页。必须有清晰的起承转合（引入、发展、高潮、结局）。
      3. **教育融入**: 将教育目标（"${params.specificNeeds}"）自然地融入情节中，避免生硬的说教。让孩子在共情中学习。
      4. **画面描述**: 为每一页提供极具画面感、细节丰富的插画提示词（imagePrompt），供 AI 绘画模型使用。提示词中必须包含对主角外观的固定描述，以保持角色一致性。

      请以 JSON 格式返回结果，格式如下：
      {
        "title": "绘本标题",
        "pages": [
          {
            "pageNumber": 1,
            "text": "故事文字...",
            "imagePrompt": "详细的英文插画提示词..."
          }
        ]
      }
    `;

    // 调用 OpenRouter 文本生成模型
    const model = getConfiguredModel('text');
    const responseText = await callOpenRouterText(
      model,
      [{ role: 'user', content: prompt }],
      { response_format: { type: 'json_object' } }
    );

    // 解析响应
    let storyStructure: { title: string; pages: Omit<StoryPage, 'imageUrl'>[] };
    try {
      storyStructure = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON from OpenRouter', responseText);
      // 尝试清理 markdown 代码块
      const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
      storyStructure = JSON.parse(cleanedText);
    }

    return NextResponse.json(storyStructure);
  } catch (error: any) {
    console.error('Generate story error:', error);
    return NextResponse.json(
      { error: error.message || '生成故事失败' },
      { status: 500 }
    );
  }
}
