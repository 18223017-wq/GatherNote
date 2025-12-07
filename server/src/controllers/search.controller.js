const db = require('../config/database');
const { notes, users } = require('../config/schema');
const { eq, or, and, like, desc, sql } = require('drizzle-orm');

/**
 * Global search for notes
 * GET /api/v1/search?q=query&tag=science&scope=public
 */
const searchNotes = async (req, res) => {
  try {
    const { q, tag, scope } = req.query;
    const userId = req.user?.userId;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Query parameter "q" is required'
      });
    }

    // Build search conditions
    const searchPattern = `%${q}%`;
    const conditions = or(
      like(notes.title, searchPattern),
      like(notes.content, searchPattern)
    );

    let whereClause = conditions;
    
    // Scope filter
    if (scope === 'private' && userId) {
      whereClause = and(conditions, eq(notes.owner_id, userId));
    }

    // Execute search
    const notesList = await db.select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      status: notes.status,
      is_favorite: notes.is_favorite,
      created_at: notes.created_at,
      updated_at: notes.updated_at,
      owner: sql`JSON_OBJECT('id', ${users.id}, 'name', ${users.name}, 'avatar_url', ${users.avatar_url})`
    })
    .from(notes)
    .leftJoin(users, eq(notes.owner_id, users.id))
    .where(whereClause)
    .orderBy(desc(notes.updated_at))
    .limit(20);

    // Create snippets
    const results = notesList.map(note => {
      let snippet = note.content || '';
      if (snippet.length > 150) {
        snippet = snippet.substring(0, 150) + '...';
      }

      return {
        note_id: note.id,
        title: note.title,
        snippet,
        status: note.status,
        is_favorite: note.is_favorite,
        owner: note.owner,
        updated_at: note.updated_at
      };
    });

    res.json(results);

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to search notes'
    });
  }
};

/**
 * Autocomplete suggestions
 * GET /api/v1/search/suggest?q=bio
 */
const getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    // Get unique titles that match the query
    const searchPattern = `%${q}%`;
    const notesList = await db.select({ title: notes.title })
      .from(notes)
      .where(like(notes.title, searchPattern))
      .orderBy(desc(notes.updated_at))
      .limit(10);

    // Extract unique suggestions
    const suggestions = [...new Set(notesList.map(n => n.title))];

    res.json(suggestions);

  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get suggestions'
    });
  }
};

module.exports = {
  searchNotes,
  getSuggestions
};
