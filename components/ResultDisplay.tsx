import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ExportSettings, ExportSettings as ExportSettingsType } from './ExportSettings';
import { TranslationBlock, BoundingBox } from '../types';
import { convertUnits, getAvailableConversions, UNIT_CONVERSIONS } from '../utils/unitConverter';

const HANDLE_SIZE = 10;
const HANDLES = ['tl', 'tm', 'tr', 'ml', 'mr', 'bl', 'bm', 'br'] as const;
type HandleType = typeof HANDLES[number];

interface MoveInteraction {
  type: 'move';
  handle: 'body';
  startIndex: number;
  startX: number;
  startY: number;
  startBox: BoundingBox;
}

interface ResizeInteraction {
  type: 'resize';
  handle: HandleType;
  startIndex: number;
  startX: number;
  startY: number;
  startBox: BoundingBox;
}

type InteractionState = MoveInteraction | ResizeInteraction | null;

const getAverageColorForBox = (
  ctx: CanvasRenderingContext2D,
  box: BoundingBox,
  canvasWidth: number,
  canvasHeight: number
): string => {
  const rectX = box.x * canvasWidth;
  const rectY = box.y * canvasHeight;
  const rectWidth = box.width * canvasWidth;
  const rectHeight = box.height * canvasHeight;

  const samplePoints: { x: number; y: number }[] = [];
  const sampleOffset = 3;
  const sampleStep = 5;

  const addSamplePoints = (xStart: number, yStart: number, xEnd: number, yEnd: number) => {
    const dx = xEnd - xStart;
    const dy = yEnd - yStart;
    const steps = Math.max(Math.abs(dx), Math.abs(dy)) / sampleStep;
    for (let i = 0; i <= steps; i++) {
      const x = xStart + (dx * i) / steps;
      const y = yStart + (dy * i) / steps;
      samplePoints.push({
        x: Math.round(Math.max(0, Math.min(canvasWidth - 1, x))),
        y: Math.round(Math.max(0, Math.min(canvasHeight - 1, y)))
      });
    }
  };

  addSamplePoints(rectX - sampleOffset, rectY - sampleOffset, rectX + rectWidth + sampleOffset, rectY - sampleOffset); // Top
  addSamplePoints(rectX - sampleOffset, rectY + rectHeight + sampleOffset, rectX + rectWidth + sampleOffset, rectY + rectHeight + sampleOffset); // Bottom
  addSamplePoints(rectX - sampleOffset, rectY - sampleOffset, rectX - sampleOffset, rectY + rectHeight + sampleOffset); // Left
  addSamplePoints(rectX + rectWidth + sampleOffset, rectY - sampleOffset, rectX + rectWidth + sampleOffset, rectY + rectHeight + sampleOffset); // Right

  if (samplePoints.length === 0) return '#1E293B';

  let r = 0, g = 0, b = 0, count = 0;

  for (const point of samplePoints) {
    try {
      const pixel = ctx.getImageData(point.x, point.y, 1, 1).data;
      if (pixel[3] > 200) {
        r += pixel[0];
        g += pixel[1];
        b += pixel[2];
        count++;
      }
    } catch (e) { /* Ignore */ }
  }

  if (count === 0) return '#1E293B';

  return `rgb(${Math.floor(r / count)}, ${Math.floor(g / count)}, ${Math.floor(b / count)})`;
};


