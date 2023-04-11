import { React } from "react";
import { useState, useEffect } from "react";
import { useFilter } from './@/../../../ucm/components/context'
import ReactPaginate from 'react-paginate';



const Page = () => {
  const filtercontext = useFilter()

  const onPageChange = (page) => {
    const temp = { ...filtercontext.active, "page": page }
    filtercontext.setActive(temp)
  };

  return (

    <div>

      <ReactPaginate
        containerClassName="pagination pagination-sm"
        breakClassName="page-item"
        breakLinkClassName="page-link"
        pageClassName="page-item"
        previousClassName="page-item"
        nextClassName="page-item"
        pageLinkClassName="page-link"
        previousLinkClassName="page-link"
        nextLinkClassName="page-link"
        activeClassName="active"
        onPageChange={onPageChange}
       // forcePage={2}
        pageCount={5}
        pageRangeDisplayed={5}
        marginPagesDisplayed={1}
      />
    </div>
  );

};

export default Page;
