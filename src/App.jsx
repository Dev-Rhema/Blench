import React, { useState, useEffect, useCallback } from "react";
import avatarPartsMale from "./AvatarPartsMale";
import avatarPartsFemale from "./AvatarPartsFemale";
import { toPng } from "html-to-image";
import logo from "./logo.svg";

// Dynamically get all trait keys from avatarParts
function getParts(avatarParts) {
  return Object.keys(avatarParts);
}

// Generate initial selections dynamically for a given avatarParts
const getInitialSelections = (avatarParts) =>
  Object.fromEntries(
    Object.entries(avatarParts).map(([part, { styles }]) => [
      part,
      {
        styleIdx: 0,
        color:
          part === "head"
            ? Object.keys(styles[0].colors).find(
                (c) => c.toLowerCase() === "light"
              ) || Object.keys(styles[0].colors)[0]
            : Object.keys(styles[0].colors)[0],
      },
    ])
  );

function getCurrentSrc(part, selections, avatarParts) {
  if (!selections || !avatarParts || !avatarParts[part] || !selections[part]) {
    console.warn(`Missing trait or selection for part: ${part}`);
    return null;
  }
  const { styleIdx, color } = selections[part];
  const styles = avatarParts[part].styles;
  if (!Array.isArray(styles) || styles.length === 0) {
    console.warn(`No styles found for part: ${part}`);
    return null;
  }
  const style = styles[styleIdx];
  if (!style || !style.colors) {
    console.warn(
      `No style/colors found for part: ${part}, styleIdx: ${styleIdx}`
    );
    return null;
  }
  // If the color exists, use it. Otherwise, use the first available color key.
  if (style.colors[color]) {
    return style.colors[color];
  }
  const colorKeys = Object.keys(style.colors);
  if (colorKeys.length > 0) {
    console.warn(
      `Color '${color}' not found for part: ${part}. Using '${colorKeys[0]}' instead.`
    );
    return style.colors[colorKeys[0]];
  }
  console.warn(`No colors available for part: ${part}, styleIdx: ${styleIdx}`);
  return null;
}

// Utility to preload an array of image URLs
function usePreloadImages(urls) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!urls || urls.length === 0) {
      setLoaded(true);
      return;
    }
    let isMounted = true;
    let loadedCount = 0;
    urls.forEach((url) => {
      const img = new window.Image();
      img.onload = img.onerror = () => {
        loadedCount++;
        if (isMounted && loadedCount === urls.length) setLoaded(true);
      };
      img.src = url;
    });
    return () => {
      isMounted = false;
    };
  }, [urls]);
  return loaded;
}

// Spinner component
function Spinner({ size = 32 }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ height: size, width: size }}
    >
      <svg
        className="animate-spin"
        style={{ width: size, height: size }}
        viewBox="0 0 50 50"
      >
        <circle
          className="opacity-25"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="#fff"
          strokeWidth="5"
        />
        <path
          className="opacity-75"
          fill="#e11d48"
          d="M25 5a20 20 0 0 1 20 20"
        />
      </svg>
    </div>
  );
}

function FadeInImage({ src, alt, className = "", style = {}, ...props }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        ...style,
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.5s cubic-bezier(0.4,0,0.2,1)",
      }}
      onLoad={() => setLoaded(true)}
      {...props}
    />
  );
}

