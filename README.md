This is a [Cartesia](https://cartesia.ai) webapp demo using [Next.js](https://nextjs.org), showing how to do text-to-speech (TTS) in the browser-based client.

## Getting Started

First, [get a Cartesia API Key](https://play.cartesia.ai/keys) and add it to `.env.local`:

```
CARTESIA_API_KEY=<your-api-key>
```

Then, install packages:

```bash
npm install
# or
pnpm install
```

Then run the development server:

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app. Click `Connect`, type some text to read out, then click `Speak` (and make sure your device is not muted).

## How it works

Roughly:

1. The demo client initiates the flow by requesting an Access Token from the demo server
2. The demo server uses its API Key to authenticate with the Cartesia API
3. After receiving the Access Token, it's passed back to the client
4. The client establishes a WebSocket connection with the Cartesia API using this token
5. Once connected, the client sends its TTS request over the WebSocket
6. The Cartesia API streams back the generated audio data
7. The client processes and plays the audio as it arrives using WebPlayer
