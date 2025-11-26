import type { RoundStatus, UserData } from "@/types";

export const roundsData = [
  {
    id: 1,
    title: "Round 404: The Missing Link",
    startTime: "Now",
    duration: "15m",
    status: "LIVE" as RoundStatus,
    participants: 142,
  },
  {
    id: 2,
    title: "Deep Dive: Hex Codes",
    startTime: "Today, 10:00 PM",
    duration: "45m",
    status: "UPCOMING" as RoundStatus,
    participants: 89,
  },
  {
    id: 3,
    title: "Protocol Analysis",
    startTime: "Tomorrow, 09:00 AM",
    duration: "60m",
    status: "UPCOMING" as RoundStatus,
    participants: 45,
  },
  {
    id: 4,
    title: "Historical Cyphers",
    startTime: "Nov 20, 2:00 PM",
    duration: "30m",
    status: "COMPLETED" as RoundStatus,
    participants: 210,
    maxScore: 980
  },
  {
    id: 5,
    title: "Image Reconnaissance",
    startTime: "Nov 19, 4:00 PM",
    duration: "20m",
    status: "COMPLETED" as RoundStatus,
    participants: 156,
    maxScore: 450
  },
  {
    id: 6,
    title: "Audio Steganography",
    startTime: "Nov 18, 11:00 AM",
    duration: "45m",
    status: "COMPLETED" as RoundStatus,
    participants: 112,
    maxScore: 750
  },
];

export const LEADERBOARD_DATA = [
  { rank: 1, user: { name: "Alex Chen", handle: "alexc", avatar: "https://i.pravatar.cc/150?u=1" }, score: 1250, timeTaken: "00:12s", status: 'CORRECT' as const },
  { rank: 2, user: { name: "Sarah V.", handle: "sarahv", avatar: "https://i.pravatar.cc/150?u=2" }, score: 1100, timeTaken: "00:15s", status: 'CORRECT' as const },
  { rank: 3, user: { name: "Dev Sandip", handle: "dev-sandip", avatar: "https://github.com/shadcn.png" }, score: 950, timeTaken: "00:19s", status: 'CORRECT' as const },
  { rank: 4, user: { name: "Rohan M.", handle: "rohanm", avatar: "https://i.pravatar.cc/150?u=4" }, score: 800, timeTaken: "00:24s", status: 'CORRECT' as const },
  { rank: 5, user: { name: "Unknown", handle: "guest_92", avatar: "https://i.pravatar.cc/150?u=5" }, score: 0, timeTaken: "-", status: 'WRONG' as const },
];

export const INITIAL_USERS = [
  { id: '1', name: "Alex Chen", handle: "alexc", avatar: "https://i.pravatar.cc/150?u=1", score: 1200 },
  { id: '2', name: "Sarah V.", handle: "sarahv", avatar: "https://i.pravatar.cc/150?u=2", score: 1150 },
  { id: '3', name: "Dev Sandip", handle: "dev-sandip", avatar: "https://github.com/shadcn.png", score: 900 },
  { id: '4', name: "Rohan M.", handle: "rohanm", avatar: "https://i.pravatar.cc/150?u=4", score: 850 },
  { id: '5', name: "Guest 92", handle: "guest_92", avatar: "https://i.pravatar.cc/150?u=5", score: 600 },
  { id: '6', name: "Cyber Ninja", handle: "ninja", avatar: "https://i.pravatar.cc/150?u=6", score: 550 },
  { id: '7', name: "Null Pointer", handle: "npe", avatar: "https://i.pravatar.cc/150?u=7", score: 400 },
];

export const MOCK_USERS: UserData[] = [
  { id: '1', name: "Alex Chen", handle: "alexc", email: "alex@maestro.dev", role: 'ADMIN', status: 'ACTIVE', elo: 2400, lastActive: 'Now' },
  { id: '2', name: "Sarah V.", handle: "sarahv", email: "sarah@gmail.com", role: 'USER', status: 'ACTIVE', elo: 1850, lastActive: '2m ago' },
  { id: '3', name: "Dev Sandip", handle: "dev-sandip", email: "sandip@dev.com", role: 'ADMIN', status: 'ACTIVE', elo: 2100, lastActive: '5m ago' },
  { id: '4', name: "Rogue Agent", handle: "unknown_99", email: "anon@temp.mail", role: 'USER', status: 'SUSPENDED', elo: 800, lastActive: '3d ago' },
  { id: '5', name: "John Doe", handle: "jdoe", email: "john@doe.com", role: 'USER', status: 'ACTIVE', elo: 1200, lastActive: '1h ago' },
]