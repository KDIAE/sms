"use client";

import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faCloudArrowUp, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

export function PhotoField({ label, accept = "image/*" }: { label: string; accept?: string }) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setName(file.name);
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  return (
    <div className="flex items-center gap-4">
      {/* Camera avatar — opens device camera directly on mobile */}
      <button
        type="button"
        onClick={() => cameraRef.current?.click()}
        className="relative shrink-0 w-16 h-16 rounded-full border-2 border-dashed border-slate-300 hover:border-[#007BFF] hover:bg-blue-50/40 transition-colors overflow-hidden flex items-center justify-center bg-slate-50 group"
        title="Take a photo"
      >
        {preview ? (
          <Image src={preview} alt="Preview" fill className="object-cover" />
        ) : (
          <FontAwesomeIcon icon={faCamera} className="text-slate-400 text-[18px] group-hover:text-[#007BFF] transition-colors" />
        )}
      </button>

      {/* Upload strip — opens file picker / gallery */}
      <div className="flex-1">
        <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">{label}</label>
        <div
          className="flex items-center gap-2 cursor-pointer border border-dashed border-slate-300 rounded-md px-3 py-2 hover:border-[#007BFF] hover:bg-blue-50/40 transition-colors"
          onClick={() => uploadRef.current?.click()}
        >
          <FontAwesomeIcon icon={faCloudArrowUp} className="text-slate-300 text-[13px]" />
          <span className={`text-[12px] truncate ${name ? "text-slate-700" : "text-slate-400"}`}>
            {name ?? "Click to upload…"}
          </span>
          {name && <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-500 text-[12px] ml-auto shrink-0" />}
        </div>
      </div>

      {/* Hidden input: camera capture (mobile → opens camera directly) */}
      <input ref={cameraRef} type="file" accept={accept} capture="environment" className="hidden" onChange={handleChange} />
      {/* Hidden input: gallery / file picker */}
      <input ref={uploadRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
    </div>
  );
}
