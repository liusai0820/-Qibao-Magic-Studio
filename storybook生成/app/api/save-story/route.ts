import { NextRequest, NextResponse } from 'next/server';
import { saveStoryToLibrary, isSupabaseAvailable } from '@/lib/supabase';
import { Story } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // 检查 Supabase 是否配置
    if (!isSupabaseAvailable()) {
      return NextResponse.json(
        { error: '未配置数据库连接，无法保存故事' },
        { status: 503 }
      );
    }

    const story: Story = await request.json();

    // 验证故事数据
    if (!story.title || !story.pages || story.pages.length === 0) {
      return NextResponse.json(
        { error: '故事数据不完整' },
        { status: 400 }
      );
    }

    // 保存到 Supabase
    const result = await saveStoryToLibrary(story);

    if (result.error) {
      throw new Error(result.error.message || String(result.error));
    }

    return NextResponse.json({
      success: true,
      id: result.data?.[0]?.id,
    });
  } catch (error: any) {
    console.error('Save story error:', error);
    return NextResponse.json(
      { error: error.message || '保存故事失败' },
      { status: 500 }
    );
  }
}
