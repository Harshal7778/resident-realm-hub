import { SOCIETY_ID } from "@/data/seed";
import {
  REQUEST_STATUSES,
  TRANSACTION_TYPES,
  type InventoryCategory,
  type InventoryItem,
  type InventoryRequest,
  type InventoryRequestItem,
  type InventoryTransaction,
  type RequestStatus,
} from "@/types/domain";

const NOW = "2026-01-01T00:00:00.000Z";
const stamps = { createdAt: NOW, updatedAt: NOW };

type ItemSeed = [name: string, category: InventoryCategory, total: number, description: string];

const ITEM_SEEDS: ItemSeed[] = [
  ["Dinner Plate", "Utensils", 300, "Steel dinner plates used for society functions."],
  ["Glass", "Utensils", 300, "Steel drinking glasses."],
  ["Spoon", "Utensils", 400, "Steel eating spoons."],
  ["Bowl", "Utensils", 250, "Small steel bowls for sweets and curry."],
  ["Serving Spoon", "Utensils", 40, "Large serving spoons for buffet counters."],
  ["Water Jug", "Utensils", 30, "2 litre steel water jugs."],
  ["Tea Cup", "Utensils", 150, "Steel tea cups for morning functions."],
  ["Tray", "Utensils", 25, "Rectangular serving trays."],
  ["Cooking Pot", "Cookware", 12, "Large cooking pots (patila) for bulk cooking."],
  ["Large Vessel", "Cookware", 8, "Extra large vessels for rice and dal."],
  ["Kadhai", "Cookware", 6, "Deep frying kadhai for sweets and snacks."],
  ["Gas Burner", "Cookware", 4, "High pressure commercial gas burners."],
  ["Gas Cylinder Stand", "Cookware", 4, "Safety stands for commercial cylinders."],
  ["Chair", "Furniture", 120, "Plastic stacking chairs."],
  ["Folding Table", "Furniture", 20, "Six-foot folding tables."],
  ["Mattress", "Furniture", 15, "Foam mattresses for guest stay."],
  ["Carpet", "Furniture", 10, "Floor carpets for hall seating."],
  ["Shamiyana Set", "Decoration", 3, "Tent/shamiyana sets with poles."],
  ["Rangoli Stencil", "Decoration", 12, "Festival rangoli stencils."],
  ["Decoration Light String", "Decoration", 30, "LED serial light strings."],
  ["Flower Vase", "Decoration", 18, "Brass flower vases for stage decoration."],
  ["Sound System", "Electrical", 2, "Portable speaker and amplifier sets."],
  ["Cordless Mic", "Electrical", 6, "Cordless microphones for announcements."],
  ["Extension Board", "Electrical", 20, "Heavy duty extension boards."],
  ["Pedestal Fan", "Electrical", 14, "Pedestal fans for hall cooling."],
  ["Notice Board", "Other", 4, "Portable notice boards for events."],
];

