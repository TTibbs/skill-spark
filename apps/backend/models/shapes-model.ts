import db from "../db/connection";
import { Shape } from "../types";

export const selectShapes = async () => {
  const { rows } = await db.query("SELECT * FROM shapes");
  return rows;
};

export const selectShapeById = async (shapeId: string) => {
  const { rows } = await db.query("SELECT * FROM shapes WHERE id = $1", [
    shapeId,
  ]);
  return rows[0];
};

export const insertShape = async (addedShape: Shape) => {
  const { name, description, image } = addedShape;
  const { rows } = await db.query(
    "INSERT INTO shapes (name, description, image) VALUES ($1, $2, $3) RETURNING *",
    [name, description, image]
  );
  return rows[0];
};

export const updateShapeById = async (shapeId: string, updatedShape: Shape) => {
  const { name, description, image } = updatedShape;
  const { rows } = await db.query(
    "UPDATE shapes SET name = $1, description = $2, image = $3 WHERE id = $4 RETURNING *",
    [name, description, image, shapeId]
  );
  return rows[0];
};

export const deleteShapeById = async (shapeId: string) => {
  const { rows } = await db.query(
    "DELETE FROM shapes WHERE id = $1 RETURNING *",
    [shapeId]
  );
  return rows[0];
};
