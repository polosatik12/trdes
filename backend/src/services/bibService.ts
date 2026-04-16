/**
 * Bib number assignment service
 *
 * Ranges per distance × gender × age:
 *
 * GRAND (114 km) — MEN
 *   A   (group A, manual only): 1–50,   reserved 1–19,  auto from 20
 *   M1  18–29:  101–199,  reserved 101–122, auto from 123
 *   M2  30–39:  301–399,  reserved 301–320, auto from 321
 *   M3  40–49:  401–499,  reserved 401–420, auto from 421
 *   M4  50–59:  501–599,  reserved 501–520, auto from 521
 *   M6  60+:    601–630,  reserved 601–606, auto from 607
 *
 * GRAND (114 km) — WOMEN
 *   FA  (group A, manual only): 701–749, reserved 701–711, auto from 712
 *   F1  18–29:  751–799,  reserved 751–761, auto from 762
 *   F2  30–39:  801–849,  reserved 801–811, auto from 812
 *   F3  40–54:  851–899,  reserved 851–861, auto from 862
 *   F4  55+:    901–949,  reserved 901–911, auto from 912
 *
 * MEDIAN (60 km)
 *   MM  men  18+: 1001–1499, reserved 1001–1022, auto from 1023
 *   MF  women 18+: 1501–1999, reserved 1501–1520, auto from 1521
 *
 * INTRO (25 km)
 *   IM  men  18+: 2001–2499, reserved 2001–2022, auto from 2023
 *   IF  women 18+: 2501–2999, reserved 2501–2520, auto from 2521
 *
 * Age is calculated on 31 December of the current year.
 * Participant must be 18+ on event start date.
 */

import { query } from '../utils/db';

export type AgeCategory =
  | 'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M6'
  | 'FA' | 'F1' | 'F2' | 'F3' | 'F4'
  | 'MM' | 'MF'
  | 'IM' | 'IF';

interface BibRange {
  category: AgeCategory;
  min: number;         // inclusive range start
  max: number;         // inclusive range end
  autoFrom: number;    // first number available for auto-assignment
  manualOnly: boolean; // true = admin must assign manually (Group A / FA)
}

// Distance type derived from distance_km
type DistanceType = 'grand' | 'median' | 'intro';

function distanceType(distanceKm: number): DistanceType {
  if (distanceKm >= 100) return 'grand';
  if (distanceKm >= 50) return 'median';
  return 'intro';
}

const RANGES: BibRange[] = [
  // GRAND — MEN
  { category: 'A',  min: 1,    max: 50,   autoFrom: 20,   manualOnly: true },
  { category: 'M1', min: 101,  max: 199,  autoFrom: 123,  manualOnly: false },
  { category: 'M2', min: 301,  max: 399,  autoFrom: 321,  manualOnly: false },
  { category: 'M3', min: 401,  max: 499,  autoFrom: 421,  manualOnly: false },
  { category: 'M4', min: 501,  max: 599,  autoFrom: 521,  manualOnly: false },
  { category: 'M6', min: 601,  max: 630,  autoFrom: 607,  manualOnly: false },
  // GRAND — WOMEN
  { category: 'FA', min: 701,  max: 749,  autoFrom: 712,  manualOnly: true },
  { category: 'F1', min: 751,  max: 799,  autoFrom: 762,  manualOnly: false },
  { category: 'F2', min: 801,  max: 849,  autoFrom: 812,  manualOnly: false },
  { category: 'F3', min: 851,  max: 899,  autoFrom: 862,  manualOnly: false },
  { category: 'F4', min: 901,  max: 949,  autoFrom: 912,  manualOnly: false },
  // MEDIAN — MEN & WOMEN
  { category: 'MM', min: 1001, max: 1499, autoFrom: 1023, manualOnly: false },
  { category: 'MF', min: 1501, max: 1999, autoFrom: 1521, manualOnly: false },
  // INTRO — MEN & WOMEN
  { category: 'IM', min: 2001, max: 2499, autoFrom: 2023, manualOnly: false },
  { category: 'IF', min: 2501, max: 2999, autoFrom: 2521, manualOnly: false },
];

/**
 * Calculates age on 31 December of the current year.
 */
