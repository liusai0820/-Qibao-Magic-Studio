'use client'

import { useState, useEffect } from 'react'
import { Story } from '@/lib/types'
import { ChevronLeft, ChevronRight, Edit2, Wand2, Save, Download, ArrowLeft, X, RefreshCw, FileText, Square, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  story: Story
  onEditImage: (pageIndex: number, prompt: string) => Promise<void>
  onBack: () => void
  onSave?: () => Promise<any>
}

export default function FlipBook({ story, onEditImage, onBack, onSave }: Props) {
  const [currentPage, setCurrentPage] = useState(0) // 0 = 封面
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDirection, setFlipDirection] = useState<'left' | 'right'>('right')
  const [editingPageIndex, setEditingPageIndex] = useState<number | null>(null)
  const [editPrompt, setEditPrompt] = useState('')
  const [isProcessingEdit, setIsProcessingEdit] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState({ progress: 0, message: '' })

  const totalPages = story.pages.length + 2 // 封面 + 内容页 + 封底

  const goToPage = (page: number, direction: 'left' | 'right') => {
    if (isFlipping || page < 0 || page >= totalPages) return
    setFlipDirection(direction)
    setIsFlipping(true)
    setTimeout(() => {
      setCurrentPage(page)
      setIsFlipping(false)
    }, 400)
  }

  const nextPage = () => goToPage(currentPage + 1, 'right')
  const prevPage = () => goToPage(currentPage - 1, 'left')

  const handleSave = async () => {
    if (!onSave) return
    setIsSaving(true)
    try {
      await onSave()
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportPDF = async (type: 'print' | 'square') => {
    setIsExporting(true)
    setShowExportMenu(false)
    
    console.log('=== 开始导出PDF（服务端） ===')
    
    // 检查所有页面是否有图片
    const pagesWithoutImages = story.pages.filter(p => !p.imageUrl)
    if (pagesWithoutImages.length > 0) {
      const confirm = window.confirm(`有 ${pagesWithoutImages.length} 页还没有生成图片，是否继续导出？`)
      if (!confirm) {
        setIsExporting(false)
        return
      }
    }
    
    try {
      setExportProgress({ progress: 10, message: '正在准备数据...' })
      
      // 调用服务端API生成PDF
      const response = await fetch('/api/storybook/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story,
          format: type === 'square' ? 'portrait' : 'landscape',
        }),
      })
      
      setExportProgress({ progress: 50, message: '正在生成PDF...' })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'PDF生成失败')
      }
      
      setExportProgress({ progress: 80, message: '正在下载...' })
      
      // 下载PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${story.title}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      setExportProgress({ progress: 100, message: '导出成功！' })
      console.log('=== PDF导出成功 ===')
      
      setTimeout(() => {
        setIsExporting(false)
        setExportProgress({ progress: 0, message: '' })
      }, 1000)
    } catch (error) {
      console.error('=== PDF导出失败 ===', error)
      alert(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`)
      setIsExporting(false)
      setExportProgress({ progress: 0, message: '' })
    }
  }

  const submitEdit = async () => {
    if (editingPageIndex === null) return
    setIsProcessingEdit(true)
    try {
      await onEditImage(editingPageIndex, editPrompt)
      setEditingPageIndex(null)
    } catch {
      alert('编辑失败，请重试')
    } finally {
      setIsProcessingEdit(false)
    }
  }

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPage()
      if (e.key === 'ArrowLeft') prevPage()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, isFlipping])

  const getPageContent = () => {
    if (currentPage === 0) {
      // 封面 - 显示第一页的图片作为封面
      const coverPage = story.pages[0]
      return (
        <div className="w-full h-full relative">
          {coverPage?.isGeneratingImage ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
              <Wand2 className="w-12 h-12 animate-spin text-amber-400 mb-4" />
              <p className="text-amber-600 font-medium">正在绘制封面...</p>
            </div>
          ) : coverPage?.imageUrl ? (
            <div className="w-full h-full relative">
              <img src={coverPage.imageUrl} alt="封面" className="w-full h-full object-cover" />
              {/* 标题叠加层 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col items-center justify-end p-8 text-center">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg leading-tight">{story.title}</h1>
                <p className="text-lg md:text-xl text-white/90 drop-shadow-md">送给 {story.params.childName} 的故事</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-8 text-center">
              <div className="w-full h-full border-4 border-double border-amber-900/20 rounded-lg p-8 flex flex-col items-center justify-center">
                <div className="mb-6 p-4 bg-amber-100 rounded-full">
                  <span className="text-5xl">📖</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-6 leading-tight">{story.title}</h1>
                <div className="w-24 h-1 bg-amber-900/20 mb-6 rounded-full" />
                <p className="text-xl text-slate-600">送给 {story.params.childName} 的故事</p>
              </div>
            </div>
          )}
        </div>
      )
    }

    if (currentPage === totalPages - 1) {
      // 封底 - 显示最后一页的图片作为封底
      const backCoverPage = story.pages[story.pages.length - 1]
      return (
        <div className="w-full h-full relative">
          {backCoverPage?.isGeneratingImage ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white">
              <Wand2 className="w-12 h-12 animate-spin text-amber-400 mb-4" />
              <p className="text-amber-400 font-medium">正在绘制封底...</p>
            </div>
          ) : backCoverPage?.imageUrl ? (
            <div className="w-full h-full relative">
              <img src={backCoverPage.imageUrl} alt="封底" className="w-full h-full object-cover" />
              {/* 文字叠加层 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col items-center justify-end p-8 text-center">
                <h3 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">全剧终</h3>
                <p className="text-xl text-white/90 drop-shadow-md mb-4">The End</p>
                <div className="text-sm text-white/70 max-w-xs drop-shadow">
                  希望这个故事能给孩子带来勇气和快乐。
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white p-8 text-center">
              <div className="w-full h-full border-4 border-white/10 rounded-lg p-8 flex flex-col items-center justify-center">
                <h3 className="text-4xl font-bold mb-6">全剧终</h3>
                <p className="text-xl opacity-70">The End</p>
                <div className="mt-8 opacity-50 text-sm max-w-xs">
                  希望这个故事能给孩子带来勇气和快乐。
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    // 内容页（跳过封面和封底）
    const pageIndex = currentPage - 1
    const page = story.pages[pageIndex]
    if (!page) return null

    // 封面和封底不显示内容页布局
    if (pageIndex === 0 || pageIndex === story.pages.length - 1) {
      return null // 已在上面处理
    }

    return (
      <div className="w-full h-full flex flex-col md:flex-row bg-white">
        {/* 图片区域 */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full bg-slate-100 relative flex items-center justify-center">
          {page.isGeneratingImage ? (
            <div className="flex flex-col items-center justify-center text-slate-500">
              <Wand2 className="w-10 h-10 animate-spin text-amber-400 mb-2" />
              <p className="text-amber-600 font-medium">AI 画师正在绘制...</p>
            </div>
          ) : page.imageUrl ? (
            <>
              <img src={page.imageUrl} alt={`第 ${page.pageNumber} 页`} className="w-full h-full object-cover" />
              <button
                onClick={() => { setEditingPageIndex(pageIndex); setEditPrompt('') }}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg text-amber-600 hover:text-amber-700 transition-all hover:scale-110"
                title="修改这张图"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="text-slate-400">等待生成...</div>
          )}
        </div>

        {/* 文字区域 */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full p-6 md:p-10 flex items-center justify-center">
          <div className="max-w-md relative">
            <div className="absolute -top-8 -left-4 text-5xl text-amber-100 font-serif">"</div>
            <p className="text-lg md:text-xl leading-relaxed text-slate-800">{page.text}</p>
            <div className="absolute -bottom-8 -right-4 text-5xl text-amber-100 font-serif rotate-180">"</div>
          </div>
        </div>

        {/* 页码 */}
        <div className="absolute bottom-4 right-4 text-slate-300 text-2xl font-bold">
          {page.pageNumber}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* 顶部控制栏 */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4 px-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-amber-700 font-medium">
          <ArrowLeft className="w-5 h-5" /> 返回创作
        </button>
        
        <div className="text-lg font-medium text-amber-800 hidden md:block">{story.title}</div>

        <div className="flex gap-3">
          {onSave && (
            <button
              onClick={handleSave}
              disabled={isSaving || saveStatus === 'success'}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white transition shadow-sm ${
                saveStatus === 'success' ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              <Save className="w-4 h-4" />
              {isSaving ? '保存中...' : saveStatus === 'success' ? '已保存!' : '保存'}
            </button>
          )}
          
          {/* PDF导出按钮 */}
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl hover:bg-amber-700 transition shadow-sm font-bold disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isExporting ? '导出中...' : '导出PDF'}
            </button>
            
            {/* 导出选项菜单 */}
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 w-64">
                <div className="p-3 bg-slate-50 border-b border-slate-200">
                  <p className="text-sm font-medium text-slate-700">选择导出格式</p>
                </div>
                <button
                  onClick={() => handleExportPDF('print')}
                  className="w-full px-4 py-3 text-left hover:bg-amber-50 transition flex items-start gap-3"
                >
                  <FileText className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-800">打印店专用 (A4横版)</p>
                    <p className="text-xs text-slate-500 mt-0.5">含3mm出血线，适合专业印刷</p>
                  </div>
                </button>
                <button
                  onClick={() => handleExportPDF('square')}
                  className="w-full px-4 py-3 text-left hover:bg-amber-50 transition flex items-start gap-3 border-t border-slate-100"
                >
                  <Square className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-800">方形绘本 (21×21cm)</p>
                    <p className="text-xs text-slate-500 mt-0.5">经典绘本尺寸，适合装订</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 翻书区域 */}
      <div className="relative perspective-1000 mx-auto" style={{ maxWidth: '900px' }}>
        {/* 书本容器 */}
        <div className="relative w-full aspect-[4/3] bg-amber-900/10 rounded-lg shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ 
                rotateY: flipDirection === 'right' ? 90 : -90,
                opacity: 0 
              }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ 
                rotateY: flipDirection === 'right' ? -90 : 90,
                opacity: 0 
              }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="absolute inset-0"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {getPageContent()}
            </motion.div>
          </AnimatePresence>

          {/* 翻页按钮 */}
          <button
            onClick={prevPage}
            disabled={currentPage === 0 || isFlipping}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </button>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages - 1 || isFlipping}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
          >
            <ChevronRight className="w-6 h-6 text-slate-700" />
          </button>
        </div>

        {/* 页码指示器 */}
        <div className="flex justify-center items-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i, i > currentPage ? 'right' : 'left')}
              className={`w-3 h-3 rounded-full transition-all ${
                i === currentPage ? 'bg-amber-500 scale-125' : 'bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
        <div className="text-center mt-2 text-slate-500 text-sm">
          {currentPage === 0 ? '封面' : currentPage === totalPages - 1 ? '封底' : `第 ${currentPage} / ${totalPages - 2} 页`}
        </div>
      </div>

      {/* 导出进度条 */}
      {isExporting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
              <h3 className="text-xl font-bold text-slate-800">正在导出PDF</h3>
            </div>
            <p className="text-slate-600 mb-4">{exportProgress.message || '准备中...'}</p>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${exportProgress.progress}%` }}
              />
            </div>
            <p className="text-right text-sm text-slate-500 mt-2">{Math.round(exportProgress.progress)}%</p>
          </div>
        </div>
      )}

      {/* 编辑弹窗 */}
      {editingPageIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Edit2 className="w-6 h-6 text-amber-500" /> 修改插画
              </h3>
              <button onClick={() => setEditingPageIndex(null)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              告诉 AI 你想如何调整这张图片。例如："加一顶红帽子"、"把背景改成夜晚"。
            </p>
            
            {story.pages[editingPageIndex]?.imageUrl && (
              <div className="mb-4 rounded-xl overflow-hidden border-2 border-slate-100">
                <img src={story.pages[editingPageIndex].imageUrl} className="w-full h-40 object-cover" />
              </div>
            )}

            <textarea
              className="w-full p-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-amber-100 focus:border-amber-400 outline-none mb-4"
              rows={3}
              placeholder="你想修改什么？"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setEditingPageIndex(null)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition">
                取消
              </button>
              <button
                onClick={submitEdit}
                disabled={!editPrompt.trim() || isProcessingEdit}
                className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2 transition shadow-lg"
              >
                {isProcessingEdit && <RefreshCw className="w-4 h-4 animate-spin" />}
                生成修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
