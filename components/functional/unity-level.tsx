import React, { useState, useEffect, useCallback } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { Level } from "@/interfaces";
import { Progress } from "../ui/progress";

export default function UnityLevelEmbed({
  level,
  onGameStatusChange,
  onFullscreen,
}: {
  level?: Level;
  onGameStatusChange: (status: string) => void;
  onFullscreen: boolean;
}) {
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  const {
    unityProvider,
    sendMessage,
    isLoaded,
    loadingProgression,
    requestFullscreen,
    addEventListener,
    removeEventListener,
  } = useUnityContext({
    loaderUrl: "/build/level/unity.loader.js",
    dataUrl: "/build/level/unity.data",
    frameworkUrl: "/build/level/unity.framework.js",
    codeUrl: "/build/level/unity.wasm",
  });
  useEffect(() => {
    requestFullscreen(true);
  }, [onFullscreen]);

  useEffect(() => {
    setLoadingPercentage(Math.round(loadingProgression * 100));

    isLoaded && SendData();
  }, [isLoaded, loadingProgression]);

  const FetchData = useCallback((data: any) => {
    onGameStatusChange(data);
  }, []);

  useEffect(() => {
    addEventListener("SendData", FetchData);
    return () => {
      removeEventListener("SendData", FetchData);
    };
  }, [addEventListener, removeEventListener, FetchData]);

  function SendData() {
    const combinedData = `//LEVEL_NAME:${level?.name}//AUTHOR_NAME:${level?.author}//SEED:${level?.seed}///`;
    sendMessage("GameManager", "FetchData", combinedData);
  }

  return (
    <div className="w-full h-full flex justify-center items-center relative">
      {level && (
        <>
          {isLoaded === false && (
            <div className="absolute top-0 left-0 w-full h-full bg-gray-400 flex flex-col justify-center items-center">
              <p className="text-6xl font-black text-center my-32">
                Loading...
              </p>

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
      )}
    </div>
  );
}
