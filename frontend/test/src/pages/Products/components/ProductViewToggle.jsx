import React from 'react';
import { Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProductViewToggle = ({ viewMode, setViewMode }) => {
  return (
    <div className="view-mode-toggle flex gap-1">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setViewMode('grid')}
        aria-label="Grid view"
      >
        <Grid size={20} />
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setViewMode('list')}
        aria-label="List view"
      >
        <List size={20} />
      </Button>
    </div>
  );
};

export default ProductViewToggle;
