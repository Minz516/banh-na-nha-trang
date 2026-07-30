// Lightweight Markdown → HTML for the admin "view as customer" preview only.
// Not the source of truth for rendering — the storefront renders the real
// published HTML server-side via remark/rehype (apps/storefront/lib/markdown.ts).
// This covers the subset editors actually use (headings, bold/italic, links, lists,
// paragraphs) so the preview is a close approximation, not pixel-perfect.

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*(?!\*)(.+?)\*(?!\*)/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

export function renderMarkdownPreview(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: string[] = [];
  let listBuffer: string[] = [];
  let paragraphBuffer: string[] = [];

  function flushList() {
    if (listBuffer.length === 0) return;
    blocks.push(`<ul>${listBuffer.map((item) => `<li>${inline(item)}</li>`).join('')}</ul>`);
    listBuffer = [];
  }

  function flushParagraph() {
    if (paragraphBuffer.length === 0) return;
    blocks.push(`<p>${paragraphBuffer.map(inline).join('<br/>')}</p>`);
    paragraphBuffer = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line === '') {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      blocks.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    const listItem = /^[-*]\s+(.*)$/.exec(line);
    if (listItem) {
      flushParagraph();
      listBuffer.push(listItem[1]);
      continue;
    }

    flushList();
    paragraphBuffer.push(line);
  }
  flushParagraph();
  flushList();

  return blocks.join('\n');
}
