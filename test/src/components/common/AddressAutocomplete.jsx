import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { getAddressSuggestions } from '@/services/addresses.service';

const AddressAutocomplete = ({ value, onChange, placeholder, name, id }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce address search
  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const delayTimer = setTimeout(async () => {
      try {
        setLoading(true);
        const results = await getAddressSuggestions(value);
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayTimer);
  }, [value]);

  const handleSelectSuggestion = (suggestion) => {
    onChange({
      target: {
        name,
        value: suggestion.display || suggestion.name || suggestion,
      },
    });
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className='relative'>
      <Input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete='off'
      />

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className='absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto'>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className='flex items-start gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors'
            >
              <MapPin className='w-4 h-4 text-gray-400 mt-1 flex-shrink-0' />
              <div>
                <p className='text-sm text-gray-900 dark:text-white'>
                  {suggestion.display || suggestion.name}
                </p>
                {suggestion.address && (
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    {suggestion.address}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className='absolute right-3 top-1/2 -translate-y-1/2'>
          <LoadingSpinner size="xs" variant="button" />
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
