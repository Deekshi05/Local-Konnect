import { FaTrash } from "react-icons/fa";

function RequirementInput({ index, requirement, requirementsList, onChange, onDelete }) {
  return (
    <div className="requirement-row">
      <select
        value={requirement.requirement}
        onChange={(e) => onChange(index, "requirement", e.target.value)}
      >
        <option value="">Select requirement</option>
        {requirementsList.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        min="1"
        value={requirement.quantity}
        onChange={(e) => onChange(index, "quantity", e.target.value)}
        placeholder="Quantity"
      />

      <input
        type="text"
        value={requirement.units}
        onChange={(e) => onChange(index, "units", e.target.value)}
        placeholder="Units"
      />

      <input
        type="text"
        value={requirement.description}
        onChange={(e) => onChange(index, "description", e.target.value)}
        placeholder="Description"
      />

      <button type="button" onClick={() => onDelete(index)}>
        <FaTrash />
      </button>
    </div>
  );
}

export default RequirementInput;
