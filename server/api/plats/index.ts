import plats from "../../data/plats.json";
import type { Plat } from "../../../app/modules/plat/types";

export default defineEventHandler((event) => {
  return plats as Plat[];
});
