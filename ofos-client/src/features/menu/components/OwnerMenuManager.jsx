import { useEffect, useMemo, useState } from 'react';
import { FiCheckCircle, FiEdit3, FiEye, FiImage, FiPackage, FiPlus, FiRefreshCw, FiTag, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { menuService } from '../services/menuService';
import { ButtonLoader } from '../../../components/common/Loader';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  preparationTime: '',
  categoryId: '',
  discountPercentage: '0',
  maxOrderQuantity: '10',
  imageUrl: '',
  isAvailable: true,
  isVegetarian: false,
  isVegan: false,
  isGlutenFree: false,
  isSpicy: false,
};

const DEFAULT_MENU_IMAGE_URL = 'https://placehold.co/640x420/fff7ed/f97316?text=Food+Item';

const imagePresets = [
  { label: 'Food', url: DEFAULT_MENU_IMAGE_URL },
  { label: 'Veg', url: 'https://placehold.co/640x420/ecfdf5/047857?text=Veg+Food' },
  { label: 'Non Veg', url: 'https://placehold.co/640x420/fff1f2/be123c?text=Non+Veg' },
  { label: 'Dessert', url: 'https://placehold.co/640x420/fdf2f8/be185d?text=Dessert' },
];

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:bg-slate-100';
const labelClass = 'mb-1 block text-sm font-semibold text-slate-700';

