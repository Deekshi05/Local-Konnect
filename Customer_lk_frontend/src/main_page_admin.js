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
              <li>
                <Collapsible trigger="Services">
                  <br></br>
                  <a href="Link Here"> Add Services</a>
                  <br></br>
                  <a href="Link Here">Manage Services</a>
                </Collapsible>
              </li>
              <li>
                <Collapsible trigger="Items">
                  <br></br>
                  <a href="Link Here"> Add Items</a>
                  <br></br>
                  <a href="Link Here">Manage Items</a>
                </Collapsible>
              </li>
              <li>
                <Collapsible trigger="Contracters">
                  <br></br>
                  <a href="Link Here"> Add Contracters</a>
                  <br></br>
                  <a href="Link Here">Manage Contracters</a>
                </Collapsible>
              </li>
              <li>
                <Collapsible trigger="Orders">
                  <br></br>
                  <a href="Link Here">Pending Oders</a>
                  <br></br>
                  <a href="Link Here">Delivered Orders</a>
                  <br></br>
                  <a href="Link Here">Cancelled Orders</a>
                </Collapsible>
              </li>
              <li>
                <Collapsible trigger="Tenders">
                  <br></br>
                  <a href="Link Here"> New Tenders</a>
                  <br></br>
                  <a href="Link Here">Pending Tenders</a>
                  <br></br>
                  <a href="Link Here">Ongoing Works</a>
                  <br></br>
                  <a href="Link Here">Completed Works</a>
                  <br></br>
                  <a href="Link Here">Cancelled Tenders</a>
                </Collapsible>
              </li>
              <li>
                <Collapsible trigger="Supervisors">
                  <br></br>
                  <a href="Link Here"> Add Supervisors</a>
                  <br></br>
                  <a href="Link Here">Manage Supervisors</a>
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
            <div class="card yellow">
              Pending Tenders<br></br>
              <span></span>
            </div>
            <div class="card red">
              Total Supervisors<br></br>
              <span> </span>
            </div>
            <div class="card cyan">
              Total Services<br></br>
              <span></span>
            </div>
            <div class="card orange">
              Ongoing Works<br></br>
              <span></span>
            </div>
            <div class="card orange">
              Completed Works<br></br>
              <span></span>
            </div>
            <div class="card teal">
              New Tenders<br></br>
              <span></span>
            </div>
            <div class="card cyan">
              All Orders<br></br>
              <span></span>
            </div>
            <div class="card orange">
              New Material Orders<br></br>
              <span></span>
            </div>
            <div class="card orange">
              Completed Material Orders<br></br>
              <span></span>
            </div>
            <div class="card orange">
              Cancelled Material Orders<br></br>
              <span></span>
            </div>
            <div class="card orange">
              Material Partners<br></br>
              <span></span>
            </div>
            <div class="card orange">
              Total Confirmed Orders<br></br>
              <span></span>
            </div>
            <div class="card orange">
              Cancelled Tenders<br></br>
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
