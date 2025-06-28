import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClipboardList,
  FaHammer,
  FaUsers,
} from "react-icons/fa";
import RequirementInput from "./RequirementInput";
import "./MakeTender.css";

function MakeTender() {
  const navigate = useNavigate();
  const [availableContractors, setAvailableContractors] = useState([]);
  const [selectedContractors, setSelectedContractors] = useState([]);
  const [services, setServices] = useState([]);
  const [requirementsList, setRequirementsList] = useState([]);
  const [formData, setFormData] = useState({
    service: "",
    supervisor: "",
    location: "",
    start_time: "",
    end_time: "",
    customer_limit: 1,
    requirements: [],
  });

  useEffect(() => {
    api.get("api/services/").then((res) => setServices(res.data));
    api.get("api/requirments/").then((res) => setRequirementsList(res.data));
    api
      .get("api/contractors/")
      .then((res) => setAvailableContractors(res.data));
  }, []);

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContractorChange = (e) => {
    const options = Array.from(e.target.options);
    const selected = options
      .filter((option) => option.selected)
      .map((option) => parseInt(option.value));
    setSelectedContractors(selected);
  };

  const handleRequirementChange = (index, field, value) => {
    const updated = [...formData.requirements];
    updated[index][field] = value;
    setFormData({ ...formData, requirements: updated });
  };

  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [
        ...formData.requirements,
        { requirement: "", quantity: 1, units: "", description: "" },
      ],
    });
  };

  const deleteRequirement = (index) => {
    const updated = [...formData.requirements];
    updated.splice(index, 1);
    setFormData({ ...formData, requirements: updated });
  };

  const validateForm = () => {
    if (!formData.service) return "Please select a service.";
    if (!formData.supervisor) return "Please enter supervisor ID.";
    if (!formData.location) return "Please enter location.";
    if (!formData.start_time) return "Please select start time.";
    if (!formData.end_time) return "Please select end time.";
    if (new Date(formData.start_time) >= new Date(formData.end_time))
      return "Start time must be before end time.";
    if (selectedContractors.length === 0)
      return "Please select at least one contractor.";

    for (let i = 0; i < formData.requirements.length; i++) {
      const req = formData.requirements[i];
      if (!req.requirement)
        return `Requirement ${i + 1}: Please select a requirement.`;
      if (req.quantity <= 0)
        return `Requirement ${i + 1}: Quantity must be greater than 0.`;
      if (!req.units) return `Requirement ${i + 1}: Please enter units.`;
    }

    return null;
  };

  const handleTenderSubmit = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    if (!window.confirm("Are you sure? This action cannot be undone.")) return;

    try {
      const tenderRes = await api.post("/api/tenders/create/", {
        service: parseInt(formData.service),
        supervisor: parseInt(formData.supervisor),
        location: formData.location,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        customer_limit: parseInt(formData.customer_limit),
      });

      const tenderId = tenderRes.data.id;

      await api.post("api/tenders/assign-contractors/", {
        tender_id: tenderId,
        contractor_ids: selectedContractors,
      });

      for (const req of formData.requirements) {
        await api.post("api/tender-requirements/", {
          tenders: tenderId,
          requirement: req.requirement,
          quantity: req.quantity,
          units: req.units,
          description: req.description,
        });
      }

      toast.success("Tender created successfully.");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create tender.");
    }
  };

  return (
    <div className="make-tender-container">
      <h1>
        <FaHammer /> Create Tender
      </h1>

      <label>Service:</label>
      <select
        name="service"
        value={formData.service}
        onChange={handleInput}
        className="input-field"
      >
        <option value="">Select service</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <label>
        <FaUsers /> Select Contractors:
      </label>
      <div
        className="input-field contractor-select"
        onClick={() => navigate("/select-contractors")}
      >
        {selectedContractors.length > 0
          ? `${selectedContractors.length} contractor(s) selected`
          : "Click to select contractors"}
      </div>
      <label>Supervisor ID:</label>
      <input
        type="number"
        name="supervisor"
        value={formData.supervisor}
        onChange={handleInput}
        className="input-field"
      />

      <label>
        <FaMapMarkerAlt /> Location:
      </label>
      <input
        type="text"
        name="location"
        value={formData.location}
        onChange={handleInput}
        className="input-field"
      />

      <label>
        <FaCalendarAlt /> Start Time:
      </label>
      <input
        type="datetime-local"
        name="start_time"
        value={formData.start_time}
        onChange={handleInput}
        className="input-field"
      />

      <label>
        <FaCalendarAlt /> End Time:
      </label>
      <input
        type="datetime-local"
        name="end_time"
        value={formData.end_time}
        onChange={handleInput}
        className="input-field"
      />

      <label>Duration (days):</label>
      <input
        type="number"
        min="1"
        name="duration"
        value={formData.duration}
        onChange={handleInput}
        className="input-field"
      />

      <h3>
        <FaClipboardList /> Requirements:
      </h3>
      {formData.requirements.map((req, index) => (
        <RequirementInput
          key={index}
          index={index}
          requirement={req}
          requirementsList={requirementsList}
          onChange={handleRequirementChange}
          onDelete={deleteRequirement}
        />
      ))}

      <button type="button" onClick={addRequirement} className="add-btn">
        <FaPlus /> Add Requirement
      </button>

      <button type="button" onClick={handleTenderSubmit} className="submit-btn">
        Submit Tender
      </button>
    </div>
  );
}

export default MakeTender;
