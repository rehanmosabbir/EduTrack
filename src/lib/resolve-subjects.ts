import { createSubject } from "@/services/api";
import { findSubjectIdByName } from "@/lib/curriculum";

/**
 * Resolve curriculum subject names to DB ids, creating missing subjects.
 */
export async function resolveSubjectIds(
  names: string[],
  existing: Array<{ id: string; name: string }>,
  onCreated?: () => void | Promise<void>,
): Promise<string[]> {
  const ids: string[] = [];
  let createdAny = false;
  const known = [...existing];

  for (const name of names) {
    const foundId = findSubjectIdByName(known, name);
    if (foundId) {
      ids.push(foundId);
      continue;
    }
    const created = await createSubject({
      name,
      description: "Bangladeshi NCTB curriculum",
    });
    known.push(created);
    ids.push(created.id);
    createdAny = true;
  }

  if (createdAny && onCreated) await onCreated();
  return ids;
}
