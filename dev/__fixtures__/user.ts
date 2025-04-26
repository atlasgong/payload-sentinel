import type { Payload } from "payload";

import { devUser } from "../helpers/credentials.js";

/**
 * Gets or creates the dev user fixture.
 */
export async function getUserFixture(payload: Payload) {
  const userResult = await payload.find({
    collection: "users",
    where: {
      email: {
        equals: devUser.email,
      },
    },
  });

  if (userResult.docs.length > 0) {
    return userResult.docs[0];
  }

  const newUser = await payload.create({
    collection: "users",
    data: devUser,
  });

  return newUser;
}
