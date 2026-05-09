"use client";

import { useEffect, useRef } from "react";

interface Props {
  stream: MediaStream | null;
  isRecording: boolean;
  isTranscribing: boolean;
}

export function AudioWaveform({ stream, isRecording, isTranscribing }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!stream || !isRecording) return;

    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.7;
    source.connect(analyser);
    analyserRef.current = analyser;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray as any;

    return () => {
      ctx.close();
      analyserRef.current = null;
      dataArrayRef.current = null;
    };
  }, [stream, isRecording]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const BAR_COUNT = 40;
    const BAR_WIDTH = 3;
    const BAR_GAP = 2;
    const TOTAL_WIDTH = BAR_COUNT * (BAR_WIDTH + BAR_GAP);
    const CENTER_X = canvas.width / 2;
    const START_X = CENTER_X - TOTAL_WIDTH / 2;

    const c = canvas;
    const dctx = ctx;

    function draw() {
      if (!c || !dctx) return;
      dctx.clearRect(0, 0, c.width, c.height);

      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;
      const active = isRecording && analyser && dataArray;

      if (active && dataArray) {
        analyser!.getByteFrequencyData(dataArray as any);
      }

      const centerY = c.height / 2;

      for (let i = 0; i < BAR_COUNT; i++) {
        const x = START_X + i * (BAR_WIDTH + BAR_GAP);

        let barHeight: number;
        if (active && dataArray) {
          const binIndex = Math.floor((i / BAR_COUNT) * dataArray.length * 0.6);
          const value = (dataArray[binIndex] || 0) / 255;
          barHeight = 3 + value * (c.height / 2 - 8);
        } else if (isTranscribing) {
          barHeight = 3 + Math.sin(i * 0.5 + Date.now() * 0.001) * 5 + Math.random() * 8;
        } else {
          const time = Date.now() * 0.002;
          barHeight = 4 + Math.sin(i * 0.4 + time) * 6 + 8;
        }

        const radius = BAR_WIDTH / 2;
        dctx.beginPath();
        dctx.roundRect(x, centerY - barHeight, BAR_WIDTH, barHeight * 2, radius);
        dctx.fillStyle = isTranscribing ? "#60a5fa" : isRecording ? "#ef4444" : "#d1d5db";
        dctx.globalAlpha = isTranscribing ? 0.5 : isRecording ? 0.9 : 0.4;
        dctx.fill();
        dctx.globalAlpha = 1;
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isRecording, isTranscribing]);

  return (
    <div className="flex items-center justify-center py-6">
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="w-full max-w-md h-32"
      />
    </div>
  );
}
