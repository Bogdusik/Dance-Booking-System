# 🎶 Dance Booking System

_A user-friendly web platform for booking dance classes, managing courses, and efficiently organizing participants._

[![CI](https://github.com/Bogdusik/Dance-Booking-System/workflows/CI/badge.svg)](https://github.com/Bogdusik/Dance-Booking-System/actions)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🛠️ Technologies

- **Node.js & Express.js** – Robust backend handling
- **NeDB** – Lightweight, embedded database
- **Mustache** – Clear and powerful templating engine
- **Custom Middleware** – Secure and efficient authentication

![Mustache](https://img.shields.io/badge/Mustache.js-000000?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Auth](https://img.shields.io/badge/Authentication-Custom-4A154B?style=for-the-badge&logo=auth0&logoColor=white)
![NeDB](https://img.shields.io/badge/NeDB-4A90E2?style=for-the-badge)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![REST API](https://img.shields.io/badge/REST_API-02569B?style=for-the-badge&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

## 🌟 Key Features

### 🔐 User Authentication
- Secure user login/logout
- Role-based access control (Admin, Organiser, User)

### 📅 Course & Session Management
- Easily create and edit dance courses and sessions
- Detailed management of participant lists

### ✅ Booking System
- Effortless enrolment and cancellation process
- Clear overview of upcoming bookings

### 📊 Admin Panel
- Comprehensive user and organiser management
- Interactive analytics dashboard

## 📸 Screenshots

## 🏠 Home Page  
<img width="1728" alt="Home Page Screenshot" src="https://github.com/user-attachments/assets/aab94363-1734-4aa3-a4e2-cbbdafe04cf8" />

## 🔐 Login Page  
<img width="1728" alt="Login Screenshot" src="https://github.com/user-attachments/assets/5496ebfa-7bd3-42a4-b90f-68f71888d117" />

## 📚 Courses Overview  
<img width="1711" alt="Courses Overview Screenshot" src="https://github.com/user-attachments/assets/9f40a838-2122-4b7f-993e-5c9162e6f9cf" />

## 🛠️ Admin Panel  
<img width="1712" alt="Admin Panel Screenshot" src="https://github.com/user-attachments/assets/e4d56622-5001-4ea1-b359-3ad831774c21" />
✨ **...and many more exciting features await you—discover them as you explore the app!** ✨


## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation

**Step 1: Clone the repository**
```bash
git clone https://github.com/Bogdusik/Dance-Booking-System.git
cd Dance-Booking-System
```

**Step 2: Install dependencies**
```bash
npm install
```

**Step 3: Configure environment variables**
```bash
cp .env.example .env
# Edit .env file with your configuration
```

**Step 4: Run the application**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 🐳 Running with Docker

**Using Docker Compose (Recommended):**
```bash
docker-compose up -d
```

**Using Docker:**
```bash
docker build -t dance-booking-system .
docker run -p 3000:3000 -v $(pwd)/db:/app/db dance-booking-system
```

The application will be available at [http://localhost:3000](http://localhost:3000)


## 🧪 Testing

This project includes **automated tests** to validate routing, access control, form validation, and error handling.

- ✅ Tested with: `Mocha`, `Chai`, `Supertest`
- 📂 Tests located in: `tests/` directory
- 📄 Summary available in: [`test_report.md`](./test_report.md)

**Run tests:**
```bash
npm test
```

**Run tests in watch mode:**
```bash
npm test -- --watch
```

## 🏗️ Project Structure

```
Dance-Booking-System/
├── app.js                 # Main application entry point
├── controllers/           # Request handlers
│   ├── authController.js
│   ├── courseController.js
│   └── organiserController.js
├── models/                # Data models
│   ├── userModel.js
│   ├── courseModel.js
│   ├── classModel.js
│   └── enrolmentModel.js
├── routes/                # Route definitions
│   ├── index.js
│   ├── auth.js
│   └── organiser.js
├── middlewares/           # Custom middleware
│   └── authMiddleware.js
├── views/                 # Mustache templates
├── public/                # Static assets
├── db/                    # NeDB database files
├── tests/                 # Test files
├── utils/                 # Utility functions
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
└── .github/workflows/     # CI/CD workflows
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-secret-key-change-this-in-production
```

See `.env.example` for reference.

## 🚀 Deployment

### Using Docker
```bash
docker-compose up -d
```

### Manual Deployment
1. Set `NODE_ENV=production`
2. Update `SESSION_SECRET` with a strong secret
3. Run `npm start`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🚧 Upcoming Features
- 💳 **Payment integration** (Stripe)
- 📧 **Notifications & reminders**
- 🎨 **Enhanced UI/UX**
- 🌟 **User feedback and rating system**
- 📊 **Advanced analytics dashboard**
- 🔄 **TypeScript migration**

## 📫 Contact

**Bogdan Bozhenko**
- [GitHub](https://github.com/Bogdusik)
- [Portfolio](https://personal-website-bogdusik.vercel.app/)
- [LinkedIn](https://www.linkedin.com/in/bohdan-bozhenko)

⭐ **Please feel free to contribute, submit issues or suggest features!** ⭐
