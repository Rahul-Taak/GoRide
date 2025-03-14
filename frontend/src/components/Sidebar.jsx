import React, { useState, useEffect } from "react";

import Loader from "../components/Loader";

const Sidebar = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Drivers");
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();

    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [activeTab]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchData = async () => {
    try {
      setLoading(true);

      const urls = {
        Drivers: `${backendUrl}/api/driver/show`,
        Customers: `${backendUrl}/api/customer/show`,
        Team: `${backendUrl}/admin/show`,
      };

      let response = await fetch(urls[activeTab], {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("goride_token")}`,
        },
      });

      const result = await response.json();

      const formattedData = result.data.map((user, index) => ({
        id: index + 1,
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
    }
  };

  return (
    <div className="d-flex pt-5">
      {loading ? <Loader /> : ""}
      <div
        className="d-flex flex-column p-3 pt-0 bg-dark text-white"
        style={{
          width: "300px",
          height: "80vh",
          borderRight: "1px solid #666",
        }}
      >
        <ul className="nav flex-column">
          {["Drivers", "Customers", "Team"].map((tab) => (
            <li className="nav-item" key={tab}>
              <button
                className={`nav-link text-start w-100 ${
                  activeTab === tab
                    ? "active bg-info text-dark rounded"
                    : " text-white"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "Team" ? "Team Members" : tab}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="pb-4 px-5 w-100" style={{ height: "80vh" }}>
        <h3 className="text-info mb-4">
          {activeTab === "Team" ? "Team Members" : activeTab}
        </h3>
        <table className="table table-dark table-striped text-white">
          <thead>
            <tr>
              <th>S.No.</th>
              {activeTab === "Team" ? <th>Image</th> : ""}
              <th>Name</th>
              <th>Email</th>
              {activeTab === "Drivers" ? <th>Ride Type</th> : ""}
              {activeTab === "Drivers" ? <th>Ride no.</th> : ""}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id} className="align-middle">
                  <td>{item.id}</td>
                  {item.profile_img ? <td><img style={{borderRadius: "50%", width: 50, height: 50, objectFit: "cover", objectPosition: "top center"}} src={item.profile_img} alt="" /></td> : (activeTab === "Team" ? <td>--</td> : "")}
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
