"use client";

import React, { useEffect, useState, useRef } from "react";

interface PerformanceMetrics {
  fps: number;
  scrollEvents: number;
  paintTime: number;
  layoutShifts: number;
  lastUpdate: number;
}

export const HeaderPerformanceTest: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    scrollEvents: 0,
    paintTime: 0,
    layoutShifts: 0,
    lastUpdate: Date.now(),
  });
  
  const [isVisible, setIsVisible] = useState(false);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const scrollEventCount = useRef(0);
  const paintTimeTotal = useRef(0);
  const paintCount = useRef(0);
  const layoutShiftCount = useRef(0);

  // FPS Counter
  useEffect(() => {
    const countFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
        setMetrics(prev => ({ ...prev, fps, lastUpdate: Date.now() }));
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      requestAnimationFrame(countFPS);
    };
    
    requestAnimationFrame(countFPS);
  }, []);

  // Scroll Event Counter
  useEffect(() => {
    const handleScroll = () => {
      scrollEventCount.current++;
      setMetrics(prev => ({ ...prev, scrollEvents: scrollEventCount.current }));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Paint Time Measurement
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint') {
          paintTimeTotal.current += entry.startTime;
          paintCount.current++;
          setMetrics(prev => ({ 
            ...prev, 
            paintTime: Math.round(paintTimeTotal.current / paintCount.current) 
          }));
        }
      }
    });

    observer.observe({ entryTypes: ['paint'] });
    
    return () => observer.disconnect();
  }, []);

  // Layout Shift Detection
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift') {
          layoutShiftCount.current++;
          setMetrics(prev => ({ ...prev, layoutShifts: layoutShiftCount.current }));
        }
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    
    return () => observer.disconnect();
  }, []);

  // Performance Debug Info
  const getPerformanceStatus = () => {
    if (metrics.fps >= 58) return "✅ Excellent";
    if (metrics.fps >= 50) return "🟡 Good";
    if (metrics.fps >= 30) return "🟠 Fair";
    return "🔴 Poor";
  };

  const getScrollPerformance = () => {
    if (metrics.scrollEvents < 100) return "✅ Excellent";
    if (metrics.scrollEvents < 500) return "🟡 Good";
    if (metrics.scrollEvents < 1000) return "🟠 Fair";
    return "🔴 Poor";
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
      >
        {isVisible ? "Hide" : "Show"} Performance
      </button>
      
      {isVisible && (
        <div className="absolute bottom-full right-0 mb-2 bg-white border border-border rounded-lg shadow-sm p-4 w-80">
          <h3 className="font-bold text-lg mb-3">Header Performance Test</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>FPS:</span>
              <span className="font-mono">{metrics.fps} {getPerformanceStatus()}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Scroll Events:</span>
              <span className="font-mono">{metrics.scrollEvents} {getScrollPerformance()}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Paint Time:</span>
              <span className="font-mono">{metrics.paintTime}ms</span>
            </div>
            
            <div className="flex justify-between">
              <span>Layout Shifts:</span>
              <span className="font-mono">{metrics.layoutShifts}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Last Update:</span>
              <span className="font-mono">{new Date(metrics.lastUpdate).toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div className="mt-4 p-2 bg-muted rounded text-xs">
            <div className="font-bold mb-1">Performance Targets:</div>
            <div>• FPS: ≥58 (Excellent)</div>
            <div>• Scroll Events: &lt;100 (Excellent)</div>
            <div>• Paint Time: &lt;16ms</div>
            <div>• Layout Shifts: 0</div>
          </div>
          
          <div className="mt-3 text-xs text-muted-foreground">
            <div className="font-bold mb-1">Chrome DevTools:</div>
            <div>• Performance Tab: Aufnahme während Scrollen</div>
            <div>• Rendering Tab: Paint Flashing aktivieren</div>
            <div>• Console: console.time(&apos;scroll&apos;)</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Chrome DevTools Debug Commands
export const debugHeaderPerformance = () => {
  if (typeof window !== 'undefined') {
    // Performance Monitoring
    console.group('🚀 Header Performance Debug');
    
    // Check for Layout Thrashing
    console.time('scroll-performance');
    
    // Monitor scroll events
    let scrollCount = 0;
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
      if (type === 'scroll') {
        scrollCount++;
        console.log(`📊 Scroll Event #${scrollCount}`, { passive: typeof options === 'object' ? options?.passive : undefined });
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Check for will-change properties
    const willChangeElements = document.querySelectorAll('[style*="will-change"]');
    console.log('🎯 Will-change elements:', willChangeElements.length);
    
    // Check for transform3d
    const transform3dElements = document.querySelectorAll('[style*="translate3d"]');
    console.log('⚡ Transform3d elements:', transform3dElements.length);
    
    // Check for hardware acceleration
    const hardwareAccelerated = document.querySelectorAll('[style*="backface-visibility"]');
    console.log('🚀 Hardware accelerated elements:', hardwareAccelerated.length);
    
    console.groupEnd();
    
    // Performance Observer for Layout Shifts
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift') {
            console.warn('⚠️ Layout Shift detected:', entry);
          }
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }
};

// Auto-run debug on development
if (process.env.NODE_ENV === 'development') {
  setTimeout(debugHeaderPerformance, 2000);
} 