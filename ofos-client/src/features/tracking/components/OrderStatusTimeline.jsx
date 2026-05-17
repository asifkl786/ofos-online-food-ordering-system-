import { motion } from 'framer-motion';
import { getStatusSteps, formatDateTime } from '../utils/trackingHelpers';

export default function OrderStatusTimeline({ order }) {
  const steps = getStatusSteps(order?.status);
  
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <span>📋</span> Order Timeline
      </h3>
      
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gray-200" />
        
        <div className="space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex gap-4"
            >
              {/* Timeline Icon */}
              <div className={`
                relative z-10 w-10 h-10 rounded-full flex items-center justify-center
                transition-all duration-300
                ${step.isCompleted 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-400'
                }
                ${step.isCurrent ? 'ring-4 ring-orange-200' : ''}
              `}>
                {step.isCompleted && index < steps.length - 1 ? '✓' : step.icon}
              </div>
              
              {/* Timeline Content */}
              <div className="flex-1 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h4 className={`font-medium ${step.isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                    {step.label}
                  </h4>
                  {step.isCompleted && order?.updatedAt && (
                    <span className="text-xs text-gray-400">
                      {formatDateTime(order.updatedAt)}
                    </span>
                  )}
                </div>
                <p className={`text-sm mt-1 ${step.isCompleted ? 'text-gray-500' : 'text-gray-300'}`}>
                  {step.description}
                </p>
                {step.isCurrent && (
                  <p className="text-xs text-orange-500 mt-2 animate-pulse">
                    ⏳ In Progress...
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}