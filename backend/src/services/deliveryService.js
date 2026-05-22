export const callDeliveryAPI = async (order) => {
  console.log(" Delivery API called for order:", order.id);

  // simulate delivery creation
  order.deliveryStatus = "SHIPPED";
};