export default function OwnerMenuManager({ restaurant, isOpen, onClose }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categorySaving, setCategorySaving] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [actionId, setActionId] = useState(null);

  const restaurantId = restaurant?.id;

  const visibleCategories = useMemo(() => categories.filter((category) => category.isActive !== false), [categories]);

  const loadMenuData = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const menuResponse = await menuService.getMenuItemsByRestaurant(restaurantId, 0, 100);
      let categoryResponse = null;
      try {
        categoryResponse = await menuService.getActiveCategories();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Categories load nahi ho pa rahi, menu items phir bhi show honge');
      }
      const categoryData = categoryResponse?.data?.data;
      setItems(menuResponse.data?.data?.content || []);
      setCategories(Array.isArray(categoryData) ? categoryData : categoryData?.content || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Menu items load nahi ho pa rahe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm);
      setEditingItem(null);
      setSelectedDetailItem(null);
      setNewCategoryName('');
      loadMenuData();
    }
  }, [isOpen, restaurantId]);

  if (!isOpen || !restaurant) return null;

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditingItem(null);
    setNewCategoryName('');
  };

  const startEditItem = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name || '',
      description: item.description || '',
      price: item.price ? String(item.price) : '',
      preparationTime: item.preparationTime ? String(item.preparationTime) : '',
      categoryId: item.categoryId ? String(item.categoryId) : '',
      discountPercentage: item.discountPercentage != null ? String(item.discountPercentage) : '0',
      maxOrderQuantity: item.maxOrderQuantity ? String(item.maxOrderQuantity) : '10',
      imageUrl: item.imageUrl || '',
      isAvailable: item.isAvailable !== false,
      isVegetarian: Boolean(item.isVegetarian),
      isVegan: Boolean(item.isVegan),
      isGlutenFree: Boolean(item.isGlutenFree),
      isSpicy: Boolean(item.isSpicy),
    });
  };

  const openItemDetails = (item) => setSelectedDetailItem(item);

  const validateForm = () => {
    if (form.name.trim().length < 2) return 'Item name minimum 2 characters hona chahiye';
    if (!form.price || Number(form.price) <= 0) return 'Valid price enter karein';
    if (!form.categoryId) return 'Menu item ke liye category select ya create karein';
    if (form.preparationTime && Number(form.preparationTime) < 0) return 'Preparation time negative nahi ho sakta';
    const discount = Number(form.discountPercentage || 0);
    if (discount < 0 || discount > 100) return 'Discount 0 se 100 ke beech hona chahiye';
    if (form.maxOrderQuantity && Number(form.maxOrderQuantity) <= 0) return 'Max order quantity valid honi chahiye';
    return null;
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    description: form.description.trim() || null,
    price: Number(form.price),
    preparationTime: form.preparationTime ? Number(form.preparationTime) : null,
    imageUrl: form.imageUrl.trim() || DEFAULT_MENU_IMAGE_URL,
    categoryId: form.categoryId ? Number(form.categoryId) : null,
    discountPercentage: Number(form.discountPercentage || 0),
    maxOrderQuantity: Number(form.maxOrderQuantity || 10),
    isAvailable: Boolean(form.isAvailable),
    isVegetarian: Boolean(form.isVegetarian),
    isVegan: Boolean(form.isVegan),
    isGlutenFree: Boolean(form.isGlutenFree),
    isSpicy: Boolean(form.isSpicy),
  });

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (name.length < 2) {
      toast.error('Category name minimum 2 characters hona chahiye');
      return;
    }

    setCategorySaving(true);
    try {
      const response = await menuService.createCategory({
        name,
        description: name + ' menu category',
        imageUrl: DEFAULT_MENU_IMAGE_URL,
        displayOrder: visibleCategories.length + 1,
      });
      const createdCategory = response.data?.data;
      if (createdCategory?.id) {
        setCategories((current) => [...current, createdCategory]);
        setForm((current) => ({ ...current, categoryId: String(createdCategory.id) }));
      }
      setNewCategoryName('');
      toast.success('Category created and selected');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Category create nahi ho pa rahi');
    } finally {
      setCategorySaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const message = validateForm();
    if (message) {
      toast.error(message);
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await menuService.updateMenuItem(editingItem.id, buildPayload());
        toast.success('Menu item updated successfully');
      } else {
        await menuService.createMenuItem(restaurantId, buildPayload());
        toast.success('Menu item added successfully');
      }
      resetForm();
      await loadMenuData();
    } catch (error) {
      toast.error(error.response?.data?.message || (editingItem ? 'Menu item update nahi ho pa raha' : 'Menu item add nahi ho pa raha'));
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (item) => {
    setActionId(item.id);
    try {
      await menuService.updateMenuItemAvailability(item.id, !item.isAvailable);
      toast.success('Menu availability updated');
      await loadMenuData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Availability update failed');
    } finally {
      setActionId(null);
    }
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`${item.name} delete karna hai?`)) return;
    setActionId(item.id);
    try {
      await menuService.deleteMenuItem(item.id);
      toast.success('Menu item deleted');
      await loadMenuData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Menu item delete nahi ho pa raha');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-md sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-orange-100 bg-gradient-to-r from-orange-50 via-white to-rose-50 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">Owner menu control</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{restaurant.name} Menu</h2>
            <p className="mt-1 text-sm text-slate-500">Add items, control visibility, and keep your customer menu fresh.</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm hover:text-orange-600 disabled:opacity-50" aria-label="Close menu manager">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="grid overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:grid-cols-[380px_1fr] lg:gap-5">
          <form onSubmit={handleSubmit} className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:mb-0">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-xl bg-orange-100 p-2 text-orange-600"><FiPlus /></span>
              <div>
                <h3 className="font-bold text-slate-900">{editingItem ? 'Update Menu Item' : 'Add Menu Item'}</h3>
                <p className="text-sm text-slate-500">{editingItem ? 'Selected item details update karein.' : 'Required fields: name and price.'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className={labelClass}>Item Name *</label>
                <input className={inputClass} value={form.name} disabled={saving} onChange={(event) => updateForm('name', event.target.value)} placeholder="e.g., Paneer Butter Masala" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Price *</label>
                  <input className={inputClass} type="number" min="1" value={form.price} disabled={saving} onChange={(event) => updateForm('price', event.target.value)} placeholder="199" />
                </div>
                <div>
                  <label className={labelClass}>Prep Min</label>
                  <input className={inputClass} type="number" min="0" value={form.preparationTime} disabled={saving} onChange={(event) => updateForm('preparationTime', event.target.value)} placeholder="20" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Category *</label>
                <select className={inputClass} value={form.categoryId} disabled={saving || categorySaving} onChange={(event) => updateForm('categoryId', event.target.value)}>
                  <option value="">Select category</option>
                  {visibleCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                {visibleCategories.length === 0 && (
                  <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                    Categories available nahi hain. Neeche ek category create karein, phir item save hoga.
                  </p>
                )}
                <div className="mt-2 flex gap-2">
                  <input className={inputClass} value={newCategoryName} disabled={saving || categorySaving} onChange={(event) => setNewCategoryName(event.target.value)} placeholder="e.g., Mughlai, Starter" />
                  <button type="button" onClick={handleCreateCategory} disabled={saving || categorySaving || newCategoryName.trim().length < 2} className="inline-flex min-w-24 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white disabled:opacity-60">
                    {categorySaving ? <ButtonLoader /> : <FiPlus />}
                    Add
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Discount %</label>
                  <input className={inputClass} type="number" min="0" max="100" value={form.discountPercentage} disabled={saving} onChange={(event) => updateForm('discountPercentage', event.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Max Qty</label>
                  <input className={inputClass} type="number" min="1" value={form.maxOrderQuantity} disabled={saving} onChange={(event) => updateForm('maxOrderQuantity', event.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Image</label>
                <input className={inputClass} value={form.imageUrl} disabled={saving} onChange={(event) => updateForm('imageUrl', event.target.value)} placeholder="Optional: paste image link or use preset" />
                <p className="mt-1 text-xs text-slate-500">Image URL optional hai. Empty chhodne par clean default food image use hogi.</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {imagePresets.map((preset) => (
                    <button key={preset.label} type="button" disabled={saving} onClick={() => updateForm('imageUrl', preset.url)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-orange-200 hover:bg-orange-50 disabled:opacity-60">
                      <FiImage /> {preset.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <img src={form.imageUrl || DEFAULT_MENU_IMAGE_URL} alt="Menu item preview" className="h-24 w-full object-cover" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea className={`${inputClass} min-h-20 resize-none`} value={form.description} disabled={saving} onChange={(event) => updateForm('description', event.target.value)} placeholder="Taste, portion size, spice level..." />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
                <Toggle label="Available" checked={form.isAvailable} disabled={saving} onChange={(value) => updateForm('isAvailable', value)} />
                <Toggle label="Vegetarian" checked={form.isVegetarian} disabled={saving} onChange={(value) => updateForm('isVegetarian', value)} />
                <Toggle label="Vegan" checked={form.isVegan} disabled={saving} onChange={(value) => updateForm('isVegan', value)} />
                <Toggle label="Gluten Free" checked={form.isGlutenFree} disabled={saving} onChange={(value) => updateForm('isGlutenFree', value)} />
                <Toggle label="Spicy" checked={form.isSpicy} disabled={saving} onChange={(value) => updateForm('isSpicy', value)} />
              </div>
              {editingItem && (
                <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">
                  Editing: {editingItem.name}
                </div>
              )}
              <div className="grid gap-2 sm:grid-cols-2">
                {editingItem && (
                  <button type="button" onClick={resetForm} disabled={saving || categorySaving} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                    <FiX /> Cancel Edit
                  </button>
                )}
                <button type="submit" disabled={saving || categorySaving} className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-100 disabled:opacity-70 ${editingItem ? '' : 'sm:col-span-2'}`}>
                  {saving ? <ButtonLoader /> : editingItem ? <FiEdit3 /> : <FiPackage />}
                  {saving ? (editingItem ? 'Updating Item...' : 'Adding Item...') : editingItem ? 'Update Menu Item' : 'Add Menu Item'}
                </button>
              </div>
            </div>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900">Menu Items</h3>
                <p className="text-sm text-slate-500">{items.length} items in this restaurant.</p>
              </div>
              <button type="button" onClick={loadMenuData} disabled={loading || saving} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 p-10 text-slate-500">
                <FiRefreshCw className="mr-2 animate-spin" /> Loading menu items...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 p-8 text-center">
                <FiPackage className="mx-auto mb-3 h-9 w-9 text-orange-500" />
                <h4 className="font-bold text-slate-900">No menu items yet</h4>
                <p className="mt-1 text-sm text-slate-500">Left side form se first item add karein.</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-orange-200 hover:shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-slate-900">{item.name}</h4>
                        <p className="text-xs text-slate-500">{item.categoryName || 'Uncategorized'}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {item.isAvailable ? 'Available' : 'Hidden'}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">{item.description || 'No description added'}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-bold text-slate-900">Rs. {item.discountedPrice || item.price}</span>
                      {Number(item.discountPercentage || 0) > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600"><FiTag /> {item.discountPercentage}% off</span>}
                      {item.isVegetarian && <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Veg</span>}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button type="button" onClick={() => toggleAvailability(item)} disabled={actionId === item.id} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                        {actionId === item.id ? <ButtonLoader /> : <FiCheckCircle />}
                        {item.isAvailable ? 'Hide' : 'Show'}
                      </button>
                      <button type="button" onClick={() => openItemDetails(item)} disabled={actionId === item.id} className="inline-flex items-center justify-center rounded-xl border border-blue-100 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-60" title="View menu item details" aria-label="View menu item details">
                        <FiEye />
                      </button>
                      <button type="button" onClick={() => startEditItem(item)} disabled={actionId === item.id || saving} className="inline-flex items-center justify-center rounded-xl border border-orange-100 px-3 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 disabled:opacity-60" title="Edit menu item" aria-label="Edit menu item">
                        <FiEdit3 />
                      </button>
                      <button type="button" onClick={() => deleteItem(item)} disabled={actionId === item.id} className="inline-flex items-center justify-center rounded-xl border border-red-100 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60" title="Delete menu item" aria-label="Delete menu item">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedDetailItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="relative h-44 bg-slate-100">
              <img src={selectedDetailItem.imageUrl || DEFAULT_MENU_IMAGE_URL} alt={selectedDetailItem.name} className="h-full w-full object-cover" />
              <button type="button" onClick={() => setSelectedDetailItem(null)} className="absolute right-4 top-4 rounded-full bg-white/95 p-2 text-slate-600 shadow-lg hover:text-orange-600" aria-label="Close details">
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Menu Item Details</p>
                  <h3 className="mt-1 text-2xl font-black text-slate-900">{selectedDetailItem.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{selectedDetailItem.categoryName || 'Uncategorized'}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${selectedDetailItem.isAvailable ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {selectedDetailItem.isAvailable ? 'Available' : 'Hidden'}
                </span>
              </div>
              <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{selectedDetailItem.description || 'No description added'}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <DetailPill label="Price" value={`Rs. ${selectedDetailItem.discountedPrice || selectedDetailItem.price}`} />
                <DetailPill label="Discount" value={`${selectedDetailItem.discountPercentage || 0}%`} />
                <DetailPill label="Prep Time" value={selectedDetailItem.preparationTime ? `${selectedDetailItem.preparationTime} min` : 'Not set'} />
                <DetailPill label="Max Qty" value={selectedDetailItem.maxOrderQuantity || 10} />
                <DetailPill label="Rating" value={selectedDetailItem.averageRating || '0.0'} />
                <DetailPill label="Total Orders" value={selectedDetailItem.totalOrders || 0} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedDetailItem.isVegetarian && <Badge>Vegetarian</Badge>}
                {selectedDetailItem.isVegan && <Badge>Vegan</Badge>}
                {selectedDetailItem.isGlutenFree && <Badge>Gluten Free</Badge>}
                {selectedDetailItem.isSpicy && <Badge>Spicy</Badge>}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => { startEditItem(selectedDetailItem); setSelectedDetailItem(null); }} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600">
                  <FiEdit3 /> Edit Item
                </button>
                <button type="button" onClick={() => setSelectedDetailItem(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({ label, checked, disabled, onChange }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400" />
      <span>{label}</span>
    </label>
  );
}


function DetailPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Badge({ children }) {
  return <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{children}</span>;
}
