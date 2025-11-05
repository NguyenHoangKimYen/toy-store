import { useRef, useState } from 'react';

export const useCarouselNavigation = () => {
  const [direction, setDirection] = useState(null);
  const [triggerSlide, setTriggerSlide] = useState(0);
  const isTransitioningRef = useRef(false);

  const goToNext = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    setDirection('next');
    setTriggerSlide(prev => prev + 1);

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 2000);
  };

  const goToPrev = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    setDirection('prev');
    setTriggerSlide(prev => prev + 1);

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 2000);
  };

  return { direction, triggerSlide, goToNext, goToPrev };
};
