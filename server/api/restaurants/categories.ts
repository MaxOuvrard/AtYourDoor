import restaurants from "../../data/restaurants.json";

export default defineEventHandler(() => {
  try {
    const cats = Array.from(new Set((restaurants as any[]).map(r => r.category).filter(Boolean)));
    return cats;
  } catch (e) {
    return [];
  }
});
