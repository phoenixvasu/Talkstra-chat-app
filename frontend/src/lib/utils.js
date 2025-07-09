export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function isValidObjectId(id) {
  return (
    typeof id === "string" && id.length === 24 && /^[a-fA-F0-9]+$/.test(id)
  );
}
