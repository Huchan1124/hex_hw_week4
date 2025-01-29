import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Modal } from "bootstrap";

const { VITE_BASE_URL, VITE_API_PATH } = import.meta.env;

const defaultModalState = {
  imageUrl: "",
  title: "",
  category: "",
  unit: "",
  origin_price: "",
  price: "",
  description: "",
  content: "",
  is_enabled: 0,
  imagesUrl: [""],
};

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [account, setAccount] = useState({ username: "", password: "" });
  const [modalMode, setModalMode] = useState(null);
  const [tempProduct, setTempProduct] = useState(defaultModalState);
  const [products, setProducts] = useState([]);
  const [pageInfo, setPageInfo] = useState({});
  const productModalRef = useRef(null);
  const delProductModal = useRef(null);

  useEffect(() => {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1",
    );
    axios.defaults.headers.common["Authorization"] = token;
    checkUserSignIn();
  }, []);

  useEffect(() => {
    new Modal(productModalRef.current, { backdrop: false });
    new Modal(delProductModal.current, { backdrop: false });
  }, []);

  const checkUserSignIn = useCallback(async () => {
    try {
      await axios.post(`${VITE_BASE_URL}/v2/api/user/check`);
      await getProducts();
      setIsAuth(true);
    } catch (error) {
      alert(error.response.data.message);
    }
  }, []);

  const getProducts = useCallback(async (page) => {
    try {

      const params = page ? { page } : {};

      const queryString = new URLSearchParams(params).toString();

      const url = `${VITE_BASE_URL}/v2/api/${VITE_API_PATH}/admin/products${queryString ? `?${queryString}` : ''}`;

      const { data } = await axios.get(url);

      setProducts(data.products);
      setPageInfo(data.pagination);
    } catch (error) {
      alert(error.response.data.message);
    }
  }, []);

  function setAuthToken(token, expired) {
    document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;
    axios.defaults.headers.common["Authorization"] = token;
  }

  async function handleSignIn(e) {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${VITE_BASE_URL}/v2/admin/signin`,
        account,
      );

      const { success, token, expired } = data;

      if (!success) return;

      setAuthToken(token, expired);
      await getProducts();
      setIsAuth(true);
    } catch (error) {
      alert(error.response.data.message);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setAccount({ ...account, [name]: value });
  }

  function handleModalInputChange(e) {
    const { name, value, checked, type } = e.target;
    setTempProduct({
      ...tempProduct,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  function handleOpenProductModal(mode, product) {
    initTempProduct();

    const actions = {
      create: () => setModalMode(mode),
      edit: () => {
        setModalMode(mode);
        setTempProduct(product);
      },
    };

    if (!actions[mode]) return;
    actions[mode]();
    Modal.getInstance(productModalRef.current).show();
  }

  function handleCloseProductModal() {
    Modal.getInstance(productModalRef.current).hide();
  }

  function handleOpenDelModal(product) {
    setTempProduct(product);
    Modal.getInstance(delProductModal.current).show();
  }

  function handleCloseDelModal() {
    Modal.getInstance(delProductModal.current).hide();
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

  function initTempProduct() {
    setTempProduct(defaultModalState);
  }

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

  async function handlePageChange(page) {
    await getProducts(page)
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];

    const formData = new FormData()

    formData.append('file-to-upload', file)

    try {
      const { data } = await axios.post(`${VITE_BASE_URL}/v2/api/${VITE_API_PATH}/admin/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setTempProduct({
        ...tempProduct,
        imageUrl: data.imageUrl
      })


    } catch (error) {
      alert("上傳圖片失敗," + error.response.data.message);

    }




  }

  return (
    <>
      {isAuth ? (
        <div className="container p-4">
          <div className="row">
            <div className="col-md-12">
              <div className="d-flex justify-content-between">
                <h2>產品列表</h2>
                <button
                  onClick={() => handleOpenProductModal("create")}
                  type="button"
                  className="btn btn-primary"
                >
                  建立新的產品
                </button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {products && products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.title}</td>
                        <td>{product.origin_price}</td>
                        <td>{product.price}</td>
                        <td>
                          {product.is_enabled ? (
                            <span className="text-success">啟用</span>
                          ) : (
                            <span className="text-danger">未啟用</span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group">
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => {
                                handleOpenProductModal("edit", product);
                              }}
                            >
                              編輯
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleOpenDelModal(product)}
                            >
                              刪除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">尚無產品資料</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="d-flex justify-content-center">
                <nav>
                  <ul className="pagination">
                    <li className={`page-item ${!pageInfo.has_pre && 'disabled'}`}
                      onClick={!pageInfo.has_pre ? null : () => handlePageChange(pageInfo.current_page - 1)}>
                      <a className="page-link" href="#">
                        上一頁
                      </a>
                    </li>

                    {Array.from({ length: pageInfo.total_pages }).map(
                      (_, index) => (
                        <li className={`page-item ${pageInfo.current_page === index + 1 && 'active'}`} key={index}
                          onClick={() => handlePageChange(index + 1)}>
                          <a className="page-link" href="#">
                            {index + 1}
                          </a>
                        </li>
                      ),
                    )}
                    <li className={`page-item ${!pageInfo.has_next && 'disabled'}`}
                      onClick={!pageInfo.has_next ? null : () => handlePageChange(pageInfo.current_page + 1)}
                    >
                      <a className="page-link"

                        href="#">
                        下一頁
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal text-center">請先登入</h1>
            <div className="col-12">
              <form id="form" className="form-signin" onSubmit={handleSignIn}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="username"
                    placeholder="name@example.com"
                    name="username"
                    value={account.username}
                    onChange={handleInputChange}
                    required
                    autoFocus
                  />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    name="password"
                    value={account.password}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <button
                  className="btn btn-lg btn-primary w-100 mt-3"
                  type="submit"
                >
                  登入
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

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
                    <label htmlFor="fileInput" className="form-label"> 主圖上傳 </label>
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

export default App;
