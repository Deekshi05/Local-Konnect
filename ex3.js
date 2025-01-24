import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './ex3.css';

function Top() {
  return (
    <div>
      <nav className="navbar navbar-light bg-light custom-navbar">
        <div className="d-flex flex-row justify-content-center">
            <div className="container-fluid">
            <button
                className="navbar-toggler custom-toggler"
                type="button"
                data-bs-toggle="dropdown" 
                aria-expanded="false"
            >
                <span className="navbar-toggler-icon"></span>
            </button>

            <ul className="dropdown-menu custom-dropdown w-100">
                <li>
                <a className="dropdown-item custom-dropdown-item" href="#action">
                    New Tenders
                </a>
                </li>
                <li className="dropdown-divider"></li> {/* Divider */}
                <li>
                <a className="dropdown-item custom-dropdown-item" href="#another-action">
                    Ongoing Works
                </a>
                </li>
                <li className="dropdown-divider"></li> {/* Divider */}
                <li>
                <a className="dropdown-item custom-dropdown-item" href="#another-action">
                    My Bids
                </a>
                </li>
                <li className="dropdown-divider"></li> {/* Divider */}
                <li>
                <a className="dropdown-item custom-dropdown-item" href="#another-action">
                    Completed Works
                </a>
                </li>
                <li className="dropdown-divider"></li> {/* Divider */}
                <li>
                <a className="dropdown-item custom-dropdown-item" href="#another-action">
                    My Profile
                </a>
                </li>
                <li className="dropdown-divider"></li> {/* Divider */}
                <li>
                <a className="dropdown-item custom-dropdown-item" href="#another-action">
                    Contact Us
                </a>
                </li>
            </ul>
            </div>
            <div><span className="navbar-title mx-auto">My Application</span></div>
        </div>
        
      </nav>

      <h1 className="main-heading">This is my first heading</h1>
    </div>
  );
}

export default Top;
