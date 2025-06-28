import { FaUsers } from "react-icons/fa";

function ContractorList({ contractors }) {
  return (
    <div className="contractor-list">
      <h3>
        <FaUsers /> Selected Contractors:
      </h3>
      {contractors.length > 0 ? (
        <ul>
          {contractors.map((c, idx) => (
            <li key={idx}>{c}</li>
          ))}
        </ul>
      ) : (
        <p>No contractors selected.</p>
      )}
    </div>
  );
}

export default ContractorList;
