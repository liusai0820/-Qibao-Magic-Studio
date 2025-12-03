'use client';

import React, { useState } from 'react';
import { AppState, Story, StoryParams } from '@/lib/types';
import StoryForm from '@/components/StoryForm';
import BookViewer from '@/components/BookViewer';
import { AlertCircle } from 'lucide-react';

export default function Home() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [story, setStory] = useState<Story | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Track image generation progress
  const [generatedCount, setGeneratedCount] = useState(0);

  const handleCreateStory = async (params: StoryParams) => {
    setErrorMsg(null);
    setAppState(AppState.GENERATING_STORY);
    setGeneratedCount(0);
    
    try {
      // 1. Generate Text Structure - 调用 API 路由
      const storyResponse = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!storyResponse.ok) {
        const errorData = await storyResponse.json();
        throw new Error(errorData.error || '生成故事失败');
      }

      const storyStructure = await storyResponse.json();
      
      const newStory: Story = {
        title: storyStructure.title,
        params: params,
        pages: storyStructure.pages.map((p: any) => ({
          ...p,
          isGeneratingImage: true
        }))
      };
      
      setStory(newStory);
      setAppState(AppState.GENERATING_IMAGES);

      // 2. Generate Images Sequentially to ensure quality and avoid rate limits
      const pagesWithImages = [...newStory.pages];
      
      for (let i = 0; i < pagesWithImages.length; i++) {
        try {
          const imageResponse = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: pagesWithImages[i].imagePrompt,
              style: params.artStyle,
              characterName: params.childName,
            }),
          });

          if (!imageResponse.ok) {
            throw new Error('生成图像失败');
          }

          const { imageUrl } = await imageResponse.json();
          
          setStory(prev => {
            if (!prev) return null;
            const updatedPages = [...prev.pages];
            updatedPages[i] = {
              ...updatedPages[i],
              imageUrl,
              isGeneratingImage: false
            };
            return { ...prev, pages: updatedPages };
          });
          setGeneratedCount(prev => prev + 1);
        } catch (err) {
          console.error(`Page ${i + 1} generation failed`, err);
          // Mark as failed but keep going
          setStory(prev => {
             if (!prev) return null;
             const updatedPages = [...prev.pages];
             updatedPages[i] = { ...updatedPages[i], isGeneratingImage: false };
             return { ...prev, pages: updatedPages };
          });
        }
      }

      setAppState(AppState.VIEWING);

    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "生成故事时遇到了问题，请稍后再试。");
      setAppState(AppState.ERROR);
    }
  };

  const handleEditImage = async (pageIndex: number, prompt: string) => {
    if (!story) return;

    setStory(prev => {
      if (!prev) return null;
      const updatedPages = [...prev.pages];
      updatedPages[pageIndex].isGeneratingImage = true;
      return { ...prev, pages: updatedPages };
    });

    try {
      const editResponse = await fetch('/api/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalPrompt: story.pages[pageIndex].imagePrompt,
          editInstruction: prompt,
          style: story.params.artStyle,
          characterName: story.params.childName,
        }),
      });

      if (!editResponse.ok) {
        throw new Error('编辑图像失败');
      }

      const { imageUrl } = await editResponse.json();
      
      setStory(prev => {
        if (!prev) return null;
        const updatedPages = [...prev.pages];
        updatedPages[pageIndex] = {
          ...updatedPages[pageIndex],
          imageUrl,
          isGeneratingImage: false
        };
        return { ...prev, pages: updatedPages };
      });
    } catch (error) {
      console.error("Edit failed", error);
      setStory(prev => {
        if (!prev) return null;
        const updatedPages = [...prev.pages];
        updatedPages[pageIndex].isGeneratingImage = false;
        return { ...prev, pages: updatedPages };
      });
      throw error;
    }
  };

  const handleSaveStory = async () => {
    if (!story) return;

    try {
      const saveResponse = await fetch('/api/save-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(story),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || '保存失败');
      }

      return await saveResponse.json();
    } catch (error: any) {
      console.error('Save error:', error);
      throw error;
    }
  };

  const reset = () => {
    if (window.confirm("确定要重新开始吗？当前的故事将会丢失（除非已保存）。")) {
      setStory(null);
      setAppState(AppState.IDLE);
      setErrorMsg(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-stone-900 selection:bg-amber-200 font-body">
      
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <main className="container mx-auto px-4 py-8 relative z-10">
        
        {appState === AppState.IDLE && (
          <div className="animate-fade-in-up">
            <StoryForm onSubmit={handleCreateStory} isLoading={false} />
          </div>
        )}

        {(appState === AppState.GENERATING_STORY || appState === AppState.GENERATING_IMAGES) && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
             <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-8 border-amber-100 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="text-4xl animate-bounce">🎨</span>
                </div>
             </div>
             
             <div className="text-center max-w-md">
               <h2 className="text-3xl font-heading font-bold text-amber-800 mb-4">
                 {appState === AppState.GENERATING_STORY ? "正在构思奇妙的故事..." : "AI 画师正在绘制插图..."}
               </h2>
               <p className="text-stone-500 text-lg">
                 {appState === AppState.GENERATING_STORY 
                   ? "我们的 AI 作家正在挥洒创意。" 
                   : "为了保证画质，这可能需要几分钟。请耐心等待魔法发生。"}
               </p>
               
               {appState === AppState.GENERATING_IMAGES && story && (
                 <div className="mt-8">
                    <p className="font-heading text-xl text-amber-600 mb-2">
                       已完成: {generatedCount} / {story.pages.length} 页
                    </p>
                    <div className="w-64 h-3 bg-stone-200 rounded-full mx-auto overflow-hidden">
                       <div 
                         className="h-full bg-amber-500 transition-all duration-500 ease-out"
                         style={{ width: `${(generatedCount / story.pages.length) * 100}%` }}
                       ></div>
                    </div>
                    <p className="mt-4 text-sm font-mono bg-white/50 backdrop-blur px-4 py-2 rounded-lg inline-block border border-amber-100">
                      正在绘制: &quot;{story.title}&quot;
                    </p>
                 </div>
               )}
             </div>
          </div>
        )}

        {appState === AppState.VIEWING && story && (
          <BookViewer 
            story={story} 
            onEditImage={handleEditImage} 
            onBack={reset}
            onSave={handleSaveStory}
          />
        )}

        {appState === AppState.ERROR && (
          <div className="max-w-md mx-auto mt-20 p-8 bg-red-50 border-2 border-red-100 rounded-3xl text-center shadow-xl">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-2xl font-heading font-bold text-red-800 mb-2">哎呀，出错了！</h3>
            <p className="text-red-600 mb-8">{errorMsg}</p>
            <button 
              onClick={() => setAppState(AppState.IDLE)}
              className="px-8 py-3 bg-white border-2 border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition"
            >
              重试一下
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
