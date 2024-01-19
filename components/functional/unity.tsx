// UnityEmbed component
import React, { useState, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { Button } from "../ui/button";
import { Level } from "@/interfaces";

export default function UnityEmbed({ level }: { level?: Level }) {
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  const {
    unityProvider,
    sendMessage,
    isLoaded,
    loadingProgression,
    requestFullscreen,
  } = useUnityContext({
    loaderUrl: "/Build/unity.loader.js",
    dataUrl: "/Build/unity.data",
    frameworkUrl: "/Build/unity.framework.js",
    codeUrl: "/Build/unity.wasm",
  });

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
    const combinedData = `//LEVEL_NAME:${level?.name}//,AUTHOR_NAME:${level?.author}//SEED:,${level?.seed}//`;
    console.log("TEST:  " + combinedData);
    sendMessage("GameManager", "FetchData", combinedData);
  }

  return (
    <div className="aspect-[16/9] relative">
      {isLoaded === false && (
        <div className="absolute top-0 left-0 w-full h-full bg-gray-400 flex, justify-center items-center">
          <p>Loading... ({loadingPercentage}%)</p>
        </div>
      )}

      <Unity unityProvider={unityProvider} className="w-full h-full" />

      <div className="absolute top-2 right-2">
        <Button
          onClick={() => {
            requestFullscreen(true);
          }}
        >
          Fullscreen
        </Button>
      </div>

      <Button
        onClick={() => sendMessage("Testing", "TestingMethod", "Test")}
        className="absolute bottom-2 left-2"
      >
        Click to Test
      </Button>
    </div>
  );
}
