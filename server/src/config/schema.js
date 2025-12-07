const { mysqlTable, int, varchar, text, longtext, boolean, datetime, mysqlEnum, unique } = require('drizzle-orm/mysql-core');
const { relations } = require('drizzle-orm');

// Enums
const noteStatusEnum = mysqlEnum('note_status', ['UNSTARTED', 'ONGOING', 'ARCHIVED']);
const noteVisibilityEnum = mysqlEnum('note_visibility', ['PRIVATE', 'PUBLIC', 'GROUP']);

// Users table
const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  avatar_url: varchar('avatar_url', { length: 500 }),
  created_at: datetime('created_at').notNull().default(new Date()),
});

// Folders table
const folders = mysqlTable('folders', {
  id: int('id').primaryKey().autoincrement(),
  owner_id: int('owner_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 50 }),
  icon: varchar('icon', { length: 100 }),
  is_pinned: boolean('is_pinned').notNull().default(false),
  created_at: datetime('created_at').notNull().default(new Date()),
});

// Notes table
const notes = mysqlTable('notes', {
  id: int('id').primaryKey().autoincrement(),
  owner_id: int('owner_id').notNull(),
  folder_id: int('folder_id'),
  title: varchar('title', { length: 500 }).notNull(),
  content: longtext('content'),
  status: noteStatusEnum.notNull().default('UNSTARTED'),
  priority: varchar('priority', { length: 50 }),
  progress: int('progress'),
  is_favorite: boolean('is_favorite').notNull().default(false),
  visibility: noteVisibilityEnum.notNull().default('PRIVATE'),
  created_at: datetime('created_at').notNull().default(new Date()),
  updated_at: datetime('updated_at').notNull().default(new Date()),
});

// Groups table
const groups = mysqlTable('groups', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 500 }),
  join_code: varchar('join_code', { length: 100 }).notNull().unique(),
  created_at: datetime('created_at').notNull().default(new Date()),
});

// Group Members table
const groupMembers = mysqlTable('group_members', {
  id: int('id').primaryKey().autoincrement(),
  group_id: int('group_id').notNull(),
  user_id: int('user_id').notNull(),
  role: varchar('role', { length: 50 }).notNull().default('MEMBER'),
  joined_at: datetime('joined_at').notNull().default(new Date()),
});

// Note Collaborators table
const noteCollaborators = mysqlTable('note_collaborators', {
  id: int('id').primaryKey().autoincrement(),
  note_id: int('note_id').notNull(),
  user_id: int('user_id').notNull(),
  permission: varchar('permission', { length: 50 }).notNull().default('VIEW'),
  added_at: datetime('added_at').notNull().default(new Date()),
}, (table) => ({
  uniqueNoteUser: unique().on(table.note_id, table.user_id),
}));

// Relations
const usersRelations = relations(users, ({ many }) => ({
  notes: many(notes),
  folders: many(folders),
  memberships: many(groupMembers),
  collaborations: many(noteCollaborators),
}));

const foldersRelations = relations(folders, ({ one, many }) => ({
  owner: one(users, {
    fields: [folders.owner_id],
    references: [users.id],
  }),
  notes: many(notes),
}));

const notesRelations = relations(notes, ({ one, many }) => ({
  owner: one(users, {
    fields: [notes.owner_id],
    references: [users.id],
  }),
  folder: one(folders, {
    fields: [notes.folder_id],
    references: [folders.id],
  }),
  collaborators: many(noteCollaborators),
}));

const groupsRelations = relations(groups, ({ many }) => ({
  members: many(groupMembers),
}));

const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.group_id],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.user_id],
    references: [users.id],
  }),
}));

const noteCollaboratorsRelations = relations(noteCollaborators, ({ one }) => ({
  note: one(notes, {
    fields: [noteCollaborators.note_id],
    references: [notes.id],
  }),
  user: one(users, {
    fields: [noteCollaborators.user_id],
    references: [users.id],
  }),
}));

module.exports = {
  users,
  folders,
  notes,
  groups,
  groupMembers,
  noteCollaborators,
  usersRelations,
  foldersRelations,
  notesRelations,
  groupsRelations,
  groupMembersRelations,
  noteCollaboratorsRelations,
};
