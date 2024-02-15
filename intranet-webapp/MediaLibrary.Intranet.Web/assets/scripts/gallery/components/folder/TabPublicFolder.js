import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getSearchResults,
  selectSearchResult,
  setGridView,
} from '@/slices/gallerySlice';
import SearchResultsView from '@/components/SearchResultsView'

const TabPublicFolder = () => {
  const dispatch = useDispatch();
  const {
    isFetching,
    results,
    page,
    totalPages,
    gridView,
    searchTerm,
    filters,
  } = useSelector((state) => state.gallery);

  useEffect(() => {
    // Fetch search results based on filters, searchTerm, and page
    dispatch(getSearchResults(searchTerm, filters, page));
  }, [dispatch, searchTerm, filters, page]);

  const onPageChange = (data) => {
    // Handle page change
    const selectedPage = data.selected + 1;
    dispatch(getSearchResults(searchTerm, filters, selectedPage));
  };

  const handleSelectResult = (resultId) => {
    // Handle selection of a search result
    dispatch(selectSearchResult(resultId));
    // Possibly scroll or perform other actions
  };

  const handleSetView = (viewType) => {
    // Handle grid/list view change
    dispatch(setGridView(viewType));
  };

  return (
    /* Your JSX/UI components for UnifiedSearchView using props from useSelector */
    // Example usage:
    <SearchResultsView
      isFetching={isFetching}
      results={results}
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      gridView={gridView}
      onSelectResult={handleSelectResult}
      onSetView={handleSetView}
    />
  );
};

export default TabPublicFolder;