export function itemIdFor(name: string): string {
  return `inv-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

type RequestLine = {
  name: string;
  requested: number;
  approved?: number;
  issued?: number;
  returned?: number;
  damaged?: number;
  missing?: number;
};

type RequestSeed = {
  id: string;
  house: string;
  member: string;
  purpose: string;
  requestDate: string;
  expectedReturnDate: string;
  notes: string;
  status: RequestStatus;
  rejectionReason?: string;
  lines: RequestLine[];
};

const REQUEST_SEEDS: RequestSeed[] = [
  {
    id: "invreq-h12-wedding",
    house: "H12",
    member: "Sunil Patel",
    purpose: "Wedding function at home",
    requestDate: "2026-09-01",
    expectedReturnDate: "2026-09-15",
    notes: "Will collect a day before the function.",
    status: REQUEST_STATUSES.PENDING,
    lines: [
      { name: "Dinner Plate", requested: 50 },
      { name: "Glass", requested: 50 },
      { name: "Bowl", requested: 30 },
    ],
  },
  {
    id: "invreq-h05-community",
    house: "H05",
    member: "Nilesh Desai",
    purpose: "Community bhajan sandhya",
    requestDate: "2026-08-28",
    expectedReturnDate: "2026-09-12",
    notes: "Chairs required for senior members.",
    status: REQUEST_STATUSES.APPROVED,
    lines: [
      { name: "Chair", requested: 60, approved: 50 },
      { name: "Serving Spoon", requested: 10, approved: 10 },
    ],
  },
  {
    id: "invreq-h18-family",
    house: "H18",
    member: "Jignesh Parmar",
    purpose: "Family satyanarayan katha",
    requestDate: "2026-08-20",
    expectedReturnDate: "2026-09-08",
    notes: "Cooking vessels needed from morning.",
    status: REQUEST_STATUSES.ISSUED,
    lines: [
      { name: "Cooking Pot", requested: 4, approved: 4, issued: 4 },
      { name: "Large Vessel", requested: 2, approved: 2, issued: 2 },
      { name: "Tray", requested: 8, approved: 6, issued: 6 },
    ],
  },
  {
    id: "invreq-h03-birthday",
    house: "H03",
    member: "Karan Patel",
    purpose: "60th birthday celebration",
    requestDate: "2026-07-10",
    expectedReturnDate: "2026-07-18",
    notes: "Returned with a broken plate and one missing glass.",
    status: REQUEST_STATUSES.COMPLETED,
    lines: [
      { name: "Dinner Plate", requested: 100, approved: 100, issued: 100, returned: 98, damaged: 1, missing: 1 },
      { name: "Glass", requested: 100, approved: 80, issued: 80, returned: 79, damaged: 0, missing: 1 },
    ],
  },
  {
    id: "invreq-h21-rejected",
    house: "H21",
    member: "Rekha Pandya",
    purpose: "Outside city function",
    requestDate: "2026-08-05",
    expectedReturnDate: "2026-08-20",
    notes: "Items to be taken outside Ahmedabad.",
    status: REQUEST_STATUSES.REJECTED,
    rejectionReason: "Society items cannot be taken outside the city as per committee rules.",
    lines: [
      { name: "Sound System", requested: 2 },
      { name: "Cordless Mic", requested: 4 },
    ],
  },
];

export interface SeededInventory {
  items: InventoryItem[];
  requests: InventoryRequest[];
  transactions: InventoryTransaction[];
}

/** Builds demo inventory with request effects already applied to stock. */
export function buildSeedInventory(): SeededInventory {
  const items: InventoryItem[] = ITEM_SEEDS.map(([name, category, total, description]) => ({
    id: itemIdFor(name),
    societyId: SOCIETY_ID,
    name,
    category,
    totalQuantity: total,
    availableQuantity: total,
    issuedQuantity: 0,
    damagedQuantity: 0,
    missingQuantity: 0,
    description,
    isActive: true,
    ...stamps,
  }));

  const byId = new Map(items.map((i) => [i.id, i]));
  const transactions: InventoryTransaction[] = items.map((item, index) => ({
    id: `invtx-add-${item.id}`,
    itemId: item.id,
    itemName: item.name,
    type: TRANSACTION_TYPES.ADDED,
    quantity: item.totalQuantity,
    note: "Opening stock added to society inventory.",
    createdAt: new Date(Date.parse("2026-01-01T00:00:00.000Z") + index * 1000).toISOString(),
  }));

  const requests: InventoryRequest[] = REQUEST_SEEDS.map((seed) => {
    const lineItems: InventoryRequestItem[] = seed.lines.map((line) => {
      const item = byId.get(itemIdFor(line.name));
      const issued = line.issued ?? 0;
      const returned = line.returned ?? 0;
      const damaged = line.damaged ?? 0;
      const missing = line.missing ?? 0;

      if (item && issued > 0) {
        const openIssued = issued - returned - damaged - missing;
        item.availableQuantity -= issued - returned;
        item.issuedQuantity += openIssued;
        item.damagedQuantity += damaged;
        item.missingQuantity += missing;

        transactions.push({
          id: `invtx-issue-${seed.id}-${item.id}`,
          itemId: item.id,
          itemName: item.name,
          type: TRANSACTION_TYPES.ISSUED,
          quantity: issued,
          requestId: seed.id,
          houseNumber: seed.house,
          note: `Issued to ${seed.house} for ${seed.purpose}.`,
          createdAt: `${seed.requestDate}T10:00:00.000Z`,
        });

        if (returned > 0) {
          transactions.push({
            id: `invtx-return-${seed.id}-${item.id}`,
            itemId: item.id,
            itemName: item.name,
            type: TRANSACTION_TYPES.RETURNED,
            quantity: returned,
            requestId: seed.id,
            houseNumber: seed.house,
            note: `Returned by ${seed.house}.`,
            createdAt: `${seed.expectedReturnDate}T10:00:00.000Z`,
          });
        }
        if (damaged > 0) {
          transactions.push({
            id: `invtx-damaged-${seed.id}-${item.id}`,
            itemId: item.id,
            itemName: item.name,
            type: TRANSACTION_TYPES.DAMAGED,
            quantity: damaged,
            requestId: seed.id,
            houseNumber: seed.house,
            note: `Reported damaged by ${seed.house}.`,
            createdAt: `${seed.expectedReturnDate}T10:05:00.000Z`,
          });
        }
        if (missing > 0) {
          transactions.push({
            id: `invtx-missing-${seed.id}-${item.id}`,
            itemId: item.id,
            itemName: item.name,
            type: TRANSACTION_TYPES.MISSING,
            quantity: missing,
            requestId: seed.id,
            houseNumber: seed.house,
            note: `Reported missing by ${seed.house}.`,
            createdAt: `${seed.expectedReturnDate}T10:06:00.000Z`,
          });
        }
      }

      return {
        itemId: item?.id ?? itemIdFor(line.name),
        itemName: line.name,
        requestedQuantity: line.requested,
        approvedQuantity: line.approved ?? 0,
        issuedQuantity: issued,
        returnedQuantity: returned,
        damagedQuantity: damaged,
        missingQuantity: missing,
      } satisfies InventoryRequestItem;
    });

    return {
      id: seed.id,
      societyId: SOCIETY_ID,
      houseId: `house-${seed.house}`,
      houseNumber: seed.house,
      memberId: `member-${seed.house}`,
      memberName: seed.member,
      purpose: seed.purpose,
      requestDate: seed.requestDate,
      expectedReturnDate: seed.expectedReturnDate,
      notes: seed.notes,
      status: seed.status,
      items: lineItems,
      ...(seed.rejectionReason ? { rejectionReason: seed.rejectionReason } : {}),
      ...(seed.status === REQUEST_STATUSES.PENDING ? {} : { approvedAt: `${seed.requestDate}T09:00:00.000Z` }),
      ...stamps,
    } satisfies InventoryRequest;
  });

  return { items, requests, transactions };
}
