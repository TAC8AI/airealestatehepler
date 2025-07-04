import React from 'react';
import { FiCpu, FiFileText, FiZap, FiTarget } from 'react-icons/fi';

interface LoadingStep {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  estimatedSeconds: number;
}

interface LoadingScreenProps {
  title: string;
  subtitle: string;
  steps: LoadingStep[];
  currentStep: number;
  progress: number;
  disclaimer?: string;
}

export function LoadingScreen({ title, subtitle, steps, currentStep, progress, disclaimer }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
            <div 
              className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"
              style={{ animationDuration: '1.5s' }}
            ></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <FiCpu className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
          <p className="text-gray-400 text-sm">{subtitle}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm text-blue-400 font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-6">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const IconComponent = step.icon;
            
            return (
              <div key={step.id} className="flex items-center space-x-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isCompleted 
                    ? 'bg-blue-500 border-blue-500' 
                    : isCurrent 
                      ? 'border-blue-400 bg-blue-400/20' 
                      : 'border-white/20 bg-white/5'
                  }
                `}>
                  <IconComponent className={`w-4 h-4 ${
                    isCompleted ? 'text-white' : isCurrent ? 'text-blue-400' : 'text-gray-500'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className={`text-sm font-medium ${
                    isCompleted ? 'text-green-400' : isCurrent ? 'text-white' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </div>
                  <div className={`text-xs ${
                    isCurrent ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {step.description}
                  </div>
                </div>
                
                {isCurrent && (
                  <div className="text-xs text-gray-400">
                    ~{step.estimatedSeconds}s
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* AI Disclaimer */}
        {disclaimer && (
          <div className="bg-amber-500/10 border border-amber-400/20 rounded-lg p-3">
            <p className="text-xs text-amber-200 leading-relaxed">
              <span className="font-medium">AI Notice:</span> {disclaimer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Preset configurations for common use cases
export const CONTRACT_ANALYSIS_STEPS: LoadingStep[] = [
  {
    id: 'upload',
    label: 'Processing Document',
    description: 'Extracting text and analyzing structure',
    icon: FiFileText,
    estimatedSeconds: 15
  },
  {
    id: 'analyze',
    label: 'Analyzing Contract',
    description: 'Identifying key terms and potential risks',
    icon: FiCpu,
    estimatedSeconds: 30
  },
  {
    id: 'validate',
    label: 'Validating Results',
    description: 'Cross-referencing legal standards',
    icon: FiTarget,
    estimatedSeconds: 10
  }
];

export const LISTING_GENERATION_STEPS: LoadingStep[] = [
  {
    id: 'research',
    label: 'Property Research',
    description: 'Gathering market data and property details',
    icon: FiTarget,
    estimatedSeconds: 25
  },
  {
    id: 'analysis',
    label: 'Market Analysis',
    description: 'Analyzing comparable properties and pricing',
    icon: FiCpu,
    estimatedSeconds: 20
  },
  {
    id: 'generate',
    label: 'Content Generation',
    description: 'Creating optimized listing descriptions',
    icon: FiZap,
    estimatedSeconds: 15
  }
]; 