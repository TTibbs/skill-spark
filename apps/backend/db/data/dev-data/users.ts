import { User } from "../../../types";

import bcrypt from "bcryptjs";

const password = "password123";
const saltRounds = 10;
const password_hash = bcrypt.hashSync(password, saltRounds);

export const users: User[] = [
  {
    username: "alice123",
    display_name: "Alice",
    timezone: "GMT",
    email: "alice@example.com",
    password_hash: password_hash,
    profile_image_url:
      "https://c5znixeqj7.ufs.sh/f/Jf9D0EOZjwR5r72WKKh4ScXJ607ewstvO3u2GfKimQM8hUFz",
    is_parent: true,
    user_preferences: {
      notificationsEnabled: true,
      theme: "dark",
      language: "en",
      pin_key: "$2b$10$9g6OekWGPb4MgxjlszpN9uQReFcE4g2.t02AABxAFOW1JLA0tzEPu",
    },
    created_at: new Date(),
    updated_at: new Date(),
    total_children: 0,
  },
  {
    username: "bob123",
    display_name: "Bob",
    timezone: "UTC",
    email: "bob@example.com",
    password_hash: password_hash,
    profile_image_url:
      "https://c5znixeqj7.ufs.sh/f/Jf9D0EOZjwR5r72WKKh4ScXJ607ewstvO3u2GfKimQM8hUFz",
    is_parent: true,
    user_preferences: {
      notificationsEnabled: true,
      theme: "dark",
      language: "en",
      pin_key: "$2b$10$9g6OekWGPb4MgxjlszpN9uQReFcE4g2.t02AABxAFOW1JLA0tzEPu",
    },
    created_at: new Date(),
    updated_at: new Date(),
    total_children: 2,
  },
  {
    username: "charlie123",
    display_name: "Charlie",
    timezone: "Europe/London",
    email: "charlie@example.com",
    password_hash: password_hash,
    profile_image_url:
      "https://c5znixeqj7.ufs.sh/f/Jf9D0EOZjwR5r72WKKh4ScXJ607ewstvO3u2GfKimQM8hUFz",
    is_parent: true,
    user_preferences: {
      notificationsEnabled: true,
      theme: "system",
      language: "en",
      pin_key: "$2b$10$9g6OekWGPb4MgxjlszpN9uQReFcE4g2.t02AABxAFOW1JLA0tzEPu",
    },
    created_at: new Date(),
    updated_at: new Date(),
    total_children: 1,
  },
  {
    username: "dave123",
    display_name: "Dave",
    timezone: "Europe/London",
    email: "dave@example.com",
    password_hash: password_hash,
    profile_image_url:
      "https://c5znixeqj7.ufs.sh/f/Jf9D0EOZjwR5r72WKKh4ScXJ607ewstvO3u2GfKimQM8hUFz",
    is_parent: false,
    user_preferences: {
      notificationsEnabled: true,
      theme: "system",
      language: "en",
      pin_key: "$2b$10$9g6OekWGPb4MgxjlszpN9uQReFcE4g2.t02AABxAFOW1JLA0tzEPu",
    },
    created_at: new Date(),
    updated_at: new Date(),
    total_children: 0,
  },
];
