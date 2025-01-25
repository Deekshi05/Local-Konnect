import React from 'react';
import './completed_tenders.css';

function CTenderCard() {
  return (
    <div className="bid-card-3">
      {/* Card Header */}
      <div className="card-header-3">
        <div className="user-id-3">
          <span>User ID:</span>
          <strong>12345</strong>
        </div>
        <div className="service-name-3">
          <span>Service Name:</span>
          <strong>Plumbing Services</strong>
        </div>
      </div>

      {/* Table Section */}
      <div className="card-table-3">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Units</th>
              <th>Per Unit Charge</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Parameter 1</td>
              <td>5</td>
              <td>kg</td>
              <td>₹ 200 /-</td>
            </tr>
            <tr>
              <td>Parameter 2</td>
              <td>10</td>
              <td>kg</td>
              <td>₹ 200 /-</td>
            </tr>
            <tr>
              <td>Parameter 3</td>
              <td>15</td>
              <td>kg</td>
              <td>₹ 300 /-</td>
            </tr>
            <tr>
              <td>Parameter 4</td>
              <td>20</td>
              <td>kg</td>
              <td>₹ 125 /-</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Section */}
      <div className="card-footer-3">
        <div className="details-3">
          <p>Max Days Limit: <span>30</span> days</p>
          <p>Your Limit: <span>15</span> days</p>
          <p>Extra Benefits List: <span>Cleaning Floor</span></p>
          <p>User Address: <span>Hyderabad, TG</span></p>
        </div>
        <div className="time-left-3">
          <p>Start Date</p>
          <div className="date-box-3">
            <small>01 Jan 2025</small>
          </div>
          <p>End Date</p>
          <div className="date-box-3">
            <small>15 Jan 2025</small>
          </div>
        </div>
      </div>

      {/* Total Section */}
      <div className="card-total-3">
        <hr />
        <p>Total Bid Value: <span>₹ 10,000 /-</span></p>
        <hr />
        <p>Payment Status: <span>Pending</span></p>
        <hr />
      </div>
    </div>
  );
}

export default CTenderCard;
