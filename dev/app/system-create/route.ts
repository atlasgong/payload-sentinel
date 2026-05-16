import configPromise from "@payload-config";
import { getPayload } from "payload";

export const GET = async () => {
  const payload = await getPayload({
    config: configPromise,
  });

  await payload.create({
    collection: "posts",
    data: {
      example: "system created post",
    },
  });

  return Response.json({ status: "ok" });
};
