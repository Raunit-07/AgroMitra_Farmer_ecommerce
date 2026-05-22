import QRCode from "qrcode";

export const generateQR = async (upiId, amount) => {
  const upiURL = `upi://pay?pa=${upiId}&am=${amount}&cu=INR`;
  return await QRCode.toDataURL(upiURL);
};
