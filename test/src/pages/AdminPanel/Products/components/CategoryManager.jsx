import { useState } from 'react';
import { Plus, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/hooks/useCategories';

const CategoryManager = ({ categories, onAdd, onRemove }) => {
  const { categories: allCategories, createCategory, loading, error } = useCategories();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // Filter categories based on search and already selected
  const filteredCategories = allCategories.filter(cat => 
    !categories.includes(cat._id) &&
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCategory = (categoryId) => {
    onAdd(categoryId);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleCreateNew = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const newCat = await createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim() || undefined,
      });
      
      onAdd(newCat._id);
      setNewCategoryName('');
      setNewCategoryDesc('');
      setIsCreatingNew(false);
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = allCategories.find(cat => cat._id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <div className='space-y-2'>
      <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
        Categories *
      </label>
      
      {/* Selected Categories */}
      {categories.length > 0 && (
        <div className='flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-md'>
          {categories.map((categoryId, index) => (
            <Badge key={index} variant='secondary' className='flex items-center gap-1'>
              {getCategoryName(categoryId)}
              <X
                className='w-3 h-3 cursor-pointer hover:text-red-600'
                onClick={() => onRemove(index)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Add Category Section */}
      <div className='relative'>
        {error && (
          <div className='mb-2 p-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200'>
            ⚠️ Could not load categories. You can still create new ones below.
          </div>
        )}
        <div className='flex gap-2'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
            <Input
              placeholder='Search or add category...'
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className='pl-10'
            />
          </div>
          <Button 
            type='button' 
            onClick={() => setIsCreatingNew(!isCreatingNew)} 
            size='sm'
            variant={isCreatingNew ? 'secondary' : 'outline'}
          >
            <Plus className='w-4 h-4 mr-1' />
            {isCreatingNew ? 'Cancel' : 'New'}
          </Button>
        </div>

        {/* Dropdown for existing categories */}
        {showDropdown && searchQuery && (
          <div className='absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto'>
            {loading ? (
              <div className='p-3 text-sm text-gray-500 text-center'>Loading...</div>
            ) : filteredCategories.length === 0 ? (
              <div className='p-3 text-sm text-gray-500 text-center'>
                No categories found. Click "New" to create one.
              </div>
            ) : (
              filteredCategories.map((cat) => (
                <button
                  key={cat._id}
                  type='button'
                  onClick={() => handleSelectCategory(cat._id)}
                  className='w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm'
                >
                  <div className='font-medium'>{cat.name}</div>
                  {cat.description && (
                    <div className='text-xs text-gray-500'>{cat.description}</div>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create New Category Form */}
      {isCreatingNew && (
        <div className='p-3 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 rounded-md space-y-2'>
          <Input
            placeholder='Category name *'
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateNew())}
          />
          <Input
            placeholder='Description (optional)'
            value={newCategoryDesc}
            onChange={(e) => setNewCategoryDesc(e.target.value)}
          />
          <Button 
            type='button' 
            onClick={handleCreateNew} 
            disabled={!newCategoryName.trim()}
            size='sm'
            className='w-full'
          >
            Create Category
          </Button>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className='fixed inset-0 z-0' 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default CategoryManager;
