import { useState, useRef } from 'react';
import { Plus, X, Upload, Link as LinkIcon, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ImageGalleryManager = ({ 
  images = [], 
  newImageUrl, 
  onAddImage, 
  onRemoveImage, 
  onImageUrlChange,
  // New props for file upload
  pendingFiles = [],
  onAddFiles,
  onRemoveFile,
  uploading = false,
  label = 'Product Images *',
  maxFiles = 10,
}) => {
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'url'
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = (files) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const validFiles = files.filter(file => {
      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Use JPG, PNG, WebP, or GIF.`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}. Max 10MB.`);
        return false;
      }
      return true;
    });

    const totalCount = images.length + pendingFiles.length + validFiles.length;
    if (totalCount > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    if (validFiles.length > 0 && onAddFiles) {
      onAddFiles(validFiles);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const totalImages = images.length + pendingFiles.length;

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
          {label}
        </label>
        <div className='flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1'>
          <button
            type='button'
            onClick={() => setInputMode('file')}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
              inputMode === 'file' 
                ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Upload className='w-3 h-3' />
            Upload
          </button>
          <button
            type='button'
            onClick={() => setInputMode('url')}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
              inputMode === 'url' 
                ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <LinkIcon className='w-3 h-3' />
            URL
          </button>
        </div>
      </div>

      {/* File Upload Mode */}
      {inputMode === 'file' && onAddFiles && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <input
            ref={fileInputRef}
            type='file'
            accept='image/jpeg,image/png,image/webp,image/gif'
            multiple
            onChange={handleFileSelect}
            className='hidden'
          />
          <Upload className='w-8 h-8 mx-auto mb-2 text-gray-400' />
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            <span className='font-medium text-blue-600 dark:text-blue-400'>Click to upload</span> or drag and drop
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-500 mt-1'>
            JPG, PNG, WebP or GIF (max 10MB each)
          </p>
        </div>
      )}

      {/* URL Input Mode */}
      {inputMode === 'url' && (
        <div className='flex gap-2'>
          <Input
            placeholder='Enter image URL (https://...)'
            value={newImageUrl}
            onChange={onImageUrlChange}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddImage())}
          />
          <Button type='button' onClick={onAddImage} size='sm'>
            <Plus className='w-4 h-4 mr-1' />
            Add
          </Button>
        </div>
      )}

      {/* Image Gallery */}
      {totalImages > 0 && (
        <div className='space-y-2'>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            {totalImages} image{totalImages !== 1 ? 's' : ''} 
            {pendingFiles.length > 0 && ` (${pendingFiles.length} pending upload)`}
          </p>
          <div className='grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2'>
            {/* Existing images (already uploaded) */}
            {images.map((url, index) => (
              <div key={`url-${index}`} className='relative group aspect-square'>
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className='w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700'
                />
                <button
                  type='button'
                  onClick={() => onRemoveImage(index)}
                  className='absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md'
                >
                  <X className='w-3 h-3' />
                </button>
                <div className='absolute bottom-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded'>
                  Saved
                </div>
              </div>
            ))}
            
            {/* Pending files (not yet uploaded) */}
            {pendingFiles.map((file, index) => (
              <div key={`file-${index}`} className='relative group aspect-square'>
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Pending ${index + 1}`}
                  className='w-full h-full object-cover rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-600'
                />
                {uploading ? (
                  <div className='absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center'>
                    <Loader2 className='w-5 h-5 text-white animate-spin' />
                  </div>
                ) : (
                  <button
                    type='button'
                    onClick={() => onRemoveFile(index)}
                    className='absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md'
                  >
                    <X className='w-3 h-3' />
                  </button>
                )}
                <div className='absolute bottom-1 left-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded'>
                  Pending
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalImages === 0 && inputMode === 'url' && (
        <div className='text-center py-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700'>
          <ImageIcon className='w-8 h-8 mx-auto mb-2 text-gray-400' />
          <p className='text-sm text-gray-500 dark:text-gray-400'>No images added yet</p>
        </div>
      )}
    </div>
  );
};

export default ImageGalleryManager;
