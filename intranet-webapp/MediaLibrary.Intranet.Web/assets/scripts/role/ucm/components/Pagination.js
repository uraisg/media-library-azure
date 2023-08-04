import { React } from "react";
import { useState } from "react";
import { useFilter } from './@/../../../ucm/components/context'
import ReactPaginate from 'react-paginate';

const Page = () => {
  const filtercontext = useFilter()

  const onPageChange = (page) => {
    const selectedPage = page.selected + 1
    const SkipPage = pageSize * page.selected
    const temp = { ...filtercontext.active, "Page": selectedPage, "currPageCount": SkipPage, "pagelimit": pageSize }
    filtercontext.setActive(temp)
  };

  const [pageSize, setPageSize] = useState(10);
  const pageSizes = [10, 20, 50, 150, 200];

  const handlePageSizeChange = (event) => {
    const pagesizeselected = event.target.value
    setPageSize(event.target.value);
    const temp = { ...filtercontext.active, "currPageCount": pagesizeselected, "pagelimit": pagesizeselected }
    filtercontext.setActive(temp)
  };

  return (

    <div>
      {filtercontext.disablesearch ? (
      null
      ) : <>
          {"Items per Page: "}
          <select onChange={handlePageSizeChange} value={pageSize} className="mr-3 " disabled={filtercontext.disablesearch}>
            {pageSizes.map((size) => (
              <option key={size} value={size} >
                {size}
              </option>
            ))}
          </select>

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
            pageCount={filtercontext.page.TotalPage}
            pageRangeDisplayed={5}
          />

          </>
      }


    </div>
  );
};

export default Page;
