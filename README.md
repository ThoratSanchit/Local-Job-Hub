# Local Job Hub

A powerful fastify-based monolithic backend structured similarly to the `vms-config-api` ecosystem.

## 🚀 Features

- **Fastify**: High-performance mapping and asynchronous request routing.
- **Sequelize & MySQL**: Secure, scalable architecture equipped with retry/reconnect pooling natively synchronized to automatically define models securely.
- **JWT Middleware**: Built-in `jsonwebtoken` logic for guarding routes effectively.
- **TypeScript**: Statically typed throughout the layers, integrated alongside ESLint.

## 📂 Architecture Stack
```text
📦 local-job-hub
 ┣ 📂 src
 ┃ ┣ 📂 config         # DB configurations & sequences (dotenv binding)
 ┃ ┣ 📂 controllers    # Business logic endpoints matching routes 
 ┃ ┣ 📂 language       # Abstractions for text/static responses (e.g. Messages)
 ┃ ┣ 📂 middlewares    # Pluggable security implementations (e.g., verifyToken)
 ┃ ┣ 📂 models         # Sequelize schemas mapped to the database definitions
 ┃ ┣ 📂 repositories   # DB interface layer for retrieving and persisting models
 ┃ ┣ 📂 routes         # Fastify route registrations mapped into plugins
 ┃ ┣ 📂 utility        # Common helpers and standardized handlers
 ┃ ┗ 📜 app.ts         # Fastify core initializer & sync point 
 ┣ 📜 package.json
 ┣ 📜 tsconfig.json
 ┣ 📜 .eslintrc.json
 ┣ 📜 .gitignore
 ┗ 📜 .env
```

## 🛠 Prerequisites
You need **Node.js (v18+)** and an active **MySQL** connection running locally on `localhost:3306`.


## 🖥 Commands

Install missing dependencies strictly:
```bash
npm install
```

Start the application with continuous restart leveraging `nodemon`:
```bash
npm run dev
```

Inspect your code for problems via `eslint`:
```bash
npm run lint
```

Compile TypeScript mappings purely before shifting to a production environment:
```bash
npm run build
```

## 🔐 Environment Configurations
Create an `.env` matching your configuration inside the root directory. 
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=local_job_hub_db

# Security
JWT_SECRET=super_secret_key
```

rm -rf .git

Use This for remove the current git repository


---
*Created by Sanchit*


