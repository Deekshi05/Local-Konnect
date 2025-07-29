import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import ProfileCard from './ProfilePage';
import TenderCard from './TenderCard';

function MyTendors() {
  const [tenders, setTenders] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTendersAndAssignments = async () => {
      try {
        const [tenderRes, assignmentRes] = await Promise.all([
          api.get('/api/tenders/customer/'),
          api.get('/api/tenders/customer/assignments/')
        ]);

        setTenders(tenderRes.data);
        setAssignments(assignmentRes.data);
      } catch (err) {
        console.error('Failed to fetch tenders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTendersAndAssignments();
  }, []);

  const now = new Date();

  const getAssignment = (tenderId) => {
    return assignments.find(a => a.tender === tenderId);
  };

  const getPaymentStatus = (tenderId) => {
    const assignment = getAssignment(tenderId);
    return assignment?.payment_status || null;
  };

  const pendingTendersActive = tenders.filter(t => {
    const start = new Date(t.start_time);
    const end = new Date(t.end_time);
    return   now <= end;
  });

  const pendingTendersEnded = tenders.filter(t => {
    const end = new Date(t.end_time);
    return now > end && !t.selected_contractor;
  });

  const ongoingTenders = assignments.filter(a => {
    const start = new Date(a.start_date);
    const end = new Date(a.due_date);
    return now >= start && now <= end && a.payment_status === 'pending';
  });

  const completedTenders = assignments.filter(a => {
    const end = new Date(a.due_date);
    return  (a.payment_status === 'paid' || a.payment_status === 'overdue');
  });

  const handleSelectContractor = (tenderId) => {
    navigate(`/select-contractor/${tenderId}`);
  };

  return (
    <div className="p-6 bg-cream min-h-screen text-brown">
      <ProfileCard />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Tenders</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-4 py-2 rounded"
        >
          <option value="pending">Pending</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="space-y-4">
        {filter === 'pending' && (
          <>
            {pendingTendersActive.map(t => (
              <TenderCard
                key={t.id}
                title={`Tender #${t.id}`}
                description={`Service: ${t.service}, Location: ${t.location}`}
                budget={`Limit: ${t.customer_limit}`}
                deadline={`From: ${new Date(t.start_time).toLocaleString()} to ${new Date(t.end_time).toLocaleString()}`}
              />
            ))}

            {pendingTendersEnded.map(t => (
              <TenderCard
                key={t.id}
                title={`Tender #${t.id}`}
                description={`Service: ${t.service}, Location: ${t.location}`}
                budget={`Limit: ${t.customer_limit}`}
                deadline={`From: ${new Date(t.start_time).toLocaleString()} to ${new Date(t.end_time).toLocaleString()}`}
                extra={
                  <button
                    onClick={() => handleSelectContractor(t.id)}
                    className="mt-2 bg-orange-600 text-white px-4 py-1 rounded"
                  >
                    Select Contractor
                  </button>
                }
              />
            ))}
          </>
        )}

        {filter === 'ongoing' && ongoingTenders.map(a => {
          const t = tenders.find(t => t.id === a.tender);
          return t && (
            <TenderCard
              key={t.id}
              title={`Tender #${t.id}`}
              description={`Service: ${t.service}, Location: ${t.location}`}
              budget={`Limit: ${t.customer_limit}`}
              deadline={`Start: ${new Date(a.start_date).toLocaleString()} - Due: ${new Date(a.due_date).toLocaleString()}`}
              extra={<p className="mt-2">Payment Status: {a.payment_status}</p>}
            />
          );
        })}

        {filter === 'completed' && completedTenders.map(a => {
          const t = tenders.find(t => t.id === a.tender);
          return t && (
            <TenderCard
              key={t.id}
              title={`Tender #${t.id}`}
              description={`Service: ${t.service}, Location: ${t.location}`}
              budget={`Limit: ${t.customer_limit}`}
              deadline={`Start: ${new Date(a.start_date).toLocaleString()} - Due: ${new Date(a.due_date).toLocaleString()}`}
              extra={<p className="mt-2">Payment Status: {a.payment_status}</p>}
            />
          );
        })}
      </div>
    </div>
  );
}

export default MyTendors;