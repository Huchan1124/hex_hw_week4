import PropTypes from "prop-types";

function Pagination({ getProducts, pageInfo }) {
  async function handlePageChange(page) {
    await getProducts(page);
  }

  return (
    <>
      <nav>
        <ul className="pagination">
          <li
            className={`page-item ${!pageInfo.has_pre && "disabled"}`}
            onClick={
              !pageInfo.has_pre
                ? null
                : () => handlePageChange(pageInfo.current_page - 1)
            }
          >
            <a className="page-link" href="#">
              上一頁
            </a>
          </li>

          {Array.from({ length: pageInfo.total_pages }).map((_, index) => (
            <li
              className={`page-item ${pageInfo.current_page === index + 1 && "active"}`}
              key={index}
              onClick={() => handlePageChange(index + 1)}
            >
              <a className="page-link" href="#">
                {index + 1}
              </a>
            </li>
          ))}
          <li
            className={`page-item ${!pageInfo.has_next && "disabled"}`}
            onClick={
              !pageInfo.has_next
                ? null
                : () => handlePageChange(pageInfo.current_page + 1)
            }
          >
            <a className="page-link" href="#">
              下一頁
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}

Pagination.propTypes = {
  getProducts: PropTypes.func,
  pageInfo: PropTypes.shape({
    has_pre: PropTypes.bool,
    has_next: PropTypes.bool,
    current_page: PropTypes.number,
    total_pages: PropTypes.number,
  }),
};

export default Pagination;
