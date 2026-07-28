export const getLevel = (xp: number) => {
  // Find the highest level where xp >= level.xp
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].xp) {
      return levels[i].level;
    }
  }
  return 1;
};

export interface Level {
  level: number;
  xp: number;
}

export const levels: Level[] = [
  {
    level: 1,
    xp: 0,
  },
  {
    level: 2,
    xp: 100,
  },
  {
    level: 3,
    xp: 300,
  },
  {
    level: 4,
    xp: 500,
  },
  {
    level: 5,
    xp: 750,
  },
  {
    level: 6,
    xp: 1000,
  },
  {
    level: 7,
    xp: 1500,
  },
  {
    level: 8,
    xp: 2000,
  },
  {
    level: 9,
    xp: 2500,
  },
  {
    level: 10,
    xp: 3000,
  },
];
