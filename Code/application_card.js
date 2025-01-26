import React from 'react';
import './application_card.css';

function ACard() {
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
              <td><input type="text" className="editable-input" placeholder="Enter cost" /></td>
            </tr>
            <tr>
              <td>Parameter 2</td>
              <td>10</td>
              <td>kg</td>
              <td><input type="text" className="editable-input" placeholder="Enter cost" /></td>
            </tr>
            <tr>
              <td>Parameter 3</td>
              <td>15</td>
              <td>kg</td>
              <td><input type="text" className="editable-input" placeholder="Enter cost" /></td>
            </tr>
            <tr>
              <td>Parameter 4</td>
              <td>20</td>
              <td>kg</td>
              <td><input type="text" className="editable-input" placeholder="Enter cost" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Section */}
      <div className="card-footer-1">
        <div className="details-1">
          <p>Max Days Limit: <span>30</span> days</p>
          <div className="extra-benefits-1">
            <label>Your limit:</label>
            <input
              type="text"
              className="extra-benefits-input-1"
              placeholder="Enter days required"
            />
          </div>
          <div className="extra-benefits-1">
            <label>Extra Benefits List:</label>
            <input
              type="text"
              className="extra-benefits-input-1"
              placeholder="Enter extra benefits"
            />
          </div>
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
        <div className="card-total-inside-1">
          <div className="card-total-inside-p-1"><p>Total Bid Value: <span>₹ 10,000 /-</span></p></div>
          <div className="card-total-inside-b-1"><button className="finish-button-1">Finish</button></div>
        </div>
        <hr />
      </div>
    </div>
  );
}

export default ACard;
