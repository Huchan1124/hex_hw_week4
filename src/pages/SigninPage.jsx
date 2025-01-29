import { useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";

const { VITE_BASE_URL } = import.meta.env;

function SigninPage({ setIsAuth }) {
  const [account, setAccount] = useState({ username: "", password: "" });

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
      setIsAuth(true);
    } catch (error) {
      alert(error.response.data.message);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setAccount({ ...account, [name]: value });
  }

  function setAuthToken(token, expired) {
    document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;
    axios.defaults.headers.common["Authorization"] = token;
  }

  return (
    <>
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
    </>
  );
}

SigninPage.propTypes = {
  setIsAuth: PropTypes.func.isRequired,
};

export default SigninPage;
