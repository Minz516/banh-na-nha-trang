import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

// `remark` (a direct dependency) ships a preconfigured processor already using
// remark-parse — importing `unified`/`remark-parse` directly here fails under
// pnpm's strict node_modules layout since neither is a declared dependency of
// this package, only transitive ones of `remark`/`remark-rehype`.
export async function renderMarkdown(content: string): Promise<string> {
  const file = await remark()
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(content);
  return String(file);
}
