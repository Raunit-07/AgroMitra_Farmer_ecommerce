import ContactMessage from "../models/ContactMessage.js";

export const createContactMessage = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required" });
  }

  const contact = await ContactMessage.create(req.body);
  res.status(201).json({ message: "Message sent successfully", contact });
};
