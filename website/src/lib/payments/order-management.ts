export const orderStatuses = ["placed", "confirmed", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = typeof orderStatuses[number];
export type PaymentStatus = "due_on_delivery" | "collected" | "cancelled";
export const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
  placed: ["confirmed", "cancelled"], confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"], delivered: [], cancelled: [],
};

export function orderChange(current: { status: OrderStatus; payment_status: PaymentStatus }, status: OrderStatus, collect: boolean) {
  if (status !== current.status && !transitions[current.status].includes(status)) throw new Error("This order cannot move to that status.");
  if (collect && status !== "delivered") throw new Error("Record COD payment only after delivery.");
  if (status === "cancelled" && current.payment_status === "collected") throw new Error("Collected payments cannot be cancelled here.");
  return {
    status,
    payment_status: status === "cancelled" ? "cancelled" as const : collect ? "collected" as const : current.payment_status,
    restock: status === "cancelled" && current.status !== "cancelled",
  };
}
