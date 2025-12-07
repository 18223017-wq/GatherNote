# GatherNote API - Quick Reference

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run db:generate

# Push database schema
npm run db:push

# Start development server
npm run dev
```

## 🔗 Base URL

```
http://localhost:3001/api/v1
```

## 📌 Essential Endpoints Cheat Sheet

### Authentication

```bash
# Register
POST /auth/register
Body: { "name", "email", "password" }

# Login
POST /auth/login
Body: { "email", "password" }
Returns: { "token": "..." }
```

### Notes

```bash
# Create
POST /notes
Header: Authorization: Bearer {token}
Body: { "title", "content", "status", "folder_id" }

# List
GET /notes?sort=newest&status=ongoing
Header: Authorization: Bearer {token}

# Get One
GET /notes/{id}
Header: Authorization: Bearer {token}

# Update
PUT /notes/{id}
Header: Authorization: Bearer {token}
Body: { "title", "content", "progress" }

# Delete
DELETE /notes/{id}
Header: Authorization: Bearer {token}

# Pin/Favorite
PATCH /notes/{id}/pin
Header: Authorization: Bearer {token}

# Move
PATCH /notes/{id}/move
Header: Authorization: Bearer {token}
Body: { "folder_id", "status" }
```

### Folders

```bash
# Create
POST /folders
Header: Authorization: Bearer {token}
Body: { "name", "description", "color", "icon" }

# List
GET /folders
Header: Authorization: Bearer {token}

# Get One
GET /folders/{id}
Header: Authorization: Bearer {token}

# Update
PUT /folders/{id}
Header: Authorization: Bearer {token}
Body: { "name", "is_pinned" }

# Delete
DELETE /folders/{id}
Header: Authorization: Bearer {token}
```

### Groups

```bash
# Create
POST /groups
Header: Authorization: Bearer {token}
Body: { "name", "description" }
Returns: { "join_code": "..." }

# Join
POST /groups/join
Header: Authorization: Bearer {token}
Body: { "join_code" }

# List
GET /groups
Header: Authorization: Bearer {token}

# Get One
GET /groups/{id}
Header: Authorization: Bearer {token}

# Remove Member / Leave
DELETE /groups/{id}/members/{userId}
Header: Authorization: Bearer {token}
```

### Search

```bash
# Search Notes
GET /search?q={query}&scope={private|public}
Header: Authorization: Bearer {token} (optional)

# Autocomplete
GET /search/suggest?q={query}
```

### Sharing

```bash
# Set Visibility
POST /notes/{id}/share
Header: Authorization: Bearer {token}
Body: { "visibility": "PUBLIC|PRIVATE|GROUP" }

# Add Collaborator
POST /notes/{id}/collaborators
Header: Authorization: Bearer {token}
Body: { "email", "permission": "VIEW|EDIT" }

# List Collaborators
GET /notes/{id}/collaborators
Header: Authorization: Bearer {token}

# Remove Collaborator
DELETE /notes/{id}/collaborators/{userId}
Header: Authorization: Bearer {token}
```

## 🔑 Authentication

All protected endpoints require:

```
Authorization: Bearer {your_jwt_token}
```

Get token from `/auth/login` or `/auth/register` response.

## 📊 Status Codes

- `200` OK - Success
- `201` Created - Resource created
- `400` Bad Request - Invalid input
- `401` Unauthorized - No/invalid token
- `403` Forbidden - No permission
- `404` Not Found - Resource not found
- `409` Conflict - Duplicate resource
- `500` Server Error - Internal error

## 🗂️ Data Models

### Note Status

- `UNSTARTED` - Not started
- `ONGOING` - In progress
- `ARCHIVED` - Completed/archived

### Note Visibility

- `PRIVATE` - Owner only
- `PUBLIC` - Everyone can view
- `GROUP` - Group members only

### Collaborator Permission

- `VIEW` - Can view only
- `EDIT` - Can view and edit

## 💡 Common Query Parameters

### Notes

- `?sort=newest|oldest|title`
- `?status=UNSTARTED|ONGOING|ARCHIVED`
- `?folder_id={id}`

### Search

- `?q={query}` - Search term (required)
- `?scope=private|public` - Search scope
- `?tag={tag}` - Filter by tag

## 🧪 Testing Tips

1. **Always login first** to get token
2. **Save the token** for subsequent requests
3. **Create a folder** before creating notes (optional)
4. **Test with multiple users** for collaboration features
5. **Use Postman collection** for easier testing

## 🐛 Common Issues

### "Access denied"

- Missing Authorization header
- Token expired (generate new one)

### "Not found"

- Wrong resource ID
- Resource belongs to different user

### "Validation error"

- Missing required fields
- Invalid data format

### Database connection error

- Check MySQL is running
- Verify DATABASE_URL in .env
- Run `npm run db:push`

## 📦 Environment Variables

```env
DATABASE_URL="mysql://user:pass@host:3306/db"
PORT=3001
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

## 🛠️ Useful Commands

```bash
# View database in browser
npm run db:studio

# Reset database
npm run db:push -- --force-reset

# Check logs
# Server logs to console in dev mode

# Test specific endpoint
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 📖 Documentation Files

- `README.md` - Full documentation
- `API_TESTING.md` - Testing guide
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- `GatherNote_API.postman_collection.json` - Postman collection

---

**Need Help?** Check the README.md for detailed documentation.
