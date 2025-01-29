import { useState, useEffect } from "react";
import SigninPage from "./pages/SigninPage";
import ProductPage from "./pages/ProductPage";

function App() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1",
    );

    if (!token) return;

    setIsAuth(true);
  }, []);

  return <>{isAuth ? <ProductPage /> : <SigninPage setIsAuth={setIsAuth} />}</>;
}

export default App;
