export function reorderWhatsAppUrl(phone: string, name: string, products: string[]) {
  let digits = phone.replace(/\D/g, "");
  if (/^01[3-9]\d{8}$/.test(digits)) digits = `88${digits}`;
  if (!/^8801[3-9]\d{8}$/.test(digits)) return null;
  const message = products.length
    ? `Hi ${name}, this is Authéra. You previously ordered ${products.join(", ")}. Do you need these products again? We would be happy to help you reorder.`
    : `Hi ${name}, this is Authéra. Are there any skincare products you need? We would be happy to help you place an order.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
