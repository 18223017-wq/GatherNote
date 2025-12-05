# GatherNote API Server

REST API server for GatherNote - A collaborative note-taking platform built with ExpressJS, Prisma, and MySQL.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication
- **User Management**: User profiles with avatar support
- **Folder Organization**: Organize notes in customizable folders
- **Note Management**: Create, read, update, delete notes with rich content
- **Advanced Search**: Full-text search across notes with autocomplete
- **Group Collaboration**: Create groups, join with codes, manage members
- **Note Sharing**: Share notes with visibility controls and collaborators
- **Real-time Collaboration**: Multiple users can collaborate on notes

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

## 🛠️ Installation

1. Clone the repository
2. Navigate to the server directory:

   ```bash
   cd server
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Configure environment variables:
   Create a `.env` file in the server root with:

   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/gathernote_db"
   PORT=3001
   JWT_SECRET="your-secret-key-here"
   NODE_ENV="development"
   ```

5. Initialize the database:
   ```bash
   npm run db:generate
   npm run db:push
   ```

## 🏃 Running the Server

### Development mode (with auto-reload):

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

The server will start on `http://localhost:3001` (or your configured PORT).

## 📚 API Documentation

### Base URL

```
http://localhost:3001/api/v1
```

### Authentication Endpoints

#### Register User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### User Profile Endpoints

#### Get Profile

```http
GET /api/v1/users/me
Authorization: Bearer {token}
```

#### Update Profile

```http
PUT /api/v1/users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

### Search Endpoints

#### Search Notes

```http
GET /api/v1/search?q=biology&scope=public
Authorization: Bearer {token} (optional)
```

#### Get Suggestions

```http
GET /api/v1/search/suggest?q=bio
```

### Folder Endpoints

#### Create Folder

```http
POST /api/v1/folders
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Science",
  "description": "Science notes",
  "color": "#3B82F6",
  "icon": "📚"
}
```

#### Get All Folders

```http
GET /api/v1/folders
Authorization: Bearer {token}
```

#### Get Folder Details

```http
GET /api/v1/folders/{id}
Authorization: Bearer {token}
```

#### Update Folder

```http
PUT /api/v1/folders/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "is_pinned": true
}
```

#### Delete Folder

```http
DELETE /api/v1/folders/{id}
Authorization: Bearer {token}
```

### Note Endpoints

#### Create Note

```http
POST /api/v1/notes
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Biology Notes",
  "content": "Cell structure...",
  "folder_id": 1,
  "status": "ONGOING",
  "priority": "HIGH"
}
```

#### Get All Notes

```http
GET /api/v1/notes?sort=newest&status=ongoing
Authorization: Bearer {token}
```

#### Get Note Details

```http
GET /api/v1/notes/{id}
Authorization: Bearer {token}
```

#### Update Note

```http
PUT /api/v1/notes/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content",
  "progress": 75
}
```

#### Delete Note

```http
DELETE /api/v1/notes/{id}
Authorization: Bearer {token}
```

#### Toggle Pin/Favorite

```http
PATCH /api/v1/notes/{id}/pin
Authorization: Bearer {token}
```

#### Move Note

```http
PATCH /api/v1/notes/{id}/move
Authorization: Bearer {token}
Content-Type: application/json

{
  "folder_id": 2,
  "status": "ARCHIVED"
}
```

### Group Endpoints

#### Create Group

```http
POST /api/v1/groups
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Study Group",
  "description": "Biology study group"
}
```

#### Join Group

```http
POST /api/v1/groups/join
Authorization: Bearer {token}
Content-Type: application/json

{
  "join_code": "ABC12345"
}
```

#### Get All Groups

```http
GET /api/v1/groups
Authorization: Bearer {token}
```

#### Get Group Details

```http
GET /api/v1/groups/{id}
Authorization: Bearer {token}
```

#### Remove Member / Leave Group

```http
DELETE /api/v1/groups/{id}/members/{userId}
Authorization: Bearer {token}
```

### Sharing Endpoints

#### Set Note Visibility

```http
POST /api/v1/notes/{id}/share
Authorization: Bearer {token}
Content-Type: application/json

{
  "visibility": "PUBLIC"
}
```

Values: `PRIVATE`, `PUBLIC`, `GROUP`

#### Add Collaborator

```http
POST /api/v1/notes/{id}/collaborators
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "collaborator@example.com",
  "permission": "EDIT"
}
```

Permissions: `VIEW`, `EDIT`

#### Get Collaborators

```http
GET /api/v1/notes/{id}/collaborators
Authorization: Bearer {token}
```

#### Remove Collaborator

```http
DELETE /api/v1/notes/{id}/collaborators/{collaboratorId}
Authorization: Bearer {token}
```

## 🗄️ Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Create and run migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

## 📁 Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.js          # Prisma client setup
│   ├── controllers/
│   │   ├── auth.controller.js   # Authentication logic
│   │   ├── user.controller.js   # User profile logic
│   │   ├── folder.controller.js # Folder management
│   │   ├── note.controller.js   # Note CRUD operations
│   │   ├── group.controller.js  # Group collaboration
│   │   ├── search.controller.js # Search functionality
│   │   └── sharing.controller.js # Sharing & collaborators
│   ├── middleware/
│   │   └── auth.middleware.js   # JWT authentication
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── folder.routes.js
│   │   ├── note.routes.js
│   │   ├── group.routes.js
│   │   ├── search.routes.js
│   │   └── sharing.routes.js
│   ├── utils/
│   │   ├── jwt.util.js          # JWT helpers
│   │   ├── password.util.js     # Password hashing
│   │   └── validator.util.js    # Input validation
│   └── index.js                 # Main server file
├── prisma/
│   └── schema.prisma            # Database schema
├── .env                         # Environment variables
└── package.json
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Helmet.js for HTTP headers security
- CORS enabled
- Input validation
- SQL injection protection via Prisma

## 🛡️ Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

Error responses follow this format:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## 📝 Database Schema

### Models

- **User**: User accounts and profiles
- **Folder**: Note organization folders
- **Note**: Main note content with status tracking
- **Group**: Collaboration groups
- **GroupMember**: Group membership and roles
- **NoteCollaborator**: Note sharing and permissions

### Enums

- **NoteStatus**: `UNSTARTED`, `ONGOING`, `ARCHIVED`
- **NoteVisibility**: `PRIVATE`, `PUBLIC`, `GROUP`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC License

## 👥 Authors

GatherNote Team

---

**Note**: This is a development server. For production deployment, ensure proper security measures, environment configuration, and database optimization.
