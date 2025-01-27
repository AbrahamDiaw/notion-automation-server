# LinkedIn Post Generator

This project automatically generates relevant LinkedIn posts using Anthropic's Claude API and stores them in a Notion database. Generation is automated through scheduled cron jobs.

## Prerequisites

Before starting, make sure you have:

- A Notion account
- An Anthropic account
- A Vercel account
- Node.js installed on your machine

## Setup

### 1. Environment Variables

Create a `.env` file at the root of your project with the following variables:

```bash
NOTION_TOKEN=your_notion_token
NOTION_DATABASE_ID=your_notion_db_token
ANTHROPIC_API_KEY=your_anthropic_api_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### 2. Notion Setup

To configure the Notion integration:
- Create a new integration on [Notion Developers](https://developers.notion.com/docs/create-a-notion-integration#getting-started)
- In your Notion database URL, get the ID before the first "?"
- Example: In "https://www.notion.so/a8c3b6d9f4e2c1b5a7d8e9f2c3b6a9d4?v=a8c3b6d9f4e2c1b5a7d8e9f2c3b6a9d4&pvs=4", the ID is "a8c3b6d9f4e2c1b5a7d8e9f2c3b6a9d4"

### 3. Anthropic Setup

To get your Anthropic API key:
- Check the [Anthropic documentation](https://docs.anthropic.com/en/api/getting-started)

### 4. Vercel Blob Setup

The project uses Vercel Blob Storage as a backup solution for all generated content. This ensures data persistence and provides an easy way to:
- Keep a JSON backup of all generated posts
- Quickly recover data in case of Notion database issues
- Easily migrate content to other databases or platforms
- Track the history of generated content

To configure Vercel Blob:
- Follow the [Vercel Blob documentation](https://vercel.com/docs/storage/vercel-blob#getting-started)

## How it works

### Cron Jobs

The project uses two cron jobs configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-ideas",
      "schedule": "0 8 * * *"  // Runs at 8:00 AM
    },
    {
      "path": "/api/cron/generate-ideas",
      "schedule": "0 0 * * *"  // Runs at midnight
    }
  ]
}
```

### Content Configuration

The project uses several configurable constants:

- `NUMBER_OF_POSTS`: Number of posts to generate per execution
- `topics`: List of topics for content generation
- `claude_system`: System prompt to define the generation context

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Generated Post Structure

Each post generated in Notion contains:

- A hook
- Main content
- Hashtags
- Metadata (Status, Language, Media, Topic)

Posts are automatically saved in both:
- Your Notion database with "💡 Idea" status
- Vercel Blob Storage as a JSON backup

## Customization

You can modify:

- Number of generated posts
- Topics for generation
- Claude's system prompt
- Generation frequency via crons
- Post structure in Notion

Adjust these parameters according to your specific needs.