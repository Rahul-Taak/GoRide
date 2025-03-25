import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import "../static/css/Sidebar.css";

const Sidebar = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("drivers");
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchData = async () => {
    try {
      setLoading(true);

      const urls = {
        drivers: `${backendUrl}/api/driver/show`,
        customers: `${backendUrl}/api/customer/show`,
        team: `${backendUrl}/admin/show`,
      };

      let response = await fetch(urls[activeTab], {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("goride_token")}`,
        },
      });

      const result = await response.json();

      const formattedData = result.data.map((user) => ({
        id: user.id,
        profile_img: user?.profile_pic_url,
        name: user.name || user.first_name,
        email: user.email,
        ride_type: user?.ride_type,
        auto_number: user?.auto_number,
        status: user?.status,
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  return (
    <div className="d-flex pt-5">
      {loading ? <Loader /> : ""}
      <div
        className="d-flex flex-column p-3 pt-0 bg-dark text-white leftSideTable"
        style={{
          width: "300px",
          height: "80vh",
          overflow: "scroll",
          borderRight: "1px solid #666",
        }}
      >
        <ul className="nav flex-column">
          {["drivers", "customers", "team"].map((tab) => (
            <li className="nav-item" key={tab}>
              <button
                className={`nav-link text-capitalize text-start w-100 ${
                  activeTab === tab
                    ? "active bg-info text-dark rounded"
                    : " text-white"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "team" ? "Team Members" : tab}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="pb-4 px-5 w-100 rightSideTable"
        style={{ height: "80vh", overflow: "scroll" }}
      >
        <h3 className="text-info text-capitalize mb-4">
          {activeTab === "team" ? "Team Members" : activeTab}
        </h3>
        <table className="table table-dark table-striped text-white">
          <thead>
            <tr>
              <th>S.No.</th>
              {activeTab === "team" || activeTab === "drivers" ? (
                <th>Image</th>
              ) : (
                ""
              )}
              <th>Name</th>
              <th>Email</th>
              {activeTab === "drivers" ? <th>Ride Type</th> : ""}
              {activeTab === "drivers" ? <th>Ride no.</th> : ""}
              <th>Status</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index + 1} className="align-middle">
                  <td>{index + 1}</td>
                  {item.profile_img ? (
                    <td>
                      <img
                        style={{
                          borderRadius: "50%",
                          width: 50,
                          height: 50,
                          objectFit: "cover",
                          objectPosition: "top center",
                        }}
                        src={item.profile_img}
                        alt=""
                      />
                    </td>
                  ) : activeTab === "team" ? (
                    <td>--</td>
                  ) : (
                    ""
                  )}
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  {item?.ride_type && <td>{item.ride_type}</td>}
                  {item?.auto_number && <td>{item.auto_number}</td>}
                  <td>
                    <span
                      className={`badge ${
                        item.status === "Active"
                          ? "bg-success"
                          : item.status === "Inactive"
                          ? "bg-danger"
                          : "bg-secondary"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <Link
                      className="btn btn-sm btn-outline-info px-1 py-0"
                      to={`/${activeTab}/${item.id}`}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sidebar;
