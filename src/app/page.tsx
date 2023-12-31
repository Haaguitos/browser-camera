"use client";

import { useEffect } from "react";

type WindowDetails = {
  screenX: number;
  screenY: number;
  screenWidth: number;
  screenHeight: number;
  width: number;
  height: number;
  updated: number;
};

export default function Home() {
  useEffect(() => {
    const stats = document.querySelector<HTMLPreElement>(".stats");
    const clear = document.querySelector<HTMLButtonElement>(".clear");
    const video = document.querySelector<HTMLVideoElement>("video");

    function getScreens(): [string, WindowDetails][] {
      return Object.entries(window.localStorage)
        .filter(([key]) => key.startsWith("screen-"))
        .map(([key, value]: [string, string]) => [
          key,
          JSON.parse(value) as WindowDetails,
        ]);
    }

    function getScreenId() {
      const existingScreens = Object.keys(window.localStorage)
        .filter((key) => key.startsWith("screen-"))
        .map((key) => parseInt(key.replace("screen-", "")))
        .sort((a, b) => a - b);

      const nextScreenNumber =
        existingScreens && existingScreens.length > 0
          ? existingScreens[existingScreens.length - 1] + 1
          : 1;

      return nextScreenNumber;
    }

    const screenId = `screen-${getScreenId()}`;

    function setScreenDetails() {
      const windowDetails = {
        screenX: window.screenX,
        screenY: window.screenY,
        screenWidth: window.screen.availWidth,
        screenHeight: window.screen.availHeight,
        width: window.outerWidth,
        height: window.innerHeight,
        updated: Date.now(),
      };
      window.localStorage.setItem(screenId, JSON.stringify(windowDetails));
      // console.log(windowDetails);
    }

    function displayStats() {
      if (!stats) return;
      const existingScreens = Object.fromEntries(getScreens());
      console.log("existingScreens", existingScreens);
      stats.innerHTML = JSON.stringify(existingScreens, null, " ");
    }

    function restart() {
      console.log(timers);
      timers.forEach((timer) => window.clearInterval(timer));
      window.localStorage.clear();
      setTimeout(() => window.location.reload(), Math.random() * 1000);
    }

    function removeScreen() {
      console.log(`removing screen ${screenId}`);
      localStorage.removeItem(screenId);
    }

    function removeOld() {
      const screens = getScreens();
      for (const [key, screen] of screens) {
        if (Date.now() - screen.updated > 1000) {
          localStorage.removeItem(key);
        }
      }
    }

    function setVideo() {
      video?.setAttribute(
        "style",
        `transform: translate(-${window.screenX}px, -${window.screenY}px)`
      );
    }

    const timers: ReturnType<typeof setInterval>[] = [];
    function go() {
      timers.push(setInterval(setScreenDetails, 10));
      timers.push(setInterval(displayStats, 10));
      timers.push(setInterval(removeOld, 100));
      timers.push(setInterval(setVideo, 10));
    }

    clear?.addEventListener("click", restart);
    window.addEventListener("beforeunload", removeScreen);

    function populateWebcam() {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (!video) return;
        video.width = window.screen.availWidth;
        video.height = window.screen.availHeight;
        video.srcObject = stream;
        video.play();
      });
    }

    go();

    populateWebcam();
  }, []);

  return (
    <>
      <video src=""></video>
      <div id="app">
        <button className="clear">Clear</button>
        <pre className="stats"></pre>
      </div>
    </>
  );
}
