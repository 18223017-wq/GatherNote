# Migration from Prisma to Drizzle ORM

## Perubahan yang Dilakukan

### 1. Dependencies

- **Dihapus**: `prisma`, `@prisma/client`
- **Ditambahkan**: `drizzle-orm`, `drizzle-kit`

### 2. File yang Diubah

#### Database Configuration

- **File**: `src/config/database.js`
- **Perubahan**: Mengganti PrismaClient dengan Drizzle connection menggunakan mysql2 pool

#### Schema Definition

- **File Baru**: `src/config/schema.js`
- **Konten**: Definisi schema dengan Drizzle ORM (tables, enums, relations)

#### Drizzle Config

- **File Baru**: `drizzle.config.ts`
- **Konten**: Konfigurasi untuk Drizzle Kit (migrations, studio, etc.)

### 3. Controllers yang Dimigrasi

Semua controller telah dimigrasi dari Prisma ke Drizzle:

1. **auth.controller.js**

   - Register user dengan `db.insert()` dan `db.select()`
   - Login dengan query menggunakan `eq()` operator

2. **note.controller.js**

   - Create, read, update, delete notes
   - Menggunakan `leftJoin` untuk relations
   - Menggunakan `sql` template untuk JSON aggregation

3. **folder.controller.js**

   - CRUD operations untuk folders
   - Count aggregation dengan subquery

4. **user.controller.js**

   - Get dan update user profile

5. **group.controller.js**

   - Group management dengan members
   - Join groups via code
   - Remove members

6. **search.controller.js**

   - Full-text search menggunakan `like()` operator
   - Autocomplete suggestions

7. **sharing.controller.js**
   - Set note visibility
   - Add/remove collaborators
   - Get collaborators dengan relations

### 4. Key Differences

#### Prisma Query

```javascript
const user = await prisma.user.findUnique({
  where: { email },
  include: { notes: true },
});
```

#### Drizzle Query

```javascript
const [user] = await db
  .select()
  .from(users)
  .where(eq(users.email, email))
  .limit(1);
```

### 5. Package.json Scripts

Scripts di `package.json` telah diupdate:

```json
"db:generate": "drizzle-kit generate",
"db:push": "drizzle-kit push",
"db:migrate": "drizzle-kit migrate",
"db:studio": "drizzle-kit studio"
```

### 6. Files Dihapus

- `prisma/` directory (schema.prisma dan migrations)
- `prisma.config.ts`

## Cara Menggunakan

### Generate Migrations

```bash
npm run db:generate
```

### Push Schema ke Database

```bash
npm run db:push
```

### Run Migrations

```bash
npm run db:migrate
```

### Open Drizzle Studio

```bash
npm run db:studio
```

### Start Server

```bash
npm run dev
```

## Catatan Penting

1. Semua query Drizzle menggunakan typed operators dari `drizzle-orm`
2. Relations menggunakan `leftJoin` atau `innerJoin`
3. Aggregations menggunakan `sql` template literals
4. Array destructuring digunakan untuk single results: `const [user] = await db.select()...`
5. Insert operations mengembalikan `insertId` yang perlu di-query ulang untuk mendapatkan full object

## Testing

Setelah migrasi, pastikan untuk test semua endpoints:

- Auth (register, login)
- Notes CRUD
- Folders CRUD
- Groups management
- Search functionality
- Sharing & collaborators
