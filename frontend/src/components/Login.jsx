import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Validation from "../Validation/LoginValidation";
import Loader from "../components/Loader";
import axios from "axios";
import Swal from "sweetalert2";
import "../static/css/Login.css";

function Login() {
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const showAlert = (title, text, icon) => {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: "OK",
      allowOutsideClick: false,
    });
  };

  const showpasswordInputGroup = {
    position: "relative",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "stretch",
    width: "100%",
  };

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);
  console.log("Frontend URL:", import.meta.env.VITE_FRONTEND_URL);
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  const handleLoginInput = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: [e.target.value] }));
  };

  const handleSubmitLogin = () => {
    setLoading(true);
    const validationErrors = Validation(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      const LOGIN_API = `${backendUrl}/admin/login`;

      axios
        .post(LOGIN_API, {
          email: values.email[0],
          password: values.password[0],
        })
        .then((res) => {
          if (res.data.code === 1) {
            Swal.fire({
              title: "Welcome to GoRide!",
              text: res.data.message + "! Redirecting to Dashboard...",
              icon: "success",
              timer: 3000,
              minheight: 800,
              showConfirmButton: false,
              allowOutsideClick: false,
              customClass: {
                popup: "custom-height",
              },
            });
            setTimeout(() => {
              navigate("/dashboard");
              sessionStorage.setItem("goride_token", res.data.data.token);
            }, 2500);
          } else {
            showAlert("Error", res.data.message, "error");
          }
          setTimeout(() => {
            setLoading(false);
          }, 500);
        })
        .catch((err) => {
          console.log("Error while login => ", err);
          showAlert(
            "Server Error",
            "Something went wrong. Please try again later.",
            "error"
          );
          setTimeout(() => {
            setLoading(false);
          }, 500);
        });
    } else {
      showAlert(
        "Validation Error",
        "Please fix the errors before proceeding.",
        "warning"
      );
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  return (
    <div className="bg-login-ride pt-5">
      {loading ? <Loader /> : ""}
      <div className="d-flex justify-content-center align-items-center vh-50 py-5 px-4">
        <div
          className="bg-white p-3 rounded w-100"
          style={{ maxWidth: 400, zIndex: 9 }}
        >
          <h4 className="text-center mb-3">Login Here</h4>
          <form action="">
            <div className="mb-3">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                onChange={handleLoginInput}
                placeholder="Enter Email"
                className="form-control mt-1"
              />
              {errors.email && (
                <span className="text-danger d-inline-block mt-1">
                  {errors.email}
                </span>
              )}
            </div>
            <div className="mb-1">
              <label htmlFor="password">Password</label>
              <div style={showpasswordInputGroup}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  onChange={handleLoginInput}
                  placeholder="Enter Password"
                  className="form-control mt-1"
                />
                <span
                  style={{ zIndex: 999, cursor: "pointer" }}
                  className="position-absolute end-0 mt-2 pt-1 me-2 pe-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                  ></i>
                </span>
              </div>
              {errors.password && (
                <span className="text-danger d-inline-block mt-1">
                  {errors.password}
                </span>
              )}
            </div>
            <div className="mb-4 d-flex justify-content-end">
              <span
                onClick={() => {return navigate('/password/forget')}}
                className="text-primary text-decoration-none"
                style={{ cursor: "pointer" }}
              >
                Forgot Password
              </span>
            </div>
            <div className="mb-3 d-flex flex-column align-items-center justify-content-center gap-2">
              <button
                type="button"
                onClick={handleSubmitLogin}
                className="btn btn-success w-100"
              >
                Log In
              </button>
              <div className="d-flex align-items-center justify-content-center gap-2">
                <span>or</span>
              </div>
              <Link
                to="/signup"
                className="btn btn-primary w-100 text-decoration-none"
              >
                Create Account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
