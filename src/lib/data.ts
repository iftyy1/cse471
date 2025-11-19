// Shared in-memory data store
// In production, replace this with a proper database

export interface Post {
  id: number;
  content: string;
  author: string;
  authorId: number;
  createdAt: string;
  likes: number;
  comments: number;
}

export interface Comment {
  id: number;
  postId: number;
  content: string;
  author: string;
  authorId: number;
  createdAt: string;
}

export const posts: Post[] = [
  {
    id: 1,
    content: "Welcome to Student Social Media! This is a sample post.",
    author: "Admin",
    authorId: 1,
    createdAt: new Date().toISOString(),
    likes: 5,
    comments: 2,
  },
];

export const comments: Record<number, Comment[]> = {
  1: [
    {
      id: 1,
      postId: 1,
      content: "Great platform!",
      author: "Student1",
      authorId: 2,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      postId: 1,
      content: "Looking forward to connecting with everyone!",
      author: "Student2",
      authorId: 3,
      createdAt: new Date().toISOString(),
    },
  ],
};

export const likes: Record<number, Set<number>> = {};

export interface ChatMessage {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

export const chatMessages: ChatMessage[] = [
  {
    id: 1,
    author: "System",
    content: "Welcome to the global study hall! Be respectful and share your best tips ✨",
    createdAt: new Date().toISOString(),
  },
];

export interface MarketplaceListing {
  id: number;
  title: string;
  type: "Book" | "Notes";
  course: string;
  price: number;
  condition: string;
  location: string;
  deliveryOptions: string[];
  seller: string;
  sellerYear: string;
  postedAt: string;
  description: string;
  highlights: string[];
  contactEmail: string;
  previewPages: number;
}

export const marketplaceListings: MarketplaceListing[] = [
  {
    id: 1,
    title: "Complete Calculus Notes (MATH 205)",
    type: "Notes",
    course: "Calculus II",
    price: 18,
    condition: "Digital PDF • Annotated",
    location: "Download / Campus pickup",
    deliveryOptions: ["Instant PDF download", "Optional printed copy", "Solved examples"],
    seller: "Aisha Rahman",
    sellerYear: "Sophomore • Mathematics",
    postedAt: "2 days ago",
    description:
      "150+ pages of color-coded Calculus II notes covering integration techniques, series, and parametric equations. Includes solved problems from recent midterms, Desmos screenshots, and cheat sheets for quick revision.",
    highlights: ["Midterm-focused summaries", "Formula bank", "Practice problems with solutions"],
    contactEmail: "aisha.rahman@example.edu",
    previewPages: 12,
  },
  {
    id: 2,
    title: "Introduction to Algorithms (CLRS 4th Edition)",
    type: "Book",
    course: "CSE 312",
    price: 45,
    condition: "Hardcover • Like New",
    location: "North Residence Hall",
    deliveryOptions: ["On-campus meetup", "Courier delivery (+$3)"],
    seller: "Noah Patel",
    sellerYear: "Junior • Computer Science",
    postedAt: "5 hours ago",
    description:
      "Latest CLRS edition with no highlights or markings. Comes with chapter summary bookmarks and access to my handwritten solutions for selected exercises. Perfect for anyone taking Data Structures or Advanced Algorithms.",
    highlights: ["Bookmark set", "Exercise solutions", "Protective book cover"],
    contactEmail: "noah.patel@example.edu",
    previewPages: 0,
  },
  {
    id: 3,
    title: "Organic Chemistry Lab Notebook",
    type: "Notes",
    course: "CHEM 241",
    price: 25,
    condition: "Handwritten • Scanned PDF",
    location: "Chemistry Building",
    deliveryOptions: ["PDF download", "Original notebook (pickup only)"],
    seller: "Leila Chen",
    sellerYear: "Senior • Biochemistry",
    postedAt: "1 week ago",
    description:
      "Lab-ready notebook with detailed experimental setups, reagent tables, and troubleshooting tips for all 12 organic chemistry labs. Includes safety notes, spectra interpretations, and TA feedback.",
    highlights: ["Spectra interpretations", "Yield optimization tips", "Lab safety checklist"],
    contactEmail: "leila.chen@example.edu",
    previewPages: 20,
  },
];

export type TournamentStatus = "Upcoming" | "Ongoing" | "Completed";

export interface Tournament {
  id: number;
  title: string;
  organizer: string;
  category: string;
  location: string;
  dateRange: string;
  registrationDeadline: string;
  prizePool: string;
  maxParticipants: number;
  enrolledParticipants: number;
  description: string;
  rules: string[];
  tags: string[];
  status: TournamentStatus;
}

export const tournamentsData: Tournament[] = [
  {
    id: 101,
    title: "Inter-University Hackathon 2025",
    organizer: "Innovation Lab",
    category: "Technology",
    location: "Engineering Hall • Hybrid",
    dateRange: "Dec 5 - Dec 7, 2025",
    registrationDeadline: "Nov 30, 2025",
    prizePool: "$4,000 cash + incubator slots",
    maxParticipants: 30,
    enrolledParticipants: 18,
    description:
      "Build solutions for campus sustainability challenges in 48 hours. Access mentor hours, hardware kits, and rapid prototyping tools. Teams of 3-4 students from any major are welcome.",
    rules: [
      "Teams must have at least one first or second year student",
      "Code must be pushed to the provided GitHub repository",
      "Final presentations limited to 6 minutes + Q&A",
    ],
    tags: ["Hackathon", "Sustainability", "Team Event"],
    status: "Upcoming",
  },
  {
    id: 205,
    title: "Intramural Esports Showdown",
    organizer: "Campus Recreation",
    category: "Esports",
    location: "Student Center Arena",
    dateRange: "Nov 20 - Nov 22, 2025",
    registrationDeadline: "Nov 18, 2025",
    prizePool: "Gaming gear + varsity tryouts",
    maxParticipants: 16,
    enrolledParticipants: 16,
    description:
      "Three-day tournament featuring Valorant, Rocket League, and Super Smash Bros. Includes coaching sessions from varsity esports captains and live casting workshop.",
    rules: [
      "Single elimination brackets per title",
      "All matches are best-of-three except finals",
      "Players must use campus esports accounts",
    ],
    tags: ["Competitive", "Streamed Live", "Limited Slots"],
    status: "Ongoing",
  },
  {
    id: 309,
    title: "Spring Entrepreneurship Pitch-Off",
    organizer: "Business Council",
    category: "Entrepreneurship",
    location: "Innovation Commons",
    dateRange: "Jan 18, 2026",
    registrationDeadline: "Jan 10, 2026",
    prizePool: "$10,000 seed funding",
    maxParticipants: 12,
    enrolledParticipants: 7,
    description:
      "Showcase your startup idea to alumni investors and faculty advisors. Receive pitch coaching, mock judging, and access to prototyping credits before Demo Day.",
    rules: [
      "Teams must include at least one enrolled student founder",
      "Pitch decks are due one week in advance",
      "Hardware demos must pass safety checks",
    ],
    tags: ["Pitch", "Funding", "Mentorship"],
    status: "Upcoming",
  },
];

export interface Tutor {
  id: number;
  name: string;
  subjects: string[];
  hourlyRate: number;
  year: string;
  headline: string;
  description: string;
  mode: "In Person" | "Virtual" | "Hybrid";
  availability: string;
  achievements: string[];
  contactEmail: string;
  sessionsHosted: number;
  rating: number;
  joinedStudents: number;
  maxStudents: number;
}

export const tutorsData: Tutor[] = [
  {
    id: 1,
    name: "Sofia Martinez",
    subjects: ["Calculus II", "Linear Algebra", "Differential Equations"],
    hourlyRate: 22,
    year: "Senior • Applied Mathematics",
    headline: "Exam-focused calc prep with live problem solving workshops",
    description:
      "I run structured 75-minute sessions focused on fast problem breakdown, pattern recognition, and exam pacing. Each cohort gets a shared Notion workspace, recorded walkthroughs, and office hours before midterms.",
    mode: "Hybrid",
    availability: "Tue & Thu evenings • Sat mornings",
    achievements: ["4.9/5 average rating", "Math Learning Center Lead", "Putnam Honorable Mention"],
    contactEmail: "sofia.martinez@example.edu",
    sessionsHosted: 48,
    rating: 4.9,
    joinedStudents: 9,
    maxStudents: 12,
  },
  {
    id: 2,
    name: "Ethan Williams",
    subjects: ["CS Fundamentals", "Data Structures", "Intro to Python"],
    hourlyRate: 18,
    year: "Junior • Computer Science",
    headline: "Debugging-first coding labs with live pair programming",
    description:
      "Ideal for students tackling their first large codebase. I review your repo beforehand, then we co-build test cases, refactor, and set up Git workflows. Additional async feedback within 24 hours.",
    mode: "Virtual",
    availability: "Mon, Wed, Fri afternoons",
    achievements: ["Former SWE intern @ Vertex AI", "CS department TA", "Google STEP Scholar"],
    contactEmail: "ethan.williams@example.edu",
    sessionsHosted: 32,
    rating: 4.8,
    joinedStudents: 5,
    maxStudents: 6,
  },
  {
    id: 3,
    name: "Priya Shah",
    subjects: ["Organic Chemistry I", "Lab Techniques", "Biochemistry"],
    hourlyRate: 25,
    year: "Graduate • Biological Chemistry",
    headline: "Reaction mechanism clinics + lab practical prep",
    description:
      "I specialize in helping pre-med students translate lecture theory into lab performance. Study packs include mechanism flashcards, IR/NMR practice, and safety checklists approved by lab coordinators.",
    mode: "In Person",
    availability: "Sun & Wed evenings",
    achievements: ["TA of the Year 2024", "Published in J. Org. Chem.", "Lead Lab Mentor"],
    contactEmail: "priya.shah@example.edu",
    sessionsHosted: 60,
    rating: 5,
    joinedStudents: 12,
    maxStudents: 15,
  },
];

let nextPostId = 2;
let nextCommentId = 3;
let nextChatMessageId = 2;

export function getNextPostId() {
  return nextPostId++;
}

export function getNextCommentId() {
  return nextCommentId++;
}

export function getNextChatMessageId() {
  return nextChatMessageId++;
}

export function joinTournament(id: number) {
  const tournament = tournamentsData.find((t) => t.id === id);
  if (!tournament) {
    return { success: false, status: "not_found" as const };
  }

  if (tournament.enrolledParticipants >= tournament.maxParticipants) {
    return { success: false, status: "full" as const };
  }

  tournament.enrolledParticipants += 1;
  return { success: true, status: "joined" as const };
}

export function joinTutorSession(id: number) {
  const tutor = tutorsData.find((t) => t.id === id);
  if (!tutor) {
    return { success: false, status: "not_found" as const };
  }

  if (tutor.joinedStudents >= tutor.maxStudents) {
    return { success: false, status: "full" as const };
  }

  tutor.joinedStudents += 1;
  return { success: true, status: "joined" as const };
}

