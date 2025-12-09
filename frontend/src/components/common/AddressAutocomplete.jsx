import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { getAddressSuggestions } from '@/services/addresses.service';
import LoadingSpinner from './LoadingSpinner';

const AddressAutocomplete = ({ value, onChange, onSelect, placeholder, name, id }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const skipSearchRef = useRef(false);
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
    // Skip search if we just selected a suggestion
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

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
    // Set flag to skip next search
    skipSearchRef.current = true;
    
    // Close dropdown immediately
    setIsOpen(false);
    setSuggestions([]);
    
    // If onSelect callback provided, use it (for lat/lng etc)
    if (onSelect) {
      onSelect(suggestion);
    } else {
      // Fallback to onChange
      onChange({
        target: {
          name,
          value: suggestion.name || suggestion,
        },
      });
    }
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
        className='min-h-[44px]'
      />

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className='absolute z-[2100] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto'>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className='flex items-start gap-2 px-3 sm:px-4 py-3 sm:py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors active:bg-gray-200 dark:active:bg-gray-600 min-h-[44px] sm:min-h-[40px]'
            >
              <MapPin className='w-4 h-4 text-gray-400 mt-1 flex-shrink-0' />
              <div className='flex-1 min-w-0'>
                <p className='text-sm sm:text-base text-gray-900 dark:text-white break-words'>
                  {suggestion.name}
                </p>
                {suggestion.address && (
                  <p className='text-xs text-gray-500 dark:text-gray-400 break-words mt-0.5'>
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
        <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'>
          <LoadingSpinner size="xs" variant="button" />
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
