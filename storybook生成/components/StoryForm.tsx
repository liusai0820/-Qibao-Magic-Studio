import React, { useState } from 'react';
import { StoryParams } from '@/lib/types';
import { BookOpen, Sparkles, Palette, Heart, User, Star } from 'lucide-react';

interface Props {
  onSubmit: (params: StoryParams) => void;
  isLoading: boolean;
}

const StoryForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [params, setParams] = useState<StoryParams>({
    childName: '',
    age: 5,
    theme: '',
    specificNeeds: '',
    artStyle: 'Eric Carle collage style, colorful tissue paper textures, white background'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(params);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 md:p-10 bg-white shadow-2xl rounded-3xl border-4 border-[#FFE4B5] relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 left-0 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      
      <div className="text-center mb-10 relative z-10">
        <h1 className="text-5xl font-heading text-amber-600 mb-3 flex items-center justify-center gap-4">
          <BookOpen className="w-12 h-12 text-amber-500" />
          奇妙童话工坊
        </h1>
        <p className="text-stone-500 text-lg font-medium">为您的孩子定制专属的成长绘本</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-lg font-heading text-stone-700">
              <User className="w-5 h-5 text-blue-400" /> 主角名字
            </label>
            <input
              type="text"
              name="childName"
              required
              value={params.childName}
              onChange={handleChange}
              className="w-full p-4 text-lg border-2 border-stone-200 rounded-2xl focus:ring-4 focus:ring-amber-200 focus:border-amber-400 outline-none transition bg-stone-50"
              placeholder="例如：豆豆"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-lg font-heading text-stone-700">
              <Sparkles className="w-5 h-5 text-yellow-400" /> 孩子年龄
            </label>
            <input
              type="number"
              name="age"
              required
              min={1}
              max={12}
              value={params.age}
              onChange={handleChange}
              className="w-full p-4 text-lg border-2 border-stone-200 rounded-2xl focus:ring-4 focus:ring-amber-200 focus:border-amber-400 outline-none transition bg-stone-50"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-lg font-heading text-stone-700">
            <Star className="w-5 h-5 text-purple-400" /> 故事主题
          </label>
          <input
            type="text"
            name="theme"
            required
            value={params.theme}
            onChange={handleChange}
            className="w-full p-4 text-lg border-2 border-stone-200 rounded-2xl focus:ring-4 focus:ring-amber-200 focus:border-amber-400 outline-none transition bg-stone-50"
            placeholder="例如：不想去奶奶家过夜，害怕消防车"
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-lg font-heading text-stone-700">
            <Heart className="w-5 h-5 text-red-400" /> 教育需求 / 想要解决的问题
          </label>
          <textarea
            name="specificNeeds"
            rows={3}
            value={params.specificNeeds}
            onChange={handleChange}
            className="w-full p-4 text-lg border-2 border-stone-200 rounded-2xl focus:ring-4 focus:ring-amber-200 focus:border-amber-400 outline-none transition bg-stone-50"
            placeholder="例如：教他勇敢和大胆，适应新环境"
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-lg font-heading text-stone-700">
            <Palette className="w-5 h-5 text-green-400" /> 绘本画风
          </label>
          <div className="relative">
            <select 
              name="artStyle"
              value={params.artStyle}
              onChange={handleChange}
              className="w-full p-4 text-lg border-2 border-stone-200 rounded-2xl focus:ring-4 focus:ring-amber-200 focus:border-amber-400 outline-none transition bg-stone-50 appearance-none cursor-pointer"
            >
               <option value="Eric Carle collage style, textured painted tissue paper, white clean background, artistic">艾瑞·卡尔拼贴画风格 (好饿的毛毛虫)</option>
               <option value="Soft watercolor style, Beatrix Potter inspiration, dreamy, gentle pastel colors">温馨水彩风格 (彼得兔)</option>
               <option value="Hayao Miyazaki style, studio ghibli, lush backgrounds, vibrant colors, anime inspired">宫崎骏动画风格 (治愈系)</option>
               <option value="Crayon drawing, child-like art, cute, rough edges, authentic kids drawing style">儿童蜡笔画风格 (童真)</option>
               <option value="3D Pixar style, cute characters, bright lighting, high detail render">3D 皮克斯动画风格 (现代)</option>
               <option value="Traditional Chinese Ink Painting, shuimo, minimalist, elegant">中国水墨画风格 (传统)</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-stone-500">
              ▼
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-5 px-6 rounded-2xl text-white font-heading text-xl shadow-[0_6px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[6px] transition-all transform hover:-translate-y-1 ${
            isLoading 
              ? 'bg-stone-400 cursor-not-allowed shadow-none translate-y-[6px]' 
              : 'bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              AI 正在创作中...
            </span>
          ) : (
            "✨ 开始生成绘本 ✨"
          )}
        </button>
      </form>
    </div>
  );
};

export default StoryForm;