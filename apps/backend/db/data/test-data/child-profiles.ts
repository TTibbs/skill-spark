import { ChildProfile } from "../../../types";

export const childProfiles: ChildProfile[] = [
  {
    user_id: 1, // alice's child
    name: "Emma",
    age: 5,
    xp: 150,
    level: 2,
    reward_points: 100,
    last_played: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    total_learned_words: 10,
  },
  {
    user_id: 1, // alice's second child
    name: "Liam",
    age: 3,
    xp: 75,
    level: 1,
    reward_points: 0,
    last_played: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    total_learned_words: 10,
  },
  {
    user_id: 2, // bob's child
    name: "Noah",
    age: 4,
    xp: 200,
    level: 3,
    reward_points: 0,
    last_played: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    total_learned_words: 10,
  },
  {
    user_id: 3, // charlie's child
    name: "Olivia",
    age: 6,
    xp: 100,
    level: 2,
    reward_points: 0,
    last_played: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    total_learned_words: 10,
  },
];
