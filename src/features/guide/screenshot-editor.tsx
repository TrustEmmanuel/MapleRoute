import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { TextArea } from "@/components/ui/text-area";
import { TextField } from "@/components/ui/text-field";
import {
  deleteLocalImage,
  isLocalImagePath,
  localImageId,
  localImagePath,
  putLocalImage,
} from "@/lib/local-images";
import { supabase } from "@/lib/supabase";
import { cardShadow } from "@/theme/shadow";
import { colors } from "@/theme/theme";

import { isRemoteId, type StepHighlight, type StepScreenshot } from "./types";

const MAX_DISPLAY_HEIGHT = 430;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_IMAGE_WIDTH = 1600;

type EditorBox = StepHighlight & { mode: "highlight" | "blur" };

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `shot-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

function makeBox(
  start: { x: number; y: number },
  end: { x: number; y: number },
  mode: EditorBox["mode"],
): EditorBox {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    w: Math.abs(end.x - start.x),
    h: Math.abs(end.y - start.y),
    mode,
  };
}

function pixelateRegion(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; w: number; h: number },
  block: number,
  scale: number,
) {
  const sx = Math.round(rect.x * scale);
  const sy = Math.round(rect.y * scale);
  const sw = Math.max(1, Math.round(rect.w * scale));
  const sh = Math.max(1, Math.round(rect.h * scale));
  if (sw < 2 || sh < 2) return;

  const cols = Math.max(1, Math.round(sw / (block * scale)));
  const rows = Math.max(1, Math.round(sh / (block * scale)));
  const temp = document.createElement("canvas");
  temp.width = cols;
  temp.height = rows;
  const tempCtx = temp.getContext("2d");
  if (!tempCtx) return;

  tempCtx.imageSmoothingEnabled = false;
  tempCtx.drawImage(ctx.canvas, sx, sy, sw, sh, 0, 0, cols, rows);

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(temp, 0, 0, cols, rows, sx, sy, sw, sh);
  ctx.restore();
}

function drawBox(
  ctx: CanvasRenderingContext2D,
  box: EditorBox,
  cssWidth: number,
  cssHeight: number,
  scale: number,
) {
  const rect = {
    x: (box.x / 100) * cssWidth,
    y: (box.y / 100) * cssHeight,
    w: (box.w / 100) * cssWidth,
    h: (box.h / 100) * cssHeight,
  };

  if (box.mode === "blur") {
    pixelateRegion(ctx, rect, 10, scale);
    ctx.strokeStyle = colors.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    return;
  }

  ctx.fillStyle = "rgba(213, 43, 30, 0.10)";
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

  if (box.label) {
    ctx.font = "600 11px Inter, sans-serif";
    const labelWidth = ctx.measureText(box.label).width + 10;
    ctx.fillStyle = colors.accent;
    ctx.fillRect(rect.x - 1, rect.y - 15, labelWidth, 15);
    ctx.fillStyle = colors.canvas;
    ctx.fillText(box.label, rect.x + 4, rect.y - 4);
  }
}

function drawPreview(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  cssWidth: number,
  cssHeight: number,
  boxes: EditorBox[],
  draft: EditorBox | null,
) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  ctx.drawImage(image, 0, 0, cssWidth, cssHeight);

  for (const box of draft ? [...boxes, draft] : boxes) {
    drawBox(ctx, box, cssWidth, cssHeight, dpr);
  }
}

async function uploadScreenshot(stepId: string, dataUrl: string, id: string) {
  if (!supabase || !isRemoteId(stepId)) return null;

  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const path = `steps/${stepId}/${id}.jpg`;
    const { error } = await supabase.storage
      .from("guide-screenshots")
      .upload(path, blob, { contentType: "image/jpeg", upsert: true });
    if (error) return null;
    return supabase.storage.from("guide-screenshots").getPublicUrl(path).data
      .publicUrl;
  } catch {
    return null;
  }
}

export async function removeScreenshotImage(storagePath: string) {
  if (isLocalImagePath(storagePath)) {
    await deleteLocalImage(localImageId(storagePath));
    return;
  }
  if (!supabase || !storagePath.includes("/guide-screenshots/")) return;
  const path = storagePath.split("/guide-screenshots/")[1]?.split("?")[0];
  if (!path) return;
  await supabase.storage.from("guide-screenshots").remove([path]);
}

export function ScreenshotEditor({
  visible,
  stepId,
  stepTitle,
  nextPosition,
  onSave,
  onClose,
}: {
  visible: boolean;
  stepId: string;
  stepTitle: string;
  nextPosition: number;
  onSave: (screenshot: StepScreenshot) => void;
  onClose: () => void;
}) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [boxes, setBoxes] = useState<EditorBox[]>([]);
  const [draftBox, setDraftBox] = useState<EditorBox | null>(null);
  const [mode, setMode] = useState<EditorBox["mode"]>("highlight");
  const [label, setLabel] = useState("");
  const [altText, setAltText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const hostRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const modeRef = useRef<EditorBox["mode"]>("highlight");
  const labelRef = useRef("");

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    labelRef.current = label;
  }, [label]);

  const reset = useCallback(() => {
    setImage(null);
    setBoxes([]);
    setDraftBox(null);
    setMode("highlight");
    setLabel("");
    setAltText("");
    setError(null);
    setReading(false);
    setSaving(false);
    startRef.current = null;
  }, []);

  const close = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const readFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Choose a PNG, JPEG or WebP image.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("That image is over 8 MB. Take a fresh screenshot or use a smaller one.");
      return;
    }

    setReading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setReading(false);
        setError("That file could not be read as an image.");
        return;
      }
      const element = new window.Image();
      element.onload = () => {
        setImage(element);
        setBoxes([]);
        setDraftBox(null);
        setReading(false);
        setError(null);
      };
      element.onerror = () => {
        setReading(false);
        setError("That file could not be read as an image.");
      };
      element.src = reader.result;
    };
    reader.onerror = () => {
      setReading(false);
      setError("That file could not be read. Try another image.");
    };
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    if (!visible || Platform.OS !== "web") return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";
    input.setAttribute("aria-label", "Choose a screenshot image");
    input.style.position = "fixed";
    input.style.left = "-9999px";
    input.style.width = "1px";
    input.style.height = "1px";
    input.style.opacity = "0";
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (file) readFile(file);
      input.value = "";
    });
    document.body.appendChild(input);
    inputRef.current = input;

    return () => {
      input.remove();
      inputRef.current = null;
    };
  }, [readFile, visible]);

  useEffect(() => {
    if (!visible || Platform.OS !== "web") return;
    const host = hostRef.current;
    if (!host) return;

    let canvas = host.querySelector("canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.setAttribute(
        "aria-label",
        "Screenshot preview. Drag across the image to draw a box.",
      );
      canvas.style.display = "block";
      canvas.style.touchAction = "none";
      canvas.style.cursor = "crosshair";
      canvas.style.borderRadius = "12px";
      canvas.style.border = `1px solid ${colors.line}`;
      host.appendChild(canvas);
    }
    const element = canvas;
    canvasRef.current = element;

    const point = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return { x: 0, y: 0 };
      return {
        x: clampPercent(((event.clientX - rect.left) / rect.width) * 100),
        y: clampPercent(((event.clientY - rect.top) / rect.height) * 100),
      };
    };

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const start = point(event);
      startRef.current = start;
      setDraftBox({ x: start.x, y: start.y, w: 0, h: 0, mode: modeRef.current });
      try {
        element.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture can fail for synthetic or cancelled pointers.
      }
      event.preventDefault();
    };

    const onMove = (event: PointerEvent) => {
      if (!startRef.current) return;
      setDraftBox(makeBox(startRef.current, point(event), modeRef.current));
      event.preventDefault();
    };

    const onUp = (event: PointerEvent) => {
      const start = startRef.current;
      if (!start) return;
      startRef.current = null;
      const box = makeBox(start, point(event), modeRef.current);
      setDraftBox(null);
      if (box.w < 1 || box.h < 1) return;
      const trimmed = labelRef.current.trim();
      setBoxes((current) => [
        ...current,
        {
          ...box,
          label: modeRef.current === "highlight" && trimmed ? trimmed : undefined,
        },
      ]);
      event.preventDefault();
    };

    element.addEventListener("pointerdown", onDown);
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerup", onUp);
    element.addEventListener("pointercancel", onUp);

    return () => {
      element.removeEventListener("pointerdown", onDown);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerup", onUp);
      element.removeEventListener("pointercancel", onUp);
    };
  }, [image, visible]);

  useEffect(() => {
    if (!visible || Platform.OS !== "web") return;
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas || !image) return;
    const width = containerWidth || host.clientWidth;
    if (!width) return;

    const ratio = image.naturalHeight / image.naturalWidth;
    let cssHeight = width * ratio;
    let cssWidth = width;
    if (cssHeight > MAX_DISPLAY_HEIGHT) {
      cssHeight = MAX_DISPLAY_HEIGHT;
      cssWidth = cssHeight / ratio;
    }

    canvas.style.marginLeft = "auto";
    canvas.style.marginRight = "auto";
    drawPreview(canvas, image, cssWidth, cssHeight, boxes, draftBox);
  }, [boxes, containerWidth, draftBox, image, visible]);

  async function save() {
    if (!image) {
      setError("Choose a screenshot first.");
      return;
    }
    if (!altText.trim()) {
      setError(
        "Add alt text so people who can't see the image still know what it shows.",
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const scale = Math.min(1, MAX_IMAGE_WIDTH / image.naturalWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available");

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const box of boxes) {
        if (box.mode !== "blur") continue;
        pixelateRegion(
          ctx,
          {
            x: (box.x / 100) * canvas.width,
            y: (box.y / 100) * canvas.height,
            w: (box.w / 100) * canvas.width,
            h: (box.h / 100) * canvas.height,
          },
          10,
          1,
        );
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const id = newId();
      const uploaded = await uploadScreenshot(stepId, dataUrl, id);
      let storagePath = uploaded;
      if (!storagePath) {
        await putLocalImage(id, dataUrl);
        storagePath = localImagePath(id);
      }

      onSave({
        id,
        storagePath,
        altText: altText.trim(),
        position: nextPosition,
        highlights: boxes
          .filter((box) => box.mode === "highlight")
          .map(({ x, y, w, h, label: boxLabel }) => ({
            x: Math.round(x * 10) / 10,
            y: Math.round(y * 10) / 10,
            w: Math.round(w * 10) / 10,
            h: Math.round(h * 10) / 10,
            label: boxLabel,
          })),
      });
      reset();
    } catch {
      setError(
        "The screenshot could not be saved. Try again, or use a smaller image.",
      );
      setSaving(false);
    }
  }

  const canEdit = Platform.OS === "web";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent
    >
      <View className="flex-1 items-center justify-center bg-black/40 px-3 py-4">
        <View
          className="w-full max-w-[880px] overflow-hidden rounded-panel bg-canvas"
          style={[cardShadow, { maxHeight: "94%" }]}
        >
          <View className="flex-row items-center justify-between border-b border-line px-5 py-4">
            <View className="flex-1 pr-3">
              <Text variant="heading">Add a screenshot</Text>
              <Text variant="small" tone="muted" className="mt-0.5" numberOfLines={1}>
                {stepTitle}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close screenshot editor"
              hitSlop={10}
              onPress={close}
              className="h-8 w-8 items-center justify-center rounded-full bg-surface"
            >
              <Ionicons name="close" size={18} color={colors.ink} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator
          >
            <View className="rounded-control border border-line bg-surface px-4 py-3">
              <Text variant="small" className="font-inter-semibold">
                Public pages only
              </Text>
              <Text variant="small" tone="muted" className="mt-1">
                Never screenshot a signed-in IRCC account. Do not include your
                UCI, passport number, date of birth or anything else personal.
                Draw a blur box over anything private before saving.
              </Text>
            </View>

            {!image ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Choose a screenshot image"
                disabled={!canEdit || reading}
                onPress={() => inputRef.current?.click()}
                className="mt-4 items-center rounded-card border border-dashed border-line bg-surface px-5 py-10 active:bg-canvas"
              >
                <Ionicons name="cloud-upload-outline" size={30} color={colors.muted} />
                <Text variant="small" className="mt-3 font-inter-semibold">
                  {reading ? "Reading image…" : "Choose a screenshot"}
                </Text>
                <Text variant="small" tone="muted" className="mt-1 text-center">
                  PNG, JPEG or WebP, up to 8 MB.
                </Text>
                {!canEdit ? (
                  <Text variant="small" tone="muted" className="mt-2 text-center">
                    Screenshots can be added on the web version.
                  </Text>
                ) : null}
              </Pressable>
            ) : (
              <>
                <View
                  className="mt-4 w-full"
                  onLayout={(event) =>
                    setContainerWidth(event.nativeEvent.layout.width)
                  }
                >
                  <View
                    ref={(node) => {
                      hostRef.current = node as unknown as HTMLElement | null;
                    }}
                    className="w-full"
                  />
                </View>

                <Text variant="small" tone="muted" className="mt-2">
                  Drag on the image to draw a box. Each box uses the tool
                  selected below.
                </Text>

                <View className="mt-3 flex-row flex-wrap items-center gap-2">
                  {(
                    [
                      { value: "highlight", icon: "square-outline", text: "Highlight" },
                      { value: "blur", icon: "eye-off-outline", text: "Blur / hide" },
                    ] as const
                  ).map((tool) => {
                    const selected = mode === tool.value;
                    return (
                      <Pressable
                        key={tool.value}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        onPress={() => setMode(tool.value)}
                        className={`min-h-[42px] flex-row items-center gap-2 rounded-control border px-3 ${
                          selected
                            ? "border-accent bg-danger-surface"
                            : "border-control-line bg-canvas"
                        }`}
                      >
                        <Ionicons
                          name={tool.icon}
                          size={15}
                          color={selected ? colors.accent : colors.muted}
                        />
                        <Text
                          variant="small"
                          className={selected ? "font-inter-semibold" : ""}
                        >
                          {tool.text}
                        </Text>
                      </Pressable>
                    );
                  })}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Undo last box"
                    disabled={boxes.length === 0}
                    onPress={() => setBoxes((current) => current.slice(0, -1))}
                    className={`min-h-[42px] flex-row items-center gap-2 rounded-control border border-line bg-canvas px-3 ${
                      boxes.length === 0 ? "opacity-40" : ""
                    }`}
                  >
                    <Ionicons name="arrow-undo-outline" size={15} color={colors.muted} />
                    <Text variant="small">Undo</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Clear all boxes"
                    disabled={boxes.length === 0}
                    onPress={() => setBoxes([])}
                    className={`min-h-[42px] flex-row items-center gap-2 rounded-control border border-line bg-canvas px-3 ${
                      boxes.length === 0 ? "opacity-40" : ""
                    }`}
                  >
                    <Ionicons name="trash-outline" size={15} color={colors.muted} />
                    <Text variant="small">Clear</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Choose another image"
                    onPress={() => inputRef.current?.click()}
                    className="min-h-[42px] flex-row items-center gap-2 rounded-control border border-line bg-canvas px-3"
                  >
                    <Ionicons name="image-outline" size={15} color={colors.muted} />
                    <Text variant="small">Replace</Text>
                  </Pressable>
                </View>

                {mode === "highlight" ? (
                  <View className="mt-3">
                    <TextField
                      plainLabel
                      label="Highlight label (optional)"
                      value={label}
                      onChangeText={setLabel}
                      placeholder="e.g. Start here"
                    />
                  </View>
                ) : (
                  <Text variant="small" tone="muted" className="mt-3">
                    Blurred areas are pixelated into the saved image and cannot
                    be undone afterwards.
                  </Text>
                )}
              </>
            )}

            <View className="mt-4">
              <TextArea
                label="Alt text"
                value={altText}
                onChangeText={setAltText}
                placeholder="Describe what the screenshot shows, in one or two sentences."
                helper="Required. Read aloud by screen readers in place of the image."
                minHeight={76}
              />
            </View>

            {error ? (
              <Text variant="small" className="mt-3 text-accent">
                {error}
              </Text>
            ) : null}

            <View className="mt-5 flex-row gap-3">
              <Button
                className="flex-1"
                label="Save screenshot"
                loading={saving}
                loadingLabel="Saving…"
                onPress={() => void save()}
              />
              <Button
                className="flex-1"
                variant="secondary"
                label="Cancel"
                onPress={close}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
