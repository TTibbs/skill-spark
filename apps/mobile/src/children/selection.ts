import type { ChildProfile } from "@skill-spark/contracts";

export function selectInitialChild(
  children: ChildProfile[],
  storedChildId: number | null
) {
  if (children.length === 0) return null;

  const storedChild = children.find((child) => child.id === storedChildId);
  return storedChild ?? children[0];
}
