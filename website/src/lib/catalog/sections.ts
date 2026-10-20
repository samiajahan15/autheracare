export const sections = {
  featured: "Featured products",
  skincare: "Face care",
  "body-care": "Body care",
  "hair-care": "Hair care",
  "lip-makeup": "Lip care",
  perfume: "Perfume",
  wellness: "Wellness",
  "oral-care": "Oral care",
  accessories: "Accessories",
  sets: "Sets",
  collection: "Our collection",
} as const;

export function sectionHref(category: string) {
  const section = Object.entries(sections).find(([, title]) => title === category)?.[0] ?? "collection";
  return `/shop/${section}`;
}
