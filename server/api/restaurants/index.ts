import restaurants from "../../data/restaurants.json";
import type { Restaurant } from "../../../app/modules/restaurant/types";

export default defineEventHandler((event) => {
  return restaurants as Restaurant[];
});
