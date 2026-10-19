/** Bangladeshi NCTB-aligned class levels and subjects for coaching. */

export const CLASS_OPTIONS = [
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "SSC",
  "HSC",
] as const;

export type ClassOption = (typeof CLASS_OPTIONS)[number];

export const DEFAULT_CLASS: ClassOption = "Class 6";

/** Junior secondary — Class 6–8 */
const JUNIOR_SUBJECTS = [
  "Bangla",
  "English",
  "Mathematics",
  "Science",
  "Bangladesh and Global Studies",
  "ICT",
  "Religion and Moral Education",
  "Physical Education and Health",
  "Arts and Crafts",
] as const;

/** Secondary — Class 9–10 / SSC */
const SECONDARY_SUBJECTS = [
  "Bangla",
  "English",
  "General Mathematics",
  "Higher Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "ICT",
  "Bangladesh and Global Studies",
  "Religion and Moral Education",
  "Accounting",
  "Business Entrepreneurship",
  "Finance and Banking",
  "Civics and Citizenship",
  "History",
  "Geography",
  "Economics",
] as const;

/** Higher secondary — Class 11–12 / HSC */
const HIGHER_SECONDARY_SUBJECTS = [
  "Bangla",
  "English",
  "ICT",
  "Physics",
  "Chemistry",
  "Biology",
  "Higher Mathematics",
  "Accounting",
  "Business Organization and Management",
  "Finance, Banking and Insurance",
  "Economics",
  "History",
  "Islamic History and Culture",
  "Civics and Good Governance",
  "Geography",
  "Logic",
  "Sociology",
  "Statistics",
] as const;

export type CurriculumLevel = "junior" | "secondary" | "higher";

export function getCurriculumLevel(className: string): CurriculumLevel {
  if (className === "HSC" || className === "Class 11" || className === "Class 12") {
    return "higher";
  }
  if (
    className === "SSC" ||
    className === "Class 9" ||
    className === "Class 10"
  ) {
    return "secondary";
  }
  return "junior";
}

export function getSubjectsForClass(className: string): readonly string[] {
  const level = getCurriculumLevel(className);
  if (level === "higher") return HIGHER_SECONDARY_SUBJECTS;
  if (level === "secondary") return SECONDARY_SUBJECTS;
  return JUNIOR_SUBJECTS;
}

/** Unique subject names across all BD curriculum levels (for seeding). */
export const ALL_CURRICULUM_SUBJECTS: string[] = Array.from(
  new Set([
    ...JUNIOR_SUBJECTS,
    ...SECONDARY_SUBJECTS,
    ...HIGHER_SECONDARY_SUBJECTS,
  ]),
);
