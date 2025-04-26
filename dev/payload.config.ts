import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { payloadSentinel } from "payload-sentinel";
import sharp from "sharp";
import { fileURLToPath } from "url";

import { devUser } from "./helpers/credentials.js";
import { testEmailAdapter } from "./helpers/testEmailAdapter.js";
import { seed } from "./seed.js";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname;
}

export default buildConfig({
  admin: {
    autoLogin: devUser,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    {
      slug: "posts",
      fields: [
        {
          name: "example",
          type: "text",
        },
      ],
      versions: true,
    },
    {
      slug: "media",
      fields: [],
      upload: {
        staticDir: path.resolve(dirname, "media"),
      },
    },
  ],
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || `file:${path.resolve(dirname, "database.db")}`,
    },
  }),
  editor: lexicalEditor(),
  email: testEmailAdapter,
  globals: [
    {
      slug: "settings",
      fields: [
        {
          name: "example",
          type: "richText",
        },
      ],
    },
  ],
  onInit: async (payload) => {
    await seed(payload);
  },
  plugins: [payloadSentinel({})],
  secret: process.env.PAYLOAD_SECRET || "test-secret_key",
  sharp,
  typescript: {
    autoGenerate: false,
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
