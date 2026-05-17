import { Formik, Form } from 'formik';
import { updateProfileSchema } from '../schemas/authSchemas';
import { useAuth } from '../hooks/useAuth';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { FiUser, FiPhone, FiSave, FiX } from 'react-icons/fi';

export default function UpdateProfile({ onClose }) {
  const { user, updateProfile, isLoading } = useAuth();

  const handleSubmit = async (values, { setSubmitting }) => {
    const result = await updateProfile(user.id, values);
    if (result.meta.requestStatus === 'fulfilled') {
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <Modal onClose={onClose} title="Edit Profile">
      <Formik
        initialValues={{
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          phoneNumber: user?.phoneNumber || '',
          profileImageUrl: user?.profileImageUrl || '',
        }}
        validationSchema={updateProfileSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, handleChange, handleBlur, touched, errors }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                placeholder="John"
                icon={<FiUser className="text-gray-400" />}
                value={values.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.firstName && errors.firstName}
              />
              <Input
                label="Last Name"
                name="lastName"
                placeholder="Doe"
                icon={<FiUser className="text-gray-400" />}
                value={values.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.lastName && errors.lastName}
              />
            </div>

            <Input
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              placeholder="9876543210"
              icon={<FiPhone className="text-gray-400" />}
              value={values.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.phoneNumber && errors.phoneNumber}
            />

            <Input
              label="Profile Image URL"
              name="profileImageUrl"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              icon={<FiUser className="text-gray-400" />}
              value={values.profileImageUrl}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.profileImageUrl && errors.profileImageUrl}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                icon={<FiX />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting || isLoading}
                icon={<FiSave />}
              >
                Save Changes
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}