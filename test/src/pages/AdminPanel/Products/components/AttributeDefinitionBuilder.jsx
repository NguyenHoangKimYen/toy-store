import { useState } from 'react';
import { Plus, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const AttributeDefinitionBuilder = ({ 
  attributeDefinitions, 
  setAttributeDefinitions,
  onGenerateVariants 
}) => {
  const [newAttributeName, setNewAttributeName] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');
  const [editingAttributeIndex, setEditingAttributeIndex] = useState(null);

  const addAttributeDefinition = () => {
    if (newAttributeName.trim()) {
      setAttributeDefinitions(prev => [
        ...prev,
        { name: newAttributeName.trim(), values: [] }
      ]);
      setNewAttributeName('');
    }
  };

  const removeAttributeDefinition = (index) => {
    setAttributeDefinitions(prev => prev.filter((_, i) => i !== index));
  };

  const addValueToAttribute = (attrIndex) => {
    if (newAttributeValue.trim()) {
      setAttributeDefinitions(prev => prev.map((attr, i) => 
        i === attrIndex 
          ? { ...attr, values: [...attr.values, newAttributeValue.trim()] }
          : attr
      ));
      setNewAttributeValue('');
      setEditingAttributeIndex(null);
    }
  };

  const removeValueFromAttribute = (attrIndex, valueIndex) => {
    setAttributeDefinitions(prev => prev.map((attr, i) =>
      i === attrIndex
        ? { ...attr, values: attr.values.filter((_, vi) => vi !== valueIndex) }
        : attr
    ));
  };

  const canGenerateVariants = attributeDefinitions.length > 0 && 
    !attributeDefinitions.some(attr => attr.values.length === 0);

  return (
    <div className='border-2 border-gray-300 dark:border-gray-600 rounded-lg p-5 space-y-4 bg-gray-50 dark:bg-gray-800'>
      <div className='flex items-center justify-between pb-3 border-b-2 border-gray-200 dark:border-gray-600'>
        <h4 className='text-base font-bold text-gray-900 dark:text-white'>
          Step 1: Define Attributes
        </h4>
        <Button
          type='button'
          onClick={onGenerateVariants}
          size='sm'
          disabled={!canGenerateVariants}
          className='bg-green-600 hover:bg-green-700'
        >
          <Zap className='w-4 h-4 mr-2' />
          Generate Variants
        </Button>
      </div>
      
      {/* Add New Attribute */}
      <div className='flex gap-2'>
        <Input
          placeholder='Attribute name (e.g., Color, Size, Material)'
          value={newAttributeName}
          onChange={(e) => setNewAttributeName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttributeDefinition())}
        />
        <Button type='button' onClick={addAttributeDefinition} size='sm'>
          <Plus className='w-4 h-4 mr-1' />
          Add
        </Button>
      </div>
      
      {/* Display Attribute Definitions */}
      {attributeDefinitions.map((attr, attrIndex) => (
        <div key={attrIndex} className='space-y-3 p-4 bg-white dark:bg-gray-700 rounded-lg border-2 border-blue-200 dark:border-blue-800 shadow-sm'>
          <div className='flex items-center justify-between'>
            <span className='font-bold text-base text-blue-900 dark:text-blue-200'>
              {attr.name}
            </span>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => removeAttributeDefinition(attrIndex)}
              className='text-red-600 hover:text-red-700 h-7'
            >
              <X className='w-4 h-4' />
            </Button>
          </div>
          
          {/* Add Value to Attribute */}
          {editingAttributeIndex === attrIndex ? (
            <div className='flex gap-2'>
              <Input
                placeholder={`Add value for ${attr.name}`}
                value={newAttributeValue}
                onChange={(e) => setNewAttributeValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addValueToAttribute(attrIndex))}
                autoFocus
                className='h-8'
              />
              <Button
                type='button'
                onClick={() => addValueToAttribute(attrIndex)}
                size='sm'
                className='h-8'
              >
                Add
              </Button>
              <Button
                type='button'
                variant='ghost'
                onClick={() => {
                  setEditingAttributeIndex(null);
                  setNewAttributeValue('');
                }}
                size='sm'
                className='h-8'
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setEditingAttributeIndex(attrIndex)}
              className='w-full h-8'
            >
              <Plus className='w-4 h-4 mr-1' />
              Add Value
            </Button>
          )}
          
          {/* Display Values */}
          {attr.values.length > 0 && (
            <div className='flex flex-wrap gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded'>
              {attr.values.map((value, valueIndex) => (
                <Badge key={valueIndex} variant='secondary' className='flex items-center gap-1 text-sm'>
                  {value}
                  <X
                    className='w-3 h-3 cursor-pointer hover:text-red-600'
                    onClick={() => removeValueFromAttribute(attrIndex, valueIndex)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AttributeDefinitionBuilder;
