'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { ComponentPropsWithoutRef } from 'react'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-docs max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Headings
          h1: ({ children, ...props }) => (
            <h1
              className="text-3xl font-bold text-[var(--color-heading)] mb-6 pb-4 border-b border-[var(--color-border)]"
              {...props}
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              className="text-2xl font-semibold text-[var(--color-heading)] mt-10 mb-4 pb-2 border-b border-[var(--color-border)]"
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3
              className="text-xl font-semibold text-[var(--color-heading)] mt-8 mb-3"
              {...props}
            >
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4
              className="text-lg font-medium text-[var(--color-heading)] mt-6 mb-2"
              {...props}
            >
              {children}
            </h4>
          ),

          // Paragraphs
          p: ({ children, ...props }) => (
            <p className="text-[var(--color-foreground)] leading-7 mb-4" {...props}>
              {children}
            </p>
          ),

          // Links
          a: ({ children, href, ...props }) => (
            <a
              href={href}
              className="text-[var(--color-primary)] hover:text-[var(--color-primary-strong)] underline decoration-[var(--color-primary)]/30 hover:decoration-[var(--color-primary)] transition-colors"
              {...props}
            >
              {children}
            </a>
          ),

          // Lists
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-outside ml-6 mb-4 space-y-2 text-[var(--color-foreground)]" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-outside ml-6 mb-4 space-y-2 text-[var(--color-foreground)]" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="text-[var(--color-foreground)] leading-7" {...props}>
              {children}
            </li>
          ),

          // Code blocks
          pre: ({ children, ...props }) => (
            <pre
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 overflow-x-auto mb-4 text-sm"
              {...props}
            >
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }: ComponentPropsWithoutRef<'code'> & { inline?: boolean }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code
                  className="bg-[var(--color-primary-soft)] text-[var(--color-primary)] px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return (
              <code className={`${className} text-sm`} {...props}>
                {children}
              </code>
            )
          },

          // Tables
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto mb-6">
              <table
                className="min-w-full border border-[var(--color-border)] rounded-xl overflow-hidden"
                {...props}
              >
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-[var(--color-surface)]" {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody className="divide-y divide-[var(--color-border)]" {...props}>
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr className="hover:bg-[var(--color-surface)]/50 transition-colors" {...props}>
              {children}
            </tr>
          ),
          th: ({ children, ...props }) => (
            <th
              className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-heading)] border-b border-[var(--color-border)]"
              {...props}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="px-4 py-3 text-sm text-[var(--color-foreground)]" {...props}>
              {children}
            </td>
          ),

          // Blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-4 border-[var(--color-primary)] bg-[var(--color-primary-soft)] pl-4 py-3 pr-4 my-4 rounded-r-lg"
              {...props}
            >
              {children}
            </blockquote>
          ),

          // Horizontal rule
          hr: ({ ...props }) => (
            <hr className="border-[var(--color-border)] my-8" {...props} />
          ),

          // Strong and emphasis
          strong: ({ children, ...props }) => (
            <strong className="font-semibold text-[var(--color-heading)]" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic" {...props}>
              {children}
            </em>
          ),

          // Images
          img: ({ src, alt, ...props }) => (
            <img
              src={src}
              alt={alt}
              className="rounded-xl border border-[var(--color-border)] my-4 max-w-full"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
