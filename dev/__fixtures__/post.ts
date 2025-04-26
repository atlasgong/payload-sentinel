import type { Payload } from "payload";

/**
 * Gets or creates an example post fixture.
 */
export async function getPostFixture(payload: Payload) {
  const result = await payload.find({
    collection: "posts",
    where: {
      example: {
        equals: "test",
      },
    },
  });

  if (result.totalDocs > 0) {
    return result.docs[0];
  }

  return await payload.create({
    collection: "posts",
    data: {
      example: "test",
    },
  });
}
