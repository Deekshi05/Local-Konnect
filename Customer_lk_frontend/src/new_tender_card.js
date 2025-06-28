import React from 'react';
import './new_tender_card.css';

function Card() {
  return (
    <div className="bid-card-1">
      {/* Card Header */}
      <div className="card-header-1">
        <div className="user-id-1">
          <span>User ID:</span>
          <strong>12345</strong>
        </div>
        <div className="service-name-1">
          <span>Service Name:</span>
          <strong>Plumbing Services</strong>
        </div>
      </div>

      {/* Table Section */}
      <div className="card-table-1">
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
      <div className="card-footer-1">
        <div className="details-1">
          <p>Max Days Limit: <span>30</span> days</p>
          <p>Your Limit: <span>15</span> days</p>
          <p>Extra Benefits List: <span>Cleaning Floor</span></p>
          <p>User Address: <span>Hyderabad, TG</span></p>
        </div>
        <div className="time-left-1">
            <p>Status</p>
          <div className="time-circle-1">
            <small>Pending</small>
          </div>
        </div>
      </div>

      {/* Total Section */}
      <div className="card-total-1">
        <hr />
        <p>Total Bid Value: <span>₹ 10,000 /-</span></p>
        <hr />
      </div>
    </div>
  );
}

export default Card;
