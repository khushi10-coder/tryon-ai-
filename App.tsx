
import React, { useState, useEffect } from 'react';
import { AppStep, GalleryItem, Product, ChatMessage } from './types';
import { generateVirtualTryOn, extractProductsFromImage, fileToDataUrl } from './services/geminiService';
import Button from './components/common/Button';
import FileUpload from './components/common/FileUpload';
import ShopSection from './components/ShopSection';
import Chatbot from './components/Chatbot';
import Gallery from './components/Gallery';
import { Sparkles, History, ArrowLeft, Shirt, PlusCircle, CheckCircle, ArrowRight } from 'lucide-react';
//Added
const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [outfitImage, setOutfitImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [currentGalleryItem, setCurrentGalleryItem] = useState<GalleryItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleGenerate = async () => {
    if (!userImage || !outfitImage) return;

    setIsProcessing(true);
    setStep(AppStep.GENERATING);

    try {
      const generatedUrl = await generateVirtualTryOn(userImage, outfitImage);
      setResultImage(generatedUrl);
      setStep(AppStep.RESULT);
      
      setIsAnalyzing(true);
      const extractedProducts = await extractProductsFromImage(generatedUrl, outfitImage);
      setProducts(extractedProducts);
      
      const newItem: GalleryItem = {
        id: Date.now().toString(),
        userImage,
        outfitImage,
        resultImage: generatedUrl,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        products: extractedProducts,
        chatHistory: []
      };
      setGallery(prev => [newItem, ...prev]);
      setCurrentGalleryItem(newItem);
    } catch (error) {
      console.error(error);
      alert("Try-on generation failed. Please try different images.");
      setStep(AppStep.UPLOAD);
    } finally {
      setIsProcessing(false);
      setIsAnalyzing(false);
    }
  };

  const handleMessageAdded = (msg: ChatMessage) => {
    if (currentGalleryItem) {
      const updatedItem = {
        ...currentGalleryItem,
        chatHistory: [...currentGalleryItem.chatHistory, msg]
      };
      setCurrentGalleryItem(updatedItem);
      setGallery(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    }
  };

  const handleReset = () => {
    setUserImage(null);
    setOutfitImage(null);
    setResultImage(null);
    setProducts([]);
    setCurrentGalleryItem(null);
    setStep(AppStep.UPLOAD);
  };

  const handleSelectGalleryItem = (item: GalleryItem) => {
    setCurrentGalleryItem(item);
    setResultImage(item.resultImage);
    setProducts(item.products);
    setStep(AppStep.RESULT);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] transition-colors duration-500">
      {/* Premium Navbar */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={handleReset}>
            <div className="w-11 h-11 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/10 group-hover:scale-110 transition-transform">
              <Shirt size={22} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter leading-none">TRY ON AI</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Virtual Concierge</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setStep(AppStep.GALLERY)}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-2xl transition-all font-bold text-sm ${step === AppStep.GALLERY ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <History size={16} />
              <span>Gallery</span>
            </button>
            {step !== AppStep.UPLOAD && (
               <Button size="sm" onClick={handleReset} variant="outline" className="hidden sm:flex border-gray-200">
                  New Draft
               </Button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        {step === AppStep.UPLOAD && (
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex flex-col items-center text-center mb-20">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                <Sparkles size={14} />
                <span>Next-Gen Generative Fashion</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-gray-900 leading-[1.1]">
                Visualize Your <span className="text-indigo-600">Future</span> Wardrobe.
              </h1>
              <p className="text-xl text-gray-500 max-w-2xl font-medium leading-relaxed">
                Elevate your shopping experience. Upload your portrait and a garment to see high-fidelity fits powered by professional AI.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 mb-16">
              <FileUpload 
                label="01. User Portrait" 
                preview={userImage} 
                onClear={() => setUserImage(null)}
                onFileSelect={async (file) => setUserImage(await fileToDataUrl(file))}
              />
              <FileUpload 
                label="02. Target Garment" 
                preview={outfitImage} 
                onClear={() => setOutfitImage(null)}
                onFileSelect={async (file) => setOutfitImage(await fileToDataUrl(file))}
              />
            </div>

            <div className="flex justify-center">
              <Button 
                size="lg" 
                variant="primary" 
                onClick={handleGenerate}
                disabled={!userImage || !outfitImage}
                className="w-full md:w-auto px-12 py-5 text-lg font-black tracking-tight shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:shadow-indigo-200 transition-all rounded-[2rem]"
              >
                Start Digital Try-On
                <ArrowRight size={22} className="ml-3" />
              </Button>
            </div>
          </div>
        )}

        {step === AppStep.GENERATING && (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-in zoom-in-95 duration-500">
            <div className="relative mb-12">
              <div className="w-32 h-32 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center luxury-shadow">
                <Shirt className="text-indigo-600 animate-bounce" size={32} />
              </div>
            </div>
            <h2 className="text-3xl font-black mb-3 tracking-tight">Fashioning Your Look</h2>
            <p className="text-gray-500 max-w-md font-medium text-lg leading-relaxed">
              Our vision models are analyzing fabric drape, lighting geometry, and fit alignment for a professional studio result.
            </p>
            <div className="mt-12 flex items-center space-x-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
              <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Processing Pixels</span>
            </div>
          </div>
        )}

        {step === AppStep.RESULT && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              {/* Left Column: Result Image */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-[3rem] overflow-hidden luxury-shadow border border-gray-100/50 aspect-[3/4] relative group">
                  {resultImage && (
                    <img 
                      src={resultImage} 
                      alt="Try On Result" 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]" 
                    />
                  )}
                  <div className="absolute bottom-10 left-10 glass-panel px-6 py-3 rounded-2xl flex items-center space-x-3 border border-white/50 shadow-2xl">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="text-white" size={10} />
                    </div>
                    <span className="text-sm font-black tracking-tight uppercase">Precision AI Render</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Chatbot */}
              <div className="lg:col-span-5">
                <Chatbot 
                  imageUrl={resultImage!} 
                  initialHistory={currentGalleryItem?.chatHistory || []}
                  onMessageAdded={handleMessageAdded}
                />
              </div>
            </div>

            {/* Shop Section below */}
            <ShopSection products={products} isLoading={isAnalyzing} />
          </div>
        )}

        {step === AppStep.GALLERY && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <h2 className="text-5xl font-black tracking-tight mb-2">Style Vault</h2>
                <p className="text-gray-500 font-medium text-lg">Your previous try-on explorations, stored locally.</p>
              </div>
              <Button size="md" variant="primary" onClick={() => setStep(AppStep.UPLOAD)} className="rounded-2xl px-8 shadow-xl">
                <PlusCircle size={20} className="mr-2" />
                New Design
              </Button>
            </div>
            <Gallery 
              items={gallery} 
              onSelectItem={handleSelectGalleryItem} 
            />
          </div>
        )}
      </main>

      {/* Modern Footer */}
      <footer className="mt-auto border-t border-gray-100 bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-6">
            <Shirt size={24} />
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">Try On AI India</p>
          <p className="text-gray-500 font-medium max-w-md">The intersection of Generative AI and Retail. Built for a cleaner, more sustainable way to shop fashion.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
