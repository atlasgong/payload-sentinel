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

  const matchingPosts = await payload.find({
    collection: "posts",
    where: {
      example: {
        equals: "test",
      },
    },
  });

  if (matchingPosts.totalDocs === 0) {
    await payload.create({
      collection: "posts",
      data: {
        example: "test",
      },
    });
  }
};
