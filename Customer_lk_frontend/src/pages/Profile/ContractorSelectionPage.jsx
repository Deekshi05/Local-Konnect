import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

function ContractorSelectionPage() {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBidSummary = async () => {
      try {
        const res = await api.get(`/api/customer/tender/${tenderId}/bid-summary/`);
        setBids(res.data);
      } catch (err) {
        setError('Failed to load bid summary');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBidSummary();
  }, [tenderId]);

  const handleSelectContractor = async (contractorId) => {
    const confirmed = window.confirm("Are you sure? This action cannot be undone.");
    if (!confirmed) return;

    try {
      await api.put(`/api/tenders/${tenderId}/select-contractor/`, {
        selected_contractor: contractorId,
      });
      alert("Contractor selected successfully.");
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert("Failed to assign contractor.");
    }
  };

  if (loading) return <p className="p-4">Loading contractor bids...</p>;
  if (error) return <p className="text-red-600 p-4">{error}</p>;

  return (
    <div className="p-6 bg-cream min-h-screen text-brown">
      <h2 className="text-2xl font-bold mb-6">Select Contractor</h2>

      {bids.length === 0 ? (
        <p>No contractor bids available for this tender.</p>
      ) : (
        <div className="space-y-6">
          {bids.map((contractor) => (
            <div key={contractor.contractor_id} className="border border-brown rounded-xl p-4 shadow-md">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-xl font-semibold">{contractor.name}</h3>
                  <p>Rating: {contractor.rating} | Experience: {contractor.experience} yrs</p>
                  <p>Location: {contractor.city}, {contractor.state}</p>
                </div>
                <button
                  onClick={() => handleSelectContractor(contractor.contractor_id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Select
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="border-b py-1">Requirement</th>
                      <th className="border-b py-1">Quantity</th>
                      <th className="border-b py-1">Bid</th>
                      <th className="border-b py-1">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractor.bids.map((bid, idx) => (
                      <tr key={idx}>
                        <td className="py-1">{bid.requirement}</td>
                        <td className="py-1">{bid.quantity}</td>
                        <td className="py-1">₹{bid.bid_amount}</td>
                        <td className="py-1">₹{bid.subtotal}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="text-right font-semibold py-2">Total Cost:</td>
                      <td className="py-2 font-bold text-green-700">₹{contractor.total_bid}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ContractorSelectionPage;
