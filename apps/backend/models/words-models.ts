import db from "../db/connection";
import { Word } from "../types";

export const selectWords = async (
  limit: number,
  page: number,
  category?: string
) => {
  try {
    const validQueryParams = {
      limit: limit || 10,
      page: page || 1,
      category: category || "",
    };

    // Calculate offset based on page number
    const offset = (validQueryParams.page - 1) * validQueryParams.limit;

    const queryString = `
      SELECT * FROM words 
      WHERE ($1 = '' OR category = $1)
      LIMIT $2 OFFSET $3
    `;

    const result = await db.query(queryString, [
      validQueryParams.category,
      validQueryParams.limit,
      offset,
    ]);

    return result.rows;
  } catch (err) {
    throw err;
  }
};

export const selectWordsCount = async (category?: string) => {
  try {
    const queryString = `
      SELECT COUNT(*) as total FROM words 
      WHERE ($1 = '' OR category = $1)
    `;

    interface CountResult {
      total: string;
    }

    const result = await db.query<CountResult>(queryString, [category || ""]);
    return parseInt(result.rows[0].total);
  } catch (err) {
    throw err;
  }
};

export const insertWord = async (
  word: string,
  category: string,
  image: string
): Promise<Word> => {
  try {
    const { rows } = await db.query<Word>(
      "INSERT INTO words (word, category, image) VALUES ($1, $2, $3) RETURNING *",
      [word, category, image]
    );
    return rows[0];
  } catch (err) {
    throw err;
  }
};

export const selectWordById = async (wordId: string): Promise<Word> => {
  try {
    const result = await db.query<Word>(
      "SELECT * FROM words WHERE word_id = $1",
      [wordId]
    );
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

export const updateWordById = async (
  wordId: string,
  word?: string,
  category?: string,
  image?: string
): Promise<Word> => {
  try {
    // Build dynamic query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (word !== undefined) {
      updates.push(`word = $${paramIndex}`);
      values.push(word);
      paramIndex++;
    }

    if (category !== undefined) {
      updates.push(`category = $${paramIndex}`);
      values.push(category);
      paramIndex++;
    }

    if (image !== undefined) {
      updates.push(`image = $${paramIndex}`);
      values.push(image);
      paramIndex++;
    }

    // Add wordId as the last parameter
    values.push(wordId);

    const queryString = `
      UPDATE words 
      SET ${updates.join(", ")} 
      WHERE word_id = $${paramIndex} 
      RETURNING *
    `;

    const { rows } = await db.query<Word>(queryString, values);
    return rows[0];
  } catch (err) {
    throw err;
  }
};

export const deleteWordById = async (wordId: string): Promise<void> => {
  try {
    await db.query("DELETE FROM words WHERE word_id = $1", [wordId]);
  } catch (err) {
    throw err;
  }
};
