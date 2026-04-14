import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-lg max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl leading-8 font-bold">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="pt-4 text-xl leading-8 font-semibold">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="pt-2 text-lg leading-6 font-semibold">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="pt-2 pb-4 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-inside list-disc space-y-2 pt-2 pb-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-inside list-decimal space-y-2">{children}</ol>
          ),
          li: ({ children }) => <li className="">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 bg-neutral-50 py-2 pl-4 italic">
              {children}
            </blockquote>
          ),
          code: ({ className, children }) => {
            const isBlock = className?.startsWith("language-");
            if (isBlock) {
              return (
                <pre className="overflow-x-auto rounded-lg p-4">
                  <code className="font-mono text-sm">{children}</code>
                </pre>
              );
            }
            return (
              <code className="rounded px-1 py-0.5 font-mono text-sm">
                {children}
              </code>
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
