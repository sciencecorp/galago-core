import { TeachPoint } from "../types";

export interface JointConfig {
  [key: string]: number | undefined;
}

export function jointsToCoordinate(joints: JointConfig, numJoints: number): string {
  const jointValues = Array.from({ length: numJoints }, (_, i) => joints[`j${i + 1}`] ?? 0);
  return jointValues.join(" ");
}

export function coordinateToJoints(coordinate: string, numJoints: number): JointConfig {
  const values = coordinate.split(" ").map(Number);
  const joints: JointConfig = {};
  
  // Skip the first value (j0) if it exists
  const startIndex = values.length > numJoints ? 1 : 0;
  
  for (let i = 0; i < numJoints; i++) {
    joints[`j${i + 1}`] = values[startIndex + i];
  }
  
  return joints;
}

export function validateJointCount(coordinate: string, expectedJoints: number): boolean {
  const values = coordinate.split(" ");
  // Only slice if first value is 0 or 1
  const firstValue = parseFloat(values[0]);
  const jointValues = (firstValue === 0 || firstValue === 1) ? values.slice(1) : values;
  console.log("JOINT VALUES", jointValues);
  return jointValues.length === expectedJoints;
}

export function filterItems<T extends { name: string; type?: string }>(
  items: T[] | undefined,
  searchTerm: string,
  type: string | "all"
): T[] {
  if (!items) return [];
  return items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = type === "all" || item.type === type;
    return matchesSearch && matchesType;
  });
} 