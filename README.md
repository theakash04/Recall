# 📘 Recall



[!demo](https://github.com/user-attachments/assets/f83d86ab-4baa-43dc-b813-4e465ab7fb94)

> **Smart bookmarks powered by AI.**  
> Save websites, documents, and articles — then Search it later.
> Recall scrapes, stores, and understands everything so you don’t have to.

---

## 🚀 Features

- **Smart Bookmarking** — Paste any URL, and we auto-scrape & store the content.
- **Intelligent Search** — Find anything via keyword, semantic, or hybrid search.
- **Blazing Fast** — Instant results, even from thousands of entries.

---

## 🧠 Why I Built This

I built Recall to learn more about modern search systems — like semantic search — and to gain full control over a production-grade stack with database modeling, embeddings, workers, and search indexing.

---

## 🛠️ Stack

- **Frontend**: Next.js
- **Backend**: Express.js
- **Auth & DB**: Supabase (Postgres + Auth) with `pgvector`
- **Worker**: Redis (upstash) + BullMQ
- **Embedding**: Google AI
- **Scraping**: Mozilla Readability
- **Containerized**: Docker (3 services + Compose)

---

## ⚙️ How It Works

1. User saves a URL
2. Backend scrapes, cleans, splits, and embeds content
3. All data is indexed & deduplicated
4. Users search via keywords or semantic meaning
5. Everything runs server-side, securely, and fast

---

## 🐳 Start locally with Docker 

```bash
# Spin up all services
docker-compose up --build
```

### [License](./LICENSE)

