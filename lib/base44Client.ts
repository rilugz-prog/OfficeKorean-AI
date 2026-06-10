import { createClient } from "@base44/sdk";

// Initialize Base44 client with your app ID
// The app ID links this frontend to your Base44 backend
const appId = "6a28f3d03f17200535be5e84";

export const base44 = createClient({ appId });
