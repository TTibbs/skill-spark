import { MemoryStats } from "../../../types";

export const memoryStats: MemoryStats[] = [
  {
    child_id: 1,
    stats: {
      totalGames: 9,
      totalMoves: 17,
      totalTimeSecs: 230,
      bestTimeSecs: 50,
      fewestMoves: 12,
      picture: {
        gamesPlayed: 4,
        totalMoves: 8,
        totalTimeSecs: 110,
        bestTimeSecs: 50,
        fewestMoves: 12,
      },
      sound: {
        gamesPlayed: 5,
        totalMoves: 9,
        totalTimeSecs: 120,
        bestTimeSecs: 55,
        fewestMoves: 13,
      },
    },
    updated_at: "2025-06-01T12:10:00.000Z",
  },
  {
    child_id: 2,
    stats: {
      totalGames: 1,
      totalMoves: 8,
      totalTimeSecs: 4,
      bestTimeSecs: 4,
      fewestMoves: 4,
      picture: {
        gamesPlayed: 2,
        totalMoves: 2,
        totalTimeSecs: 2,
        bestTimeSecs: 2,
        fewestMoves: 2,
      },
      sound: {
        gamesPlayed: 2,
        totalMoves: 2,
        totalTimeSecs: 2,
        bestTimeSecs: 2,
        fewestMoves: 2,
      },
    },
    updated_at: "2025-06-01T12:20:00.000Z",
  },
  {
    child_id: 3,
    stats: {
      totalGames: 4,
      totalMoves: 8,
      totalTimeSecs: 4,
      bestTimeSecs: 4,
      fewestMoves: 4,
      picture: {
        gamesPlayed: 2,
        totalMoves: 2,
        totalTimeSecs: 2,
        bestTimeSecs: 2,
        fewestMoves: 2,
      },
      sound: {
        gamesPlayed: 2,
        totalMoves: 2,
        totalTimeSecs: 2,
        bestTimeSecs: 2,
        fewestMoves: 2,
      },
    },
    updated_at: new Date("2024-01-15").toISOString(),
  },
];
