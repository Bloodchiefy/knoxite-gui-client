import React, { useState } from 'react';
import { cn } from '../utils/utils';

const SampleSplitter = ({
  id = 'drag-bar',
  dir,
  isDragging,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div
      id={id}
      data-testid={id}
      tabIndex={0}
      className={cn(
        'drag-bar',
        dir === 'horizontal' && 'drag-bar--horizontal',
        (isDragging || isFocused) && 'drag-bar--dragging'
      )}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      {...props}
    />
  );
};

export default SampleSplitter;
