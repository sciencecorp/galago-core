import { TeachPoint } from "../types";

export function jointsToCoordinate(joints: {
  j1?: number;
  j2?: number;
  j3?: number;
  j4?: number;
  j5?: number;
  j6?: number;
}): string {
  return [joints.j1, joints.j2, joints.j3, joints.j4, joints.j5, joints.j6]
    .map((j) => j ?? 0)
    .join(" ");
}

export function coordinateToJoints(coordinate: string): {
  j1?: number;
  j2?: number;
  j3?: number;
  j4?: number;
  j5?: number;
  j6?: number;
} {
  const [j0, j1, j2, j3, j4, j5, j6] = coordinate.split(" ").map(Number);
  return {
    j1: j1,
    j2: j2,
    j3: j3,
    j4: j4,
    j5: j5,
    j6: j6,
  };
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