import { useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Modal } from "bootstrap";

const { VITE_BASE_URL, VITE_API_PATH } = import.meta.env;
function DelProductModal({ tempProduct, delProductModal, getProducts }) {
  useEffect(() => {
    new Modal(delProductModal.current, { backdrop: false });
  }, []);

  async function handleDeleteProduct(id) {
    try {
      await axios.delete(
        `${VITE_BASE_URL}/v2/api/${VITE_API_PATH}/admin/product/${id}`,
      );
      alert("刪除成功");
      getProducts();
      handleCloseDelModal();
    } catch (error) {
      alert("刪除失敗," + error.response.data.message);
    }
  }

  function handleCloseDelModal() {
    Modal.getInstance(delProductModal.current).hide();
  }

  return (
    <>
      <div
        className="modal fade"
        id="delProductModal"
        ref={delProductModal}
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">刪除產品</h1>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseDelModal}
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              你是否要刪除
              <span className="text-danger fw-bold">{tempProduct.title}</span>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseDelModal}
              >
                取消
              </button>
              <button
                onClick={() => handleDeleteProduct(tempProduct.id)}
                type="button"
                className="btn btn-danger"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

DelProductModal.propTypes = {
  tempProduct: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
  }),
  delProductModal: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }),
  getProducts: PropTypes.func,
};

export default DelProductModal;
