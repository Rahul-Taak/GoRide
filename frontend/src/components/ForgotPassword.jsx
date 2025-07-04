// ForgotPassword.jsx ================================
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeProvider";
import axios from "axios";
import Validation from "../Validation/ResetEmailValidation";
import Swal from "sweetalert2";
import "../static/css/Login.css";

// components ===============
import Loader from "../components/Loader";
import Header from "./Header";
import Footer from "./Footer";

const ForgotPassword = () => {
  const { theme } = useContext(ThemeContext);
  const [text, setText] = useState("text-white");
  const [bg, setBg] = useState("bg-dark");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: "",
  });
  const [errors, setErrors] = useState({
    email: "",
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      setBg("bg-dark");
      setText("text-white");
    } else {
      setBg("bg-light");
      setText("text-dark");
    }
  }, [theme]);

  const showAlert = (title, text, icon) => {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: "OK",
      allowOutsideClick: false,
    });
  };

  const handleEmailInput = (e) => {
    setValues({ [e.target.name]: [e.target.value] });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const validationErrors = Validation(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      const FORGOT_API = `${backendUrl}/admin/forget-password`;

      axios
        .post(FORGOT_API, {
          email: values.email[0],
        })
        .then((res) => {
          if (res.data.code === 1) {
            Swal.fire({
              title: "Success!",
              text: res.data.message + "! Redirecting to login page...",
              icon: "success",
              timer: 3000,
              confirmButtonText: "OK",
              allowOutsideClick: false,
            });

            setTimeout(() => {
              navigate("/");
            }, 2500);
          } else {
            showAlert("Error", res.data.message, "error");
          }
          setTimeout(() => {
            setLoading(false);
          }, 500);
        })
        .catch((err) => {
          showAlert(
            "Unable to Forgot password",
            err.response.data.message,
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

  const handleBack = () => {
    navigate("/");
  };

  if (loading) return <Loader />;

  return (
    <>
      <div className={`bg-login-ride pt-5 ${bg}`}>
        <Header />
        <div className="d-flex flex-column align-items-center justify-content-center px-4">
          <div
            className="d-flex flex-column gap-3 align-items-start w-100"
            style={{ maxWidth: "500px" }}
          >
            <button
              className={`btn btn-sm btn-outline-light pt-1`}
              onClick={handleBack}
            >
              <span
                style={{
                  fontSize: 25,
                  lineHeight: "10px",
                  marginLeft: -3,
                  zIndex: 999,
                }}
              >
                &larr;
              </span>{" "}
              Back to Dashboard
            </button>
            <div className={`card p-4 shadow ${bg} w-100`}>
              <h4 className={`text-center mb-4 ${text}`}>Reset Password</h4>

              <form action="">
                <input
                  name="email"
                  type="email"
                  className={`form-control mt-1 ${text} ${bg} ${
                    theme === "dark" ? "place-light" : "place-dark"
                  }`}
                  placeholder="Enter your email"
                  onChange={handleEmailInput}
                />
                {errors.email && (
                  <span className="text-danger d-inline-block mt-1">
                    {errors.email}
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn btn-primary mt-4 w-100"
                >
                  Send Reset Link
                </button>
              </form>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default ForgotPassword;