export const ResultDisplay: React.FC<{
  originalImageUrl: string;
  initialTranslations: TranslationBlock[];
  defaultFilename: string;
  isGeneratingFilename: boolean;
}> = ({ originalImageUrl, initialTranslations, defaultFilename, isGeneratingFilename }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [translations, setTranslations] = useState(initialTranslations);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [interaction, setInteraction] = useState<InteractionState>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [originalImageSize, setOriginalImageSize] = useState({ width: 0, height: 0 });
  const [exportSettings, setExportSettings] = useState<ExportSettingsType>({
    filename: defaultFilename,
    width: 0,
    height: 0,
    dpi: 150
  });
  const [cursorStyle, setCursorStyle] = useState('move');
  const [showUnitConverter, setShowUnitConverter] = useState(false);
  const [hasConvertibleUnits, setHasConvertibleUnits] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;
    if (!ctx || !canvas || !img) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    translations.forEach((t, index) => {
      const box = t.boundingBox;
      const rectX = box.x * canvas.width;
      const rectY = box.y * canvas.height;
      const rectWidth = box.width * canvas.width;
      const rectHeight = box.height * canvas.height;

      const backgroundColor = getAverageColorForBox(ctx, box, canvas.width, canvas.height);
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

      const rgbMatch = backgroundColor.match(/\d+/g);
      let textColor = "white";
      if (rgbMatch) {
        const luma = 0.299 * parseInt(rgbMatch[0]) + 0.587 * parseInt(rgbMatch[1]) + 0.114 * parseInt(rgbMatch[2]);
        textColor = luma > 128 ? "black" : "white";
      }

      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      let fontSize = rectHeight;
      const fontFamily = "sans-serif";
      const calculateFont = (size: number) => `bold ${size}px ${fontFamily}`;
      ctx.font = calculateFont(fontSize);

      while (ctx.measureText(t.englishText).width > rectWidth * 0.9 && fontSize > 8) {
        fontSize -= 1;
        ctx.font = calculateFont(fontSize);
      }
      ctx.fillText(t.englishText, rectX + rectWidth / 2, rectY + rectHeight / 2);

      if (index === selectedIndex) {
        ctx.strokeStyle = '#38BDF8'; // Light blue
        ctx.lineWidth = 2;
        ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);

        const handleOffset = HANDLE_SIZE / 2;
        HANDLES.forEach(handle => {
          const [x, y] = getHandleCoords(box, handle, canvas.width, canvas.height);
          ctx.fillStyle = '#38BDF8';
          ctx.fillRect(x - handleOffset, y - handleOffset, HANDLE_SIZE, HANDLE_SIZE);
        });
      }
    });
  }, [translations, selectedIndex, canvasSize]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = originalImageUrl;
    img.onload = () => {
      imageRef.current = img;
      setOriginalImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      const canvas = canvasRef.current;
      if (canvas) {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const maxWidth = canvas.parentElement?.clientWidth || 600;
        const width = Math.min(img.naturalWidth, maxWidth);
        const height = width / aspectRatio;
        setCanvasSize({ width, height });
      }
    };
  }, [originalImageUrl]);

  useEffect(() => {
    setExportSettings(prev => ({ ...prev, filename: defaultFilename }));
  }, [defaultFilename]);

  // 変換可能な単位があるかチェック
  useEffect(() => {
    const hasUnits = translations.some(t => 
      getAvailableConversions(t.englishText).length > 0
    );
    setHasConvertibleUnits(hasUnits);
  }, [translations]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && canvasSize.width > 0) {
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      draw();
    }
  }, [canvasSize, draw]);

  const getHandleUnderCursor = (x: number, y: number, box: BoundingBox): HandleType | null => {
    for (const handle of HANDLES) {
      const [hx, hy] = getHandleCoords(box, handle, canvasSize.width, canvasSize.height);
      if (x >= hx - HANDLE_SIZE && x <= hx + HANDLE_SIZE && y >= hy - HANDLE_SIZE && y <= hy + HANDLE_SIZE) {
        return handle;
      }
    }
    return null;
  }

  const getHandleCoords = (box: BoundingBox, handle: HandleType, width: number, height: number): [number, number] => {
    const rectX = box.x * width;
    const rectY = box.y * height;
    const rectWidth = box.width * width;
    const rectHeight = box.height * height;

    switch (handle) {
      case 'tl': return [rectX, rectY];
      case 'tm': return [rectX + rectWidth / 2, rectY];
      case 'tr': return [rectX + rectWidth, rectY];
      case 'ml': return [rectX, rectY + rectHeight / 2];
      case 'mr': return [rectX + rectWidth, rectY + rectHeight / 2];
      case 'bl': return [rectX, rectY + rectHeight];
      case 'bm': return [rectX + rectWidth / 2, rectY + rectHeight];
      case 'br': return [rectX + rectWidth, rectY + rectHeight];
      default: return [0, 0];
    }
  };

  const getCursorForHandle = (handle: HandleType): string => {
    switch (handle) {
      case 'tl': // 左上
        return 'nw-resize';
      case 'tr': // 右上
        return 'ne-resize';
      case 'bl': // 左下
        return 'sw-resize';
      case 'br': // 右下
        return 'se-resize';
      case 'tm': // 上
        return 'n-resize';
      case 'bm': // 下
        return 's-resize';
      case 'ml': // 左
        return 'w-resize';
      case 'mr': // 右
        return 'e-resize';
      default:
        return 'move';
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = e.nativeEvent;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = x - rect.left;
    const mouseY = y - rect.top;

    let newSelectedIndex = null;

    if (selectedIndex !== null) {
      const selectedBox = translations[selectedIndex].boundingBox;
      const handle = getHandleUnderCursor(mouseX, mouseY, selectedBox);
      if (handle) {
        setInteraction({
          type: 'resize',
          handle,
          startIndex: selectedIndex,
          startX: mouseX,
          startY: mouseY,
          startBox: selectedBox
        });
        return;
      }
    }

    for (let i = translations.length - 1; i >= 0; i--) {
      const box = translations[i].boundingBox;
      const rectX = box.x * canvasSize.width;
      const rectY = box.y * canvasSize.height;
      const rectWidth = box.width * canvasSize.width;
      const rectHeight = box.height * canvasSize.height;
      if (mouseX >= rectX && mouseX <= rectX + rectWidth && mouseY >= rectY && mouseY <= rectY + rectHeight) {
        newSelectedIndex = i;
        break;
      }
    }

    setSelectedIndex(newSelectedIndex);
    if (newSelectedIndex !== null) {
      setInteraction({ type: 'move', handle: 'body', startIndex: newSelectedIndex, startX: mouseX, startY: mouseY, startBox: translations[newSelectedIndex].boundingBox });
    } else {
      setInteraction(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = e.nativeEvent;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = x - rect.left;
    const mouseY = y - rect.top;

    // Update cursor style based on mouse position
    if (!interaction) {
      let newCursorStyle = 'move';

      if (selectedIndex !== null) {
        const selectedBox = translations[selectedIndex].boundingBox;
        const handle = getHandleUnderCursor(mouseX, mouseY, selectedBox);
        if (handle) {
          newCursorStyle = getCursorForHandle(handle);
        } else {
          // Check if mouse is over any text box
          let isOverTextBox = false;
          for (let i = translations.length - 1; i >= 0; i--) {
            const box = translations[i].boundingBox;
            const rectX = box.x * canvasSize.width;
            const rectY = box.y * canvasSize.height;
            const rectWidth = box.width * canvasSize.width;
            const rectHeight = box.height * canvasSize.height;
            if (mouseX >= rectX && mouseX <= rectX + rectWidth && mouseY >= rectY && mouseY <= rectY + rectHeight) {
              isOverTextBox = true;
              break;
            }
          }
          newCursorStyle = isOverTextBox ? 'move' : 'default';
        }
      } else {
        // Check if mouse is over any text box when none is selected
        let isOverTextBox = false;
        for (let i = translations.length - 1; i >= 0; i--) {
          const box = translations[i].boundingBox;
          const rectX = box.x * canvasSize.width;
          const rectY = box.y * canvasSize.height;
          const rectWidth = box.width * canvasSize.width;
          const rectHeight = box.height * canvasSize.height;
          if (mouseX >= rectX && mouseX <= rectX + rectWidth && mouseY >= rectY && mouseY <= rectY + rectHeight) {
            isOverTextBox = true;
            break;
          }
        }
        newCursorStyle = isOverTextBox ? 'pointer' : 'default';
      }

      setCursorStyle(newCursorStyle);
    }

    // Handle dragging
    if (!interaction) return;

    const dx = (mouseX - interaction.startX) / canvasSize.width;
    const dy = (mouseY - interaction.startY) / canvasSize.height;

    const newTranslations = [...translations];
    let newBox = { ...interaction.startBox };

    if (interaction.type === 'move') {
      newBox.x += dx;
      newBox.y += dy;
    } else if (interaction.type === 'resize') {
      const handle = interaction.handle;
      if (handle.includes('l')) { newBox.x += dx; newBox.width -= dx; }
      if (handle.includes('r')) { newBox.width += dx; }
      if (handle.includes('t')) { newBox.y += dy; newBox.height -= dy; }
      if (handle.includes('b')) { newBox.height += dy; }

      if (newBox.width < 0) { newBox.width = 0; }
      if (newBox.height < 0) { newBox.height = 0; }
    }

    newTranslations[interaction.startIndex] = { ...newTranslations[interaction.startIndex], boundingBox: newBox };
    setTranslations(newTranslations);
  };

  const handleMouseUp = () => {
    setInteraction(null);
  };

  const handleUnitConversion = () => {
    const convertedTranslations = translations.map(translation => {
      const availableConversions = getAvailableConversions(translation.englishText);
      if (availableConversions.length > 0) {
        return {
          ...translation,
          englishText: convertUnits(translation.englishText, availableConversions)
        };
      }
      return translation;
    });
    setTranslations(convertedTranslations);
    setShowUnitConverter(false);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    // Briefly deselect to draw without handles for the download
    const currentSelection = selectedIndex;
    setSelectedIndex(null);

    requestAnimationFrame(() => {
      // Create a new canvas for export with the desired size
      const exportCanvas = document.createElement('canvas');
      const exportCtx = exportCanvas.getContext('2d');
      if (!exportCtx) return;

      // Determine export dimensions
      let exportWidth = exportSettings.width || originalImageSize.width;
      let exportHeight = exportSettings.height || originalImageSize.height;

      // If only one dimension is specified, maintain aspect ratio
      if (exportSettings.width > 0 && exportSettings.height === 0) {
        const aspectRatio = originalImageSize.height / originalImageSize.width;
        exportHeight = exportSettings.width * aspectRatio;
      } else if (exportSettings.height > 0 && exportSettings.width === 0) {
        const aspectRatio = originalImageSize.width / originalImageSize.height;
        exportWidth = exportSettings.height * aspectRatio;
      }

      exportCanvas.width = exportWidth;
      exportCanvas.height = exportHeight;

      // Draw the image
      exportCtx.drawImage(img, 0, 0, exportWidth, exportHeight);

      // Draw translations with proper scaling
      translations.forEach((t) => {
        const box = t.boundingBox;
        const rectX = box.x * exportWidth;
        const rectY = box.y * exportHeight;
        const rectWidth = box.width * exportWidth;
        const rectHeight = box.height * exportHeight;

        const backgroundColor = getAverageColorForBox(exportCtx, {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height
        }, exportWidth, exportHeight);

        exportCtx.fillStyle = backgroundColor;
        exportCtx.fillRect(rectX, rectY, rectWidth, rectHeight);

        const rgbMatch = backgroundColor.match(/\d+/g);
        let textColor = "white";
        if (rgbMatch) {
          const luma = 0.299 * parseInt(rgbMatch[0]) + 0.587 * parseInt(rgbMatch[1]) + 0.114 * parseInt(rgbMatch[2]);
          textColor = luma > 128 ? "black" : "white";
        }

        exportCtx.fillStyle = textColor;
        exportCtx.textAlign = "center";
        exportCtx.textBaseline = "middle";

        let fontSize = rectHeight;
        const fontFamily = "sans-serif";
        const calculateFont = (size: number) => `bold ${size}px ${fontFamily}`;
        exportCtx.font = calculateFont(fontSize);

        while (exportCtx.measureText(t.englishText).width > rectWidth * 0.9 && fontSize > 8) {
          fontSize -= 1;
          exportCtx.font = calculateFont(fontSize);
        }
        exportCtx.fillText(t.englishText, rectX + rectWidth / 2, rectY + rectHeight / 2);
      });

      // Export with DPI setting (PNG doesn't support DPI in canvas, but we keep the setting for future use)
      const dataUrl = exportCanvas.toDataURL('image/png', 1.0);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${exportSettings.filename}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Restore selection
      setSelectedIndex(currentSelection);
    });
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-slate-200">3. 調整とダウンロード</h2>
        {hasConvertibleUnits && (
          <button
            onClick={() => setShowUnitConverter(!showUnitConverter)}
            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            単位変換
          </button>
        )}
      </div>
      <p className="text-slate-400 mb-6 text-center">テキストブロックをクリックして選択し、ドラッグして移動、ハンドルでサイズを変更できます。</p>

      {/* 単位変換パネル */}
      {showUnitConverter && (
        <div className="mb-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-200 mb-3">単位変換</h3>
          <p className="text-purple-300 text-sm mb-4">
            画像内の単位を以下のように変換します：
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-purple-200 mb-4">
            <div>cm → inch</div>
            <div>mm → inch</div>
            <div>m → ft</div>
            <div>km → mile</div>
            <div>g → oz</div>
            <div>kg → lb</div>
            <div>°C → °F</div>
            <div>ml → fl oz</div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleUnitConversion}
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
            >
              変換を実行
            </button>
            <button
              onClick={() => setShowUnitConverter(false)}
              className="px-4 py-2 bg-slate-600 text-white text-sm rounded-md hover:bg-slate-700 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas area */}
        <div className="lg:col-span-2">
          <div className="w-full p-2 bg-slate-800 rounded-lg shadow-lg" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              className="w-full h-auto rounded-md"
              style={{ cursor: cursorStyle }}
            />
          </div>
        </div>

        {/* Export settings */}
        <div className="lg:col-span-1">
          <ExportSettings
            settings={exportSettings}
            onSettingsChange={setExportSettings}
            onExport={handleDownload}
            isGeneratingFilename={isGeneratingFilename}
          />
        </div>
      </div>
    </div>
  );
};