# Local Konnect Platform

A comprehensive hyperlocal service marketplace connecting customers with contractors and supervisors for home services and construction projects. Local Konnect revolutionizes local service discovery through AI-powered voice assistance, 3D model visualization, and a dual-track trust network system.

## 🌟 Key Features

### 🎯 Core Platform Features
- **Multi-User System**: Customers, Contractors, and Supervisors with role-based access
- **Formal Tender System**: Complete bidding and project management workflow
- **Trust Network**: Community-driven contractor recommendations
- **Quick Service Jobs**: Urgent service requests outside formal bidding
- **3D Model Viewer**: Interactive visualization of project models
- **AI Voice Assistant**: Multi-language natural language processing
- **Interior Design AI**: Smart wall painting and texture visualization tool

### 🗣️ AI-Powered Voice Integration
- **Multi-Language Support**: Hindi, English
- **Gemini AI Integration**: Intelligent parsing of voice and text queries
- **Quick Service Requests**: Voice-enabled rapid service posting
- **Natural Language Processing**: Automatic service type and urgency detection

### 🤝 Hyperlocal Trust Network
- **Social Recommendations**: Community-driven contractor discovery
- **Trust Score Algorithm**: Intelligent ranking based on network connections
- **Quick Jobs Platform**: Alternative to formal tenders for urgent needs
- **Network Visualization**: Clear trust relationship mapping

### 🏗️ Comprehensive Project Management
- **Tender Creation & Bidding**: Full lifecycle tender management
- **Milestone Tracking**: Project progress monitoring
- **File Management**: Document and media attachments
- **Virtual & Physical Appointments**: Flexible meeting options
- **Audit Logging**: Complete project history tracking

### 🎨 AI-Powered Interior Design
- **Smart Wall Detection**: Automatic wall identification using Segment Anything Model (SAM)
- **Virtual Paint Visualization**: Real-time wall color preview and simulation
- **Color Recommendations**: AI-generated color palette suggestions
- **Texture Mapping**: Advanced texture and pattern application
- **Room Visualization**: Complete room makeover previews
- **Cost-Effective Planning**: Avoid expensive paint mistakes with virtual testing

## 🔧 Technical Architecture

### Backend (Django REST Framework)
- **Language**: Python 3.11+
- **Framework**: Django 5.2.1 with REST Framework
- **Authentication**: JWT-based user authentication
- **Database**: PostgreSQL
- **AI Integration**: Google Gemini API
- **File Storage**: Media files for images and 3D models

### Frontend Applications
1. **Customer Portal** (`local_konnect_frontend/`)
   - React 19 with Vite
   - 3D model viewer with Three.js
   - Voice recognition and AI integration
   - Responsive dashboard and tender management

2. **Contractor Portal** (`lk_frontend_contractor/`)
   - Bid management and project tracking
   - Profile and rating system
   - Mobile-responsive interface

3. **Supervisor Portal** (`lk_frontend_supervisor/`)
   - Project oversight and guidance
   - Analytics and reporting
   - Quality assurance tools

### Key Technologies
- **3D Visualization**: Three.js, React Three Fiber, React Three Drei
- **Voice Recognition**: Web Speech API
- **AI Processing**: Google Gemini API
- **Computer Vision**: Segment Anything Model (SAM) for wall detection
- **Interior Design AI**: Deep learning models for color and texture recommendations

## 🏗️ Project Structure

```
Local-Konnect/
├── lk_backend/                    # Django REST API Backend
│   ├── accounts/                  # User management (Customer, Contractor, Supervisor)
│   ├── needs/                     # Service categories and requirements
│   ├── works/                     # Tender system and project management
│   ├── trust_network/             # Hyperlocal trust and quick jobs
│   ├── model_files/               # 3D model management
│   └── appointments/              # Virtual and physical meetings
├── local_konnect_frontend/        # Customer React App
├── lk_frontend_contractor/        # Contractor React App
├── lk_frontend_supervisor/        # Supervisor React App
└── env/                          # Python virtual environment
```

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 16+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Deekshi05/Local-Konnect.git
cd Local-Konnect
```

2. **Backend Setup**
```bash
# Activate virtual environment
.\env\Scripts\activate  # Windows
# source env/bin/activate  # Linux/Mac

# Install dependencies
cd lk_backend
pip install -r ../requirements.txt

# Database migration
python manage.py migrate

# Create sample data (optional)
python seed_realistic_data.py

