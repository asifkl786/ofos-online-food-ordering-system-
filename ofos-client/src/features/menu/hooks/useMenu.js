import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchMenuItems, 
  searchMenuItems, 
  clearMenu,
  setSelectedCategory,
  setSearchKeyword,
  setVegFilter,
  filterMenu
} from '../slices/menuSlice';

export const useMenu = () => {
  const dispatch = useDispatch();
  const { 
    items, 
    filteredItems, 
    isLoading, 
    error, 
    pagination,
    selectedCategory,
    searchKeyword,
    isVegFilter
  } = useSelector((state) => state.menu);

  const getMenuItems = (restaurantId, page = 0, size = 50) => {
    dispatch(fetchMenuItems({ restaurantId, page, size }));
  };

  const searchItems = (restaurantId, keyword, page = 0, size = 50) => {
    dispatch(searchMenuItems({ restaurantId, keyword, page, size }));
  };

  const clearMenuData = () => {
    dispatch(clearMenu());
  };

  const selectCategory = (categoryId) => {
    dispatch(setSelectedCategory(categoryId));
    dispatch(filterMenu());
  };

  const setSearch = (keyword) => {
    dispatch(setSearchKeyword(keyword));
    dispatch(filterMenu());
  };

  const toggleVegFilter = () => {
    dispatch(setVegFilter(!isVegFilter));
    dispatch(filterMenu());
  };

  const clearFilters = () => {
    dispatch(setSelectedCategory(null));
    dispatch(setSearchKeyword(''));
    dispatch(setVegFilter(false));
    dispatch(filterMenu());
  };

  return {
    // State
    items,
    filteredItems,
    isLoading,
    error,
    pagination,
    selectedCategory,
    searchKeyword,
    isVegFilter,
    
    // Actions
    getMenuItems,
    searchItems,
    clearMenuData,
    selectCategory,
    setSearch,
    toggleVegFilter,
    clearFilters,
  };
};