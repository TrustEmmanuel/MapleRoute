import { useEffect, useState } from "react";

import {
  getLocalImage,
  isLocalImagePath,
  localImageId,
} from "@/lib/local-images";
import { isSafeHttpUrl } from "@/lib/links";

function bundledImageUri(path: string | null | undefined) {
  if (!path || !path.startsWith("/")) return null;
  if (typeof window === "undefined") return null;
  return `${window.location.origin}${path}`;
}

export function useImageUri(path: string | null | undefined) {
  const [uri, setUri] = useState<string | null>(() =>
    path && isSafeHttpUrl(path) ? path : bundledImageUri(path),
  );

  useEffect(() => {
    if (!path) {
      setUri(null);
      return;
    }

    if (isLocalImagePath(path)) {
      let active = true;
      setUri(null);
      void getLocalImage(localImageId(path)).then((dataUrl) => {
        if (active) setUri(dataUrl);
      });
      return () => {
        active = false;
      };
    }

    setUri(isSafeHttpUrl(path) ? path : bundledImageUri(path));
  }, [path]);

  return uri;
}
