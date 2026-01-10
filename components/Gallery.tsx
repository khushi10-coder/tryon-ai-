
import React from 'react';
import { GalleryItem } from '../types';
import { Calendar, ArrowRight, User, Shirt } from 'lucide-react';

interface GalleryProps {
  items: GalleryItem[];
  onSelectItem: (item: GalleryItem) => void;
}

const Gallery: React.FC<GalleryProps> = ({ items, onSelectItem }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center bg-white rounded-[4rem] border border-gray-100 luxury-shadow">
        <div className="bg-gray-50 p-10 rounded-full mb-8">
          <Calendar size={56} className="text-gray-200" />
        </div>
        <h2 className="text-2xl font-black mb-3">Your Vault is Empty</h2>
        <p className="text-gray-400 font-medium max-w-xs leading-relaxed">Start exploring and trying on pieces to build your personal digital lookbook.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="group relative cursor-pointer flex flex-col transition-all duration-500 hover:-translate-y-3"
          onClick={() => onSelectItem(item)}
        >
          <div className="aspect-[3/4] bg-white rounded-[2.5rem] overflow-hidden luxury-shadow border border-gray-100 mb-6 relative">
            <img 
              src={item.resultImage} 
              alt="Generated Result" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
              <div className="flex items-center text-white text-sm font-black uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                Explore Look <ArrowRight size={16} className="ml-2" />
              </div>
            </div>
          </div>
          
          <div className="px-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.date}</span>
              <div className="flex items-center -space-x-3">
                <img src={item.userImage} className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover" alt="User" />
                <img src={item.outfitImage} className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover" alt="Outfit" />
              </div>
            </div>
            <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Digital Silhouette #{item.id.slice(-4)}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Gallery;
