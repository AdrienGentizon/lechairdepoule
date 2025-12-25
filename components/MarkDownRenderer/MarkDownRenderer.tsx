import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-6 text-4xl font-bold text-gray-900">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-gray-800">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-3 mt-6 text-xl font-semibold text-gray-800">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed text-gray-700">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 ml-4 list-inside list-disc space-y-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-4 list-inside list-decimal space-y-2">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="text-gray-700">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-blue-500 bg-gray-50 py-2 pl-4 italic text-gray-600">
              {children}
            </blockquote>
          ),
          code: ({ inline, children }: any) => {
            if (inline) {
              return (
                <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm">
                  {children}
                </code>
              );
            }
            return (
              <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-100 p-4">
                <code className="font-mono text-sm">{children}</code>
              </pre>
            );
          },
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 underline transition-colors hover:text-blue-800 hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
