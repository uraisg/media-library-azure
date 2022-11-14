import React from 'react'
import PropTypes from 'prop-types'
import { styled } from '@linaria/react'
import DateFilter from '@/components/DateFilter'
import SpatialFilter from '@/components/SpatialFilter'
import LayoutTypeSwitch from '@/components/LayoutTypeSwitch'

const Container = styled.div`
  padding: 1rem;
  margin: 0 -0.25rem;
  display: flex;
  justify-content: space-between;
`

const PushRight = styled.div`
  margin: 0 0.25rem 0 auto;
`
const FilterSettings = ({
  filters,
  setFilters,
  areas,
  gridView,
  onSetView,
}) => {
  return (
    <Container>
      <SpatialFilter filters={filters} setFilters={setFilters} areas={areas} />
      <DateFilter filters={filters} setFilters={setFilters} />
      <PushRight>
        <LayoutTypeSwitch gridView={gridView} setGridView={onSetView} />
      </PushRight>
    </Container>
  )
}

FilterSettings.propTypes = {
  filters: PropTypes.object.isRequired,
  setFilters: PropTypes.func.isRequired,
  areas: PropTypes.array.isRequired,
  gridView: PropTypes.bool.isRequired,
  onSetView: PropTypes.func.isRequired,
}

export default FilterSettings
