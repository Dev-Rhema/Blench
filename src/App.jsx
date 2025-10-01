import React, { useState } from "react";
import avatarParts from "./AvatarParts";
import { toPng } from "html-to-image";

const initialSelections = {
  head: {
    styleIdx: 0,
    color: Object.keys(avatarParts.head.styles[0].colors)[0],
  },
  eye: {
    styleIdx: 0,
    color: Object.keys(avatarParts.eye.styles[0].colors)[0],
  },
  hair: {
    styleIdx: 0,
    color: Object.keys(avatarParts.hair.styles[0].colors)[0],
  },
  shirt: {
    styleIdx: 0,
    color: Object.keys(avatarParts.shirt.styles[0].colors)[0],
  },
};

function App() {
  const [selectedPart, setSelectedPart] = useState("head");
  const [selections, setSelections] = useState(initialSelections);

  // Get current style and color for selected part
  const selectedStyleIdx = selections[selectedPart].styleIdx;
  const selectedColor = selections[selectedPart].color;

  // Get styles and colors for selected part
  const styles = avatarParts[selectedPart].styles;
  const colors =
    selectedStyleIdx >= 0 && styles[selectedStyleIdx]
      ? Object.keys(styles[selectedStyleIdx].colors)
      : [];

  // Pad styles to 4 items
  const paddedStyles = [...styles];
  while (paddedStyles.length < 4) {
    paddedStyles.push(null);
  }

  // Helper to get current SVG src for any part
  const getCurrentSrc = (part) => {
    const styleIdx = selections[part].styleIdx;
    const color = selections[part].color;
    if (
      styleIdx === -1 ||
      color === null ||
      !avatarParts[part].styles[styleIdx] ||
      !avatarParts[part].styles[styleIdx].colors[color]
    ) {
      return null; // No image for this part
    }
    // Always return string path
    return avatarParts[part].styles[styleIdx].colors[color];
  };

  return (
    <>
      <img src="/Head/basehead.svg" alt="" />
      <div
        className="flex flex-col items-center justify-center h-screen max-lg:h-full"
        style={{
          backgroundImage: `url("/bg.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <img src="/logo.svg" alt="" className="w-120" />
        <div
          style={{
            background: "rgba(10,10,60,0.32)", // dark blue glass
            border: "1px solid rgba(200,0,40,0.42)", // red border
          }}
          className="rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-[4.3px] w-[80vw] h-[70vh] grid grid-cols-3 items-center p-10 gap-6 max-lg:grid-cols-1 max-lg:w-full max-lg:rounded-none  max-lg:p-2 max-lg:h-full max-lg:gap-0"
        >
          {/* OPTIONS */}
          <div className="border border-rose-100 h-full p-6 gap-2 flex flex-col max-lg:mb-4">
            {/* SELECTOR */}
            <div className="w-full col-span-1 flex justify-between">
              {["head", "hair", "eye", "shirt"].map((part) => (
                <img
                  key={part}
                  src={getCurrentSrc(part)}
                  alt={part}
                  className={`size-10 p-2 rounded-full cursor-pointer border ${
                    selectedPart === part ? "ring-2 ring-rose-500" : ""
                  }`}
                  style={{
                    background:
                      "radial-gradient(circle at 25% 25%, #fff 0%, #27272a 75%)",
                  }}
                  onClick={() => setSelectedPart(part)}
                />
              ))}
            </div>
            {/* OPTION */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-xs mx-auto">
              {paddedStyles.map((style, idx) => (
                <div
                  key={idx}
                  className={`aspect-square cursor-pointer border border-gray-100 flex items-center justify-center ${
                    selectedStyleIdx === idx ? "ring-2 ring-rose-500" : ""
                  }`}
                  style={{
                    background:
                      "radial-gradient(circle at 25% 25%, #fff 0%, #27272a 75%)",
                    opacity: style ? 1 : 0.3,
                    width: "100%",
                    height: "100%",
                    minWidth: "4rem",
                    minHeight: "4rem",
                    maxWidth: "8rem",
                    maxHeight: "8rem",
                  }}
                  onClick={() => {
                    if (style) {
                      setSelections((prev) => ({
                        ...prev,
                        [selectedPart]: {
                          styleIdx: idx,
                          color: Object.keys(style.colors)[0],
                        },
                      }));
                    }
                  }}
                >
                  {style && (
                    <img
                      src={style.colors[Object.keys(style.colors)[0]]}
                      alt={style.name}
                      className="w-3/4 h-3/4 object-contain"
                    />
                  )}
                </div>
              ))}
            </div>
            {/* COLOR */}
            {selectedStyleIdx >= 0 && colors.length > 0 ? (
              <div className="flex justify-between mt-2">
                {colors.map((color) => (
                  <div
                    key={color}
                    className={`size-10 p-2 rounded-full cursor-pointer border flex items-center justify-center ${
                      selectedColor === color ? "ring-2 ring-rose-500" : ""
                    }`}
                    style={{
                      background:
                        "radial-gradient(circle at 25% 25%, #fff 0%, #27272a 75%)",
                    }}
                    onClick={() =>
                      setSelections((prev) => ({
                        ...prev,
                        [selectedPart]: {
                          ...prev[selectedPart],
                          color,
                        },
                      }))
                    }
                  >
                    <img
                      src={styles[selectedStyleIdx].colors[color]}
                      alt={color}
                      className="w-8 h-8 object-contain rounded-full"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-between mt-2">
                {[...Array(4)].map((_, idx) => (
                  <div
                    key={idx}
                    className="size-10 p-2 rounded-full border flex items-center justify-center"
                    style={{
                      background:
                        "radial-gradient(circle at 25% 25%, #fff 0%, #27272a 75%)",
                      opacity: 0.3,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          {/* CANVAS */}
          <div className="col-span-2 border border-rose-100  h-full flex flex-col justify-center items-center">
            <main className="w-full flex items-center justify-center m-auto h-full">
              <div
                className="w-[300px] h-[300px] bg-gray-800 relative"
                id="avatar-canvas"
              >
                {/* SHIRT */}
                <img
                  src={getCurrentSrc("shirt")}
                  alt="shirt"
                  className="absolute bottom-0 left right-1/2 translate-x-1/2 z-10"
                />
                {/* HEAD */}
                <img
                  src={getCurrentSrc("head")}
                  alt="head"
                  className="absolute bottom-24 right-46 translate-x-1/2"
                />
                {/* EYE */}
                <img
                  src={getCurrentSrc("eye")}
                  alt="eye"
                  className="absolute bottom-[138px] right-[202px] translate-x-1/2"
                />
                {/* HAIR */}
                {getCurrentSrc("hair") && (
                  <img
                    src={getCurrentSrc("hair")}
                    alt="hair"
                    className="absolute bottom-28 right-[188px] translate-x-1/2"
                  />
                )}
              </div>
            </main>
            {/* BUTTONS UNDER CANVAS */}
            <div className="flex gap-4 my-6">
              <button
                className="px-7 py-3 rounded-xl font-bold bg-gradient-to-br from-red-700 via-blue-900 to-blue-700 text-white shadow-lg border-none cursor-pointer
      backdrop-blur-md bg-opacity-80
      hover:shadow-[0_0_20px_5px_rgba(200,0,40,0.4)]
      hover:bg-gradient-to-br hover:from-red-500 hover:via-blue-700 hover:to-blue-900
      transition-all duration-200"
                onClick={() => {
                  const randomSelections = {};
                  Object.keys(avatarParts).forEach((part) => {
                    const styles = avatarParts[part].styles;
                    const styleIdx = Math.floor(Math.random() * styles.length);
                    const colors = Object.keys(styles[styleIdx].colors);
                    const colorIdx = Math.floor(Math.random() * colors.length);
                    randomSelections[part] = {
                      styleIdx,
                      color: colors[colorIdx],
                    };
                  });
                  setSelections(randomSelections);
                }}
              >
                <span className="drop-shadow-lg">🎲 Randomize</span>
              </button>
              <button
                className="px-7 py-3 rounded-xl font-bold bg-gradient-to-br from-blue-900 via-red-700 to-red-600 text-white shadow-lg border-none cursor-pointer
      backdrop-blur-md bg-opacity-80
      hover:shadow-[0_0_20px_5px_rgba(10,10,60,0.4)]
      hover:bg-gradient-to-br hover:from-blue-700 hover:via-red-600 hover:to-red-900
      transition-all duration-200"
                onClick={async () => {
                  const avatarNode = document.getElementById("avatar-canvas");
                  if (avatarNode) {
                    toPng(avatarNode, { cacheBust: true })
                      .then((dataUrl) => {
                        const link = document.createElement("a");
                        link.download = "avatar.png";
                        link.href = dataUrl;
                        link.click();
                      })
                      .catch((err) => {
                        console.error("Download failed:", err);
                      });
                  }
                }}
              >
                <span className="drop-shadow-lg">⬇️ Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
