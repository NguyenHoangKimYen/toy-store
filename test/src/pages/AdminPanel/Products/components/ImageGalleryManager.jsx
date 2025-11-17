import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ImageGalleryManager = ({ images, newImageUrl, onAddImage, onRemoveImage, onImageUrlChange }) => {
  return (
    <div className='space-y-2'>
      <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
        Product Images *
      </label>
      <div className='flex gap-2'>
        <Input
          placeholder='Enter image URL'
          value={newImageUrl}
          onChange={onImageUrlChange}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddImage())}
        />
        <Button type='button' onClick={onAddImage} size='sm'>
          <Plus className='w-4 h-4 mr-1' />
          Add
        </Button>
      </div>
      {images.length > 0 && (
        <div className='grid grid-cols-4 gap-2 mt-2'>
          {images.map((url, index) => (
            <div key={index} className='relative group'>
              <img
                src={url}
                alt={`Product ${index + 1}`}
                className='w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700'
              />
              <button
                type='button'
                onClick={() => onRemoveImage(index)}
                className='absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
              >
                <X className='w-3 h-3' />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGalleryManager;
