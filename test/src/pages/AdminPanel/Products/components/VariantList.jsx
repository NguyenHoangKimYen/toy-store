import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const VariantList = ({ variants, onUpdatePrice, onUpdateStock, onRemove }) => {
  if (variants.length === 0) return null;

  return (
    <div className='space-y-3 mt-4'>
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h4 className='text-base font-bold text-gray-900 dark:text-white'>
            💰 Step 2: Set Prices & Stock for Each Variant
          </h4>
          <span className='text-sm font-semibold text-blue-600 dark:text-blue-400'>
            {variants.length} {variants.length === 1 ? 'combination' : 'combinations'} generated
          </span>
        </div>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          Each combination of attributes creates a unique variant. Set a distinct price and stock quantity for each.
        </p>
      </div>
      
      <div className='space-y-2 max-h-96 overflow-y-auto pr-2'>
        {variants.map((variant, index) => (
          <div key={variant._id} className='flex items-start gap-3 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors'>
            <div className='flex-1 space-y-3'>
              {/* Attributes */}
              <div className='flex flex-wrap gap-2'>
                {Object.entries(variant.attributes || {}).map(([key, value]) => (
                  <Badge key={key} variant='outline' className='text-sm font-medium'>
                    <span className='font-bold text-blue-600 dark:text-blue-400'>{key}:</span>
                    <span className='ml-1'>{value}</span>
                  </Badge>
                ))}
              </div>
              
              {/* Price and Stock Inputs */}
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block'>
                    Price ($) *
                  </label>
                  <Input
                    type='number'
                    step='0.01'
                    min='0'
                    placeholder='0.00'
                    value={variant.price.$numberDecimal}
                    onChange={(e) => onUpdatePrice(index, e.target.value)}
                    className='h-9'
                    required
                  />
                </div>
                <div>
                  <label className='text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block'>
                    Stock Quantity
                  </label>
                  <Input
                    type='number'
                    min='0'
                    placeholder='0'
                    value={variant.stock}
                    onChange={(e) => onUpdateStock(index, e.target.value)}
                    className='h-9'
                  />
                </div>
              </div>
            </div>
            
            <button
              type='button'
              onClick={() => onRemove(index)}
              className='text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded transition-colors'
              title='Remove this variant'
            >
              <Trash2 className='w-4 h-4' />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VariantList;
