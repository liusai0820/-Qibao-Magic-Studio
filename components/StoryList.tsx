
import React from 'react';
import { Story } from '@/lib/types';

interface StoryListProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
}

const StoryList: React.FC<StoryListProps> = ({ stories, onSelectStory }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-amber-800 mb-8">我的故事书</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stories.map((story) => (
          <div
            key={story.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300"
            onClick={() => onSelectStory(story)}
          >
            {story.pages && story.pages.length > 0 && story.pages[0].imageUrl ? (
              <img src={story.pages[0].imageUrl} alt={story.title} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No Image</p>
              </div>
            )}
            <div className="p-4">
              <h3 className="text-xl font-bold text-amber-900 truncate">{story.title}</h3>
              <p className="text-gray-600 mt-2">
                {new Date(story.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryList;
