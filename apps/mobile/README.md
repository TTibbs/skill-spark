# Skill Spark Mobile

Expo development-build client for Skill Spark.

This app uses Expo Router, NativeWind and the shared Skill Spark API client. It
is intended to be tested with an installed development build, not Expo Go.

## Local Development

Create `apps/mobile/.env.local` or export the variable in your shell:

```env
EXPO_PUBLIC_API_URL=http://<development-machine-lan-ip>:8181/api
```

Physical devices cannot use `localhost` for the API because that points to the
device itself. Keep the device and development machine on the same network, or
use a tunnel/hosted API.

```bash
pnpm install
pnpm --filter @skill-spark/mobile exec eas login
pnpm --filter @skill-spark/mobile exec eas build:configure
pnpm mobile:build:dev:ios
pnpm --filter @skill-spark/mobile start --dev-client
```

For emulator/simulator installs, use the simulator profile:

```bash
pnpm mobile:build:dev:ios:simulator
pnpm mobile:build:dev:android:emulator
```

Do not run a production EAS build for this development-client pass.
