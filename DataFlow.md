# Data Flow: Page ⇄ API ⇄ Supabase ⇄ Postgres (v0)

PostgreSQL 是底层的关系型数据库软件（类似 MySQL），负责真正的数据存储与查询。
Supabase 是构建在 PostgreSQL 之上的云平台，负责托管数据库并提供 API、SDK 和安全机制。
Next.js 的 route.ts 定义了应用自己的后端接口，用于在前端与 Supabase 之间建立受控的数据交换。
前端页面通过 fetch 调用这些接口，从而间接完成对数据库的读写操作。
