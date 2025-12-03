'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { AppState, Story, StoryParams } from '@/lib/types'
import StoryForm from '@/components/StoryForm'
import StoryList from '@/components/StoryList'
import FlipBook from '@/components/FlipBook'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AlertCircle, Wand2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function StorybookPage() {
  const { isLoaded, user } = useUser()
  const [appState, setAppState] = useState<AppState>(AppState.IDLE)
  const [story, setStory] = useState<Story | null>(null)
  const [stories, setStories] = useState<Story[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [generatedCount, setGeneratedCount] = useState(0)
  const [showStoryForm, setShowStoryForm] = useState(false)

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/storybook/list')
      if (!response.ok) {
        throw new Error('Failed to fetch stories')
      }
      const data = await response.json()
      setStories(data)
      if (data.length > 0) {
        setShowStoryForm(false)
      } else {
        setShowStoryForm(true)
      }
    } catch (error) {
      console.error(error)
      // Don't show an error message, just show the form
      setShowStoryForm(true)
    }
  }

  useEffect(() => {
    if (isLoaded) {
      fetchStories()
    }
  }, [isLoaded])

  const handleCreateStory = async (params: StoryParams) => {
    setErrorMsg(null)
    setAppState(AppState.GENERATING_STORY)
    setGeneratedCount(0)
    setStory(null)
    
    try {
      // 1. 生成故事文本结构
      const storyResponse = await fetch('/api/storybook/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      if (!storyResponse.ok) {
        const errorData = await storyResponse.json()
        throw new Error(errorData.error || '生成故事失败')
      }

      const storyStructure = await storyResponse.json()
      const characterSheet = storyStructure.characterSheet // Capture characterSheet
      
      const newStory: any = {
        title: storyStructure.title,
        ...params,
        characterSheet: characterSheet, // Add characterSheet to newStory
        pages: storyStructure.pages.map((p: any) => ({
          ...p,
          isGeneratingImage: true
        }))
      }
      
      setStory(newStory)
      setAppState(AppState.GENERATING_IMAGES)

      // 2. 串行生成所有图片（避免并发auth问题）
      const generateImageWithRetry = async (pageIndex: number, isCover: boolean, isBackCover: boolean, retries = 3): Promise<void> => {
        let prompt = newStory.pages[pageIndex].imagePrompt
        
        // 封面特殊处理
        if (isCover) {
          prompt = `Beautiful children's book cover illustration. Title: ${newStory.title}. Main character: ${params.childName}. Based on the character sheet: ${JSON.stringify(characterSheet)}. Style: ${params.artStyle}. Eye-catching, warm, inviting cover featuring the main character. Professional children's book cover design. Square format 1:1 aspect ratio.`
        }
        
        // 封底特殊处理
        if (isBackCover) {
          prompt = `Warm heartwarming children's book back cover illustration. Main character: ${params.childName}. Based on the character sheet: ${JSON.stringify(characterSheet)}. Style: ${params.artStyle}. Show the character waving goodbye in a happy, peaceful sunset scene. Soft pastel colors, gentle atmosphere, hopeful mood, beautiful ending. Square format 1:1 aspect ratio.`
        }

        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            // 每次请求前等待，避免auth token问题
            if (attempt > 1) {
              await new Promise(resolve => setTimeout(resolve, 2000))
            }

            const imageResponse = await fetch('/api/storybook/generate-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt,
                style: params.artStyle,
                characterSheet: JSON.stringify(characterSheet), // Pass characterSheet
                referenceImageUrl: params.referenceImageUrl,
                pageNumber: pageIndex + 1,
              }),
            })

            if (imageResponse.status === 401 && attempt < retries) {
              console.log(`Page ${pageIndex + 1}: 401 error, retry ${attempt}/${retries}`)
              continue
            }

            if (!imageResponse.ok) {
              throw new Error(`生成图像失败: ${imageResponse.status}`)
            }

            const { imageUrl } = await imageResponse.json()
            
            setStory(prev => {
              if (!prev) return null
              const updatedPages = [...prev.pages]
              updatedPages[pageIndex] = {
                ...updatedPages[pageIndex],
                imageUrl,
                isGeneratingImage: false
              }
              return { ...prev, pages: updatedPages }
            })
            setGeneratedCount(prev => prev + 1)
            return
          } catch (err) {
            if (attempt === retries) {
              console.error(`Page ${pageIndex + 1} generation failed after ${retries} attempts`, err)
              setStory(prev => {
                if (!prev) return null
                const updatedPages = [...prev.pages]
                updatedPages[pageIndex] = { ...updatedPages[pageIndex], isGeneratingImage: false }
                return { ...prev, pages: updatedPages }
              })
              setGeneratedCount(prev => prev + 1)
            }
          }
        }
      }

      const generateImage = async (pageIndex: number, isCover: boolean, isBackCover: boolean) => {
        await generateImageWithRetry(pageIndex, isCover, isBackCover)
      }

      // 并行生成所有页面
      const imageGenerationPromises = newStory.pages.map((_: any, i: number) => {
        const isCover = i === 0
        const isBackCover = i === newStory.pages.length - 1
        return generateImage(i, isCover, isBackCover)
      })

      await Promise.all(imageGenerationPromises)

      setAppState(AppState.VIEWING)
    } catch (error: any) {
      console.error(error)
      setErrorMsg(error.message || '生成故事时遇到了问题，请稍后再试。')
      setAppState(AppState.ERROR)
    }
  }

  const handleEditImage = async (pageIndex: number, prompt: string) => {
    if (!story) return

    setStory(prev => {
      if (!prev) return null
      const updatedPages = [...prev.pages]
      updatedPages[pageIndex].isGeneratingImage = true
      return { ...prev, pages: updatedPages }
    })

    try {
      const response = await fetch('/api/storybook/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${story.pages[pageIndex].imagePrompt}. Modifications: ${prompt}`,
          style: story.artStyle,
          characterSheet: JSON.stringify(story.characterSheet), // Pass characterSheet
          pageNumber: pageIndex + 1,
        }),
      })

      if (!response.ok) throw new Error('编辑图像失败')

      const { imageUrl } = await response.json()
      
      setStory(prev => {
        if (!prev) return null
        const updatedPages = [...prev.pages]
        updatedPages[pageIndex] = { ...updatedPages[pageIndex], imageUrl, isGeneratingImage: false }
        return { ...prev, pages: updatedPages }
      })
    } catch (error) {
      console.error('Edit failed', error)
      setStory(prev => {
        if (!prev) return null
        const updatedPages = [...prev.pages]
        updatedPages[pageIndex].isGeneratingImage = false
        return { ...prev, pages: updatedPages }
      })
      throw error
    }
  }

  const handleSaveStory = async () => {
    if (!story) return
    const response = await fetch('/api/storybook/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(story),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || '保存失败')
    }
    await fetchStories()
    return await response.json()
  }

  const handleSelectStory = (selectedStory: Story) => {
    setStory(selectedStory)
    setAppState(AppState.VIEWING)
  }

  const reset = () => {
    setStory(null)
    setAppState(AppState.IDLE)
    setErrorMsg(null)
    fetchStories()
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 to-orange-50">
      <Header />
      <main className="flex-1 py-8 px-4">
        {appState === AppState.IDLE && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {showStoryForm ? (
              <StoryForm onSubmit={handleCreateStory} isLoading={false} />
            ) : (
              <div>
                <StoryList stories={stories} onSelectStory={handleSelectStory} />
                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowStoryForm(true)}
                    className="px-8 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition"
                  >
                    创作新故事
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {(appState === AppState.GENERATING_STORY || appState === AppState.GENERATING_IMAGES) && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-8 border-amber-100 rounded-full" />
              <div className="absolute inset-0 border-8 border-amber-500 rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Wand2 className="w-10 h-10 text-amber-500 animate-pulse" />
              </div>
            </div>
            <div className="text-center max-w-md">
              <h2 className="text-3xl font-bold text-amber-800 mb-4">
                {appState === AppState.GENERATING_STORY ? '正在构思奇妙的故事...' : 'AI 画师正在绘制插图...'}
              </h2>
              {appState === AppState.GENERATING_IMAGES && story && (
                <div className="mt-8">
                  <p className="text-xl text-amber-600 mb-2">已完成: {generatedCount} / {story.pages.length} 页</p>
                  <div className="w-64 h-3 bg-slate-200 rounded-full mx-auto overflow-hidden">
                    <div className="h-full bg-amber-500 transition-all" style={{ width: `${(generatedCount / story.pages.length) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
            {appState === AppState.GENERATING_IMAGES && story && generatedCount > 0 && (
              <div className="w-full max-w-4xl mt-8">
                <FlipBook story={story} onEditImage={handleEditImage} onBack={() => {}} />
              </div>
            )}
          </div>
        )}

        {appState === AppState.VIEWING && story && (
          <FlipBook story={story} onEditImage={handleEditImage} onBack={reset} onSave={handleSaveStory} />
        )}

        {appState === AppState.ERROR && (
          <div className="max-w-md mx-auto mt-20 p-8 bg-red-50 border-2 border-red-100 rounded-3xl text-center shadow-xl">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-red-800 mb-2">哎呀，出错了！</h3>
            <p className="text-red-600 mb-8">{errorMsg}</p>
            <button onClick={reset} className="px-8 py-3 bg-white border-2 border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition">
              返回
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
