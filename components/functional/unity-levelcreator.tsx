import React, { useState, useEffect, useCallback } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { Progress } from "../ui/progress";

export default function UnityLevelEmbed({
  onFetchSeed,
  onFetchScreenshot,
  onScreenshot,
  onFullscreen,
  onHideUI,
  onGridSize,
}: {
  onFetchSeed: (status: string) => void;
  onFetchScreenshot: (status: string | undefined) => void;
  onScreenshot: boolean;
  onFullscreen: boolean;
  onHideUI: boolean;
  onGridSize: string;
}) {
  const [loadingPercentage, setLoadingPercentage] = useState<number>(0);
  const [hideUI, setHideUI] = useState(false);

  const [gameStatus, setGameStatus] = useState("");
  const {
    unityProvider,
    sendMessage,
    isLoaded,
    loadingProgression,
    requestFullscreen,
    takeScreenshot,
    addEventListener,
    removeEventListener,
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
    onFetchScreenshot(dataUrl);
    //   newWindow.document.write('<img src="' + dataUrl + '" />');
  }, [onScreenshot]);

  useEffect(() => {
    sendMessage("GameManager", "FetchData", onGridSize);
  }, [onGridSize]);

  useEffect(() => {
    setHideUI(!hideUI);
    console.log(hideUI);
    sendMessage(
      "GameManager",
      "FetchData",
      hideUI ? "UIHide:true" : "UIHide:false"
    );
  }, [onHideUI]);

  useEffect(() => {
    setLoadingPercentage(Math.round(loadingProgression * 100));
    isLoaded && sendMessage("GameManager", "FetchData", "Instantiate:3,3");
  }, [isLoaded, loadingProgression]);

  const FetchData = useCallback((data: any) => {
    setGameStatus(data);
    onFetchSeed(data);
    console.log(data);
  }, []);

  useEffect(() => {
    addEventListener("SendData", FetchData);
    return () => {
      removeEventListener("SendData", FetchData);
    };
  }, [addEventListener, removeEventListener, FetchData]);

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
