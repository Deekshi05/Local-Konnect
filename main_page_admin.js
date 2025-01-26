import React from "react";
import "./main_page_admin.css";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Collapsible from "react-collapsible";


function MainBody() {
  // const toggleSubMenu = () => {
  //   const submenu = document.querySelector(".submenu");
  //   const arrow = document.querySelector(".arrow1");
  //   submenu.classList.toggle("active");
  //   arrow.classList.toggle("rotate");
  // };

  // const toggleSubOrder = () => {
  //   const submenu = document.querySelector(".subOrder");
  //   const arrow = document.querySelector(".arrow2");
  //   submenu.classList.toggle("active");
  //   arrow.classList.toggle("rotate");
  // };

  return (
    <>
      <div class="container">
        <aside class="sidebar">
          <nav>
            <ul>
              <li class="dash">Dashboard</li>
              <li>Item Category</li>
              <li>
                <Collapsible trigger="Items">
                  {/* <p>
                    This is the collapsible content. It can be any element or
                    React component you like.
                  </p> */}
                  <br></br>
                  <a href="Link Here"> Add Items</a>
                  <br></br>
                  <a href="Link Here">Manage Items</a>
                </Collapsible>
              </li>
              <li>
                <Collapsible trigger="Orders">
                  {/* <p>
                    This is the collapsible content. It can be any element or
                    React component you like.
                  </p> */}
                  <br></br>
                  <a href="Link Here">All Orders</a>
                  <br></br>
                  <a href="Link Here">Pending</a>
                  <br></br>
                  <a href="Link Here">Delivered</a>
                  <br></br>
                  <a href="Link Here">Confirmed</a>
                </Collapsible>
              </li>
            </ul>
          </nav>
        </aside>
        <main class="main-content">
          <section class="stats-grid">
            <div class="card purple">
              Total Reg Users<br></br>
              <span></span>
            </div>
            <div class="card red">
              Total Products<br></br>
              <span> </span>
            </div>
            <div class="card cyan">
              All Orders<br></br>
              <span></span>
            </div>
            <div class="card orange">
              Total Confirmed Orders<br></br>
              <span></span>
            </div>
            <div class="card yellow">
              Total Cancelled Orders<br></br>
              <span></span>
            </div>
            <div class="card teal">
              Total Delivered Orders<br></br>
              <span></span>
            </div>
            <div class="card blue">
              Pending Orders<br></br>
              <span> </span>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
export default MainBody;
