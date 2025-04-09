"use client";
import { CartesiaClient, WebPlayer } from "@cartesia/cartesia-js";
import { useCallback, useRef, useState } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { ClassValue } from "clsx";


//////////////////////////////////
// UI Utilities
//////////////////////////////////
function cn(...classLists: ClassValue[]) {
  return twMerge(clsx(classLists))
}

function Button({ children, onClick, disabled }: React.ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "group flex h-8 items-center justify-center rounded-md border bg-gradient-to-b px-4 text-neutral-50 ",
        disabled
          ? "border-gray-300 bg-gray-300 text-gray-400"
          : "border-blue-600 from-blue-400 via-blue-500 to-blue-600 hover:from-blue-600 hover:via-blue-600 hover:to-blue-600 shadow-[inset_0_1px_0px_0px_#93c5fd] active:[box-shadow:none]"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="block group-active:[transform:translate3d(0,1px,0)]">{children}</span>
    </button>
  )
}

//////////////////////////////////
// Main
//////////////////////////////////
type ConnectionState = "idle" | "fetching-token" | "connecting" | "ready" | "disconnected";

export default function Home() {
  const websocketRef = useRef<ReturnType<typeof CartesiaClient.prototype.tts.websocket> | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [playerState, setPlayerState] = useState<"idle" | "playing">("idle");

  const [script, setScript] = useState("");

  const connect = useCallback(async () => {
    setConnectionState("fetching-token");
    const res = await fetch('/get-token');
    const data = await res.json();
    setConnectionState("connecting");
    const cartesia = new CartesiaClient();
    websocketRef.current = cartesia.tts.websocket({
      container: "raw",
      encoding: "pcm_f32le",
      sampleRate: 44100,
    });
    const ctx = await websocketRef.current?.connect({
      accessToken: data.token,
    });
    setConnectionState("ready");
    ctx.on("close", () => {
      setConnectionState("disconnected");
      websocketRef.current = null;
    });
  }, []);

  const speak = useCallback(async () => {
    const ctx = websocketRef.current;
    if (!ctx) {
      console.error("Not connected");
      return;
    }
    const resp = await ctx.send({
      modelId: "sonic-2",
      voice: {
        mode: "id",
        id: "694f9389-aac1-45b6-b726-9d9369183238",
      },
      language: "en",
      transcript: script,
    });
    const player = new WebPlayer({ bufferDuration: 600 });
    setPlayerState("playing");
    await player.play(resp.source);
    setPlayerState("idle");
  }, [script]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 max-w-screen-sm mx-auto">
      <div className="w-full h-8 flex justify-left items-center gap-2">
        {(connectionState === "idle" || connectionState === "disconnected") && <Button onClick={connect}>Connect</Button>}
        <div className="px-1 text-gray-700">
          {connectionState === "fetching-token" && "Fetching token..."}
          {connectionState === "connecting" && "Connecting..."}
          {connectionState === "ready" && "Ready!"}
          {connectionState === "disconnected" && "Disconnected - Cartesia disconnects websockets after 5 min of inactivity"}
        </div>
      </div>
      <div className="w-full">
        <textarea className="w-full border-1 border-gray-400 rounded-md p-2" value={script} onChange={(e) => setScript(e.target.value)} />
        <div className="w-full flex justify-between items-center">
          <Button disabled={connectionState !== "ready" || playerState === "playing"} onClick={speak}>Speak</Button>
          <a
            className="flex gap-2 text-blue-700 hover:text-blue-500"
            href="https://docs.cartesia.ai/"
            target="_blank"
            rel="noopener noreferrer"
          >
            More info on docs.cartesia.ai →
          </a>
        </div>
      </div>
    </div>
  );
}
