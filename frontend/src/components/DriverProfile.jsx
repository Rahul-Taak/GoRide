// DriverProfile.jsx ================================
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeProvider";
import Swal from "sweetalert2";

// components ===============
import Loader from "./Loader";
import Header from "./Header";
import Footer from "./Footer";

function DriverProfile() {
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [error, setError] = useState(null);
  const [text, setText] = useState("text-white");
  const [bg, setBg] = useState("bg-dark");
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchDriverData();
  }, [id]);

  useEffect(() => {
    if (theme === "dark") {
      setBg("bg-dark");
      setText("text-white");
    } else {
      setBg("bg-light");
      setText("text-dark");
    }
  }, [theme]);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      setError(null);

      let response = await fetch(`${backendUrl}/admin/driver-profile/${id}`);

      const result = await response.json();

      if (result.data && result.code === 1) {
        setDriver(result.data[0]);
      } else {
        setError("No Driver data found");
      }
    } catch (error) {
      setError(error.message || "Failed to load Driver data");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const handleEditClick = () => {
    setIsEditable(true);
  };

  const handleSaveClick = () => {
    Swal.fire({
      title: "Do you really want to update this driver ?",
      text: "You cannot revert this !",
      icon: "warning",
      showConfirmButton: true,
      showCancelButton: true,
      allowOutsideClick: false,
    }).then((btn) => {
      if (btn.isConfirmed) {
        setLoading(true);
        fetch(`${backendUrl}/admin/driver-profile/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(driver),
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            if (data && data.code === 1) {
              setTimeout(() => {
                setIsEditable(false);
                fetchDriverData();
                setLoading(false);

                Swal.fire({
                  title: data.message,
                  icon: "success",
                  showConfirmButton: true,
                  allowOutsideClick: false,
                });
              }, 500);
            }
          })
          .catch((error) => {
            Swal.fire({
              title: error?.message,
              icon: "error",
              showConfirmButton: true,
              allowOutsideClick: false,
            });
          });
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDriver((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <Loader />;

  return (
    <div className={`${bg} ${text} min-vh-100 d-flex flex-column pt-5`}>
      <Header />
      <main className="flex-grow-1">
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {error ? (
                <div className="alert alert-danger">{error}</div>
              ) : !driver ? (
                <div></div>
              ) : (
                <div className="d-flex flex-column gap-3 align-items-start">
                  <button
                    className={`btn btn-sm ${
                      theme === "dark"
                        ? "btn-outline-light"
                        : "btn-outline-dark"
                    } pt-1`}
                    onClick={() => navigate("/")}
                  >
                    <span
                      style={{
                        fontSize: 25,
                        lineHeight: "10px",
                        marginLeft: -3,
                      }}
                    >
                      &larr;
                    </span>{" "}
                    Back to Dashboard
                  </button>
                  <div className={`card ${bg} border border-info w-100`}>
                    <div className="card-header bg-info text-dark d-flex justify-content-between align-items-center">
                      <h4 className="m-0 text-dark">Driver Profile</h4>
                      <div>
                        <button
                          className={`btn btn-sm ${
                            isEditable ? "btn-success" : "btn-light"
                          }`}
                          onClick={
                            isEditable ? handleSaveClick : handleEditClick
                          }
                        >
                          {isEditable ? "Save Profile" : "Edit Profile"}
                        </button>
                      </div>
                    </div>

                    <div className="card-body">
                      <form>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="form-group mb-3">
                              <label className={`form-label fw-bold ${text}`}>
                                First Name:
                              </label>
                              <input
                                type="text"
                                className={`form-control ${bg} ${text}`}
                                name="first_name"
                                value={driver.first_name || ""}
                                onChange={handleChange}
                                disabled={!isEditable}
                              />
                            </div>

                            <div className="form-group mb-3">
                              <label className={`form-label fw-bold ${text}`}>
                                Mobile:
                              </label>
                              <input
                                type="text"
                                className={`form-control ${bg} ${text}`}
                                name="mobile"
                                value={driver.mobile || ""}
                                onChange={handleChange}
                                disabled={!isEditable}
                              />
                            </div>

                            <div className="form-group mb-3">
                              <label className={`form-label fw-bold ${text}`}>
                                Gender:
                              </label>
                              <select
                                className={`form-select ${bg} ${text}`}
                                name="gender"
                                value={driver.gender || ""}
                                onChange={handleChange}
                                disabled={!isEditable}
                              >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="others">Others</option>
                              </select>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="form-group mb-3">
                              <label className={`form-label fw-bold ${text}`}>
                                Last Name:
                              </label>
                              <input
                                type="text"
                                className={`form-control ${bg} ${text}`}
                                name="last_name"
                                value={driver.last_name || ""}
                                onChange={handleChange}
                                disabled={!isEditable}
                              />
                            </div>

                            <div className="form-group mb-3">
                              <label className={`form-label fw-bold ${text}`}>
                                Email:
                              </label>
                              <input
                                type="email"
                                className={`form-control ${bg} ${text}`}
                                name="email"
                                value={driver.email || ""}
                                onChange={handleChange}
                                disabled={!isEditable}
                              />
                            </div>

                            <div className="form-group mb-3">
                              <label className={`form-label fw-bold ${text}`}>
                                Status:
                              </label>
                              <select
                                className={`form-select ${bg} ${text}`}
                                name="status"
                                value={driver.status || ""}
                                onChange={handleChange}
                                disabled={!isEditable}
                              >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Deleted">Deleted</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>

                    <div
                      className={`card-footer ${bg} border-top border-info`}
                      style={{ height: 80 }}
                    >
                      <div className="row align-items-center justify-content-between h-100">
                        <div className="col-md-6">
                          <span className={text}>Driver ID: {driver.id}</span>
                          <div className="col-md-4 text-center d-flex gap-2 mt-1">
                            <span className={text}>Status</span>{" "}
                            {driver.status === "Active" ? (
                              <span
                                className="badge bg-success"
                                style={{ paddingTop: 6 }}
                              >
                                Active
                              </span>
                            ) : driver.status === "Inactive" ? (
                              <span
                                className="badge bg-warning text-dark"
                                style={{ paddingTop: 6 }}
                              >
                                Inactive
                              </span>
                            ) : (
                              <span
                                className="badge bg-danger"
                                style={{ paddingTop: 6 }}
                              >
                                Blocked
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="text-md-end">
                            <div className={`small ${text}`}>
                              Registered at:{" "}
                              {driver.created_at
                                ? new Date(driver.created_at).toLocaleString()
                                : "N/A"}
                            </div>
                            <div className={`small ${text}`}>
                              Last modified at:{" "}
                              {driver.updated_at
                                ? new Date(driver.updated_at).toLocaleString()
                                : "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default DriverProfile;
