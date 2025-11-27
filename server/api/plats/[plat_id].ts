import plats from "../../data/plats.json";
import type { Plat } from "../../../app/modules/plat/types";

export default defineEventHandler((event) => {
  const params = event.context.params;
  const platId = Number(params?.plat_id);
  const foundPlat = (plats as Plat[])?.find?.(
    (plat) => plat.id == platId
  );
  if (!foundPlat) {
    throw createError({
      status: 404,
    });
  }

  return foundPlat;
});
