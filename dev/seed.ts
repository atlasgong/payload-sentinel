import type { Payload } from "payload";

import { devUser } from "./helpers/credentials.js";

export const seed = async (payload: Payload) => {
  const matchingUsers = await payload.find({
    collection: "users",
    where: {
      email: {
        equals: devUser.email,
      },
    },
  });

  if (matchingUsers.totalDocs === 0) {
    await payload.create({
      collection: "users",
      data: devUser,
    });
  }
};
