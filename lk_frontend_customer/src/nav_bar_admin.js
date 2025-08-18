import React from "react";
import "./nav_bar_admin.css";
import moment from "moment";
import logo from "./assets/LocalKonnectLogo.png";
function NavBarAdmin() {
  const formattedDate = moment().format("MMMM Do YYYY");
  return (
    <div class="top-nav">
      {/* <h2>Local Konnect</h2> */}
      <img src={logo} alt="Logo" />
      <h1>Dashboard</h1>
      <span>{formattedDate}</span>
    </div>
  );
}
export default NavBarAdmin;
