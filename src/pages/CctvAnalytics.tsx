import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertCircle, CheckCircle, Activity, Box } from 'lucide-react';
import { motion } from 'framer-motion';
import { cctvService } from '../services/cctvService';

export const CctvAnalytics: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    total_boxes: number;
    confidence: number;
    status: string;
    output_preview_path: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const isVideo = file.type.startsWith('video/');
      const data = isVideo 
        ? await cctvService.analyzeVideo(file)
        : await cctvService.analyzeImage(file);
        
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error processing file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CCTV Analytics</h1>
          <p className="text-muted-foreground mt-1">AI-powered box detection for warehouse camera feeds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl border border-border bg-card shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Box className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Boxes</p>
              <h3 className="text-2xl font-bold">{result?.total_boxes ?? '-'}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl border border-border bg-card shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
              <h3 className="text-2xl font-bold">{result ? `${(result.confidence * 100).toFixed(0)}%` : '-'}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl border border-border bg-card shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Activity Level</p>
              <h3 className="text-2xl font-bold">
                {result ? (result.total_boxes > 50 ? 'High' : result.total_boxes > 20 ? 'Medium' : 'Low') : '-'}
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl border border-border bg-card shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Camera className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <h3 className="text-2xl font-bold capitalize">{loading ? 'Processing...' : (result?.status ?? 'Waiting')}</h3>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        {/* Upload Section */}
        <div className="lg:col-span-1 border border-border rounded-xl bg-card p-6 flex flex-col items-center justify-center space-y-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">Click to Upload</h3>
            <p className="text-sm text-muted-foreground text-center">Supports images and videos (MP4, JPG, PNG)</p>
          </div>
          {file && (
            <div className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm truncate mr-4" title={file.name}>{file.name}</span>
              <button 
                onClick={handleUpload}
                disabled={loading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          )}
          {error && (
            <div className="w-full p-3 bg-red-500/10 text-red-500 text-sm flex items-center gap-2 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="truncate" title={error}>{error}</span>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-2 border border-border rounded-xl bg-card overflow-hidden flex items-center justify-center relative bg-muted/20">
          {!result && !preview && (
             <div className="text-muted-foreground flex flex-col items-center gap-2">
               <Camera className="w-12 h-12 opacity-50" />
               <p>Output preview will appear here</p>
             </div>
          )}
          
          {loading && (
             <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
               <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
               <p className="mt-4 font-medium">Running YOLO Inference...</p>
             </div>
          )}

          {result?.output_preview_path ? (
            result.output_preview_path.endsWith('.mp4') ? (
              <video 
                src={`http://localhost:8000${result.output_preview_path}`} 
                controls 
                autoPlay 
                loop 
                className="w-full h-full object-contain"
              />
            ) : (
              <img 
                src={`http://localhost:8000${result.output_preview_path}`} 
                alt="Detection Output" 
                className="w-full h-full object-contain" 
              />
            )
          ) : preview ? (
            file?.type.startsWith('video/') ? (
              <video src={preview} controls className="w-full h-full object-contain opacity-50" />
            ) : (
              <img src={preview} alt="Preview" className="w-full h-full object-contain opacity-50" />
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};
