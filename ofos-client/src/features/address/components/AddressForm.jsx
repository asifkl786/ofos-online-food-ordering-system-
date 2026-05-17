import { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { FiX, FiMapPin, FiUser, FiPhone, FiHome, FiBriefcase, FiNavigation, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { isValidPincode, isValidPhone } from '../utils/addressHelpers';

// Validation Schema
const addressSchema = yup.object({
  streetAddress: yup.string().required('Street address is required'),
  apartmentNumber: yup.string(),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zipCode: yup.string()
    .required('Pin code is required')
    .test('valid-pincode', 'Enter a valid 6-digit pin code', (value) => isValidPincode(value)),
  country: yup.string().required('Country is required'),
  landmark: yup.string(),
  addressType: yup.string().required('Select address type'),
  phoneNumber: yup.string()
    .required('Phone number is required')
    .test('valid-phone', 'Enter a valid 10-digit mobile number', (value) => isValidPhone(value)),
  receiverName: yup.string().required('Receiver name is required'),
});

export default function AddressForm({ initialData, onSubmit, onClose, isEditing }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    streetAddress: initialData?.streetAddress || '',
    apartmentNumber: initialData?.apartmentNumber || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zipCode: initialData?.zipCode || '',
    country: initialData?.country || 'India',
    landmark: initialData?.landmark || '',
    addressType: initialData?.addressType || 'HOME',
    phoneNumber: initialData?.phoneNumber || '',
    receiverName: initialData?.receiverName || '',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const addressTypes = [
    { value: 'HOME', label: 'Home', icon: FiHome, selectedClass: 'border-blue-500 bg-blue-50 text-blue-600' },
    { value: 'WORK', label: 'Work', icon: FiBriefcase, selectedClass: 'border-purple-500 bg-purple-50 text-purple-600' },
    { value: 'OTHER', label: 'Other', icon: FiMapPin, selectedClass: 'border-gray-500 bg-gray-50 text-gray-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => !isSubmitting && onClose()}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? '✏️ Edit Address' : '➕ Add New Address'}
          </h2>
          <button
            onClick={() => !isSubmitting && onClose()}
            disabled={isSubmitting}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close address form"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <Formik
          initialValues={initialValues}
          validationSchema={addressSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, errors, touched }) => (
            <Form className="p-6 space-y-5">
              {/* Address Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {addressTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = values.addressType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => !isSubmitting && setFieldValue('addressType', type.value)}
                        disabled={isSubmitting}
                        className={`
                          flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                          ${isSelected 
                            ? type.selectedClass 
                            : 'border-gray-200 hover:border-gray-300 text-gray-500'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
                <ErrorMessage name="addressType" component="p" className="mt-1 text-xs text-red-500" />
              </div>

              {/* Receiver Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receiver Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400 w-4 h-4" />
                  </div>
                  <Field
                    name="receiverName"
                    type="text"
                    placeholder="Full name"
                    className={`w-full pl-10 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.receiverName && touched.receiverName ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                </div>
                <ErrorMessage name="receiverName" component="p" className="mt-1 text-xs text-red-500" />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="text-gray-400 w-4 h-4" />
                  </div>
                  <Field
                    name="phoneNumber"
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    className={`w-full pl-10 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.phoneNumber && touched.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                </div>
                <ErrorMessage name="phoneNumber" component="p" className="mt-1 text-xs text-red-500" />
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiNavigation className="text-gray-400 w-4 h-4" />
                  </div>
                  <Field
                    name="streetAddress"
                    type="text"
                    placeholder="House/Flat/Block No."
                    className={`w-full pl-10 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.streetAddress && touched.streetAddress ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                </div>
                <ErrorMessage name="streetAddress" component="p" className="mt-1 text-xs text-red-500" />
              </div>

              {/* Apartment Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apartment/Society Name</label>
                <Field
                  name="apartmentNumber"
                  type="text"
                  placeholder="Apartment, Society, Building name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                <Field
                  name="landmark"
                  type="text"
                  placeholder="Near any famous place"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* City, State, Pin Code - Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="city"
                    type="text"
                    placeholder="City"
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.city && touched.city ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  <ErrorMessage name="city" component="p" className="mt-1 text-xs text-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="state"
                    type="text"
                    placeholder="State"
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.state && touched.state ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  <ErrorMessage name="state" component="p" className="mt-1 text-xs text-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pin Code <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="zipCode"
                    type="text"
                    placeholder="6-digit PIN code"
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.zipCode && touched.zipCode ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  <ErrorMessage name="zipCode" component="p" className="mt-1 text-xs text-red-500" />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <Field
                  name="country"
                  type="text"
                  placeholder="Country"
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.country && touched.country ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                />
                <ErrorMessage name="country" component="p" className="mt-1 text-xs text-red-500" />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => !isSubmitting && onClose()}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:bg-orange-400 disabled:shadow-none cursor-pointer"
                >
                  {isSubmitting && <FiRefreshCw className="h-4 w-4 animate-spin" />}
                  <span>{isSubmitting ? (isEditing ? 'Updating Address...' : 'Saving Address...') : (isEditing ? 'Update Address' : 'Save Address')}</span>
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </motion.div>
  );
}



