import React, { memo, useMemo, useCallback } from 'react';

interface OptimizedComponentProps {
  children: React.ReactNode;
  dependencies?: any[];
  onUpdate?: () => void;
  className?: string;
}

// Performance optimization wrapper component
export const OptimizedComponent = memo<OptimizedComponentProps>(({
  children,
  dependencies = [],
  onUpdate,
  className
}) => {
  // Memoize expensive calculations
  const memoizedContent = useMemo(() => {
    return children;
  }, dependencies);

  // Memoize callback functions
  const handleUpdate = useCallback(() => {
    onUpdate?.();
  }, [onUpdate]);

  return (
    <div className={className} data-optimized="true">
      {memoizedContent}
    </div>
  );
});

OptimizedComponent.displayName = 'OptimizedComponent';

// High-performance list component for large datasets
interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  className?: string;
  maxItems?: number;
}

export const OptimizedList = memo(<T,>({
  items,
  renderItem,
  keyExtractor,
  className,
  maxItems = 100
}: OptimizedListProps<T>) => {
  // Limit items for performance and use virtualization concept
  const visibleItems = useMemo(() => {
    return items.slice(0, maxItems);
  }, [items, maxItems]);

  const memoizedItems = useMemo(() => {
    return visibleItems.map((item, index) => (
      <div key={keyExtractor(item, index)} className="optimized-list-item">
        {renderItem(item, index)}
      </div>
    ));
  }, [visibleItems, renderItem, keyExtractor]);

  return (
    <div className={`optimized-list ${className || ''}`}>
      {memoizedItems}
    </div>
  );
});

OptimizedList.displayName = 'OptimizedList';