export function ageOnDec31(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth);
  const dec31 = new Date(new Date().getFullYear(), 11, 31); // Dec 31 current year
  let age = dec31.getFullYear() - birth.getFullYear();
  const m = dec31.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && dec31.getDate() < birth.getDate())) age--;
  return age;
}

/**
 * Checks if participant is 18+ on event start date.
 */
export function isEligible(dateOfBirth: string, eventDate: string): boolean {
  const birth = new Date(dateOfBirth);
  const start = new Date(eventDate);
  let age = start.getFullYear() - birth.getFullYear();
  const m = start.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && start.getDate() < birth.getDate())) age--;
  return age >= 18;
}

/**
 * Determines age category based on distance, gender and age (on Dec 31).
 */
export function determineCategory(
  distanceKm: number,
  gender: 'male' | 'female',
  dateOfBirth: string,
): AgeCategory {
  const type = distanceType(distanceKm);
  const age = ageOnDec31(dateOfBirth);

  if (type === 'median') return gender === 'male' ? 'MM' : 'MF';
  if (type === 'intro')  return gender === 'male' ? 'IM' : 'IF';

  // GRAND
  if (gender === 'male') {
    // Participants start in their age group; admin moves to A manually
    if (age < 30) return 'M1';
    if (age < 40) return 'M2';
    if (age < 50) return 'M3';
    if (age < 60) return 'M4';
    return 'M6';
  }
  // female GRAND
  if (age < 30) return 'F1';
  if (age < 40) return 'F2';
  if (age < 55) return 'F3';
  return 'F4';
}

/**
 * Returns the BibRange config for a given category.
 */
export function getRangeForCategory(category: AgeCategory): BibRange {
  const range = RANGES.find(r => r.category === category);
  if (!range) throw new Error(`Unknown category: ${category}`);
  return range;
}

/**
 * Finds the next available bib number for the given event + category.
 * Returns null if the range is exhausted.
 */
export async function nextAvailableBib(
  eventId: string,
  category: AgeCategory,
): Promise<number | null> {
  const range = getRangeForCategory(category);

  if (range.manualOnly) return null; // A / FA — never auto-assigned

  // Get all taken bibs in this range for this event
  const taken = await query(
    `SELECT bib_number FROM event_registrations
     WHERE event_id = $1
       AND bib_number >= $2
       AND bib_number <= $3
       AND bib_number IS NOT NULL
     ORDER BY bib_number ASC`,
    [eventId, range.autoFrom, range.max],
  );

  const takenSet = new Set<number>(taken.rows.map((r: any) => r.bib_number as number));

  for (let n = range.autoFrom; n <= range.max; n++) {
    if (!takenSet.has(n)) return n;
  }
  return null; // range exhausted
}

/**
 * Auto-assigns a bib number to a registration.
 * Skips if: category is manual-only, bib already assigned, or range exhausted.
 * Returns the assigned bib number or null.
 */
export async function autoAssignBib(
  registrationId: string,
  eventId: string,
  category: AgeCategory,
): Promise<number | null> {
  const bib = await nextAvailableBib(eventId, category);
  if (bib === null) return null;

  await query(
    `UPDATE event_registrations
     SET bib_number = $1, age_category = $2, updated_at = NOW()
     WHERE id = $3 AND bib_number IS NULL AND bib_number_manual = false`,
    [bib, category, registrationId],
  );

  return bib;
}

/**
 * Manually assigns a bib number (admin action).
 * Validates the number is not already taken in this event.
 */
export async function manualAssignBib(
  registrationId: string,
  eventId: string,
  bibNumber: number,
  category?: AgeCategory,
): Promise<void> {
  // Check uniqueness within the event
  const conflict = await query(
    `SELECT id FROM event_registrations
     WHERE event_id = $1 AND bib_number = $2 AND id != $3`,
    [eventId, bibNumber, registrationId],
  );
  if (conflict.rows.length > 0) {
    throw new Error(`Номер ${bibNumber} уже занят на этом мероприятии`);
  }

  const updates: string[] = ['bib_number = $1', 'bib_number_manual = true', 'updated_at = NOW()'];
  const values: any[] = [bibNumber];

  if (category) {
    updates.push(`age_category = $${values.length + 1}`);
    values.push(category);
  }

  values.push(registrationId);

  await query(
    `UPDATE event_registrations SET ${updates.join(', ')} WHERE id = $${values.length}`,
    values,
  );
}
