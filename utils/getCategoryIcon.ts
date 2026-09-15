import { MaterialIcons } from "@expo/vector-icons";

/**
 * Retorna el nombre del ícono de MaterialIcons correspondiente a una categoría de reporte.
 */
export const getCategoryIcon = (
  categoryName: string,
): keyof typeof MaterialIcons.glyphMap => {
  if (!categoryName) return "label";

  const norm = categoryName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  if (norm.includes("acequia") || norm.includes("drenaje")) return "water";
  if (norm.includes("alumbrado") || norm.includes("luz")) return "lightbulb";
  if (norm.includes("arbol") || norm.includes("arbolado")) return "nature";
  if (norm.includes("bache") || norm.includes("paviment") || norm.includes("calzada")) return "construction";
  if (norm.includes("limpieza") || norm.includes("residuo") || norm.includes("basura") || norm.includes("higiene")) return "delete-outline";
  if (norm.includes("plaza") || norm.includes("parque") || norm.includes("verde") || norm.includes("espacio")) return "park";
  if (norm.includes("semaforo") || norm.includes("senales") || norm.includes("senalisacion") || norm.includes("transito")) return "traffic";
  if (norm.includes("vereda") || norm.includes("accesib")) return "directions-walk";
  if (norm.includes("agua") || norm.includes("cloaca")) return "water-drop";

  return "report-problem";
};
