import { motion } from 'framer-motion';

export default function CheckoutStepper({ currentStep }) {
  const steps = [
    { id: 1, name: 'Cart', icon: '🛒' },
    { id: 2, name: 'Address', icon: '📍' },
    { id: 3, name: 'Payment', icon: '💳' },
    { id: 4, name: 'Order', icon: '📦' },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex-1 relative">
            <div className="flex flex-col items-center">
              {/* Step Circle */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: currentStep >= step.id ? 1 : 0.8 }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold
                  transition-all duration-300
                  ${currentStep >= step.id 
                    ? 'bg-orange-500 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {currentStep > step.id ? '✓' : step.icon}
              </motion.div>
              
              {/* Step Label */}
              <span className={`text-xs mt-2 font-medium ${
                currentStep >= step.id ? 'text-orange-500' : 'text-gray-400'
              }`}>
                {step.name}
              </span>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2 ${
                currentStep > step.id ? 'bg-orange-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}