# Start backend server
python manage.py runserver
```

3. **Frontend Setup**
```bash
# Customer Portal
cd local_konnect_frontend
npm install
npm run dev

# Contractor Portal (new terminal)
cd lk_frontend_contractor
npm install
npm run dev

# Supervisor Portal (new terminal)
cd lk_frontend_supervisor
npm install
npm run dev
```

4. **AI Integration Setup**
```bash
# Get Gemini API key from Google AI Studio
# Add to lk_backend/lk_backend/settings.py:
GEMINI_API_KEY = 'your-api-key-here'
```

5. **AI Setup (Interior Design Tool)**
```bash
# Download SAM model for wall detection
# Visit: https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth
# Create checkpoints folder: main/static/checkpoints/
# Place the downloaded model file in the checkpoints folder

# Install additional ML dependencies
pip install segment-anything opencv-python pillow numpy
```

### Quick Start Script
```bash
# Use the provided PowerShell script
.\start-with-3d-viewer.ps1
```

## 🎯 User Roles & Capabilities

### 👤 Customers
- Post formal tenders with detailed requirements
- Request quick services via voice/text
- Discover contractors through trust network
- Manage project milestones and payments
- Upload 3D models for visualization
- Rate and recommend contractors
- **Use AI Tool**: Visualize wall colors and textures before painting
- **Get Design Recommendations**: AI-powered color and texture suggestions
- **Virtual Room Makeover**: Preview complete room transformations

### 🔨 Contractors
- Browse and bid on tenders
- Express interest in quick jobs
- Manage project delivery and milestones
- Build trust network presence
- Upload work portfolios and certifications

### 👨‍💼 Supervisors
- Provide tender creation assistance
- Oversee project quality and progress
- Offer expert consultation
- Manage virtual and physical appointments
- Generate project reports and analytics

## 🌐 API Features

### Authentication & User Management
- Multi-role registration (Customer/Contractor/Supervisor)
- JWT-based authentication
- Profile management with image uploads
- Password reset and email verification

### Tender Management
- Create tenders (manual or assisted)
- Bid submission and evaluation
- Milestone creation and tracking
- File attachments and media support
- Audit logging and version control

### Trust Network
- Social contractor recommendations
- Trust score calculation
- Quick job posting and assignment
- Network-based contractor discovery

### 3D Model Integration
- GLB/GLTF file upload and management
- Interactive 3D model viewer
- User preferences and settings
- Responsive model display

### Interior Design AI
- **Image Upload & Processing**: Upload room photos for AI analysis
- **Automatic Wall Detection**: SAM model identifies paintable wall surfaces
- **Color Selection Tool**: Interactive color picker with real-time preview
- **Texture Application**: Apply various textures and patterns to walls
- **AI Recommendations**: Smart color and design suggestions based on room analysis
- **Before/After Comparison**: Side-by-side visualization of changes

## 🛠️ Development Features

### Testing & Debugging
- Comprehensive test suites
- API testing scripts
- Debug utilities for tender assistance
- 3D integration testing

### Documentation
- Complete API documentation
- Implementation guides
- Setup instructions
- Feature summaries

### Environment Management
- Python virtual environment
- Environment-specific settings
- Development and production configurations

## 🔐 Security Features

- JWT token authentication
- Role-based access control
- Input validation and sanitization
- File upload security
- API rate limiting ready

## 📱 Mobile Responsiveness

- Mobile-first design approach
- Touch-friendly interfaces
- Responsive 3D model viewer
- Voice recognition on mobile devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation files
- Review the API documentation

## 🏆 Future Roadmap

- Real-time chat integration
- Advanced analytics dashboard
- Mobile app development
- Payment gateway integration
- Multi-city expansion features
- Advanced AI recommendations

## 🎨 Interior Design Workflow

### For Customers:
1. **Upload Room Photo**: Take or upload a photo of your room
2. **AI Wall Detection**: System automatically identifies walls using SAM AI
3. **Color Selection**: Choose from recommended colors or pick custom colors
4. **Real-time Preview**: See instant visualization of color changes
5. **Texture Application**: Apply different textures and patterns

### Technical Implementation:
- **Computer Vision**: Segment Anything Model for precise wall detection
- **Image Processing**: Advanced algorithms for realistic color application
- **AI Recommendations**: Machine learning models trained on design principles
- **User Interface**: Intuitive tools for color and texture selection

---

**Local Konnect** - Connecting communities, one service at a time! 🏠✨