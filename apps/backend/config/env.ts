import dotenv from "dotenv";
import path from "path";

const env = process.env.NODE_ENV || "development";
const rootDir = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(rootDir, ".env") });

if (env === "test") {
  dotenv.config({ path: path.join(rootDir, ".env.test"), override: true });
} else {
  dotenv.config({ path: path.join(rootDir, `.env.${env}`), override: true });
  dotenv.config({ path: path.join(rootDir, ".env.local"), override: true });
}

export const NODE_ENV = env;
