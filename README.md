# 📘 Recall

![Demo](./demo.gif) <!-- Replace this with your actual video/GIF path -->

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

I built Recall to dive deep into modern search systems — like semantic search — and to gain full control over a production-grade stack with database modeling, embeddings, workers, and search indexing.

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

## 🐳 Local Dev with Docker

```bash
# Spin up all services
docker-compose up --build
```

# [License](./LICENSE)

