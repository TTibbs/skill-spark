import { ShapeStats } from "../../../types";

export const shapeStats: ShapeStats[] = [
  {
    child_id: 1, // Emma's stats
    stats: {
      totalGames: 4,
      totalShapes: 8,
      totalCorrectShapes: 8,
      totalIncorrectShapes: 0,
      overallAccuracy: 100,
      totalTimeSecs: 120,
      bestTimeSecs: 80,
    },
  },
  {
    child_id: 2, // Liam's stats
    stats: {
      totalGames: 4,
      totalShapes: 8,
      totalCorrectShapes: 7,
      totalIncorrectShapes: 1,
      overallAccuracy: 100,
      totalTimeSecs: 120,
      bestTimeSecs: 100,
    },
  },
  {
    child_id: 3, // Another child's stats
    stats: {
      totalGames: 4,
      totalShapes: 8,
      totalCorrectShapes: 7,
      totalIncorrectShapes: 1,
      overallAccuracy: 100,
      totalTimeSecs: 120,
      bestTimeSecs: 120,
    },
  },
];
