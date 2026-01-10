
import React, { useState } from 'react';
import { Product } from '../types';
import { ExternalLink, ShoppingBag, CheckCircle2, Sparkles, ShieldCheck, X, Layers, Filter, Check } from 'lucide-react';

interface ShopSectionProps {
  products: Product[];
  isLoading?: boolean;
}

const ProductCard: React.FC<{ product: Product; showBadge?: boolean }> = ({ product, showBadge = true }) => (
  <div className="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 transition-all duration-700 hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)] hover:-translate-y-2">
    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
      <img 
        src={product.imageUrl} 
        alt={product.name} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
      />
      
      {showBadge && product.isExactMatch && (
        <div className="absolute top-5 left-5 z-10">
          <div className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl ring-2 ring-white/20">
            <CheckCircle2 size={12} className="text-green-500" />
            <span>Exact Match</span>
          </div>
        </div>
      )}

      {showBadge && product.isAlternative && (
        <div className="absolute top-5 left-5 z-10">
          <div className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl ring-2 ring-white/20">
            <Layers size={12} />
            <span>Style Twin</span>
          </div>
        </div>
      )}

      <div className="absolute bottom-5 right-5 bg-white/90 backdrop-blur-xl px-3 py-1.5 rounded-xl text-[10px] font-black text-black border border-gray-100 shadow-xl">
        {product.platform}
      </div>
    </div>
    
    <div className="p-6 flex flex-col flex-1">
      <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">{product.category}</span>
      <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-6 leading-tight group-hover:text-indigo-600 transition-colors">{product.name}</h3>
      
      <div className="mt-auto flex items-end justify-between">
        <div className="flex flex-col">
           <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Price</span>
           <span className="text-xl font-black text-gray-900 tracking-tight">₹{product.price.toLocaleString('en-IN')}</span>
        </div>
        <a 
          href={product.buyLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center bg-black text-white w-10 h-10 rounded-xl hover:bg-indigo-600 hover:scale-110 transition-all active:scale-95 shadow-lg"
          title={`Buy on ${product.platform}`}
        >
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  </div>
);

const ShopSection: React.FC<ShopSectionProps> = ({ products, isLoading }) => {
  const [showOnlyExact, setShowOnlyExact] = useState(false);

  if (isLoading) {
    return (
      <div className="mt-16">
        <div className="h-8 bg-gray-100 rounded-lg w-48 animate-pulse mb-8"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-gray-200 rounded-[2.5rem] mb-4"></div>
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const exactMatches = products.filter(p => p.isExactMatch);
  const alternatives = products.filter(p => p.isAlternative);

  if (products.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center justify-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-gray-100 shadow-inner">
        <div className="bg-gray-50 p-12 rounded-full mb-8">
          <X size={64} className="text-gray-200" />
        </div>
        <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">No Matches Found</h3>
        <p className="text-gray-500 text-sm max-w-sm text-center leading-relaxed font-semibold">
          We couldn't verify an exact match for this look. Try different lighting in your original photo!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-16 space-y-20 pb-24">
      {/* Dynamic Filter Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-50 luxury-shadow">
        <div className="flex items-center space-x-5">
          <div className="bg-black p-4 rounded-3xl">
            <ShoppingBag size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase leading-none mb-1">Shop It!</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Digital-to-Retail Pipeline</p>
          </div>
        </div>

        <button 
          onClick={() => setShowOnlyExact(!showOnlyExact)}
          className={`group flex items-center space-x-3 px-8 py-4 rounded-2xl font-black text-xs transition-all border-2 active:scale-95 ${
            showOnlyExact 
              ? 'bg-black border-black text-white' 
              : 'bg-white border-gray-100 text-gray-500 hover:border-black hover:text-black'
          }`}
        >
          {showOnlyExact ? <Check size={16} /> : <Filter size={16} />}
          <span className="uppercase tracking-[0.2em]">Show Only Exact Matches</span>
          {showOnlyExact && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2" />
          )}
        </button>
      </div>

      {/* Main Grid Container */}
      <div className="space-y-24">
        {/* Exact Matches Section */}
        {exactMatches.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center space-x-3">
                <ShieldCheck size={20} className="text-black" />
                <h3 className="text-xl font-black tracking-tight text-gray-900 uppercase">1:1 Visual Matches</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {exactMatches.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Alternatives Section (Conditional) */}
        {!showOnlyExact && alternatives.length > 0 && (
          <section className="pt-16 border-t border-gray-100 animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center space-x-3">
                <Layers size={20} className="text-indigo-600" />
                <h3 className="text-xl font-black tracking-tight text-gray-900 uppercase">Style Recommendations</h3>
              </div>
              <div className="bg-indigo-50 px-4 py-2 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                <Sparkles size={12} className="inline mr-2" />
                Curated Alternatives
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {alternatives.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>

      {/* Retailer Footer - Expanded */}
      <div className="p-12 bg-black rounded-[4rem] flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {['Ajio', 'Myntra', 'H&M', 'Max', 'Nike', 'Puma', 'Amazon', 'Meesho', 'Flipkart', 'Savana'].map((name, i) => (
            <div key={i} className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[8px] font-black text-white uppercase tracking-tighter text-center px-1">
              {name}
            </div>
          ))}
        </div>
        <div className="text-center md:text-right max-w-sm">
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-2">Merchant Verification</p>
          <p className="text-sm text-white/70 font-medium leading-relaxed">
            Every product link is strictly vetted to ship within <span className="text-white font-black underline decoration-indigo-500 underline-offset-4">India</span> from our network of authorized retailers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShopSection;
