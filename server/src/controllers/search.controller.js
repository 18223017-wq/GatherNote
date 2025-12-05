const prisma = require('../config/database');

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
    const searchConditions = {
      OR: [
        { title: { contains: q } },
        { content: { contains: q } }
      ]
    };

    // Scope filter
    if (scope === 'private' && userId) {
      searchConditions.owner_id = userId;
    } else if (scope === 'public') {
      // For now, all notes are searchable
      // In future: Add visibility field to Note model
    }

    // Execute search
    const notes = await prisma.note.findMany({
      where: searchConditions,
      select: {
        id: true,
        title: true,
        content: true,
        status: true,
        is_favorite: true,
        created_at: true,
        updated_at: true,
        owner: {
          select: {
            id: true,
            name: true,
            avatar_url: true
          }
        }
      },
      take: 20,
      orderBy: { updated_at: 'desc' }
    });

    // Create snippets
    const results = notes.map(note => {
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
    const notes = await prisma.note.findMany({
      where: {
        title: { contains: q }
      },
      select: {
        title: true
      },
      take: 10,
      orderBy: { updated_at: 'desc' }
    });

    // Extract unique suggestions
    const suggestions = [...new Set(notes.map(n => n.title))];

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
