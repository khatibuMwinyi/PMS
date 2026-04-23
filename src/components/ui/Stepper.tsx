'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/core/lib/utils';
import { CheckCircle, Circle, X } from 'lucide-react';

export interface Step {
  /** Step label */
  label: string;
  /** Optional step description */
  description?: string;
  /** Optional step icon */
  icon?: React.ReactNode;
  /** Optional status badge */
  status?: 'pending' | 'current' | 'completed' | 'error';
}

export interface StepperProps {
  /** Array of steps */
  steps: Step[];
  /** Current active step index */
  currentStep: number;
  /** Optional className for customization */
  className?: string;
  /** Callback when step is clicked */
  onStepChange?: (step: number) => void;
  /** Whether steps are clickable */
  clickable?: boolean;
  /** Whether to show step descriptions */
  showDescriptions?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Individual step component
 */
const StepItem = React.forwardRef<
  HTMLDivElement,
  {
    step: Step;
    index: number;
    isActive: boolean;
    isCompleted: boolean;
    isFirst: boolean;
    isLast: boolean;
    onClick?: () => void;
    clickable: boolean;
    size: 'sm' | 'md' | 'lg';
    showDescriptions: boolean;
  }
>(({ step, index, isActive, isCompleted, isFirst, isLast, onClick, clickable, size, showDescriptions }, ref) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const getStepIcon = () => {
    if (isCompleted) {
      return <CheckCircle className="w-5 h-5 text-[var(--state-success)]" />;
    }

    if (step.status === 'error') {
      return <X className="w-5 h-5 text-[var(--state-error)]" />;
    }

    return <Circle className="w-5 h-5 text-[var(--border-default)]" />;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-lg';
      default: return 'text-sm';
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center relative',
        clickable && 'cursor-pointer',
        size === 'sm' && 'min-w-[80px]',
        size === 'md' && 'min-w-[120px]',
        size === 'lg' && 'min-w-[160px]'
      )}
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-current={isActive ? 'step' : undefined}
      aria-setsize={steps.length}
      aria-posinset={index + 1}
    >
      {/* Step connector */}
      {!isLast && (
        <div
          className={cn(
            'absolute top-6 left-1/2 w-full h-0.5 -translate-x-1/2',
            isCompleted ? 'bg-[var(--state-success)]' : 'bg-[var(--border-subtle)]'
          )}
          style={{ width: size === 'sm' ? '40px' : size === 'md' ? '60px' : '80px' }}
        />
      )}

      {/* Step icon */}
      <motion.div
        className={cn(
          'relative z-10 flex items-center justify-center rounded-full border-2 bg-white',
          'transition-all duration-300',
          isActive && 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/20',
          isCompleted && 'border-[var(--state-success)] bg-[var(--state-success-bg)]',
          step.status === 'error' && 'border-[var(--state-error)] bg-[var(--state-error-bg)]',
          isHovered && clickable && 'scale-110',
          size === 'sm' && 'w-8 h-8',
          size === 'md' && 'w-10 h-10',
          size === 'lg' && 'w-12 h-12'
        )}
        whileHover={clickable ? { scale: 1.1 } : undefined}
        whileTap={clickable ? { scale: 0.95 } : undefined}
      >
        {step.icon || getStepIcon()}
      </motion.div>

      {/* Step label */}
      <div className={cn('mt-3 text-center', getSizeClasses())}>
        <p
          className={cn(
            'font-medium leading-tight',
            isActive && 'text-[var(--brand-primary)]',
            isCompleted && 'text-[var(--state-success)]',
            step.status === 'error' && 'text-[var(--state-error)]',
            !isActive && !isCompleted && 'text-[var(--text-primary)]'
          )}
        >
          {step.label}
        </p>

        {/* Step description */}
        {showDescriptions && step.description && (
          <p
            className={cn(
              'text-xs mt-1 leading-tight line-clamp-2',
              isActive ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'
            )}
          >
            {step.description}
          </p>
        )}
      </div>

      {/* Step number */}
      <span
        className={cn(
          'absolute -top-2 -right-2 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center',
          isActive ? 'bg-[var(--brand-primary)] text-white' : 'bg-[var(--surface-overlay)] text-[var(--text-muted)]'
        )}
      >
        {index + 1}
      </span>
    </div>
  );
});

StepItem.displayName = 'StepItem';

/**
 * Stepper component for multi-step processes
 */
export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({
    steps,
    currentStep,
    className,
    onStepChange,
    clickable = false,
    showDescriptions = false,
    size = 'md',
    ...props
  }, ref) => {
    const handleStepClick = (index: number) => {
      if (clickable && onStepChange) {
        onStepChange(index);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between w-full',
          className
        )}
        {...props}
      >
        {steps.map((step, index) => (
          <StepItem
            key={index}
            step={step}
            index={index}
            isActive={index === currentStep}
            isCompleted={index < currentStep}
            isFirst={index === 0}
            isLast={index === steps.length - 1}
            onClick={() => handleStepClick(index)}
            clickable={clickable}
            size={size}
            showDescriptions={showDescriptions}
          />
        ))}
      </div>
    );
  }
);

Stepper.displayName = 'Stepper';

/**
 * Vertical stepper variant
 */
export const VerticalStepper = React.forwardRef<
  HTMLDivElement,
  StepperProps & { orientation?: 'vertical' }
>(({ steps, currentStep, className, orientation = 'vertical', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col space-y-8' : 'flex-row items-center justify-between',
        className
      )}
      {...props}
    >
      {steps.map((step, index) => (
        <div
          key={index}
          className={cn(
            'flex',
            orientation === 'vertical' ? 'flex-row items-start' : 'flex-col items-center'
          )}
        >
          {/* Step content */}
          <div className="flex-1">
            <StepItem
              step={step}
              index={index}
              isActive={index === currentStep}
              isCompleted={index < currentStep}
              isFirst={index === 0}
              isLast={index === steps.length - 1}
              clickable={props.clickable}
              size={props.size}
              showDescriptions={props.showDescriptions}
            />
          </div>

          {/* Connector for vertical stepper */}
          {index < steps.length - 1 && orientation === 'vertical' && (
            <div className="ml-6 w-0.5 h-8 bg-[var(--border-subtle)]" />
          )}
        </div>
      ))}
    </div>
  );
});

VerticalStepper.displayName = 'VerticalStepper';

/**
 * Hook for managing stepper state
 */
export const useStepper = (initialStep: number = 0, totalSteps: number) => {
  const [currentStep, setCurrentStep] = React.useState(initialStep);

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const goToStep = (step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)));
  };

  const canGoNext = currentStep < totalSteps - 1;
  const canGoPrev = currentStep > 0;

  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    canGoNext,
    canGoPrev,
    totalSteps,
  };
};