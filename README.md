# ISYARA Backend

Backend for ISYARA - Indonesian Sign Language Learning Application with Gamification

## Tech Stack

- Backend: Express.js (Node.js)
- Database: Supabase (PostgreSQL)
- Deployment: Railway
- Language: JavaScript (ES Modules)
- Style guide: ESLint + Prettier
- Database Module: Supabase JS Client
- Authentication: Google OAuth via Supabase

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   PORT=3000
   ```
4. Run the development server: `npm run dev`

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with nodemon
- `npm run lint`: Run ESLint to check code quality

## API Endpoints

### Auth
- `POST /api/auth/save-user`: Save or update user data after Google OAuth login
- `POST /api/auth/register`: Register manually with email and password
- `GET /api/auth/me`: Get current user profile (requires authentication)
- `POST /api/auth/test-google-user`: Test endpoint to simulate Google OAuth login (for development only)

### Users
- `GET /api/users/:id`: Get user by ID
- `PUT /api/users/:id`: Update user profile (requires authentication)

### Letters
- `GET /api/letters`: Get all letters with grouping by modules
- `GET /api/letters/:char`: Get letter by character

### Progress
- `GET /api/progress`: Get all progress for current user (requires authentication)
- `POST /api/progress`: Update progress for a letter (requires authentication)
- `GET /api/progress/:letter_id`: Get progress for a specific letter (requires authentication)

### Words
- `GET /api/words/random`: Get random word for word building exercise
- `POST /api/words/success`: Update user points after successful word completion (requires authentication)

### Leaderboard
- `GET /api/leaderboard`: Get top users based on points

### Health Check
- `GET /api/health`: Health check endpoint

## Authentication

This API uses Supabase authentication. To access protected endpoints, include an Authorization header with a Bearer token: 
`Authorization: Bearer your_token_here`

## Google OAuth Integration

The authentication flow with Google works as follows:

1. Frontend uses Supabase Auth UI or client to initiate Google OAuth
2. After successful Google login, frontend receives user data from Supabase
3. Frontend calls `/api/auth/save-user` endpoint with the user data
4. Backend saves/updates user information in the database
5. Frontend stores the access token for authenticated requests

For detailed implementation instructions, see [docs/google-auth.md](docs/google-auth.md) 