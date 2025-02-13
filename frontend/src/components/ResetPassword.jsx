import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Validation from "../Validation/ResetPasswordValidation";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    password: "",
  });

  const [errors, setErrors] = useState({});

  const HOST = import.meta.env.VITE_HOST;
  const PORT = import.meta.env.VITE_PORT;

  const handleInput = (e) => {
    setValues({ [e.target.name]: [e.target.value] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors(Validation(values));

    if (errors.password === "") {
      let RESET_API = `http://${HOST}:${PORT}/admin/reset-password/${token}`;
      axios
        .post(RESET_API, {
          password: values.password[0],
        })
        .then((res) => {
          if (res.data.code === 1) {
            navigate("/");
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.log("Error while reset password => ", err);
        });
    }
  };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ height: "100vh" }}
    >
      <div className="card p-4 shadow" style={{ width: "400px" }}>
        <h3 className="text-center">Set A New Password</h3>

        <form onSubmit={handleSubmit}>
          <input
            className="form-control mt-3 mb-2"
            name="password"
            type="password"
            placeholder="Enter new password"
            onChange={handleInput}
          />

          {errors.password && (
            <span className="text-danger d-inline-block mt-1">
              {errors.password}
            </span>
          )}

          <button type="submit" className="btn btn-primary mt-3 w-100">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
