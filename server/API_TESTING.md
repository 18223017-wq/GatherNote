# GatherNote API Testing Guide

## Setup Instructions

### 1. Start the Server

```bash
cd server
npm install
npm run dev
```

### 2. Create Database

Ensure MySQL is running and create the database:

```sql
CREATE DATABASE gathernote_db;
```

### 3. Initialize Prisma

```bash
npm run db:generate
npm run db:push
```

## Testing Flow

### Step 1: Register a User

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123"
  }'
```

**Expected Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "avatar_url": null,
    "created_at": "2025-12-05T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Step 2: Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

**Save the token from response for subsequent requests!**

### Step 3: Get User Profile

```bash
curl -X GET http://localhost:3001/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 4: Create a Folder

```bash
curl -X POST http://localhost:3001/api/v1/folders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Folder",
    "description": "Testing folder creation",
    "color": "#3B82F6",
    "icon": "📁"
  }'
```

### Step 5: Create a Note

```bash
curl -X POST http://localhost:3001/api/v1/notes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Note",
    "content": "This is the content of my first note",
    "folder_id": 1,
    "status": "ONGOING"
  }'
```

### Step 6: Search Notes

```bash
curl -X GET "http://localhost:3001/api/v1/search?q=first" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 7: Create a Group

```bash
curl -X POST http://localhost:3001/api/v1/groups \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Study Group",
    "description": "My first study group"
  }'
```

**Note the join_code from response**

### Step 8: Share a Note

```bash
curl -X POST http://localhost:3001/api/v1/notes/1/share \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "visibility": "PUBLIC"
  }'
```

### Step 9: Add Collaborator (Register second user first)

```bash
# Register second user
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Second User",
    "email": "second@example.com",
    "password": "test123"
  }'

# Add as collaborator (use first user's token)
curl -X POST http://localhost:3001/api/v1/notes/1/collaborators \
  -H "Authorization: Bearer FIRST_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "second@example.com",
    "permission": "EDIT"
  }'
```

## Common Test Scenarios

### Test 1: Complete Note Lifecycle

1. Register user
2. Login
3. Create folder
4. Create note in folder
5. Update note content
6. Toggle pin/favorite
7. Move note to different folder
8. Archive note (change status)
9. Delete note

### Test 2: Group Collaboration

1. User A creates a group
2. User B joins group with join_code
3. Verify both users see the group
4. User A removes User B
5. Verify User B no longer has access

### Test 3: Note Sharing

1. User A creates a note
2. User A sets visibility to PUBLIC
3. User A adds User B as collaborator with EDIT permission
4. User B accesses the note
5. User A removes User B
6. Verify User B loses access

### Test 4: Search Functionality

1. Create multiple notes with different content
2. Search by keyword
3. Test autocomplete suggestions
4. Filter by scope (private/public)

## Testing with Postman

Import the collection below to Postman:

### Environment Variables

Create a Postman environment with:

- `base_url`: `http://localhost:3001/api/v1`
- `token`: (will be set automatically after login)
- `note_id`: (will be set after creating a note)
- `folder_id`: (will be set after creating a folder)
- `group_id`: (will be set after creating a group)

### Auto-save Token Script

Add this to the "Tests" tab of login/register requests:

```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
  var jsonData = pm.response.json();
  pm.environment.set("token", jsonData.token);
}
```

## Error Testing

### Test Invalid Credentials

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@example.com",
    "password": "wrongpass"
  }'
```

Expected: 401 Unauthorized

### Test Missing Token

```bash
curl -X GET http://localhost:3001/api/v1/users/me
```

Expected: 401 Access denied

### Test Invalid Token

```bash
curl -X GET http://localhost:3001/api/v1/users/me \
  -H "Authorization: Bearer invalid_token_here"
```

Expected: 403 Invalid token

### Test Duplicate Email

```bash
# Register same email twice
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "password": "test123"
  }'
```

Expected: 409 Conflict

## Performance Testing

### Load Test with Apache Bench

```bash
# Test login endpoint
ab -n 100 -c 10 -p login.json -T application/json \
  http://localhost:3001/api/v1/auth/login
```

Where `login.json` contains:

```json
{ "email": "test@example.com", "password": "test123" }
```

## Database Verification

### Check Data in MySQL

```bash
mysql -u admin_gathernote -p gathernote_db

# View tables
SHOW TABLES;

# Check users
SELECT * FROM users;

# Check notes
SELECT * FROM notes;

# Check folders
SELECT * FROM folders;

# Check groups
SELECT * FROM groups;

# Check collaborators
SELECT * FROM note_collaborators;
```

## Troubleshooting

### Server won't start

- Check if port 3001 is available
- Verify MySQL is running
- Check DATABASE_URL in .env

### Database connection error

- Verify MySQL credentials
- Ensure database exists
- Run `npm run db:push`

### JWT token errors

- Check JWT_SECRET is set in .env
- Verify token is included in Authorization header
- Token format: `Bearer <token>`

### Prisma errors

- Run `npm run db:generate` after schema changes
- Clear node_modules and reinstall if needed
- Check Prisma version compatibility

## API Response Times (Expected)

| Endpoint            | Expected Time |
| ------------------- | ------------- |
| POST /auth/register | < 500ms       |
| POST /auth/login    | < 300ms       |
| GET /users/me       | < 100ms       |
| POST /notes         | < 200ms       |
| GET /notes          | < 150ms       |
| GET /search         | < 300ms       |
| POST /groups        | < 200ms       |

---

Happy Testing! 🚀
