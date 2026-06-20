import { useCallback, useRef, useState } from "react";
import { Upload, X, GripVertical, Loader2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "tour-images";
const MAX_DIM = 2400;
const QUALITY = 0.85;

async function compressImage(file: File): Promise<Blob> {
  // Skip compression for small files or non-raster types (svg, gif animations)
  if (file.size < 200_000 || /(svg|gif)/i.test(file.type)) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  let { width, height } = bitmap;
  const scale = Math.min(1, MAX_DIM / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  // Prefer webp; fall back to jpeg
  const blob: Blob | null = await new Promise((res) =>
    canvas.toBlob(res, "image/webp", QUALITY),
  );
  if (blob && blob.size < file.size) return blob;
  const jpeg: Blob | null = await new Promise((res) =>
    canvas.toBlob(res, "image/jpeg", QUALITY),
  );
  return jpeg && jpeg.size < file.size ? jpeg : file;
}

function extFor(blob: Blob, original: string) {
  if (blob.type === "image/webp") return "webp";
  if (blob.type === "image/jpeg") return "jpg";
  if (blob.type === "image/png") return "png";
  const m = original.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : "bin";
}

export function TourImageUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const dragIdx = useRef<number | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (!arr.length) return;
      setErr(null);
      setBusy((b) => b + arr.length);
      const uploaded: string[] = [];
      for (const file of arr) {
        try {
          const blob = await compressImage(file);
          const ext = extFor(blob, file.name);
          const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
          const { error } = await supabase.storage
            .from(BUCKET)
            .upload(path, blob, { contentType: blob.type || file.type, upsert: false });
          if (error) throw error;
          const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
          uploaded.push(data.publicUrl);
        } catch (e: any) {
          setErr(e?.message ?? "Upload failed");
        } finally {
          setBusy((b) => b - 1);
        }
      }
      if (uploaded.length) onChange([...value, ...uploaded]);
    },
    [onChange, value],
  );

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= value.length) return;
    const next = value.slice();
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Images</span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs hover:bg-muted"
        >
          {busy > 0 ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          {busy > 0 ? `Uploading ${busy}…` : "Upload images"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
        }}
        className="rounded-lg border border-dashed border-border p-2"
      >
        {value.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            Drop images here or click Upload. First image is the cover.
          </p>
        ) : (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {value.map((url, i) => (
              <li
                key={url + i}
                draggable
                onDragStart={() => (dragIdx.current = i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (dragIdx.current !== null) move(dragIdx.current, i);
                  dragIdx.current = null;
                }}
                className="group relative aspect-square overflow-hidden rounded-md ring-1 ring-border"
              >
                <img src={url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-1 top-1 inline-flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                    <Star className="h-2.5 w-2.5" /> Cover
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-1.5 py-1 opacity-0 transition group-hover:opacity-100">
                  <GripVertical className="h-3 w-3 text-white/80" />
                  <div className="flex items-center gap-1">
                    {i > 0 && (
                      <button type="button" onClick={() => move(i, i - 1)} className="rounded bg-white/20 px-1 text-[10px] text-white hover:bg-white/30">←</button>
                    )}
                    {i < value.length - 1 && (
                      <button type="button" onClick={() => move(i, i + 1)} className="rounded bg-white/20 px-1 text-[10px] text-white hover:bg-white/30">→</button>
                    )}
                    <button type="button" onClick={() => remove(i)} className="rounded bg-white/20 p-0.5 text-white hover:bg-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}
