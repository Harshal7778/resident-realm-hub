import {
  EVENT_STATUSES,
  type AppNotification,
  type AttendanceRecord,
  type Meeting,
  type Notice,
  ROLES,
  type House,
  type Member,
  type MobileNumber,
  type Role,
  type Society,
  type SocietyEvent,
} from "@/types/domain";

export const SEED_VERSION = "3";

const NOW = "2026-01-01T00:00:00.000Z";
const stamps = { createdAt: NOW, updatedAt: NOW };

export const SOCIETY_ID = "soc-green-valley";

export const demoSociety: Society = {
  id: SOCIETY_ID,
  name: "Green Valley Society",
  address: "Sardar Patel Road, Sector 7",
  city: "Ahmedabad",
  registrationNo: "GJ/AHM/2019/GVS",
  ...stamps,
};

type SeedRow = {
  house: string;
  owner: string;
  mobiles: string[];
  role?: Role;
  active?: boolean;
};

const rows: SeedRow[] = [
  { house: "H01", owner: "Rajesh Patel", mobiles: ["9000000001", "9812340001"], role: ROLES.ADMIN },
  { house: "H02", owner: "Amit Shah", mobiles: ["9000000002"], role: ROLES.SECRETARY },
  { house: "H03", owner: "Karan Patel", mobiles: ["9000000003", "9812340003"], role: ROLES.TREASURER },
  { house: "H04", owner: "Meera Joshi", mobiles: ["9000000004"] },
  { house: "H05", owner: "Nilesh Desai", mobiles: ["9000000005", "9812340005"] },
  { house: "H06", owner: "Priya Mehta", mobiles: ["9000000006"] },
  { house: "H07", owner: "Vikram Chauhan", mobiles: ["9000000007"] },
  { house: "H08", owner: "Anita Trivedi", mobiles: ["9000000008", "9812340008"] },
  { house: "H09", owner: "Hardik Bhatt", mobiles: ["9000000009"] },
  { house: "H10", owner: "Snehal Vyas", mobiles: ["9000000010"] },
  { house: "H11", owner: "Manoj Solanki", mobiles: ["9000000011"], active: false },
  { house: "H12", owner: "Sunil Patel", mobiles: ["9000000012", "9812340012"] },
  { house: "H13", owner: "Kavita Nair", mobiles: ["9000000013"] },
  { house: "H14", owner: "Dhruv Rana", mobiles: ["9000000014"] },
  { house: "H15", owner: "Pooja Gandhi", mobiles: ["9000000015", "9812340015"] },
  { house: "H16", owner: "Ramesh Iyer", mobiles: ["9000000016"] },
  { house: "H17", owner: "Bhavna Parmar", mobiles: ["9000000017"] },
  { house: "H18", owner: "Jignesh Modi", mobiles: ["9000000018"] },
  { house: "H19", owner: "Sonal Dave", mobiles: ["9000000019", "9812340019"] },
  { house: "H20", owner: "Alpesh Thakkar", mobiles: ["9000000020"] },
  { house: "H21", owner: "Rekha Pandya", mobiles: ["9000000021"] },
  { house: "H22", owner: "Chirag Suthar", mobiles: ["9000000022"] },
  { house: "H23", owner: "Nisha Raval", mobiles: ["9000000023", "9812340023"] },
  { house: "H24", owner: "Paresh Makwana", mobiles: ["9000000024"], active: false },
  { house: "H25", owner: "Falguni Shah", mobiles: ["9000000025"] },
];

function toMobiles(house: string, numbers: string[]): MobileNumber[] {
  return numbers.map((number, i) => ({
    id: `mob-${house}-${i + 1}`,
    number,
    label: i === 0 ? "PRIMARY" : "SECONDARY",
    isActive: true,
  }));
}

export function buildSeedHouses(): House[] {
  return rows.map((r) => ({
    id: `house-${r.house}`,
    societyId: SOCIETY_ID,
    houseNumber: r.house,
    ownerName: r.owner,
    isActive: r.active !== false,
    ...stamps,
  }));
}

export function buildSeedMembers(): Member[] {
  return rows.map((r) => ({
    id: `member-${r.house}`,
    societyId: SOCIETY_ID,
    houseId: `house-${r.house}`,
    name: r.owner,
    isOwner: true,
    isActive: r.active !== false,
    mobileNumbers: toMobiles(r.house, r.mobiles),
    role: r.role ?? ROLES.MEMBER,
    ...stamps,
  }));
}

export const DEMO_LOGIN_MOBILES: Record<Role, string> = {
  ADMIN: "9000000001",
  SECRETARY: "9000000002",
  TREASURER: "9000000003",
  MEMBER: "9000000012",
};

