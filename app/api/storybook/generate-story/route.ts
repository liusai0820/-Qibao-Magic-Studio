import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { StoryParams } from '@/lib/types'
import { STORYBOOK_STORY_PROMPT } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const params: StoryParams = await request.json()

    if (!params.childName || !params.age || !params.theme) {
      return NextResponse.json({ error: '缺少必填参数' }, { status: 400 })
    }

    // 构建专业化prompt
    const prompt = STORYBOOK_STORY_PROMPT
      .replace(/{AGE}/g, String(params.age))
      .replace(/{CHILD_NAME}/g, params.childName)
      .replace(/{THEME}/g, params.theme)
      .replace(/{SPECIFIC_NEEDS}/g, params.specificNeeds || '培养好习惯，建立自信心')
      .replace(/{ART_STYLE}/g, params.artStyle)
      .replace(/{CHARACTER_DESCRIPTION}/g, params.characterDescription || '可爱的中国小朋友')
      .replace(/{CHARACTER_SHEET}/g, `{ "main": "A ${params.age}-year-old Chinese child named ${params.childName}. ${translateToEnglish(params.characterDescription || 'a cute Chinese child')}" }`)

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: process.env.BRAINSTORM_MODEL || 'google/gemini-2.0-flash-exp',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 6000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`生成故事失败: ${error}`)
    }

    const data = await response.json()
    let content = data.choices[0].message.content

    try {
      const storyStructure = JSON.parse(content)
      if (!storyStructure.characterSheet) {
        storyStructure.characterSheet = { "main": characterAnchorBase }
      }
      return NextResponse.json(storyStructure)
    } catch {
      const cleanedText = content.replace(/```json\n?|\n?```/g, '').trim()
      const parsed = JSON.parse(cleanedText)
      if (!parsed.characterSheet) {
        parsed.characterSheet = { "main": characterAnchorBase }
      }
      return NextResponse.json(parsed)
    }
