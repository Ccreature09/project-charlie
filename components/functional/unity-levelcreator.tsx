import React, { useState, useEffect, useCallback, useRef } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

export default function UnityLevelEmbed({
  onGameStatusChange,
  onScreenshot,
  onFullscreen,
}: {
  onGameStatusChange: (status: string) => void;
  onScreenshot: boolean;

  onFullscreen: boolean;
}) {
  const [loadingPercentage, setLoadingPercentage] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState("");

  const {
    unityProvider,
    sendMessage,
    isLoaded,
    loadingProgression,
    requestFullscreen,
    takeScreenshot,
  } = useUnityContext({
    loaderUrl: "build/level-creator/unity.loader.js",
    dataUrl: "build/level-creator/unity.data",
    frameworkUrl: "build/level-creator/unity.framework.js",
    codeUrl: "build/level-creator/unity.wasm",
    webglContextAttributes: {
      preserveDrawingBuffer: true,
    },
  });

  useEffect(() => {
    requestFullscreen(true);
  }, [onFullscreen]);

  useEffect(() => {
    const dataUrl = takeScreenshot("image/jpg", 0.5);
    //   newWindow.document.write('<img src="' + dataUrl + '" />');
    console.log(dataUrl);
  }, [onScreenshot]);

  useEffect(() => {
    setLoadingPercentage(Math.round(loadingProgression * 100));

    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        SendData();
      }, 2500);

      return () => clearTimeout(timeoutId);
    }
  }, [isLoaded, loadingProgression]);

  function SendData() {
    const combinedData = "true";
    console.log("TEST:  " + combinedData);
    sendMessage("GameManager", "FetchData", combinedData);
  }

  const FetchData = useCallback((data: any) => {
    setGameStatus(data);
    onGameStatusChange(data);
    console.log(data);
  }, []);

  return (
    <div className="w-full h-full flex justify-center items-center relative">
      <>
        {isLoaded === false && (
          <div className="absolute top-0 left-0 w-full h-full bg-gray-400 flex flex-col justify-center items-center">
            <p className="text-6xl font-black text-center my-32">Loading...</p>

            <Progress
              className="w-1/2 mx-auto"
              value={loadingPercentage}
            ></Progress>
          </div>
        )}
        <div className="aspect-[16/9] w-full h-full ">
          <Unity unityProvider={unityProvider} className="w-full h-full" />
        </div>
      </>
    </div>
  );
}
