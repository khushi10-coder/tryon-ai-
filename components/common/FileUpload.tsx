
import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react';

interface FileUploadProps {
  label: string;
  preview: string | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, preview, onFileSelect, onClear, className }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{label}</span>
        {preview && (
          <span className="text-[10px] font-bold text-green-500 flex items-center bg-green-50 px-2 py-0.5 rounded-full">
            Ready
          </span>
        )}
      </div>
      <div 
        className={`relative group bg-white rounded-[2.5rem] luxury-shadow border-2 border-dashed transition-all h-[360px] flex flex-col items-center justify-center overflow-hidden cursor-pointer
          ${preview ? 'border-indigo-200' : 'border-gray-200 hover:border-black hover:bg-gray-50'}`}
        onClick={() => !preview && fileInputRef.current?.click()}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <div className="bg-white/80 backdrop-blur-md p-3 rounded-full text-black shadow-2xl">
                 <Camera size={20} />
               </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="absolute top-4 right-4 p-2 bg-black/80 backdrop-blur-md text-white rounded-2xl hover:bg-black transition-all shadow-xl active:scale-90"
            >
              <X size={18} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center p-12 text-center group">
            <div className="bg-gray-50 p-6 rounded-[1.5rem] mb-6 group-hover:bg-black group-hover:text-white transition-all duration-500 group-hover:-translate-y-2">
              <Upload size={32} />
            </div>
            <p className="text-lg font-black text-gray-900 mb-2">Drop your asset</p>
            <p className="text-sm text-gray-400 font-medium">Select a high-resolution portrait or garment photo to begin.</p>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
      </div>
    </div>
  );
};

export default FileUpload;
