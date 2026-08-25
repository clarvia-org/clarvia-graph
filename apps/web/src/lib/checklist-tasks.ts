import { readFile } from "node:fs/promises";
import path from "node:path";

type RuntimeSource = { id: string; title: string; url?: string };
type RuntimeTask = {
  id: string;
  title: string;
  rendering?: { user_visible_caveat?: string | null };
};
type RuntimeConsequence = {
  title: string;
  distribution_status?: string;
  task_template_refs?: string[];
  source_refs?: string[];
};

export type PublicChecklistTask = {
  id: string;
  title: string;
  description: string;
  sourceUrl?: string;
  sourceTitle?: string;
};

export async function loadPublicChecklistTasks(): Promise<PublicChecklistTask[]> {
  const file = path.join(process.cwd(), "public/data/clarvia/runtime/bereavement.json");
  const raw = JSON.parse(await readFile(file, "utf8")) as {
    task_templates?: RuntimeTask[];
    consequences?: RuntimeConsequence[];
    sources?: RuntimeSource[];
  };

  const sources = new Map((raw.sources ?? []).map((source) => [source.id, source]));
  const tasks = raw.task_templates ?? [];

  return tasks.map((task) => {
    const consequence = (raw.consequences ?? []).find((item) =>
      (item.task_template_refs ?? []).includes(task.id)
    );
    const source = consequence?.source_refs?.map((id) => sources.get(id)).find((item) => item?.url);
    return {
      id: task.id,
      title: task.title,
      description: task.rendering?.user_visible_caveat || consequence?.title || task.title,
      sourceUrl: source?.url,
      sourceTitle: source?.title,
    };
  });
}
