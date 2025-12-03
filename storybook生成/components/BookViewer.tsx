import React, { useState } from 'react';
import { Story } from '@/lib/types';
import { Printer, Edit2, Wand2, ArrowLeft, RefreshCw, Sparkles, Save } from 'lucide-react';

interface Props {
  story: Story;
  onEditImage: (pageIndex: number, prompt: string) => Promise<void>;
  onBack: () => void;
  onSave?: () => Promise<any>;
}

const BookViewer: React.FC<Props> = ({ story, onEditImage, onBack, onSave }) => {
  const [editingPageIndex, setEditingPageIndex] = useState<number | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isProcessingEdit, setIsProcessingEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    if (!onSave) {
      alert("未配置云端存储，无法保存");
      return;
    }
    setIsSaving(true);
    try {
      await onSave();
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      console.error(e);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (index: number) => {
    setEditingPageIndex(index);
    setEditPrompt("");
  };

  const submitEdit = async () => {
    if (editingPageIndex === null) return;
    setIsProcessingEdit(true);
    try {
      await onEditImage(editingPageIndex, editPrompt);
      setEditingPageIndex(null);
    } catch (e) {
      console.error(e);
      alert("编辑失败，请重试");
    } finally {
      setIsProcessingEdit(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-20">
      {/* Header Controls - Hidden on Print */}
      <div className="no-print sticky top-0 z-50 bg-[#FFFDF5]/95 backdrop-blur border-b border-amber-100 p-4 mb-8 flex flex-wrap justify-between items-center shadow-sm gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-stone-600 hover:text-amber-700 font-heading text-lg">
          <ArrowLeft className="w-6 h-6" /> 返回创作
        </button>
        
        <h2 className="text-2xl font-heading font-bold text-amber-800 truncate px-4 hidden md:block">
          {story.title}
        </h2>

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
              {isSaving ? '保存中...' : saveStatus === 'success' ? '已保存!' : '保存云端'}
            </button>
          )}

          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl hover:bg-amber-700 transition shadow-sm font-bold"
          >
            <Printer className="w-4 h-4" /> 
            <span className="hidden sm:inline">打印 / 导出 PDF</span>
          </button>
        </div>
      </div>

      {/* Book Content */}
      <div className="space-y-16 print:space-y-0">
        
        {/* Cover Page */}
        <div className="bg-white p-8 md:p-16 shadow-xl rounded-md aspect-[3/4] mx-auto max-w-2xl flex flex-col items-center justify-center text-center border-l-8 border-amber-800/20 print:shadow-none print:border-none print:w-full print:h-screen print:break-after-page relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-30 pointer-events-none"></div>
          <div className="w-full h-full border-4 border-double border-amber-900/30 p-8 flex flex-col items-center justify-center relative z-10">
             <div className="mb-8 p-4 bg-amber-50 rounded-full">
               <Sparkles className="w-12 h-12 text-amber-500" />
             </div>
             <h1 className="font-heading text-6xl md:text-7xl text-amber-900 mb-8 leading-tight">{story.title}</h1>
             <div className="w-32 h-1 bg-amber-900/20 mb-8 rounded-full"></div>
             <p className="font-heading text-2xl text-stone-600">送给 {story.params.childName} 的故事</p>
          </div>
        </div>

        {/* Pages */}
        {story.pages.map((page, index) => (
          <div 
            key={index} 
            className="bg-white shadow-xl rounded-md flex flex-col md:flex-row overflow-hidden print:shadow-none print:flex-col print:h-screen print:break-after-page print:rounded-none relative group border border-stone-100"
          >
             {/* Page Number Badge */}
             <div className="absolute bottom-4 right-4 z-10 font-heading text-stone-300 text-4xl select-none print:bottom-8 print:right-8">
               {page.pageNumber}
             </div>

            {/* Image Side */}
            <div className="w-full md:w-1/2 bg-stone-50 flex items-center justify-center relative print:w-full print:h-[55%] print:bg-white border-b md:border-b-0 md:border-r border-stone-100">
               <div className="relative w-full aspect-square md:h-full md:aspect-auto">
                  {page.isGeneratingImage ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100 text-stone-500">
                      <Wand2 className="w-10 h-10 animate-spin text-amber-400 mb-2" />
                      <p className="font-heading text-amber-600">AI 画师正在绘制...</p>
                    </div>
                  ) : page.imageUrl ? (
                    <img 
                      src={page.imageUrl} 
                      alt={`Illustration for page ${page.pageNumber}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-400">
                      等待生成...
                    </div>
                  )}

                  {/* Edit Button */}
                  {!page.isGeneratingImage && page.imageUrl && (
                    <button 
                      onClick={() => openEditModal(index)}
                      className="no-print absolute top-4 right-4 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg text-amber-600 hover:text-amber-700 transition-all transform hover:scale-110"
                      title="修改这张图"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  )}
               </div>
            </div>

            {/* Text Side */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex items-center justify-center print:w-full print:h-[45%]">
              <div className="max-w-md w-full relative">
                 <div className="absolute -top-10 -left-6 text-6xl text-amber-100 font-serif opacity-50">“</div>
                 <p className="font-body text-xl md:text-2xl leading-loose text-stone-800 text-justify">
                  {page.text}
                </p>
                <div className="absolute -bottom-10 -right-6 text-6xl text-amber-100 font-serif opacity-50 rotate-180">“</div>
              </div>
            </div>
          </div>
        ))}

        {/* Back Cover */}
         <div className="bg-[#2c2c2c] p-12 shadow-2xl rounded-md aspect-[3/4] mx-auto max-w-2xl flex flex-col items-center justify-center text-center text-white/90 print:shadow-none print:w-full print:h-screen print:bg-white print:text-black">
          <div className="w-full h-full border-4 border-white/10 p-8 flex flex-col items-center justify-center print:border-black/10">
             <h3 className="font-heading text-4xl mb-6">全剧终</h3>
             <p className="font-heading text-xl opacity-70">Generated with WonderTales AI</p>
             <div className="mt-8 opacity-50 text-sm font-body max-w-xs">
                希望这个故事能给孩子带来勇气和快乐。
             </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingPageIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border-4 border-amber-100">
            <h3 className="text-2xl font-heading text-stone-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              修改插画
            </h3>
            <p className="text-sm text-stone-500 mb-6 font-body">
              告诉 AI 你想如何调整这张图片。例如："加一顶红帽子"、"把背景改成夜晚"。
            </p>
            
            <div className="mb-6 rounded-xl overflow-hidden border-2 border-stone-100">
               <img src={story.pages[editingPageIndex].imageUrl} className="w-full h-48 object-cover opacity-90" />
            </div>

            <textarea
              className="w-full p-4 border-2 border-stone-200 rounded-xl focus:ring-4 focus:ring-amber-100 focus:border-amber-400 outline-none mb-6 font-body"
              rows={3}
              placeholder="你想修改什么？"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setEditingPageIndex(null)}
                className="px-6 py-3 text-stone-500 font-bold hover:bg-stone-100 rounded-xl transition"
              >
                取消
              </button>
              <button 
                onClick={submitEdit}
                disabled={!editPrompt.trim() || isProcessingEdit}
                className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2 transition shadow-lg shadow-amber-200"
              >
                {isProcessingEdit && <RefreshCw className="w-4 h-4 animate-spin" />}
                生成修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookViewer;