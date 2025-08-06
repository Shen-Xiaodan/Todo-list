# Todo List

A full-stack Todo List application built with React frontend, Node.js middleware, and Java backend.

## 🚀 Features

- User authentication (signup/login)
- Create, read, update, delete todos
- Mark todos as complete/incomplete
- User-specific todo management
- Real-time data persistence

## 🏗️ Architecture

This application follows a three-tier architecture:

1. **Frontend**: React with Vite
2. **Middleware**: Node.js Express server
3. **Backend**: Java with Spark framework
4. **Database**: MySQL

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- Java JDK (v8 or higher)
- MySQL Server
- Git

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Shen-Xiaodan/Todo-list.git
cd Todo-list
```

### 2. Database Setup
Create a MySQL database and run the initialization script:
```bash
mysql -u your_username -p < backend/init_database.sql
```

### 3. Backend Configuration
Navigate to the backend directory and configure the database connection:
```bash
cd backend
cp config.properties.example config.properties
```

Edit `config.properties` with your database credentials:
```properties
db.url=jdbc:mysql://localhost:3306/TodoList?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC
db.username=your_actual_username
db.password=your_actual_password
server.port=8080
```

### 4. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

#### Middleware Dependencies
```bash
cd server
npm install
cd ..
```

### 5. Start the Application

You can start all services at once using the provided script:
```bash
./start-all.sh
```

Or start each service individually:

#### Start Java Backend
```bash
cd backend
./compile-and-run.sh
```

#### Start Node.js Middleware
```bash
cd server
npm start
```

#### Start React Frontend
```bash
npm run dev
```

## 🌐 Application URLs

- **Frontend**: http://localhost:5173
- **Middleware API**: http://localhost:3001
- **Java Backend API**: http://localhost:8080

## 📚 API Documentation

### Authentication Endpoints

#### User Signup
```bash
POST /api/signup
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

#### User Login
```bash
POST /api/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

### Todo Endpoints

#### Get User Todos
```bash
GET /api/todos?userId={userId}
```

#### Create Todo
```bash
POST /api/todos
Content-Type: application/json

{
  "text": "Todo description",
  "done": false,
  "userId": 1
}
```

#### Update Todo
```bash
PUT /api/todos/{todoId}
Content-Type: application/json

{
  "text": "Updated todo description",
  "done": true,
  "userId": 1
}
```

#### Delete Todo
```bash
DELETE /api/todos/{todoId}?userId={userId}
```

## 🧪 Testing

### Test the API
Run the API test script:
```bash
cd backend
./test-api.sh
```

### Frontend Testing
```bash
npm run lint
```

## 📁 Project Structure

```
todo-list/
├── src/                    # React frontend source
│   ├── App.jsx            # Main application component
│   ├── App.css            # Application styles
│   ├── main.jsx           # Application entry point
│   └── services/
│       └── todoApi.js     # API service layer
├── server/                # Node.js middleware
│   ├── server.js          # Express server
│   └── package.json       # Node.js dependencies
├── backend/               # Java backend
│   ├── JavaTodoAPI.java   # Main Java application
│   ├── config.properties  # Database configuration
│   ├── init_database.sql  # Database schema
│   └── *.jar             # Java dependencies
├── public/               # Static assets
├── package.json          # Frontend dependencies
├── vite.config.js        # Vite configuration
├── start-all.sh          # Start all services script
├── stop-all.sh           # Stop all services script
└── README.md             # This file
```

## 🔧 Development

### Frontend Development
The frontend is built with:
- React 19.1.0
- Vite for build tooling
- ESLint for code linting

### Middleware Development
The middleware server provides:
- CORS handling
- Request forwarding to Java backend
- Error handling and logging

### Backend Development
The Java backend uses:
- Spark framework for REST API
- MySQL for data persistence
- Gson for JSON serialization

## 🚦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `./start-all.sh` - Start all services
- `./stop-all.sh` - Stop all services

## 🔒 Security Features

- User authentication and authorization
- User-specific data isolation
- Input validation and sanitization
- Secure password handling

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in config.properties
   - Ensure database exists and is accessible

2. **Port Already in Use**
   - Check if services are already running
   - Use `./stop-all.sh` to stop all services
   - Verify ports 3001, 5173, and 8080 are available

3. **Java Compilation Errors**
   - Ensure all JAR dependencies are present in backend directory
   - Check Java version compatibility
   - Verify classpath in compile-and-run.sh

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Created by [Shen-Xiaodan](https://github.com/Shen-Xiaodan)

## 🙏 Acknowledgments

- React team for the amazing frontend framework
- Spark Java for the lightweight web framework
- Express.js for the middleware server
- MySQL for reliable data storage
