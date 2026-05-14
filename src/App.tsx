import React, { useState, useRef, useEffect, ChangeEvent, DragEvent } from 'react';
import { UploadCloud, Image as ImageIcon, Download, Lock, Unlock, X, Maximize } from 'lucide-react';

export default function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('image/jpeg');
  
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);
  
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [keepAspect, setKeepAspect] = useState<boolean>(true);
  
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    
    setFileName(file.name);
    setFileType(file.type);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);
      
      const img = new Image();
      img.onload = () => {
        setOrigWidth(img.width);
        setOrigHeight(img.height);
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newWidth = e.target.value ? parseInt(e.target.value, 10) : '';
    setWidth(newWidth);
    
    if (keepAspect && newWidth !== '' && origWidth > 0) {
      const ratio = origHeight / origWidth;
      setHeight(Math.round(newWidth * ratio));
    }
  };

  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newHeight = e.target.value ? parseInt(e.target.value, 10) : '';
    setHeight(newHeight);
    
    if (keepAspect && newHeight !== '' && origHeight > 0) {
      const ratio = origWidth / origHeight;
      setWidth(Math.round(newHeight * ratio));
    }
  };

  const resetImage = () => {
    setImageSrc(null);
    setFileName('');
    setWidth('');
    setHeight('');
    setOrigWidth(0);
    setOrigHeight(0);
  };

  const downloadImage = () => {
    if (!imageSrc || width === '' || height === '') return;
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      
      const res = canvas.toDataURL(fileType);
      const link = document.createElement('a');
      link.href = res;
      
      // format new filename
      const parts = fileName.split('.');
      const ext = parts.pop();
      const base = parts.join('.');
      link.download = `${base}-${width}x${height}.${ext}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.src = imageSrc;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 sm:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-2 text-blue-600">
            <Maximize className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Image Resizer</h1>
          <p className="text-slate-500">Fast, client-side image resizing. Your photos never leave your device.</p>
        </header>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {!imageSrc ? (
            /* Upload State */
            <div 
              className={`p-12 transition-colors duration-200 flex flex-col items-center justify-center min-h-[400px] cursor-pointer
                ${isDragging ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={`p-4 rounded-full mb-4 transition-colors duration-200 ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                <UploadCloud className="w-10 h-10" />
              </div>
              <p className="text-lg font-medium text-slate-700 mb-1">
                Drag and drop an image
              </p>
              <p className="text-sm text-slate-500 mb-6">
                or click to browse from your device
              </p>
              
              <button className="px-6 py-2.5 bg-white border border-slate-200 shadow-sm rounded-lg font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Select File
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange} 
              />
            </div>
          ) : (
            /* Editor State */
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 text-slate-800">
              
              {/* Left Column: Preview */}
              <div className="w-full md:w-3/5 p-6 md:p-8 bg-slate-50/50 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-medium text-slate-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    Preview
                  </h2>
                  <button 
                    onClick={resetImage}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    title="Remove Image"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 flex items-center justify-center p-4 bg-white border border-slate-200 border-dashed rounded-xl overflow-hidden shadow-inner relative group min-h-[300px]">
                  <img 
                    src={imageSrc} 
                    alt="Preview" 
                    className="max-w-full max-h-[400px] object-contain transition-transform duration-200"
                  />
                  <div className="absolute bottom-4 left-4 right-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm inline-block">
                      {fileName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Controls */}
              <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col bg-white">
                <h2 className="font-medium text-slate-700 mb-6 flex items-center gap-2">
                  Resize Options
                </h2>
                
                <div className="space-y-6 flex-1">
                  
                  {/* Original Info */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Original Size</div>
                    <div className="flex items-end gap-1 font-mono">
                      <span className="text-xl font-medium">{origWidth}</span>
                      <span className="text-slate-400 text-sm mb-0.5">Ã</span>
                      <span className="text-xl font-medium">{origHeight}</span>
                      <span className="text-slate-500 text-sm mb-0.5 ml-1">px</span>
                    </div>
                  </div>

                  {/* Dimensions Input */}
                  <div>
                    <div className="flex items-center justify-between mb-3 text-sm font-medium text-slate-700">
                      <label>New Dimensions</label>
                      <button 
                        onClick={() => setKeepAspect(!keepAspect)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors
                          ${keepAspect ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'text-slate-500 bg-slate-100 hover:bg-slate-200'}`}
                      >
                        {keepAspect ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        {keepAspect ? 'Locked' : 'Unlocked'}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <label className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium uppercase tracking-wider">W</label>
                        <input 
                          type="number" 
                          value={width} 
                          onChange={handleWidthChange}
                          className="w-full pl-8 pr-4 pt-6 pb-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 font-mono text-lg"
                        />
                      </div>
                      <div className="text-slate-300 font-medium">Ã</div>
                      <div className="flex-1 relative">
                        <label className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium uppercase tracking-wider">H</label>
                        <input 
                          type="number" 
                          value={height} 
                          onChange={handleHeightChange}
                          className="w-full pl-8 pr-4 pt-6 pb-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 font-mono text-lg"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Presets */}
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-2">Quick Presets</div>
                    <div className="flex flex-wrap gap-2">
                       {[0.25, 0.5, 0.75].map(scale => (
                         <button
                           key={scale}
                           onClick={() => {
                             setWidth(Math.round(origWidth * scale));
                             setHeight(Math.round(origHeight * scale));
                           }}
                           className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                         >
                           {scale * 100}%
                         </button>
                       ))}
                       <button
                         onClick={() => {
                           setWidth(origWidth);
                           setHeight(origHeight);
                         }}
                         className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                       >
                         Original
                       </button>
                    </div>
                  </div>

                </div>

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <button 
                    onClick={downloadImage}
                    disabled={!width || !height}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Resized Image
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
        
        <footer className="text-center text-sm text-slate-400">
          <p>Processing happens entirely in your browser.</p>
        </footer>
      </div>
    </div>
  );
}
