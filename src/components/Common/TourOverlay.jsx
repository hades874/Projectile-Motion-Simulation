import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { HelpCircle, ChevronRight, ChevronLeft, X, BookOpen, Settings } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage.jsx';
import styles from './TourOverlay.module.css';

const TourOverlay = ({ steps, storageKey, blockedByKey, onBeforeStep, hideTrigger, triggerRef }) => {
  const [phase, setPhase] = useState('idle'); // 'idle', 'active'
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [showTooltip, setShowTooltip] = useState(false);
  const { language } = useLanguage();
  const [tourMode, setTourMode] = useState(localStorage.getItem('10ms_tour_mode') || 'beginner');

  const tooltipRef = useRef(null);
  const resizeObserver = useRef(null);

  const currentStep = steps[currentStepIndex];

  // Logic to handle auto-start
  useEffect(() => {
    const isCompleted = localStorage.getItem(storageKey) === '1';
    if (isCompleted) return;

    let pollInterval;
    const startTime = Date.now();

    const poll = () => {
      const isBlocked = blockedByKey && localStorage.getItem(blockedByKey) !== '1';
      if (!isBlocked || (Date.now() - startTime > 15000)) {
        setPhase('active');
        setCurrentStepIndex(0);
        clearInterval(pollInterval);
      }
    };

    pollInterval = setInterval(poll, 1000);
    return () => clearInterval(pollInterval);
  }, [storageKey, blockedByKey]);

  const updateTargetRect = useCallback(() => {
    if (phase !== 'active' || !currentStep) return;

    const element = document.querySelector(`[data-tour="${currentStep.targetId}"]`);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      });
    } else {
      setTargetRect(null);
    }
  }, [phase, currentStep]);

  // Handle step transitions and calculations
  useEffect(() => {
    if (phase !== 'active') return;

    let isMounted = true;

    const calculatePosition = async () => {
      setShowTooltip(false);

      if (onBeforeStep) {
        onBeforeStep(currentStep);
      }

      // Wait for React re-render/tab switches
      await new Promise(resolve => setTimeout(resolve, 250));
      if (!isMounted) return;

      updateTargetRect();

      // Wait for spotlight transition and tab switches to stabilize
      setTimeout(() => {
        if (!isMounted) return;
        updateTooltipPosition();
        setShowTooltip(true);
      }, 400);
    };

    calculatePosition();
    return () => { isMounted = false; };
  }, [currentStepIndex, phase]); // Only trigger on step or phase change

  const updateTooltipPosition = useCallback(() => {
    const element = document.querySelector(`[data-tour="${currentStep.targetId}"]`);
    if (!element || !tooltipRef.current) {
      // Fallback: Center of screen
      setTooltipStyle({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      });
      return;
    }

    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 15;
    const placement = currentStep.placement || 'auto';

    let top, left;

    const calculateTop = () => {
      if (rect.top > tooltipRect.height + padding) return rect.top - tooltipRect.height - padding;
      return rect.bottom + padding;
    };

    const calculateBottom = () => {
      if (window.innerHeight - rect.bottom > tooltipRect.height + padding) return rect.bottom + padding;
      return rect.top - tooltipRect.height - padding;
    };

    if (placement === 'top') {
      top = rect.top - tooltipRect.height - padding;
      left = rect.left + (rect.width - tooltipRect.width) / 2;
    } else if (placement === 'bottom') {
      top = rect.bottom + padding;
      left = rect.left + (rect.width - tooltipRect.width) / 2;
    } else if (placement === 'left') {
      top = rect.top + (rect.height - tooltipRect.height) / 2;
      left = rect.left - tooltipRect.width - padding;
    } else if (placement === 'right') {
      top = rect.top + (rect.height - tooltipRect.height) / 2;
      left = rect.right + padding;
    } else {
      // Auto
      top = rect.bottom + padding;
      left = rect.left + (rect.width - tooltipRect.width) / 2;
    }

    // Boundary checks
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));

    setTooltipStyle({ top: `${top}px`, left: `${left}px` });
  }, [currentStep]);

  // Window resize handling
  useEffect(() => {
    window.addEventListener('resize', updateTargetRect);
    return () => window.removeEventListener('resize', updateTargetRect);
  }, [updateTargetRect]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (phase !== 'active') return;

      if (e.key === 'Escape') handleDismiss();
      if (e.key === 'ArrowRight' || e.key === ' ') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, currentStepIndex]);

  const handleStartTour = (mode) => {
    setTourMode(mode);
    localStorage.setItem('10ms_tour_mode', mode);
    setPhase('active');
    setCurrentStepIndex(0);
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleDismiss = () => {
    setPhase('idle');
    localStorage.setItem(storageKey, '1');
  };

  const handleComplete = () => {
    setPhase('idle');
    localStorage.setItem(storageKey, '1');
  };

  const getStepText = (field) => {
    const text = currentStep[field];
    if (typeof text === 'object') {
      return text.beginner || text.expert || Object.values(text)[0];
    }
    return text;
  };

  useEffect(() => {
    if (triggerRef) {
      triggerRef.current = () => { setPhase('active'); setCurrentStepIndex(0); };
    }
  }, [triggerRef]);

  return (
    <>
      {!hideTrigger && (
        <button
          className={styles.helpButton}
          onClick={() => { setPhase('active'); setCurrentStepIndex(0); }}
          title="টিউটোরিয়াল শুরু করুন"
        >
          <HelpCircle size={24} />
        </button>
      )}

      {phase === 'active' && (
        <div className={`${styles.overlay} ${styles.overlayActive}`}>
          <svg className={styles.svgOverlay}>
            <defs>
              <mask id="tour-mask">
                <rect width="100%" height="100%" fill="white" />
                {targetRect && (
                  <rect
                    className={styles.spotlightHole}
                    x={targetRect.x - 5}
                    y={targetRect.y - 5}
                    width={targetRect.width + 10}
                    height={targetRect.height + 10}
                    rx="8"
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect width="100%" height="100%" mask="url(#tour-mask)" className={styles.maskRect} />
          </svg>

          {targetRect && (
            <div
              className={styles.glowRing}
              style={{
                top: targetRect.y - 5,
                left: targetRect.x - 5,
                width: targetRect.width + 10,
                height: targetRect.height + 10
              }}
            />
          )}

          <div
            ref={tooltipRef}
            className={`${styles.tooltip} ${!showTooltip ? styles.tooltipHidden : ''}`}
            style={tooltipStyle}
          >
            <h3 className={styles.tooltipTitle}>
              {getStepText('title')}
            </h3>
            <p className={styles.tooltipBody}>
              {getStepText('body')}
            </p>
            <div className={styles.tooltipFooter}>
              <span className={styles.stepCounter}>
                {language === 'bn' ? 'ধাপ' : 'Step'} {currentStepIndex + 1} / {steps.length}
              </span>
              <div className={styles.navButtons}>
                {currentStepIndex > 0 && (
                  <button className={styles.helpButton} style={{position: 'static', width: 'auto', height: '36px', padding: '0 12px', borderRadius: '8px'}} onClick={handlePrev}>
                    <ChevronLeft size={18} />
                  </button>
                )}
                <button
                  className={styles.helpButton}
                  style={{position: 'static', width: 'auto', height: '36px', padding: '0 12px', borderRadius: '8px', background: '#2563eb', color: 'white', borderColor: '#2563eb'}}
                  onClick={handleNext}
                >
                  {currentStepIndex === steps.length - 1 
                    ? (language === 'bn' ? 'শেষ করুন' : 'Finish') 
                    : (language === 'bn' ? 'পরবর্তী' : 'Next')}
                  {currentStepIndex !== steps.length - 1 && <ChevronRight size={18} />}
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              style={{position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8'}}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TourOverlay;