function PartSelector({
  selectedPart,
  setSelectedPart,
  selections,
  avatarParts,
}) {
  const PARTS = Object.keys(avatarParts);
  return (
    <div className="w-full grid grid-cols-4 gap-4 justify-items-center">
      {PARTS.map((part) => (
        <div key={part} className="flex flex-col items-center">
          <FadeInImage
            src={getCurrentSrc(part, selections, avatarParts)}
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
          <span className="text-xs text-white mt-1">{part}</span>
        </div>
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
            background: style
              ? "radial-gradient(circle at 25% 25%, #fff 0%, #27272a 75%)"
              : "transparent",
            opacity: style ? 1 : 0.08,
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
  selections,
}) {
  // If hands, only show color matching head color
  let filteredColors = colors;
  if (selectedPart === "hands" && selections && selections.head) {
    filteredColors = colors.filter((c) => c === selections.head.color);
  }
  return (
    <div className="grid grid-cols-4 gap-4 mt-2 justify-items-center">
      {selectedStyleIdx >= 0 && filteredColors.length > 0
        ? filteredColors.map((color) => (
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

function AvatarCanvas({ selections, avatarBg, avatarParts, isRandomizing }) {
  // Define preferred rendering order
  const preferredOrder = [
    "shirt",
    "head",
    "hair",
    "eye",
    "earrings",
    "hands",
    "tattoos",
    // Add other traits as needed, or leave others to default
  ];
  // Custom z-index for each part
  const zIndexMap = {
    shirt: 100,
    head: 50,
    hair: 80,
    eye: 70,
    earrings: 100,
    hands: 10,
    tattoos: 60,
    // Add more parts and z-index values as needed
  };
  const PARTS = getParts(avatarParts);
  // Sort parts: preferredOrder first, then others
  const sortedParts = [
    ...preferredOrder.filter((part) => PARTS.includes(part)),
    ...PARTS.filter((part) => !preferredOrder.includes(part)),
  ];
  const avatarUrls = sortedParts
    .map((part) => getCurrentSrc(part, selections, avatarParts))
    .filter(Boolean);
  const loaded = usePreloadImages(avatarUrls);
  if (isRandomizing) {
    return (
      <div className="w-[300px] h-[300px] flex items-center justify-center">
        <Spinner size={64} />
      </div>
    );
  }
  return (
    <div
      className="w-[300px] h-[300px] relative"
      id="avatar-canvas"
      style={{ background: avatarBg }}
    >
      {sortedParts.map((part, idx) => {
        const src = getCurrentSrc(part, selections, avatarParts);
        if (!src) return null;
        const zIndex =
          zIndexMap[part] !== undefined ? zIndexMap[part] : 10 + idx;
        return (
          <FadeInImage
            key={part}
            src={src}
            alt={part}
            className="absolute left-0 top-0 w-full h-full object-contain"
            style={{ zIndex }}
          />
        );
      })}
    </div>
  );
}

function App() {
  const [gender, setGender] = useState("male");
  const [selectedPart, setSelectedPart] = useState("head");
  const [avatarParts, setAvatarParts] = useState(avatarPartsMale);
  const [selections, setSelections] = useState(
    getInitialSelections(avatarPartsMale)
  );
  const [avatarBg, setAvatarBg] = useState("#27272a");
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [pendingRandomSelections, setPendingRandomSelections] = useState(null);

  // Update avatarParts and selections when gender changes
  React.useEffect(() => {
    if (gender === "male") {
      setAvatarParts(avatarPartsMale);
      setSelections(getInitialSelections(avatarPartsMale));
    } else {
      setAvatarParts(avatarPartsFemale);
      setSelections(getInitialSelections(avatarPartsFemale));
    }
    setSelectedPart("head");
  }, [gender]);

  const selectedStyleIdx = selections[selectedPart].styleIdx;
  const selectedColor = selections[selectedPart].color;
  const styles = avatarParts[selectedPart].styles;
  const colors =
    selectedStyleIdx >= 0 && styles[selectedStyleIdx]
      ? Object.keys(styles[selectedStyleIdx].colors)
      : [];
  const paddedStyles =
    styles.length < 4
      ? [...styles, ...Array(4 - styles.length).fill(null)]
      : styles;

  const randomizeSelections = () => {
    setIsRandomizing(true);
    setPendingRandomSelections(null);
    setTimeout(() => {
      const randomSelections = {};
      Object.entries(avatarParts).forEach(([part, { styles }]) => {
        const styleIdx = Math.floor(Math.random() * styles.length);
        const colorKeys = Object.keys(styles[styleIdx].colors);
        const color = colorKeys[Math.floor(Math.random() * colorKeys.length)];
        randomSelections[part] = { styleIdx, color };
      });
      // Sync hand color to head color if possible
      if (randomSelections.head && randomSelections.hands) {
        const headColor = randomSelections.head.color;
        const handStyleIdx = randomSelections.hands.styleIdx;
        const handColors = avatarParts.hands.styles[handStyleIdx].colors;
        if (handColors[headColor]) {
          randomSelections.hands.color = headColor;
        } else {
          randomSelections.hands.color = Object.keys(handColors)[0];
        }
      }
      setPendingRandomSelections({
        selections: randomSelections,
        bg: randomPastelColor(),
      });
    }, 600); // Simulate randomization delay
  };

  // Wait for all images to load before showing avatar after randomize
  useEffect(() => {
    if (!pendingRandomSelections) return;
    const PARTS = Object.keys(avatarParts);
    const urls = PARTS.map((part) =>
      getCurrentSrc(part, pendingRandomSelections.selections, avatarParts)
    ).filter(Boolean);
    let loadedCount = 0;
    if (urls.length === 0) {
      setSelections(pendingRandomSelections.selections);
      setAvatarBg(pendingRandomSelections.bg);
      setIsRandomizing(false);
      setPendingRandomSelections(null);
      return;
    }
    urls.forEach((url) => {
      const img = new window.Image();
      img.onload = img.onerror = () => {
        loadedCount++;
        if (loadedCount === urls.length) {
          setSelections(pendingRandomSelections.selections);
          setAvatarBg(pendingRandomSelections.bg);
          setIsRandomizing(false);
          setPendingRandomSelections(null);
        }
      };
      img.src = url;
    });
  }, [pendingRandomSelections, avatarParts]);

  // Utility to generate a random pastel color
  function randomPastelColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 85%)`;
  }

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

  // Sync hand color to head color when head changes
  React.useEffect(() => {
    if (selections && selections.head && selections.hands) {
      const headColor = selections.head.color;
      const handStyleIdx = selections.hands.styleIdx;
      const handColors = avatarParts.hands.styles[handStyleIdx].colors;
      if (!handColors[headColor]) return;
      if (selections.hands.color !== headColor) {
        setSelections((prev) => ({
          ...prev,
          hands: {
            ...prev.hands,
            color: headColor,
          },
        }));
      }
    }
  }, [selections.head?.color, avatarParts]);

  return (
    <>
      <div
        className="flex flex-col items-center justify-center min-h-screen max-lg:h-full"
        style={{
          backgroundImage: `url("https://res.cloudinary.com/dwzojroob/image/upload/v1759309914/your-folder-name/fxrujpiwnv6rwr89qxqx.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <img src={logo} alt="Logo" className="w-120" />
        <div
          style={{
            background: "rgba(10,10,60,0.32)",
            border: "1px solid rgba(200,0,40,0.42)",
          }}
          className="rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-[4.3px] w-[80vw] min-h-[70vh] grid grid-cols-3 juc items-center p-10 gap-6 mb-10 max-lg:grid-cols-1 max-lg:w-full max-lg:rounded-none max-lg:p-2 max-lg:h-full max-lg:gap-0"
        >
          {/* OPTIONS */}
          <div
            className="border border-rose-100 h-full p-6 gap-2 flex flex-col max-lg:mb-4"
            style={{ background: "rgba(10,10,60,0.12)" }}
          >
            {/* Gender Selection Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-4 w-full">
              <button
                className={`w-full px-4 py-2 rounded-lg font-bold border-2 ${
                  gender === "male"
                    ? "bg-blue-800 text-white border-blue-800"
                    : "bg-white text-blue-800 border-blue-800"
                }`}
                onClick={() => setGender("male")}
              >
                Male
              </button>
              <button
                className={`w-full px-4 py-2 rounded-lg font-bold border-2 ${
                  gender === "female"
                    ? "bg-pink-700 text-white border-pink-700"
                    : "bg-white text-pink-700 border-pink-700"
                }`}
                onClick={() => setGender("female")}
              >
                Female
              </button>
            </div>
            <PartSelector
              selectedPart={selectedPart}
              setSelectedPart={setSelectedPart}
              selections={selections}
              avatarParts={avatarParts}
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
              selections={selections}
            />
          </div>
          {/* CANVAS */}
          <div className="col-span-2 border border-rose-100 h-full flex flex-col justify-center items-center">
            <main className="w-full flex flex-col items-center justify-center m-auto h-full">
              <AvatarCanvas
                selections={selections}
                avatarBg={avatarBg}
                avatarParts={avatarParts}
                isRandomizing={isRandomizing}
              />
              <div className="flex flex-col items-center mt-4">
                <label
                  htmlFor="avatar-bg"
                  className="text-white mb-1 text-sm flex items-center flex-col"
                >
                  <p className="italic">
                    click on the bar below to select background color
                  </p>
                </label>
                <input
                  id="avatar-bg"
                  type="color"
                  value={avatarBg}
                  onChange={(e) => setAvatarBg(e.target.value)}
                  className="w-[300px] h-8 rounded border-none"
                  style={{ background: "none" }}
                />
              </div>
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
      <footer className="bg-blue-950 py-2 text-center text-white ">
        <a href="https://x.com/dev_rhema" className="cursor-pointer">
          &copy; Dev Rhema 𝕏
        </a>
      </footer>
    </>
  );
}

export default App;
