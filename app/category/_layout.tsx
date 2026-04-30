import { Slot } from "expo-router";

// Bare pass-through layout — no custom Slot wrapper so that router.replace()
// operates directly on the root Stack navigator.
export default Slot;
