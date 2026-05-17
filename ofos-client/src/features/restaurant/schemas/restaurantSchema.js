import * as yup from 'yup';

const optionalNumber = () => yup
  .number()
  .transform((value, originalValue) => (originalValue === '' || originalValue === null ? null : value))
  .nullable();

const optionalText = () => yup
  .string()
  .transform((value) => (typeof value === 'string' && value.trim() === '' ? null : value?.trim?.() ?? value))
  .nullable();

export const restaurantSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Restaurant name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(80, 'Name must be 80 characters or less'),
  description: optionalText().max(500, 'Description must be 500 characters or less'),
  cuisineType: yup
    .string()
    .trim()
    .required('Cuisine type is required')
    .max(60, 'Cuisine type must be 60 characters or less'),
  minimumOrderAmount: optionalNumber().min(0, 'Minimum order cannot be negative'),
  deliveryFee: optionalNumber().min(0, 'Delivery fee cannot be negative'),
  openingTime: yup.string(),
  closingTime: yup.string(),
  contactPhone: yup
    .string()
    .transform((value) => (value ? value.replace(/\D/g, '') : ''))
    .matches(/^$|^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  contactEmail: optionalText().email('Invalid email address'),
  website: optionalText().url('Invalid URL'),
  address: yup.object({
    streetAddress: yup.string().trim().required('Street address is required').max(160, 'Street address is too long'),
    city: yup.string().trim().required('City is required').max(60, 'City name is too long'),
    state: yup.string().trim().required('State is required').max(60, 'State name is too long'),
    zipCode: yup
      .string()
      .transform((value) => (value ? value.replace(/\D/g, '') : ''))
      .required('Zip code is required')
      .matches(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit zip code'),
    country: yup.string().trim().required('Country is required'),
    landmark: optionalText().max(100, 'Landmark is too long'),
    latitude: optionalNumber(),
    longitude: optionalNumber(),
  }),
});

export const getInitialAddress = () => ({
  streetAddress: '',
  landmark: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'India',
  latitude: null,
  longitude: null,
});
