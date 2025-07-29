import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect } from "react";
import api from "../../api";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaPlus,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClipboardList,
  FaHammer,
  FaUsers,
} from "react-icons/fa";
import "./MakeTender.css";

function MakeTender() {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedContractors, setSelectedContractors] = useState([]);
  const [services, setServices] = useState([]);
  const [requirementsList, setRequirementsList] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
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
  }, []);

  useEffect(() => {
    if (location.state?.selectedContractors) {
      setSelectedContractors(location.state.selectedContractors);
    }
    if (location.state?.service) {
      setSelectedService(location.state.service);
      setFormData((prev) => ({
        ...prev,
        service: parseInt(location.state.service.id),
      }));
    }
  }, [location.state]);

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        { requirment: "", quantity: 1, units: "", description: "" },
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
      if (!req.requirment)
        return `Requirement ${i + 1}: Please select a requirement.`;
      if (req.quantity <= 0)
        return `Requirement ${i + 1}: Quantity must be greater than 0.`;
      if (!req.units) return `Requirement ${i + 1}: Please enter units.`;
    }
    return null;
  };

  const handleTenderSubmit = async () => {
    const error = validateForm();
    console.log(formData);
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

      await api.post("/api/tenders/assign-contractors/", {
        tender_id: tenderId,
        contractor_ids: selectedContractors,
      });

      for (const req of formData.requirements) {
        await api.post("/api/tender-requirments/", {
          tenders: tenderId,
          requirments: req.requirment,
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
      <h1>Create Tender</h1>

      <div className="form-group">
        <label>
          <FaHammer className="icon" /> Service:
        </label>
        <select
          name="service"
          value={formData.service}
          onChange={(e) => {
            const selected = services.find(
              (s) => s.id === parseInt(e.target.value)
            );
            setSelectedService(selected);
            handleInput(e);
          }}
        >
          <option value="">Select service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <button
        className="select-btn"
        onClick={() =>
          navigate("/select-contractors", {
            state: {
              serviceId: formData.service,
              service: selectedService,
              selectedContractors: selectedContractors,
            },
          })
        }
      >
        <FaUsers className="icon" /> Select Contractors
      </button>

      {selectedContractors.length > 0 && (
        <p className="selected-contractors">
          Selected Contractors: {selectedContractors.join(", ")}
        </p>
      )}

      <div className="form-group">
        <label>
          <FaClipboardList className="icon" /> Supervisor ID:
        </label>
        <input
          name="supervisor"
          placeholder="Supervisor ID"
          onChange={handleInput}
        />
      </div>

      <div className="form-group">
        <label>
          <FaMapMarkerAlt className="icon" /> Location:
        </label>
        <input name="location" placeholder="Location" onChange={handleInput} />
      </div>

      <div className="form-group">
        <label>
          <FaCalendarAlt className="icon" /> Start Time:
        </label>
        <input type="datetime-local" name="start_time" onChange={handleInput} />
      </div>

      <div className="form-group">
        <label>
          <FaCalendarAlt className="icon" /> End Time:
        </label>
        <input type="datetime-local" name="end_time" onChange={handleInput} />
      </div>

      <div className="form-group">
        <label>Customer Limit:</label>
        <input
          type="number"
          name="customer_limit"
          min={1}
          value={formData.customer_limit}
          onChange={handleInput}
        />
      </div>

      <h2>Requirements</h2>
      {formData.requirements.map((req, index) => (
        <div key={index} className="requirement-item">
          <select
            value={req.requirment}
            onChange={(e) =>
              handleRequirementChange(index, "requirment", e.target.value)
            }
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
            placeholder="Quantity"
            value={req.quantity}
            onChange={(e) =>
              handleRequirementChange(index, "quantity", e.target.value)
            }
          />
          <input
            placeholder="Units"
            value={req.units}
            onChange={(e) =>
              handleRequirementChange(index, "units", e.target.value)
            }
          />
          <input
            placeholder="Description"
            value={req.description}
            onChange={(e) =>
              handleRequirementChange(index, "description", e.target.value)
            }
          />
          <button
            className="delete-btn"
            onClick={() => deleteRequirement(index)}
          >
            Delete
          </button>
        </div>
      ))}

      <button className="add-btn" onClick={addRequirement}>
        <FaPlus /> Add Requirement
      </button>

      <button className="submit-btn" onClick={handleTenderSubmit}>
        Post Tender
      </button>
    </div>
  );
}

export default MakeTender;
