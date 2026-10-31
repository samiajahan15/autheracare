import Image, { type ImageProps } from "next/image";
import { productImageSource } from "@/lib/catalog/product-image";

export default function ProductImage(props: ImageProps) {
  return <Image {...props} src={typeof props.src === "string" ? productImageSource(props.src)! : props.src}/>;
}