export function buildSeedEvents(): SocietyEvent[] {
  return [
    {
      id: "event-diwali-2026",
      societyId: SOCIETY_ID,
      name: "Diwali Function 2026",
      type: "Festival",
      description: "Society-wide Diwali celebration with dinner, rangoli and fireworks.",
      startDate: "2026-11-06",
      endDate: "2026-11-08",
      standardContribution: 1000,
      status: EVENT_STATUSES.ACTIVE,
      ...stamps,
    },
    {
      id: "event-holi-2026",
      societyId: SOCIETY_ID,
      name: "Holi Function 2026",
      type: "Festival",
      description: "Morning Holi celebration with organic colours and snacks.",
      startDate: "2026-03-03",
      endDate: "2026-03-03",
      standardContribution: 500,
      status: EVENT_STATUSES.DRAFT,
      ...stamps,
    },
    {
      id: "event-annual-2026",
      societyId: SOCIETY_ID,
      name: "Annual Society Function",
      type: "Annual",
      description: "Annual general function with cultural programme and prize distribution.",
      startDate: "2026-01-26",
      endDate: "2026-01-26",
      standardContribution: 1500,
      status: EVENT_STATUSES.ACTIVE,
      ...stamps,
    },
  ];
}

export function buildSeedMeetings(): Meeting[] {
  return [
    {
      id: "meeting-monthly-aug-2026",
      societyId: SOCIETY_ID,
      title: "Monthly Society Meeting",
      date: "2026-08-25",
      time: "20:00",
      location: "Society Hall",
      description: "Monthly review of maintenance, security and upcoming festival planning.",
      ...stamps,
    },
    {
      id: "meeting-agm-2026",
      societyId: SOCIETY_ID,
      title: "Annual General Meeting",
      date: "2026-09-20",
      time: "19:30",
      location: "Society Garden",
      description: "Annual accounts presentation, committee election and member grievances.",
      ...stamps,
    },
  ];
}

/** Attendance history for the monthly meeting: 21 present, 4 absent. */
export function buildSeedAttendance(houses: House[], members: Member[]): AttendanceRecord[] {
  const absentHouses = new Set(["H05", "H11", "H18", "H24"]);
  return houses.map((house) => {
    const member = members.find((m) => m.houseId === house.id);
    return {
      id: `att-meeting-monthly-aug-2026-${house.id}`,
      meetingId: "meeting-monthly-aug-2026",
      houseId: house.id,
      houseNumber: house.houseNumber,
      memberId: member?.id ?? "",
      memberName: member?.name ?? house.ownerName,
      status: absentHouses.has(house.houseNumber) ? "ABSENT" : "PRESENT",
      ...stamps,
    } satisfies AttendanceRecord;
  });
}

export function buildSeedNotices(): Notice[] {
  return [
    {
      id: "notice-water-tank",
      societyId: SOCIETY_ID,
      title: "Water tank cleaning",
      message: "Water tank cleaning today at 5 PM. Please store water in advance. Supply resumes by 8 PM.",
      priority: "IMPORTANT",
      status: "PUBLISHED",
      publishDate: "2026-08-20",
      expiryDate: "2026-09-20",
      ...stamps,
    },
    {
      id: "notice-parking",
      societyId: SOCIETY_ID,
      title: "Parking discipline",
      message: "Kindly park vehicles inside the allotted slot only. Visitor vehicles must use the gate parking bay.",
      priority: "NORMAL",
      status: "PUBLISHED",
      publishDate: "2026-08-10",
      expiryDate: "2026-10-10",
      ...stamps,
    },
    {
      id: "notice-maintenance-due",
      societyId: SOCIETY_ID,
      title: "Quarterly maintenance due",
      message: "Quarterly maintenance of ₹3,000 per house is due before 10 September. Cash receipts at the office.",
      priority: "IMPORTANT",
      status: "PUBLISHED",
      publishDate: "2026-08-28",
      expiryDate: "2026-09-15",
      ...stamps,
    },
  ];
}

export function buildSeedNotifications(members: Member[]): AppNotification[] {
  const templates: Array<Omit<AppNotification, "id" | "userId">> = [
    {
      type: "NEW_NOTICE",
      title: "Water tank cleaning",
      message: "IMPORTANT: Water tank cleaning today at 5 PM.",
      timestamp: "2026-08-20T09:00:00.000Z",
      read: false,
      link: "/notices",
    },
    {
      type: "MEETING_REMINDER",
      title: "Monthly Society Meeting",
      message: "Meeting on 25 Aug 2026 at 8:00 PM, Society Hall.",
      timestamp: "2026-08-24T04:30:00.000Z",
      read: false,
      link: "/meetings",
    },
    {
      type: "CONTRIBUTION_REMINDER",
      title: "Contribution pending",
      message: "Your Diwali Function 2026 contribution is still pending.",
      timestamp: "2026-08-18T06:00:00.000Z",
      read: true,
      link: "/events",
    },
    {
      type: "NEW_EVENT",
      title: "Diwali Function 2026",
      message: "A new event has been created. Standard contribution ₹1,000.",
      timestamp: "2026-08-05T10:15:00.000Z",
      read: true,
      link: "/events",
    },
  ];

  return members.flatMap((member) =>
    templates.map((t, i) => ({
      ...t,
      id: `notif-seed-${member.id}-${i + 1}`,
      userId: member.id,
    })),
  );
}
