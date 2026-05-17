import { useEffect, useState } from 'react';
import { useNotification } from '../hooks/useNotification';
import { FiMail, FiPhone, FiBell, FiShoppingBag, FiPercent, FiCreditCard, FiMessageCircle, FiSave } from 'react-icons/fi';

export default function NotificationPreferences() {
  const { preferences, isLoading, getPreferences, updateUserPreferences } = useNotification();
  const [contactForm, setContactForm] = useState({ phoneNumber: '', whatsappNumber: '' });

  useEffect(() => {
    getPreferences();
  }, []);

  useEffect(() => {
    if (preferences) {
      setContactForm({
        phoneNumber: preferences.phoneNumber || '',
        whatsappNumber: preferences.whatsappNumber || preferences.phoneNumber || '',
      });
    }
  }, [preferences]);

  const handleToggle = async (key, value) => {
    await updateUserPreferences({ [key]: !value });
  };

  const handleContactSave = async () => {
    await updateUserPreferences(contactForm);
  };

  if (isLoading && !preferences) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-xl"></div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  const preferenceSections = [
    {
      title: 'Notification Channels',
      icon: <FiBell className="w-5 h-5" />,
      preferences: [
        { key: 'emailEnabled', label: 'Email Notifications', icon: <FiMail className="w-4 h-4" />, description: 'Receive notifications via email' },
        { key: 'smsEnabled', label: 'SMS Notifications', icon: <FiPhone className="w-4 h-4" />, description: 'Receive notifications via SMS' },
        { key: 'whatsappEnabled', label: 'WhatsApp Notifications', icon: <FiMessageCircle className="w-4 h-4" />, description: 'Receive important updates on WhatsApp' },
        { key: 'pushEnabled', label: 'Push Notifications', icon: <FiBell className="w-4 h-4" />, description: 'Receive push notifications in browser' },
      ],
    },
    {
      title: 'Notification Types',
      icon: <FiShoppingBag className="w-5 h-5" />,
      preferences: [
        { key: 'orderUpdatesEnabled', label: 'Order Updates', icon: <FiShoppingBag className="w-4 h-4" />, description: 'Order confirmation, status changes, delivery updates' },
        { key: 'promotionalEnabled', label: 'Promotions & Offers', icon: <FiPercent className="w-4 h-4" />, description: 'Special offers, discounts, and deals' },
        { key: 'paymentAlertsEnabled', label: 'Payment Alerts', icon: <FiCreditCard className="w-4 h-4" />, description: 'Payment success, failure, and refund alerts' },
      ],
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FiBell className="text-orange-500" /> Notification Preferences
        </h2>
        <p className="text-sm text-gray-500 mt-1">Choose how you want to receive notifications</p>
      </div>

      <div className="space-y-6">
        {preferenceSections.map((section) => (
          <div key={section.title} className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {section.icon}
                <h3 className="font-medium text-gray-800">{section.title}</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {section.preferences.map((pref) => (
                <div key={pref.key} className="flex items-center justify-between p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-gray-400 mt-0.5">{pref.icon}</div>
                    <div>
                      <p className="font-medium text-gray-800">{pref.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{pref.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(pref.key, preferences?.[pref.key])}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences?.[pref.key] ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences?.[pref.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FiPhone className="w-5 h-5" />
              <h3 className="font-medium text-gray-800">Delivery Contact</h3>
            </div>
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="block">
              <span className="text-xs font-medium text-gray-500">SMS Number</span>
              <input
                type="tel"
                value={contactForm.phoneNumber}
                onChange={(event) => setContactForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                placeholder="9876543210"
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-500">WhatsApp Number</span>
              <input
                type="tel"
                value={contactForm.whatsappNumber}
                onChange={(event) => setContactForm((prev) => ({ ...prev, whatsappNumber: event.target.value }))}
                placeholder="9876543210"
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>
            <button
              type="button"
              onClick={handleContactSave}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiSave className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-500 text-center">
          You can change these preferences anytime. We'll never spam you.
        </p>
      </div>
    </div>
  );
}
