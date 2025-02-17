import { TeachPoint } from "../types";

export interface JointConfig {
  [key: string]: number | undefined;
}

export const jointsToCoordinate = (joints: JointConfig, numJoints: number): string => {
  const jointValues = Array.from({ length: numJoints }, (_, i) => joints[`j${i + 1}`] || 0);
  return jointValues.join(" ");
};

export function coordinateToJoints(coordinates: string, numJoints: number): JointConfig {
  const values = coordinates.split(" ").map(Number);
  const joints: JointConfig = {};

  // Handle the coordinate string directly
  for (let i = 0; i < Math.min(values.length, numJoints); i++) {
    joints[`j${i + 1}`] = values[i];
  }

  // Fill in any missing joints with 0
  for (let i = values.length; i < numJoints; i++) {
    joints[`j${i + 1}`] = 0;
  }

  return joints;
}

export function validateJointCount(coordinates: string, expectedJoints: number): boolean {
  const values = coordinates.split(" ").slice(1);
  return values.length === expectedJoints;
}

export function filterItems<T extends { name: string; type?: string }>(
  items: T[] | undefined,
  searchTerm: string,
  type: string | "all",
): T[] {
  if (!items) return [];
  return items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = type === "all" || item.type === type;
    return matchesSearch && matchesType;
  });
}
