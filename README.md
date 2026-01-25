# Dance Booking System

A Node.js-based web platform for booking dance classes with role-based access control, session scheduling, and enrollment tracking. Features comprehensive admin management, organiser tools, and a user-friendly interface built with Express.js and Mustache templating.

## Demo

![Home Page](screenshots/home.png)
![Courses Overview](screenshots/courses.png)
![Admin Panel](screenshots/admin.png)
![Booking Interface](screenshots/booking.png)

## Why It's Cool

- **Role-Based Access Control**: Three-tier system (Admin, Organiser, User) with secure authentication and authorization middleware
- **Complete Booking Management**: Full lifecycle management from course creation to session scheduling and participant enrollment
- **Lightweight Database**: Uses NeDB (embedded database) for easy setup without external database dependencies
- **Server-Side Rendering**: Mustache templating engine for clean, maintainable server-rendered views
- **Comprehensive Testing**: Full test coverage with Mocha, Chai, and Supertest for routing, authentication, and business logic
- **Production Ready**: Docker support, security middleware (Helmet, CSRF protection), and structured error handling

## Tech Stack

- **Backend**: Node.js 18, Express.js, Express Session, bcryptjs
- **Database**: NeDB (embedded NoSQL database)
- **Templating**: Mustache (Mustache-Express)
- **Security**: Helmet, CSRF protection, express-validator
- **Testing**: Mocha, Chai, Supertest
- **DevOps**: Docker, Docker Compose, GitHub Actions (CI/CD)

## How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Bogdusik/Dance-Booking-System.git
   cd Dance-Booking-System
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with:
   ```
   PORT=3000
   NODE_ENV=development
   SESSION_SECRET=your-secret-key-change-this-in-production
   ```

4. **Start the application:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```
   Application will be available at `http://localhost:3000`

   **Alternative (Docker):**
   ```bash
   docker-compose up -d
   ```

> **Important**: Never hardcode secrets. Always use `.env` file for sensitive data.

## Project Structure

```
Dance-Booking-System/
├── app.js                        # Main application entry point
│
├── controllers/                  # Request handlers
│   ├── authController.js        # Authentication logic
│   ├── courseController.js      # Course management
│   └── organiserController.js    # Organiser operations
│
├── models/                       # Data models
│   ├── userModel.js             # User data operations
│   ├── courseModel.js           # Course data operations
│   ├── classModel.js            # Class/session operations
│   └── enrolmentModel.js        # Enrollment tracking
│
├── routes/                       # Route definitions
│   ├── index.js                 # Main routes
│   ├── auth.js                  # Authentication routes
│   └── organiser.js             # Organiser routes
│
├── middlewares/                  # Custom middleware
│   ├── authMiddleware.js        # Authentication & authorization
│   └── errorHandler.js          # Error handling
│
├── views/                        # Mustache templates
│   ├── index.mustache           # Home page
│   ├── login.mustache           # Login page
│   ├── courses.mustache         # Courses listing
│   ├── dashboard.mustache       # User dashboard
│   ├── manage_users.mustache    # Admin panel
│   └── [other views]
│
├── public/                       # Static assets
│   └── css/
│       └── style.css
│
├── db/                           # NeDB database files
│   └── [database files]
│
├── tests/                        # Test files
│   ├── auth.test.js
│   ├── course.test.js
│   ├── courseController.test.js
│   └── organiser.test.js
│
├── utils/                        # Utility functions
│   ├── logger.js                 # Winston logger
│   ├── validation.js             # Validation helpers
│   └── validators.js             # Custom validators
│
├── .github/workflows/            # CI/CD pipelines
│   └── ci.yml
│
├── Dockerfile                     # Docker configuration
└── docker-compose.yml            # Docker Compose configuration
```

## What I Learned

- **Role-Based Access Control**: Implemented secure authentication and authorization system with middleware for protecting routes based on user roles
- **Server-Side Rendering**: Built complete application using Mustache templating engine for server-rendered views instead of SPA architecture
- **Embedded Database**: Worked with NeDB for lightweight, file-based database operations without external database setup
- **Express.js Architecture**: Designed MVC-like structure with controllers, models, routes, and middleware for maintainable codebase
- **Security Best Practices**: Implemented security middleware (Helmet, CSRF protection), input validation, and secure session management
- **Testing Strategies**: Wrote comprehensive integration tests for authentication flows, route protection, and business logic validation

Fork it, use it, improve it - open to PRs!
