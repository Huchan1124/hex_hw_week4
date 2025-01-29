import { useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Modal } from "bootstrap";

const { VITE_BASE_URL, VITE_API_PATH } = import.meta.env;

function ProductModal({
  productModalRef,
  modalMode,
  tempProduct,
  setTempProduct,
  getProducts,
}) {
  function handleCloseProductModal() {
    Modal.getInstance(productModalRef.current).hide();
  }

  function handleModalInputChange(e) {
    const { name, value, checked, type } = e.target;
    let newValue;

    if (type === "checkbox") {
      newValue = checked ? 1 : 0;
    } else if (name === "origin_price" || name === "price") {
      newValue = Number(value);
    } else {
      newValue = value;
    }

    setTempProduct({
      ...tempProduct,
      [name]: newValue,
    });
  }

  function handleImagesUrlChange(e, index) {
    const { value } = e.target;
    const newImagesUrl = [...tempProduct.imagesUrl];
    newImagesUrl[index] = value;
    setTempProduct({ ...tempProduct, imagesUrl: newImagesUrl });
  }

  function handleAddImagesUrl() {
    const newImagesUrl = [...tempProduct.imagesUrl, ""];
    setTempProduct({ ...tempProduct, imagesUrl: newImagesUrl });
  }

  function handleRemoveImagesUrl() {
    const newImagesUrl = [...tempProduct.imagesUrl];
    newImagesUrl.pop();
    setTempProduct({ ...tempProduct, imagesUrl: newImagesUrl });
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];

    const formData = new FormData();

    formData.append("file-to-upload", file);

    try {
      const { data } = await axios.post(
        `${VITE_BASE_URL}/v2/api/${VITE_API_PATH}/admin/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setTempProduct({
        ...tempProduct,
        imageUrl: data.imageUrl,
      });
    } catch (error) {
      alert("上傳圖片失敗," + error.response.data.message);
    }
  }

  async function handleUpdateProduct() {
    try {
      const apiCall = modalMode === "create" ? createProduct : updateProduct;
      await apiCall();
      getProducts();
      handleCloseProductModal();
    } catch (error) {
      alert("更新產品失敗," + error.response.data.message);
    }
  }

  async function createProduct() {
    try {
      await axios.post(
        `${VITE_BASE_URL}/v2/api/${VITE_API_PATH}/admin/product`,
        {
          data: {
            ...tempProduct,
            origin_price: Number(tempProduct.origin_price),
            price: Number(tempProduct.price),
          },
        },
      );
      alert("新增產品成功");
    } catch (error) {
      alert("新增產品失敗," + error.response.data.message);
    }
  }

  async function updateProduct() {
    try {
      await axios.put(
        `${VITE_BASE_URL}/v2/api/${VITE_API_PATH}/admin/product/${tempProduct.id}`,
        {
          data: {
            ...tempProduct,
            origin_price: Number(tempProduct.origin_price),
            price: Number(tempProduct.price),
          },
        },
      );
      alert("更新產品成功");
    } catch (error) {
      alert("更新產品失敗," + error.response.data.message);
    }
  }

  useEffect(() => {
    new Modal(productModalRef.current, { backdrop: false });
  }, []);

  return (
    <>
      <div
        id="productModal"
        ref={productModalRef}
        className="modal fade"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom">
              <h5 className="modal-title fs-4">
                {modalMode === "create" ? "新增產品" : "編輯產品"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseProductModal}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body p-4">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="mb-4">
                    <label htmlFor="fileInput" className="form-label">
                      {" "}
                      主圖上傳{" "}
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png"
                      className="form-control"
                      id="fileInput"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="primary-image" className="form-label">
                      主圖
                    </label>
                    <div className="input-group">
                      <input
                        name="imageUrl"
                        onChange={handleModalInputChange}
                        value={tempProduct.imageUrl}
                        type="text"
                        id="primary-image"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                      />
                    </div>

                    {tempProduct.imageUrl && (
                      <img
                        src={tempProduct.imageUrl}
                        alt="主圖"
                        className="img-fluid"
                      />
                    )}
                  </div>
                  {/* 副圖 */}
                  <div className="border border-2 border-dashed rounded-3 p-3">
                    {tempProduct.imagesUrl?.map((image, index) => (
                      <div key={index} className="mb-2">
                        <label
                          htmlFor={`imagesUrl-${index + 1}`}
                          className="form-label"
                        >
                          副圖 {index + 1}
                        </label>
                        <input
                          id={`imagesUrl-${index + 1}`}
                          type="text"
                          value={image}
                          onChange={(e) => handleImagesUrlChange(e, index)}
                          placeholder={`圖片網址 ${index + 1}`}
                          className="form-control mb-2"
                        />
                        {image && (
                          <img
                            src={image}
                            alt={`副圖 ${index + 1}`}
                            className="img-fluid mb-2"
                          />
                        )}
                      </div>
                    ))}
                    <div className="btn-group w-100 mt-3">
                      {tempProduct.imagesUrl.length < 5 &&
                        tempProduct.imagesUrl[
                          tempProduct.imagesUrl.length - 1
                        ] !== "" && (
                          <button
                            className="btn btn-outline-primary btn-sm w-100"
                            onClick={handleAddImagesUrl}
                          >
                            新增圖片
                          </button>
                        )}
                      {tempProduct.imagesUrl.length > 1 && (
                        <button
                          className="btn btn-outline-danger btn-sm w-100"
                          onClick={handleRemoveImagesUrl}
                        >
                          取消圖片
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                    <input
                      name="title"
                      onChange={handleModalInputChange}
                      value={tempProduct.title}
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                      分類
                    </label>
                    <input
                      name="category"
                      onChange={handleModalInputChange}
                      value={tempProduct.category}
                      id="category"
                      type="text"
                      className="form-control"
                      placeholder="請輸入分類"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="unit" className="form-label">
                      單位
                    </label>
                    <input
                      name="unit"
                      onChange={handleModalInputChange}
                      value={tempProduct.unit}
                      id="unit"
                      type="text"
                      className="form-control"
                      placeholder="請輸入單位"
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        name="origin_price"
                        onChange={handleModalInputChange}
                        value={tempProduct.origin_price}
                        id="origin_price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入原價"
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        name="price"
                        onChange={handleModalInputChange}
                        value={tempProduct.price}
                        id="price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入售價"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      name="description"
                      onChange={handleModalInputChange}
                      value={tempProduct.description}
                      id="description"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入產品描述"
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      name="content"
                      onChange={handleModalInputChange}
                      value={tempProduct.content}
                      id="content"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入說明內容"
                    ></textarea>
                  </div>

                  <div className="form-check">
                    <input
                      name="is_enabled"
                      onChange={handleModalInputChange}
                      checked={tempProduct.is_enabled}
                      type="checkbox"
                      className="form-check-input"
                      id="isEnabled"
                    />
                    <label className="form-check-label" htmlFor="isEnabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top bg-light">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseProductModal}
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleUpdateProduct()}
              >
                確認
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

ProductModal.propTypes = {
  productModalRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  modalMode: PropTypes.string,
  tempProduct: PropTypes.shape({
    id: PropTypes.string,
    category: PropTypes.string,
    title: PropTypes.string,
    unit: PropTypes.string,
    origin_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    description: PropTypes.string,
    content: PropTypes.string,
    is_enabled: PropTypes.number,
    imageUrl: PropTypes.string,
    imagesUrl: PropTypes.arrayOf(PropTypes.string),
  }),
  setTempProduct: PropTypes.func,
  getProducts: PropTypes.func,
};

export default ProductModal;
