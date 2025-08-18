import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { servicesApi } from '../../api/services';
import { tendersApi } from '../../api/tenders';
import { tenderAssistanceApi } from '../../api/tenderAssistance';
import { userApi } from '../../api/users';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { isDateTimeInFuture, convertISTToUTC } from '../../utils/timezoneUtils';
import './CreateTender.css';

const CreateTender = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [services, setServices] = useState([]);
    const [requirements, setRequirements] = useState([]);
    const [supervisors, setSupervisors] = useState([]);
    const [contractors, setContractors] = useState([]); // Ensure it's initialized as an empty array
    const [selectedContractors, setSelectedContractors] = useState([]);
    const [loadingSupervisors, setLoadingSupervisors] = useState(false);
    const [loadingContractors, setLoadingContractors] = useState(false);
    
    // Contractor filter states
    const [contractorFilters, setContractorFilters] = useState({
        minRating: '',
        minExperience: '',
        sortBy: 'rating',
        sortOrder: 'desc'
    });
    const [filteredContractors, setFilteredContractors] = useState([]);
    
    // Get assistance data if creating from assistance
    const assistanceData = location.state?.assistance;
    const [formData, setFormData] = useState({
        title: '',
        service: '',
        description: '',
        budget: '',
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        location: '',
        requirements: [],
        customer_limit: 1,
        supervisor: '',  // Added supervisor field
        priority: 'medium',  // Added priority field
        payment_terms: '',  // Added payment terms
        special_requirements: '',  // Added special requirements
        contractor_qualifications: ''  // Added contractor qualifications
    });

    useEffect(() => {
        if (user) {
            loadServices();
        }
    }, [user]);

    const loadSupervisors = async (serviceId) => {
        try {
            setLoadingSupervisors(true);
            // Use the corrected API endpoint
            const response = await userApi.getSupervisorsByService(serviceId);
            const supervisorsData = Array.isArray(response.data) ? response.data : [];
            console.log('Supervisors data received:', supervisorsData); // Debug log
            setSupervisors(supervisorsData);
        } catch (error) {
            toast.error('Failed to load supervisors');
            console.error('Error loading supervisors:', error);
            setSupervisors([]);
        } finally {
            setLoadingSupervisors(false);
        }
    };

    const loadServices = async () => {
        try {
            const response = await servicesApi.getAllServices();
            setServices(response.data);
        } catch (error) {
            toast.error('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            // Validate required fields
            if (!formData.title || !formData.service || !formData.description || 
                !formData.budget || !formData.start_date || !formData.end_date || 
                !formData.start_time || !formData.end_time || !formData.location) {
                toast.error('Please fill in all required fields');
                return;
            }

            // Validate dates and times using IST
            const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
            const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);
            
            // Validate that start time is in the future (using IST)
            if (!isDateTimeInFuture(formData.start_date, formData.start_time)) {
                toast.error('Start date and time cannot be in the past (IST)');
                return;
            }

            // Validate that end time is after start time
            if (startDateTime >= endDateTime) {
                toast.error('End date and time must be after start date and time');
                return;
            }

            // Prepare datetime strings for backend
            // Convert IST input to UTC for backend storage
            const startDateTimeIST = `${formData.start_date}T${formData.start_time}:00`;
            const endDateTimeIST = `${formData.end_date}T${formData.end_time}:00`;
            
            // Convert IST to UTC for backend
            const startDateTimeUTC = convertISTToUTC(startDateTimeIST);
            const endDateTimeUTC = convertISTToUTC(endDateTimeIST);

            console.log('Original IST times:');
            console.log('Start time (IST):', startDateTimeIST);
            console.log('End time (IST):', endDateTimeIST);
            console.log('Converted UTC times for backend:');
            console.log('Start time (UTC):', startDateTimeUTC);
            console.log('End time (UTC):', endDateTimeUTC);

            if (formData.requirements.length === 0) {
                toast.error('Please add at least one requirement');
                return;
            }

            // Validate requirements
            for (const req of formData.requirements) {
                if (!req.requirement_id || !req.quantity || !req.units || !req.description) {
                    toast.error('Please fill in all requirement fields');
                    return;
                }
                if (req.quantity <= 0) {
                    toast.error('Requirement quantities must be greater than 0');
                    return;
                }
            }

            // Create tender with required fields
            const tenderData = {
                title: formData.title,
                service: parseInt(formData.service),
                description: formData.description,
                location: formData.location,
                start_date: formData.start_date,
                end_date: formData.end_date,
                start_time: startDateTimeUTC,
                end_time: endDateTimeUTC,
                budget: parseFloat(formData.budget),
                supervisor: parseInt(formData.supervisor),
                priority: formData.priority,
                status: 'published'
            };

            // Add assistance-related fields if creating from assistance
            if (assistanceData) {
                tenderData.consultation = assistanceData.id;
            }

            console.log('Sending tender data:', tenderData);
            
            let tenderId;
            if (assistanceData) {
                // For assisted tenders
                const assistedTenderData = {
                    assistance_id: assistanceData.id,
                    title: formData.title,
                    description: formData.description,
                    location: formData.location,
                    start_time: startDateTimeUTC,
                    end_time: endDateTimeUTC,
                    customer_limit: parseInt(formData.customer_limit)
                };
                
                console.log('Creating assisted tender:', assistedTenderData);
                const response = await tendersApi.createAssistedTender(assistedTenderData);
                tenderId = response.data.id || response.data.tender_id;
            } else {
                // For regular tenders
                console.log('Creating regular tender:', tenderData);
                const response = await tendersApi.createTender(tenderData);
                tenderId = response.data.id;
            }

            // Add requirements (match backend: requirement, quantity, units, description)
            const requirementPromises = formData.requirements.map(req => 
                tendersApi.addRequirement({
                    tender: tenderId,
                    requirement: req.requirement_id,
                    quantity: req.quantity,
                    units: req.units,
                    description: req.description
                })
            );

            await Promise.all(requirementPromises);

            // Assign selected contractors to the tender
            if (selectedContractors.length > 0) {
                try {
                    await tendersApi.assignContractors({
                        tender_id: tenderId,
                        contractor_ids: selectedContractors
                    });
                    console.log('Contractors assigned successfully');
                } catch (contractorError) {
                    console.warn('Failed to assign contractors:', contractorError);
                    toast.warn('Tender created but failed to assign some contractors');
                }
            }

            toast.success('Tender created successfully!');
            navigate('/customer/tenders');
        } catch (error) {
            console.error('Error creating tender:', error);
            // Log the full error response for debugging
            if (error.response) {
                console.log('Error response data:', error.response.data);
                const errorMessage = error.response.data.detail || 
                    Object.values(error.response.data)[0]?.[0] ||
                    'Failed to create tender';
                toast.error(errorMessage);
            } else {
                toast.error('Network error occurred');
            }
        } finally {
            setCreating(false);
        }
    };

    const calculateDays = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate - startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset supervisor when service changes
            ...(name === 'service' ? { supervisor: '' } : {})
        }));

        // Load contractors and supervisors when service is selected
        if (name === 'service' && value) {
            loadContractors(value);
            loadSupervisors(value);
        }
    };

    const loadContractors = async (serviceId) => {
        try {
            setLoadingContractors(true);
            const response = await userApi.getContractorsByService(serviceId);
            
            // Handle the response structure from the backend
            const contractorsData = response.data?.contractors || response.data || [];
            console.log('Contractors data received:', contractorsData); // Debug log
            const contractorsArray = Array.isArray(contractorsData) ? contractorsData : [];
            setContractors(contractorsArray);
            setFilteredContractors(contractorsArray); // Initialize filtered contractors
        } catch (error) {
            toast.error('Failed to load contractors');
            console.error('Error loading contractors:', error);
            setContractors([]);
            setFilteredContractors([]);
        } finally {
            setLoadingContractors(false);
        }
    };

    const handleContractorSelection = (contractorId) => {
        setSelectedContractors(prev => {
            if (prev.includes(contractorId)) {
                return prev.filter(id => id !== contractorId);
            }
            return [...prev, contractorId];
        });
    };

    // Filter contractors based on criteria
    const filterContractors = () => {
        let filtered = [...contractors];

        // Apply rating filter
        if (contractorFilters.minRating) {
            filtered = filtered.filter(contractor => 
                (contractor.rating || 0) >= parseFloat(contractorFilters.minRating)
            );
        }

        // Apply experience filter
        if (contractorFilters.minExperience) {
            filtered = filtered.filter(contractor => 
                (contractor.experience || 0) >= parseInt(contractorFilters.minExperience)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let valueA = contractorFilters.sortBy === 'rating' ? (a.rating || 0) : (a.experience || 0);
            let valueB = contractorFilters.sortBy === 'rating' ? (b.rating || 0) : (b.experience || 0);

            if (contractorFilters.sortBy === 'name') {
                valueA = `${a.user?.first_name || ''} ${a.user?.last_name || ''}`;
                valueB = `${b.user?.first_name || ''} ${b.user?.last_name || ''}`;
                return contractorFilters.sortOrder === 'asc' 
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA);
            }

            return contractorFilters.sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
        });

        setFilteredContractors(filtered);
    };

    // Update filtered contractors when filters change
    useEffect(() => {
        filterContractors();
    }, [contractorFilters, contractors]);

    const handleFilterChange = (filterName, value) => {
        setContractorFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const selectAllContractors = () => {
        const allContractorIds = filteredContractors.map(contractor => contractor.id);
        setSelectedContractors(allContractorIds);
    };

    const selectTopRatedContractors = (count = 5) => {
        const topRated = [...filteredContractors]
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, count)
            .map(contractor => contractor.id);
        setSelectedContractors(topRated);
    };

    const selectExperiencedContractors = (minExp = 3) => {
        const experienced = filteredContractors
            .filter(contractor => (contractor.experience || 0) >= minExp)
            .map(contractor => contractor.id);
        setSelectedContractors(experienced);
    };

    const clearContractorSelection = () => {
        setSelectedContractors([]);
    };

    const handleRequirementChange = (e, index, field) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            requirements: prev.requirements.map((req, i) => 
                i === index ? { ...req, [field]: value } : req
            )
        }));
    };

    useEffect(() => {
        const loadRequirements = async () => {
            try {
                const response = await tendersApi.getRequirementsList();
                setRequirements(response.data);
            } catch (error) {
                toast.error('Failed to load requirements');
            }
        };
        
        loadRequirements();
    }, []);

    const addRequirement = () => {
        setFormData(prev => ({
            ...prev,
            requirements: [...prev.requirements, { description: '', quantity: 1, units: '' }]
        }));
    };

    const removeRequirement = (index) => {
        setFormData(prev => ({
            ...prev,
            requirements: prev.requirements.filter((_, i) => i !== index)
        }));
    };

    if (!user) {
        return (
            <div className="create-tender">
                <LoadingSpinner />
                <p className="loading-text">Loading user data...</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="create-tender">
                <LoadingSpinner />
                <p className="loading-text">Loading services and requirements...</p>
            </div>
        );
    }

    return (
        <div className="create-tender">
            <h1>Create New Tender</h1>
            {creating && (
                <div className="overlay">
                    <LoadingSpinner />
                    <p>Creating tender...</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="tender-form">
                {/* Basic Information Section */}
                <div className="form-section">
                    <h3 className="section-title">Basic Information</h3>
                    
                    <div className="form-group">
                        <label htmlFor="service">Service Category *</label>
                        <select
                            id="service"
                            name="service"
                            value={formData.service}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select a service</option>
                            {services.map(service => (
                                <option key={service.id} value={service.id}>
                                    {service.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="title">Tender Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter a descriptive title for your tender"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows={4}
                            placeholder="Describe the work you need done"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="budget">Budget *</label>
                            <input
                                type="number"
                                id="budget"
                                name="budget"
                                value={formData.budget}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="0.01"
                                placeholder="Enter your budget"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="location">Location *</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter the work location"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="customer_limit">Max days to complete *</label>
                            <input
                                type="number"
                                id="customer_limit"
                                name="customer_limit"
                                value={formData.customer_limit}
                                onChange={handleInputChange}
                                required
                                min="1"
                                max="20"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="priority">Priority Level *</label>
                            <select
                                id="priority"
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Schedule Section */}
                <div className="form-section">
                    <h3 className="section-title">Schedule</h3>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="start_date">Start Date *</label>
                            <input
                                type="date"
                                id="start_date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleInputChange}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="start_time">Start Time *</label>
                            <input
                                type="time"
                                id="start_time"
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="end_date">End Date *</label>
                            <input
                                type="date"
                                id="end_date"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleInputChange}
                                required
                                min={formData.start_date}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="end_time">End Time *</label>
                            <input
                                type="time"
                                id="end_time"
                                name="end_time"
                                value={formData.end_time}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Team Selection Section */}
                <div className="form-section">
                    <h3 className="section-title">Team Selection</h3>
                    
                    <div className="form-group">
                        <label htmlFor="supervisor">Supervisor *</label>
                        {!formData.service ? (
                            <p className="info-text">Please select a service first to view available supervisors</p>
                        ) : (
                            <>
                                <select
                                    id="supervisor"
                                    name="supervisor"
                                    value={formData.supervisor}
                                    onChange={handleInputChange}
                                    required
                                    disabled={loadingSupervisors}
                                >
                                    <option value="">Select a supervisor</option>
                                    {supervisors.map(supervisorService => {
                                        // Handle both possible data structures
                                        const supervisor = supervisorService.supervisor || supervisorService;
                                        const user = supervisor?.user;
                                        if (!user) return null;
                                        
                                        return (
                                            <option key={supervisor.id} value={supervisor.id}>
                                                {user.first_name} {user.last_name} - Rating: {supervisor.rating || 'N/A'}
                                            </option>
                                        );
                                    })}
                                </select>
                                {loadingSupervisors && <small>Loading supervisors...</small>}
                                {supervisors.length === 0 && !loadingSupervisors && (
                                    <small>No supervisors available for this service</small>
                                )}
                                {formData.supervisor && supervisors.length > 0 && (
                                    <div className="supervisor-details-info">
                                        {(() => {
                                            const selectedSupervisor = supervisors.find(s => {
                                                const supervisor = s.supervisor || s;
                                                return supervisor.id.toString() === formData.supervisor;
                                            });
                                            
                                            if (selectedSupervisor) {
                                                const supervisor = selectedSupervisor.supervisor || selectedSupervisor;
                                                return (
                                                    <small>
                                                        Rating: {supervisor.rating || 'N/A'}
                                                    </small>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Contractor Selection within Team Selection */}
                    <div className="contractors-section">
                        <label>Select Eligible Contractors</label>
                        {!formData.service ? (
                            <p className="info-text">Please select a service first to view available contractors</p>
                        ) : (
                            <>
                                {loadingContractors ? (
                                    <div className="loading-contractors">
                                        <LoadingSpinner />
                                        <p>Loading contractors...</p>
                                    </div>
                                ) : contractors.length === 0 ? (
                                    <p className="info-text">No contractors available for this service</p>
                                ) : (
                                    <div className="contractors-container">
                                        {/* Contractor Filters */}
                                        <div className="contractor-filters">
                                            <h4>Filter & Sort Contractors</h4>
                                            <div className="filters-row">
                                                <div className="filter-group">
                                                    <label>Min Rating:</label>
                                                    <select
                                                        value={contractorFilters.minRating}
                                                        onChange={(e) => handleFilterChange('minRating', e.target.value)}
                                                    >
                                                        <option value="">Any Rating</option>
                                                        <option value="4.5">4.5+ Stars</option>
                                                        <option value="4.0">4.0+ Stars</option>
                                                        <option value="3.5">3.5+ Stars</option>
                                                        <option value="3.0">3.0+ Stars</option>
                                                    </select>
                                                </div>
                                                
                                                <div className="filter-group">
                                                    <label>Min Experience:</label>
                                                    <select
                                                        value={contractorFilters.minExperience}
                                                        onChange={(e) => handleFilterChange('minExperience', e.target.value)}
                                                    >
                                                        <option value="">Any Experience</option>
                                                        <option value="1">1+ Years</option>
                                                        <option value="3">3+ Years</option>
                                                        <option value="5">5+ Years</option>
                                                        <option value="10">10+ Years</option>
                                                    </select>
                                                </div>
                                                
                                                <div className="filter-group">
                                                    <label>Sort By:</label>
                                                    <select
                                                        value={contractorFilters.sortBy}
                                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                                    >
                                                        <option value="rating">Rating</option>
                                                        <option value="experience">Experience</option>
                                                        <option value="name">Name</option>
                                                    </select>
                                                </div>
                                                
                                                <div className="filter-group">
                                                    <label>Order:</label>
                                                    <select
                                                        value={contractorFilters.sortOrder}
                                                        onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                                                    >
                                                        <option value="desc">High to Low</option>
                                                        <option value="asc">Low to High</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Selection Buttons */}
                                        <div className="quick-selection">
                                            <h4>Quick Selection</h4>
                                            <div className="selection-buttons">
                                                <button
                                                    type="button"
                                                    onClick={selectAllContractors}
                                                    className="selection-btn select-all"
                                                >
                                                    Select All ({filteredContractors.length})
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => selectTopRatedContractors(5)}
                                                    className="selection-btn select-top-rated"
                                                >
                                                    Top 5 Rated
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => selectExperiencedContractors(3)}
                                                    className="selection-btn select-experienced"
                                                >
                                                    3+ Years Exp
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={clearContractorSelection}
                                                    className="selection-btn clear-selection"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                            <p className="selection-info">
                                                {selectedContractors.length} contractor(s) selected
                                            </p>
                                        </div>

                                        {/* Contractors List */}
                                        <div className="contractors-list">
                                            <h4>Available Contractors ({filteredContractors.length})</h4>
                                            <div className="contractors-grid">
                                                {filteredContractors.map(contractor => {
                                                    const user = contractor?.user;
                                                    if (!user) return null;
                                                    
                                                    const isSelected = selectedContractors.includes(contractor.id);
                                                    
                                                    return (
                                                        <div 
                                                            key={contractor.id} 
                                                            className={`contractor-card ${isSelected ? 'selected' : ''}`}
                                                            onClick={() => handleContractorSelection(contractor.id)}
                                                        >
                                                            <div className="contractor-header">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => handleContractorSelection(contractor.id)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                                <div className="contractor-name">
                                                                    {user.first_name} {user.last_name}
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="contractor-details">
                                                                <div className="detail-item">
                                                                    <span className="label">Rating:</span>
                                                                    <span className="value rating">
                                                                        {contractor.rating ? (
                                                                            <>
                                                                                ⭐ {contractor.rating}/5
                                                                            </>
                                                                        ) : (
                                                                            'N/A'
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                
                                                                {contractor.experience && (
                                                                    <div className="detail-item">
                                                                        <span className="label">Experience:</span>
                                                                        <span className="value">
                                                                            {contractor.experience} years
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                
                                                                {contractor.specialization && (
                                                                    <div className="detail-item">
                                                                        <span className="label">Specialization:</span>
                                                                        <span className="value">
                                                                            {contractor.specialization}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Requirements Section */}
                <div className="form-section">
                    <h3 className="section-title">Project Requirements</h3>
                    
                    <div className="form-group requirements-section">
                        <label>Requirements *</label>
                        <button type="button" onClick={addRequirement} className="add-requirement-button">
                            Add Requirement
                        </button>

                        {formData.requirements.map((req, index) => (
                            <div key={index} className="requirement-item">
                                <div className="requirement-fields">
                                    <select
                                        value={req.requirement_id || ''}
                                        onChange={(e) => handleRequirementChange(e, index, 'requirement_id')}
                                        required
                                    >
                                        <option value="">Select requirement type</option>
                                        {requirements.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>

                                    <input
                                        type="number"
                                        value={req.quantity || ''}
                                        onChange={(e) => handleRequirementChange(e, index, 'quantity')}
                                        placeholder="Quantity"
                                        required
                                        min="1"
                                    />

                                    <input
                                        type="text"
                                        value={req.units || ''}
                                        onChange={(e) => handleRequirementChange(e, index, 'units')}
                                        placeholder="Units"
                                        required
                                    />

                                    <textarea
                                        value={req.description || ''}
                                        onChange={(e) => handleRequirementChange(e, index, 'description')}
                                        placeholder="Description"
                                        rows={2}
                                        required
                                    />
                                </div>

                                <button 
                                    type="button" 
                                    onClick={() => removeRequirement(index)}
                                    className="remove-requirement-button"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="submit-button" 
                        disabled={creating}
                    >
                        {creating ? 'Creating Tender...' : 'Create Tender'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTender;
