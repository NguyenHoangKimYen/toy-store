import React, { useState, useRef, useEffect } from 'react';

/**
 * OptimizedImage - Lazy loading image with blur-up effect and srcset support
 * Improves LCP and image delivery metrics
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  sizes = '100vw',
  placeholder = 'blur',
  onLoad,
  style,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef(null);

  // Generate srcset for responsive images if using Cloudinary or similar
  const generateSrcSet = (url) => {
    if (!url || url.includes('placeholder')) return '';
    
    // If it's a Cloudinary URL, generate responsive variants
    if (url.includes('cloudinary.com')) {
      const widths = [320, 480, 640, 768, 1024, 1280];
      return widths
        .map(w => {
          const optimizedUrl = url.replace('/upload/', `/upload/w_${w},f_auto,q_auto/`);
          return `${optimizedUrl} ${w}w`;
        })
        .join(', ');
    }
    
    return '';
  };

  // Generate optimized URL
  const getOptimizedSrc = (url) => {
    if (!url || url.includes('placeholder')) return url;
    
    // Cloudinary auto-optimization
    if (url.includes('cloudinary.com') && !url.includes('f_auto')) {
      return url.replace('/upload/', '/upload/f_auto,q_auto/');
    }
    
    return url;
  };

  useEffect(() => {
    if (priority || !imgRef.current) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before entering viewport
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const srcSet = generateSrcSet(src);
  const optimizedSrc = getOptimizedSrc(src);

  // Low quality placeholder (tiny base64 or CSS blur)
  const placeholderStyle = placeholder === 'blur' && !isLoaded
    ? {
        filter: 'blur(10px)',
        transform: 'scale(1.1)',
        transition: 'filter 0.3s ease-out, transform 0.3s ease-out',
      }
    : {};

  const loadedStyle = isLoaded
    ? {
        filter: 'blur(0)',
        transform: 'scale(1)',
      }
    : {};

  return (
    <img
      ref={imgRef}
      src={isInView ? optimizedSrc : undefined}
      srcSet={isInView && srcSet ? srcSet : undefined}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      onLoad={handleLoad}
      className={className}
      style={{
        ...style,
        ...placeholderStyle,
        ...loadedStyle,
        backgroundColor: !isLoaded ? '#f3f4f6' : undefined,
      }}
      {...props}
    />
  );
};

export default OptimizedImage;
