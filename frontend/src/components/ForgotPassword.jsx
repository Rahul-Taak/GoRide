import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Validation from "../Validation/ResetEmailValidation";
import Loader from "../components/Loader";
import Swal from "sweetalert2";
import "../static/css/Login.css";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: "",
  });

  const [errors, setErrors] = useState({
    email: "",
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

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

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
              confirmButtonText: "OK",
              allowOutsideClick: false,
            }).then(() => {
              navigate("/");
            });
          } else {
            showAlert("Error", res.data.message, "error");
          }
          setTimeout(() => {
            setLoading(false);
          }, 500);
        })
        .catch((err) => {
          console.log("Error while forgot password => ", err);
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
    <div className="bg-login-ride">
      {loading ? <Loader /> : ""}
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        <div className="card p-4 shadow" style={{ width: "400px" }}>
          <h4 className="text-center mb-4">Reset Password</h4>

          <form action="">
            <input
              name="email"
              type="email"
              className="form-control"
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
  );
};

export default ForgotPassword;
