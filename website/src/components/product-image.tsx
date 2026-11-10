"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { productImageSource } from "@/lib/catalog/product-image";

export default function ProductImage(props: ImageProps) {
  const source = typeof props.src === "string" ? productImageSource(props.src)! : props.src;
  const [failedSource, setFailedSource] = useState<ImageProps['src'] | null>(null);
  // Local catalog assets are already prepared for display. Load them directly
  // so a grid never depends on generating dozens of resized images at once.
  const direct = typeof source === 'string' && source.startsWith('/products/');
  return <Image {...props} alt={props.alt} src={source} unoptimized={props.unoptimized || direct || failedSource === source} onError={event => {
    setFailedSource(source);
    props.onError?.(event);
  }}/>;
}

