import React, { useState } from "react";
import avatarParts from "./AvatarParts";
import { toPng } from "html-to-image";

const PARTS = ["head", "hair", "eye", "shirt"];

// Generate initial selections dynamically
const getInitialSelections = () =>
  Object.fromEntries(
    Object.entries(avatarParts).map(([part, { styles }]) => [
      part,
      {
        styleIdx: 0,
        color: Object.keys(styles[0].colors)[0],
      },
    ])
  );

function getCurrentSrc(part, selections) {
  const { styleIdx, color } = selections[part];
  const style = avatarParts[part].styles[styleIdx];
  return style && style.colors[color] ? style.colors[color] : null;
}

function PartSelector({ selectedPart, setSelectedPart, selections }) {
  return (
    <div className="w-full flex justify-between">
      {PARTS.map((part) => (
        <img
          key={part}
          src={getCurrentSrc(part, selections)}
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
  );
}

function StyleSelector({
  paddedStyles,
  selectedStyleIdx,
  setSelections,
  selectedPart,
}) {
  return (
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
  );
}

function ColorSelector({
  colors,
  selectedStyleIdx,
  selectedColor,
  styles,
  setSelections,
  selectedPart,
}) {
  return (
    <div className="flex justify-between mt-2">
      {selectedStyleIdx >= 0 && colors.length > 0
        ? colors.map((color) => (
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
          ))
        : [...Array(4)].map((_, idx) => (
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
  );
}

function AvatarCanvas({ selections }) {
  return (
    <div
      className="w-[300px] h-[300px] bg-gray-800 relative"
      id="avatar-canvas"
    >
      <img
        src={getCurrentSrc("shirt", selections)}
        alt="shirt"
        className="absolute bottom-0 left right-1/2 translate-x-1/2 z-10"
      />
      <img
        src={getCurrentSrc("head", selections)}
        alt="head"
        className="absolute bottom-24 right-46 translate-x-1/2"
      />
      <img
        src={getCurrentSrc("eye", selections)}
        alt="eye"
        className="absolute bottom-[138px] right-[202px] translate-x-1/2"
      />
      {getCurrentSrc("hair", selections) && (
        <img
          src={getCurrentSrc("hair", selections)}
          alt="hair"
          className="absolute bottom-28 right-[188px] translate-x-1/2"
        />
      )}
    </div>
  );
}

function App() {
  const [selectedPart, setSelectedPart] = useState("head");
  const [selections, setSelections] = useState(getInitialSelections());

  const selectedStyleIdx = selections[selectedPart].styleIdx;
  const selectedColor = selections[selectedPart].color;
  const styles = avatarParts[selectedPart].styles;
  const colors =
    selectedStyleIdx >= 0 && styles[selectedStyleIdx]
      ? Object.keys(styles[selectedStyleIdx].colors)
      : [];
  const paddedStyles = [...styles, ...Array(4 - styles.length).fill(null)];

  const randomizeSelections = () => {
    const randomSelections = {};
    Object.entries(avatarParts).forEach(([part, { styles }]) => {
      const styleIdx = Math.floor(Math.random() * styles.length);
      const colorKeys = Object.keys(styles[styleIdx].colors);
      const color = colorKeys[Math.floor(Math.random() * colorKeys.length)];
      randomSelections[part] = { styleIdx, color };
    });
    setSelections(randomSelections);
  };

  const downloadAvatar = async () => {
    const avatarNode = document.getElementById("avatar-canvas");
    if (avatarNode) {
      try {
        const dataUrl = await toPng(avatarNode, { cacheBust: true });
        const link = document.createElement("a");
        link.download = "avatar.png";
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Download failed:", err);
      }
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-screen max-lg:h-full"
      style={{
        backgroundImage: `url("/bg.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <img src="/logo.svg" alt="Logo" className="w-120" />
      <div
        style={{
          background: "rgba(10,10,60,0.32)",
          border: "1px solid rgba(200,0,40,0.42)",
        }}
        className="rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-[4.3px] w-[80vw] h-[70vh] grid grid-cols-3 items-center p-10 gap-6 max-lg:grid-cols-1 max-lg:w-full max-lg:rounded-none max-lg:p-2 max-lg:h-full max-lg:gap-0"
      >
        {/* OPTIONS */}
        <div className="border border-rose-100 h-full p-6 gap-2 flex flex-col max-lg:mb-4">
          <PartSelector
            selectedPart={selectedPart}
            setSelectedPart={setSelectedPart}
            selections={selections}
          />
          <StyleSelector
            paddedStyles={paddedStyles}
            selectedStyleIdx={selectedStyleIdx}
            setSelections={setSelections}
            selectedPart={selectedPart}
          />
          <ColorSelector
            colors={colors}
            selectedStyleIdx={selectedStyleIdx}
            selectedColor={selectedColor}
            styles={styles}
            setSelections={setSelections}
            selectedPart={selectedPart}
          />
        </div>
        {/* CANVAS */}
        <div className="col-span-2 border border-rose-100 h-full flex flex-col justify-center items-center">
          <main className="w-full flex items-center justify-center m-auto h-full">
            <AvatarCanvas selections={selections} />
          </main>
          <div className="flex gap-4 my-6">
            <button
              className="px-7 py-3 rounded-xl font-bold bg-gradient-to-br from-red-700 via-blue-900 to-blue-700 text-white shadow-lg border-none cursor-pointer
      backdrop-blur-md bg-opacity-80
      hover:shadow-[0_0_20px_5px_rgba(200,0,40,0.4)]
      hover:bg-gradient-to-br hover:from-red-500 hover:via-blue-700 hover:to-blue-900
      transition-all duration-200"
              onClick={randomizeSelections}
            >
              <span className="drop-shadow-lg">🎲 Randomize</span>
            </button>
            <button
              className="px-7 py-3 rounded-xl font-bold bg-gradient-to-br from-blue-900 via-red-700 to-red-600 text-white shadow-lg border-none cursor-pointer
      backdrop-blur-md bg-opacity-80
      hover:shadow-[0_0_20px_5px_rgba(10,10,60,0.4)]
      hover:bg-gradient-to-br hover:from-blue-700 hover:via-red-600 hover:to-red-900
      transition-all duration-200"
              onClick={downloadAvatar}
            >
              <span className="drop-shadow-lg">⬇️ Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
