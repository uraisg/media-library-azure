import React from 'react'
import PropTypes from 'prop-types'
import { styled } from '@linaria/react'
import DateFilter from '@/components/DateFilter'
import SpatialFilter from '@/components/SpatialFilter'
import LayoutTypeSwitch from '@/components/LayoutTypeSwitch'
import ToggleSwitch from '@/components/ToggleSwitch'

const Container = styled.div`
  padding: 1rem;
  margin: 0 -0.25rem;
  display: flex;
  justify-content: space-between;
`

const PushRight = styled.div`
  margin: 0 0.25rem 0 auto;
  flex-direction: row;
`
const FilterSettings = ({
  filters,
  setFilters,
  areas,
  popupChecked,
  setPopupChecked,
  gridView,
  onSetView,
}) => {
  return (
    <Container>
      <SpatialFilter filters={filters} setFilters={setFilters} areas={areas} />
      <DateFilter filters={filters} setFilters={setFilters} />
      <PushRight>
        <ToggleSwitch popupChecked={popupChecked} setPopupChecked={setPopupChecked} />
        <LayoutTypeSwitch gridView={gridView} setGridView={onSetView} />
      </PushRight>
    </Container>
  )
}

FilterSettings.propTypes = {
  filters: PropTypes.object.isRequired,
  setFilters: PropTypes.func.isRequired,
  areas: PropTypes.array.isRequired,
  popupChecked: PropTypes.bool,
  setPopupChecked: PropTypes.func,
  gridView: PropTypes.bool.isRequired,
  onSetView: PropTypes.func.isRequired,
}

export default FilterSettings
