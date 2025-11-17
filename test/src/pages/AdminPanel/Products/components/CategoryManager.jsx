import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const CategoryManager = ({ categories, onAdd, onRemove }) => {
  const [newCategory, setNewCategory] = useState('');

  const handleAdd = () => {
    if (newCategory.trim()) {
      onAdd(newCategory.trim());
      setNewCategory('');
    }
  };

  return (
    <div className='space-y-2'>
      <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
        Categories *
      </label>
      <div className='flex gap-2'>
        <Input
          placeholder='Add category'
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
        />
        <Button type='button' onClick={handleAdd} size='sm'>
          <Plus className='w-4 h-4 mr-1' />
          Add
        </Button>
      </div>
      {categories.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {categories.map((cat, index) => (
            <Badge key={index} variant='secondary' className='flex items-center gap-1'>
              {typeof cat === 'string' ? cat : cat.name}
              <X
                className='w-3 h-3 cursor-pointer hover:text-red-600'
                onClick={() => onRemove(index)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
