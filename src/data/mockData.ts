import { JobCategory } from "@/components/jobs/JobCard";

export const mockPosts = [
  {
    id: "1",
    author: {
      name: "Sarah Mitchell",
      role: "Flight Nurse, CCRN",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    },
    content: "12-hour shift done. Nothing beats seeing a patient walk out of the ER when they came in on a stretcher. This is why we do what we do. 💪",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=600&fit=crop",
    location: "Memorial Hermann Hospital, Houston TX",
    likes: 247,
    comments: 34,
    timestamp: "2h ago",
  },
  {
    id: "2",
    author: {
      name: "Marcus Johnson",
      role: "Firefighter/Paramedic",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    content: "Training day with the new recruits. Passing on what was taught to me. The next generation is looking sharp. 🔥",
    image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&h=600&fit=crop",
    location: "Station 42, Chicago IL",
    likes: 412,
    comments: 56,
    timestamp: "4h ago",
  },
  {
    id: "3",
    author: {
      name: "Emily Chen",
      role: "EMT-P, Tactical Medic",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    content: "Just accepted a 13-week travel assignment in Denver! Ready for the mountain air and new challenges. Any connections in the area? Would love to grab coffee! ☕",
    likes: 189,
    comments: 28,
    timestamp: "6h ago",
  },
  {
    id: "4",
    author: {
      name: "James Rodriguez",
      role: "Flight Paramedic",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    content: "Golden hour extraction complete. The team worked flawlessly today. Grateful for every crew member who makes these missions possible.",
    image: "https://images.unsplash.com/photo-1587351021759-3772687fe598?w=800&h=600&fit=crop",
    location: "Life Flight, Phoenix AZ",
    likes: 567,
    comments: 72,
    timestamp: "8h ago",
  },
];

export const mockJobs: Array<{
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  category: JobCategory;
  type: string;
  posted: string;
  urgent?: boolean;
}> = [
  {
    id: "1",
    title: "Travel Paramedic - Hurricane Response",
    company: "Crisis Response Medical",
    location: "Florida (Various)",
    salary: "$3,200/week",
    category: "crisis",
    type: "13 weeks",
    posted: "1h ago",
    urgent: true,
  },
  {
    id: "2",
    title: "Flight Nurse - CCRN Required",
    company: "AirMed International",
    location: "Denver, CO",
    salary: "$95,000 - $115,000",
    category: "w2",
    type: "Full-time",
    posted: "3h ago",
  },
  {
    id: "3",
    title: "Mobile ICU Paramedic",
    company: "TravelMed Staffing",
    location: "San Diego, CA",
    salary: "$2,800/week",
    category: "travel",
    type: "8 weeks",
    posted: "5h ago",
  },
  {
    id: "4",
    title: "Event Medical Director",
    company: "Stadium Medical Services",
    location: "Las Vegas, NV",
    salary: "$150/hour",
    category: "1099",
    type: "Per event",
    posted: "8h ago",
  },
  {
    id: "5",
    title: "ER Technician - Night Shift",
    company: "Memorial Hospital",
    location: "Austin, TX",
    salary: "$28 - $35/hr",
    category: "w2",
    type: "Full-time",
    posted: "12h ago",
  },
  {
    id: "6",
    title: "Disaster Response Team Lead",
    company: "Federal Emergency Services",
    location: "Nationwide",
    salary: "$4,500/week",
    category: "contract",
    type: "On-call",
    posted: "1d ago",
  },
  {
    id: "7",
    title: "PRN Paramedic - Hospital Transport",
    company: "MedTrans Corp",
    location: "Seattle, WA",
    salary: "$42/hour",
    category: "temp",
    type: "PRN",
    posted: "1d ago",
  },
  {
    id: "8",
    title: "Staffing Coordinator - EMS",
    company: "FirstResp Staffing",
    location: "Remote",
    salary: "$65,000 - $75,000",
    category: "staffing",
    type: "Full-time",
    posted: "2d ago",
  },
];

export const mockUser = {
  name: "Sarah Mitchell",
  role: "Flight Nurse, CCRN",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face",
  coverImage: "https://images.unsplash.com/photo-1587351021759-3772687fe598?w=1200&h=400&fit=crop",
  location: "Houston, TX",
  credentials: ["CCRN", "CEN", "FP-C", "ACLS"],
  joinDate: "March 2023",
  postsCount: 47,
  connectionsCount: 312,
};

export const mockPhotos = [
  { id: "1", url: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=400&fit=crop" },
  { id: "2", url: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&h=400&fit=crop" },
  { id: "3", url: "https://images.unsplash.com/photo-1587351021759-3772687fe598?w=400&h=400&fit=crop" },
  { id: "4", url: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=400&h=400&fit=crop" },
  { id: "5", url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop" },
  { id: "6", url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop" },
];
