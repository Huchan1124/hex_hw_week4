import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Modal } from "bootstrap";
import Pagination from "../components/Pagination";
import ProductModal from "../components/modals/ProductModal";
import DelProductModal from "../components/modals/DelProductModal";

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

function ProductPage() {
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

  const checkUserSignIn = useCallback(async () => {
    try {
      await axios.post(`${VITE_BASE_URL}/v2/api/user/check`);
      await getProducts();
    } catch (error) {
      alert(error.response.data.message);
    }
  }, []);

  const getProducts = useCallback(async (page) => {
    try {
      const params = page ? { page } : {};

      const queryString = new URLSearchParams(params).toString();

      const url = `${VITE_BASE_URL}/v2/api/${VITE_API_PATH}/admin/products${queryString ? `?${queryString}` : ""}`;

      const { data } = await axios.get(url);

      setProducts(data.products);
      setPageInfo(data.pagination);
    } catch (error) {
      alert(error.response.data.message);
    }
  }, []);

  function initTempProduct() {
    setTempProduct(defaultModalState);
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

  function handleOpenDelModal(product) {
    setTempProduct(product);
    Modal.getInstance(delProductModal.current).show();
  }

  return (
    <>
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
              <Pagination getProducts={getProducts} pageInfo={pageInfo} />
            </div>
          </div>
        </div>
      </div>
      <ProductModal
        productModalRef={productModalRef}
        modalMode={modalMode}
        tempProduct={tempProduct}
        setTempProduct={setTempProduct}
        getProducts={getProducts}
      />

      <DelProductModal
        tempProduct={tempProduct}
        delProductModal={delProductModal}
        getProducts={getProducts}
      />
    </>
  );
}

export default ProductPage;
