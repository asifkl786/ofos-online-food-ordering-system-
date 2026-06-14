import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { useDelivery } from '../hooks/useDelivery';
import { FiTruck, FiUser, FiPhone, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import { ButtonLoader } from '../../../components/common/Loader';

const registrationSchema = yup.object({
  vehicleNumber: yup.string().required('Vehicle number is required'),
  vehicleType: yup.string().required('Vehicle type is required'),
  drivingLicenseNumber: yup.string().required('Driving license is required'),
  zone: yup.string(),
});

const vehicleTypes = [
  { value: 'BIKE', label: 'Bike', icon: '🏍️' },
  { value: 'SCOOTER', label: 'Scooter', icon: '🛵' },
  { value: 'CAR', label: 'Car', icon: '🚗' },
];

export default function DeliveryPartnerRegistration() {
  const navigate = useNavigate();
  const { register, isLoading, profile } = useDelivery();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    const result = await register(values);
    if (result.meta?.requestStatus === 'fulfilled') {
      setIsSuccess(true);
      setTimeout(() => navigate('/delivery/dashboard'), 2000);
    }
    setSubmitting(false);
  };

  if (profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800">Already Registered!</h2>
          <p className="text-gray-500 mt-2">You are already registered as a delivery partner</p>
          <button
            onClick={() => navigate('/delivery/dashboard')}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Registration Successful! 🎉</h2>
          <p className="text-gray-500 mt-2">You are now a delivery partner</p>
          <p className="text-sm text-gray-400 mt-1">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTruck className="w-8 h-8 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Become a Delivery Partner</h1>
            <p className="text-gray-500 mt-2">Join our team and start earning today</p>
          </div>

          <Formik
            initialValues={{
              vehicleNumber: '',
              vehicleType: 'BIKE',
              drivingLicenseNumber: '',
              zone: '',
            }}
            validationSchema={registrationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiTruck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Field
                      name="vehicleNumber"
                      type="text"
                      placeholder="MH 01 AB 1234"
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <ErrorMessage name="vehicleNumber" component="p" className="mt-1 text-xs text-red-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {vehicleTypes.map((type) => (
                      <label key={type.value} className="cursor-pointer">
                        <Field
                          type="radio"
                          name="vehicleType"
                          value={type.value}
                          className="hidden peer"
                        />
                        <div className="text-center py-3 border-2 border-gray-200 rounded-xl peer-checked:border-orange-500 peer-checked:bg-orange-50 transition-all">
                          <div className="text-2xl">{type.icon}</div>
                          <span className="text-sm font-medium">{type.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <ErrorMessage name="vehicleType" component="p" className="mt-1 text-xs text-red-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driving License Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Field
                      name="drivingLicenseNumber"
                      type="text"
                      placeholder="DL-1234567890"
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <ErrorMessage name="drivingLicenseNumber" component="p" className="mt-1 text-xs text-red-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Zone (Optional)</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Field
                      name="zone"
                      type="text"
                      placeholder="e.g., North Mumbai"
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  aria-busy={isSubmitting || isLoading}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {(isSubmitting || isLoading) && <ButtonLoader />}
                  {isSubmitting || isLoading ? 'Registering...' : 'Register as Delivery Partner'}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
