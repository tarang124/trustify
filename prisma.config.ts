import path from "node:path"
import { defineConfig } from "prisma/config"

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL ?? "file:prisma/dev.db",
  },
  migrate: {
    async adapter() {
      const { PrismaLibSql } = await import("@prisma/adapter-libsql")
      return new PrismaLibSql({
        url: process.env.DATABASE_URL ?? "file:prisma/dev.db",
      })
    },
  },
})
