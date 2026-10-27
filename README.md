# FusionGPT

A multi-modal AI chat app that combines a ChatGPT-style chat interface, voice input/output and an autonomous "agent" mode in one place. It is built on top of the open-source [chat-with-gpt](https://github.com/cogentapps/chat-with-gpt) project (MIT) and adds an AgentGPT-style agent powered by LangChain.

## Features

- **Chat with OpenAI models** — streaming responses, Markdown/code/LaTeX rendering, editable message trees and chat history
- **Voice input** — speech-to-text through OpenAI **Whisper**
- **Voice output** — text-to-speech through **ElevenLabs** (or the browser's built-in Web Speech API)
- **Autonomous agent mode** — give the agent a goal and it plans and runs tasks using tools:
  - web search (Serper / Google)
  - image generation
  - code writing
  - summarisation
- **Sync & sharing** — chats sync across devices (Yjs) and can be shared via a link
- **Accounts** — local username/password login (Passport) or Auth0
- Plugins for system prompts, automatic chat titles and context trimming

## Repository layout

```
app/      React front end (Create React App + CRACO, Mantine UI, Redux Toolkit)
server/   Node.js/Express + TypeScript back end (API proxies, auth, sync, agent)
Dockerfile  Builds the front end and serves it from the back end in one image
```

A standalone copy of the back end, set up for separate deployment, lives in [fusion-Backend-Seperate](https://github.com/Gladiathor1/fusion-Backend-Seperate).

## Getting started

### Prerequisites

- Node.js 18+
- API keys for OpenAI (required), ElevenLabs (optional, for TTS) and Serper (optional, for agent web search)

### 1. Back end

```bash
cd server
cp .example.env .env   # then fill in your API keys
npm install
npm start              # http://localhost:3001
```

Environment variables:

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Chat completions & Whisper |
| `ELEVENLABS_API_KEY` | Text-to-speech |
| `SERPER_API_KEY` | Web-search tool for the agent |
| `PORT` | Server port (default `3001`) |
| `AUTH_SECRET` | Session secret (random if unset) |
| `S3_BUCKET` / `DEFAULT_S3_REGION` | Store data in S3 instead of local SQLite |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` | API rate limiting |

Further options (database, TLS, Auth0, public URL) can be set in `data/config.yaml` — see `server/src/config.ts`.

### 2. Front end

```bash
cd app
npm install
npm start              # http://localhost:3000, proxies /chatapi to the back end
```

### Docker

```bash
docker build -t fusiongpt .
docker run -p 3000:3000 --env-file server/.env fusiongpt
```

The GitHub Actions workflows in `.github/workflows` build the image and publish it to GitHub Container Registry on pushes to the `release` branch.

## License

MIT — see [LICENSE](LICENSE). Based on chat-with-gpt by Cogent Apps.
