import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Badge from '@/components/ui/badge';

const AttributeDefinitionBuilder = ({ 
  attributeDefinitions, 
  setAttributeDefinitions,
  onGenerateVariants 
}) => {
  const [newAttributeName, setNewAttributeName] = useState('');
  const [attributeValueInputs, setAttributeValueInputs] = useState({});

  const addAttributeDefinition = () => {
    if (newAttributeName.trim()) {
      setAttributeDefinitions(prev => [
        ...prev,
        { name: newAttributeName.trim(), values: [] }
      ]);
      setNewAttributeName('');
    }
  };

  const removeAttributeDefinition = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setAttributeDefinitions(prev => prev.filter((_, i) => i !== index));
    // Clean up input state
    setAttributeValueInputs(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
  };

  const addValueToAttribute = (attrIndex) => {
    const value = attributeValueInputs[attrIndex]?.trim();
    if (value) {
      setAttributeDefinitions(prev => prev.map((attr, i) => 
        i === attrIndex 
          ? { ...attr, values: [...attr.values, value] }
          : attr
      ));
      setAttributeValueInputs(prev => ({ ...prev, [attrIndex]: '' }));
    }
  };

  const removeValueFromAttribute = (e, attrIndex, valueIndex) => {
    e.preventDefault();
    e.stopPropagation();
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
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h4 className='text-base font-bold text-gray-900 dark:text-white'>
            Step 1: Define Product Attributes
          </h4>
          <Button
            type='button'
            onClick={onGenerateVariants}
            size='sm'
            disabled={!canGenerateVariants}
            className='bg-green-600 hover:bg-green-700'
          >
            Generate Variants
          </Button>
        </div>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          Create attributes (like Color, Size) and add values to each. Click "Generate Variants" to create all combinations.
        </p>
      </div>
      
      {/* Add New Attribute */}
      <div className='flex gap-2'>
        <Input
          placeholder='Enter attribute name (Color, Size, Storage, Material...)'
          value={newAttributeName}
          onChange={(e) => setNewAttributeName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttributeDefinition())}
        />
        <Button type='button' onClick={addAttributeDefinition} size='sm' className='whitespace-nowrap'>
          <Plus className='w-4 h-4 mr-1' />
          Add Attribute
        </Button>
      </div>
      
      {/* Display Attribute Definitions */}
      {attributeDefinitions.length === 0 ? (
        <div className='text-center py-6 text-gray-500 dark:text-gray-400 text-sm'>
          No attributes defined yet. Add your first attribute above (e.g., "Color", "Size").
        </div>
      ) : (
        attributeDefinitions.map((attr, attrIndex) => (
          <div key={attrIndex} className='space-y-3 p-4 bg-white dark:bg-gray-700 rounded-lg border-2 border-blue-200 dark:border-blue-800 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <span className='font-bold text-base text-blue-900 dark:text-blue-200'>
                  {attr.name}
                </span>
                <span className='ml-2 text-xs text-gray-500 dark:text-gray-400'>
                  ({attr.values.length} {attr.values.length === 1 ? 'value' : 'values'})
                </span>
              </div>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={(e) => removeAttributeDefinition(e, attrIndex)}
                className='text-red-600 hover:text-red-700 h-7'
              >
                <X className='w-4 h-4' />
              </Button>
            </div>
          
          {/* Add Value to Attribute - Always visible */}
          <div className='flex gap-2'>
            <Input
              placeholder={`e.g., ${attr.name === 'Color' ? 'Red, Blue, Green' : attr.name === 'Size' ? 'Small, Medium, Large' : 'Enter value'}`}
              value={attributeValueInputs[attrIndex] || ''}
              onChange={(e) => setAttributeValueInputs(prev => ({ ...prev, [attrIndex]: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addValueToAttribute(attrIndex))}
              className='h-9'
            />
            <Button
              type='button'
              onClick={() => addValueToAttribute(attrIndex)}
              size='sm'
              className='h-9 whitespace-nowrap'
              disabled={!attributeValueInputs[attrIndex]?.trim()}
            >
              <Plus className='w-4 h-4 mr-1' />
              Add
            </Button>
          </div>
          
          {/* Display Values */}
          {attr.values.length > 0 ? (
            <div className='flex flex-wrap gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded'>
              {attr.values.map((value, valueIndex) => (
                <Badge key={valueIndex} variant='secondary' className='flex items-center gap-1 text-sm'>
                  {typeof value === 'object' ? (value.value || value.name || JSON.stringify(value)) : value}
                  <button
                    type='button'
                    className='ml-1 hover:text-red-600 focus:outline-none pointer-events-auto'
                    onClick={(e) => removeValueFromAttribute(e, attrIndex, valueIndex)}
                  >
                    <X className='w-3 h-3' />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <div className='text-center py-2 text-xs text-gray-500 dark:text-gray-400'>
              No values yet. Click "Add Value" to start.
            </div>
          )}
        </div>
      )))
      }
    </div>
  );
};

export default AttributeDefinitionBuilder;
