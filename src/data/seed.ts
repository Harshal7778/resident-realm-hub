import {
  EVENT_STATUSES,
  ROLES,
  type House,
  type Member,
  type MobileNumber,
  type Role,
  type Society,
  type SocietyEvent,
} from "@/types/domain";

export const SEED_VERSION = "2";

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
