import { Formik, Form } from 'formik';
import { changePasswordSchema } from '../schemas/authSchemas';
import { useAuth } from '../hooks/useAuth';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { FiLock, FiSave, FiX } from 'react-icons/fi';

export default function ChangePassword({ onClose }) {
  const { user, changePassword, isLoading } = useAuth();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const result = await changePassword(user.id, {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    if (result.meta.requestStatus === 'fulfilled') {
      resetForm();
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <Modal onClose={onClose} title="Change Password">
      <Formik
        initialValues={{
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        }}
        validationSchema={changePasswordSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, handleChange, handleBlur, touched, errors }) => (
          <Form className="space-y-4">
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              placeholder="Enter your current password"
              icon={<FiLock className="text-gray-400" />}
              value={values.currentPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.currentPassword && errors.currentPassword}
            />

            <Input
              label="New Password"
              name="newPassword"
              type="password"
              placeholder="Create a new password"
              icon={<FiLock className="text-gray-400" />}
              value={values.newPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.newPassword && errors.newPassword}
            />

            <Input
              label="Confirm New Password"
              name="confirmNewPassword"
              type="password"
              placeholder="Confirm your new password"
              icon={<FiLock className="text-gray-400" />}
              value={values.confirmNewPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.confirmNewPassword && errors.confirmNewPassword}
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
                Update Password
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}