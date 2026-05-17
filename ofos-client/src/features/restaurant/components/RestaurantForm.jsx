import { Formik, Form, Field, ErrorMessage, getIn } from 'formik';
import { FiClock, FiDollarSign, FiInfo, FiMail, FiMapPin, FiPhone, FiRefreshCw } from 'react-icons/fi';
import { restaurantSchema } from '../schemas/restaurantSchema';

const digitsOnly = (value, maxLength) => value.replace(/\D/g, '').slice(0, maxLength);

const sectionStyle = 'rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm sm:p-5';
const labelStyle = 'mb-1.5 block text-sm font-semibold text-slate-700';
const helpStyle = 'mt-1 text-xs text-slate-400';

const fieldClass = (hasError) => [
  'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition',
  'placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
  hasError
    ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100'
    : 'border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100',
].join(' ');

function FieldError({ name }) {
  return <ErrorMessage name={name} component="p" className="mt-1.5 text-xs font-medium text-red-500" />;
}

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="rounded-xl bg-orange-100 p-2 text-orange-600">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export default function RestaurantForm({ initialValues, isSubmitting, onSubmit, onCancel }) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={restaurantSchema}
      enableReinitialize
      onSubmit={onSubmit}
    >
      {({ isSubmitting: formSubmitting, values, errors, touched, setFieldValue }) => {
        const submitting = isSubmitting || formSubmitting;
        const hasError = (name) => Boolean(getIn(touched, name) && getIn(errors, name));

        return (
          <Form className="space-y-5 bg-slate-50/70 p-4 sm:p-6">
            <div className={sectionStyle}>
              <SectionTitle
                icon={FiInfo}
                title="Basic details"
                description="These details appear on restaurant listing and detail pages."
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelStyle}>
                    Restaurant Name <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="name"
                    type="text"
                    disabled={submitting}
                    placeholder="e.g., Spicy Delight"
                    className={fieldClass(hasError('name'))}
                  />
                  <FieldError name="name" />
                </div>

                <div>
                  <label className={labelStyle}>
                    Cuisine Type <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="cuisineType"
                    type="text"
                    disabled={submitting}
                    placeholder="e.g., North Indian, Chinese"
                    className={fieldClass(hasError('cuisineType'))}
                  />
                  <FieldError name="cuisineType" />
                </div>
              </div>

              <div className="mt-4">
                <label className={labelStyle}>Description</label>
                <Field
                  as="textarea"
                  name="description"
                  rows="3"
                  disabled={submitting}
                  placeholder="Shortly describe your restaurant, speciality, and service style."
                  className={`${fieldClass(hasError('description'))} resize-none`}
                />
                <div className="flex items-center justify-between gap-2">
                  <FieldError name="description" />
                  <p className={helpStyle}>{values.description?.length || 0}/500</p>
                </div>
              </div>
            </div>

            <div className={sectionStyle}>
              <SectionTitle
                icon={FiDollarSign}
                title="Ordering settings"
                description="Keep prices simple and clear for the customer."
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelStyle}>Delivery Fee (Rs.)</label>
                  <Field
                    name="deliveryFee"
                    type="number"
                    min="0"
                    disabled={submitting}
                    placeholder="e.g., 40"
                    onWheel={(event) => event.currentTarget.blur()}
                    className={fieldClass(hasError('deliveryFee'))}
                  />
                  <FieldError name="deliveryFee" />
                </div>

                <div>
                  <label className={labelStyle}>Minimum Order (Rs.)</label>
                  <Field
                    name="minimumOrderAmount"
                    type="number"
                    min="0"
                    disabled={submitting}
                    placeholder="e.g., 199"
                    onWheel={(event) => event.currentTarget.blur()}
                    className={fieldClass(hasError('minimumOrderAmount'))}
                  />
                  <FieldError name="minimumOrderAmount" />
                </div>
              </div>
            </div>

            <div className={sectionStyle}>
              <SectionTitle
                icon={FiClock}
                title="Timing and contact"
                description="Customers use this information before placing orders."
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelStyle}>Opening Time</label>
                  <Field
                    name="openingTime"
                    type="time"
                    disabled={submitting}
                    className={fieldClass(hasError('openingTime'))}
                  />
                  <FieldError name="openingTime" />
                </div>

                <div>
                  <label className={labelStyle}>Closing Time</label>
                  <Field
                    name="closingTime"
                    type="time"
                    disabled={submitting}
                    className={fieldClass(hasError('closingTime'))}
                  />
                  <FieldError name="closingTime" />
                </div>

                <div>
                  <label className={labelStyle}>Contact Phone</label>
                  <div className="relative">
                    <FiPhone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Field name="contactPhone">
                      {({ field }) => (
                        <input
                          {...field}
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={10}
                          disabled={submitting}
                          placeholder="9876543210"
                          onChange={(event) => setFieldValue('contactPhone', digitsOnly(event.target.value, 10))}
                          className={`${fieldClass(hasError('contactPhone'))} pl-10`}
                        />
                      )}
                    </Field>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <FieldError name="contactPhone" />
                    <p className={helpStyle}>{values.contactPhone?.length || 0}/10 digits</p>
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Contact Email</label>
                  <div className="relative">
                    <FiMail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Field
                      name="contactEmail"
                      type="email"
                      disabled={submitting}
                      placeholder="restaurant@example.com"
                      className={`${fieldClass(hasError('contactEmail'))} pl-10`}
                    />
                  </div>
                  <FieldError name="contactEmail" />
                </div>
              </div>
            </div>

            <div className={sectionStyle}>
              <SectionTitle
                icon={FiMapPin}
                title="Restaurant address"
                description="Accurate address helps customers and delivery partners find the restaurant."
              />

              <div className="space-y-4">
                <div>
                  <label className={labelStyle}>
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="address.streetAddress"
                    type="text"
                    disabled={submitting}
                    placeholder="House No., Building Name, Area"
                    className={fieldClass(hasError('address.streetAddress'))}
                  />
                  <FieldError name="address.streetAddress" />
                </div>

                <div>
                  <label className={labelStyle}>Landmark</label>
                  <Field
                    name="address.landmark"
                    type="text"
                    disabled={submitting}
                    placeholder="Near City Mall"
                    className={fieldClass(hasError('address.landmark'))}
                  />
                  <FieldError name="address.landmark" />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelStyle}>
                      City <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="address.city"
                      type="text"
                      disabled={submitting}
                      placeholder="Mumbai"
                      className={fieldClass(hasError('address.city'))}
                    />
                    <FieldError name="address.city" />
                  </div>

                  <div>
                    <label className={labelStyle}>
                      State <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="address.state"
                      type="text"
                      disabled={submitting}
                      placeholder="Maharashtra"
                      className={fieldClass(hasError('address.state'))}
                    />
                    <FieldError name="address.state" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelStyle}>
                      Zip Code <span className="text-red-500">*</span>
                    </label>
                    <Field name="address.zipCode">
                      {({ field }) => (
                        <input
                          {...field}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          disabled={submitting}
                          placeholder="400001"
                          onChange={(event) => setFieldValue('address.zipCode', digitsOnly(event.target.value, 6))}
                          className={fieldClass(hasError('address.zipCode'))}
                        />
                      )}
                    </Field>
                    <div className="flex items-center justify-between gap-2">
                      <FieldError name="address.zipCode" />
                      <p className={helpStyle}>{values.address?.zipCode?.length || 0}/6 digits</p>
                    </div>
                  </div>

                  <div>
                    <label className={labelStyle}>
                      Country <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="address.country"
                      type="text"
                      disabled={submitting}
                      placeholder="India"
                      className={fieldClass(hasError('address.country'))}
                    />
                    <FieldError name="address.country" />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 -mx-4 -mb-4 border-t border-slate-200 bg-white/95 p-4 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={submitting}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-32"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:from-orange-600 hover:to-rose-600 disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-44"
                >
                  {submitting && <FiRefreshCw className="h-4 w-4 animate-spin" />}
                  {submitting ? 'Saving Restaurant...' : 'Save Restaurant'}
                </button>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}
