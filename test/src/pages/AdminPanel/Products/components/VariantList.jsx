import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const VariantList = ({ variants, onUpdatePrice, onUpdateStock, onRemove }) => {
  if (variants.length === 0) return null;

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between pb-3 border-b-2 border-gray-200 dark:border-gray-600'>
        <h4 className='text-base font-bold text-gray-900 dark:text-white'>
          Step 2: Set Prices & Stock ({variants.length} variants)
        </h4>
      </div>
      
      <div className='space-y-2 max-h-96 overflow-y-auto'>
        {variants.map((variant, index) => (
          <div key={variant._id} className='flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
            <div className='flex-1 space-y-2'>
              {/* Attributes */}
              <div className='flex flex-wrap gap-2'>
                {Object.entries(variant.attributes || {}).map(([key, value]) => (
                  <Badge key={key} variant='outline' className='text-xs'>
                    <span className='font-semibold'>{key}:</span> {value}
                  </Badge>
                ))}
              </div>
              
              {/* Price and Stock Inputs */}
              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <label className='text-xs text-gray-600 dark:text-gray-400'>Price *</label>
                  <Input
                    type='number'
                    step='0.01'
                    placeholder='0.00'
                    value={variant.price.$numberDecimal}
                    onChange={(e) => onUpdatePrice(index, e.target.value)}
                    className='h-8'
                  />
                </div>
                <div>
                  <label className='text-xs text-gray-600 dark:text-gray-400'>Stock</label>
                  <Input
                    type='number'
                    placeholder='0'
                    value={variant.stock}
                    onChange={(e) => onUpdateStock(index, e.target.value)}
                    className='h-8'
                  />
                </div>
              </div>
            </div>
            
            <button
              type='button'
              onClick={() => onRemove(index)}
              className='text-red-500 hover:text-red-700 p-1 mt-1'
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
