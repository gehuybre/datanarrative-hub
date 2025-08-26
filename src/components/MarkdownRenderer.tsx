import React from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Simple markdown parser for basic formatting
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n')
    const elements: JSX.Element[] = []
    let key = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      key++

      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={key} className="text-display-small font-bold mb-6 mt-8 first:mt-0">
            {line.slice(2)}
          </h1>
        )
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={key} className="text-headline-small font-semibold mb-4 mt-8 first:mt-0">
            {line.slice(3)}
          </h2>
        )
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={key} className="text-title-large font-medium mb-3 mt-6 first:mt-0">
            {line.slice(4)}
          </h3>
        )
      }
      // Bullet points
      else if (line.startsWith('• ') || line.startsWith('- ')) {
        const listItems = []
        let j = i
        
        while (j < lines.length && (lines[j].startsWith('• ') || lines[j].startsWith('- '))) {
          listItems.push(lines[j].slice(2))
          j++
        }
        
        elements.push(
          <ul key={key} className="space-y-2 mb-4 ml-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-body-large leading-relaxed flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>{parseInlineMarkdown(item)}</span>
              </li>
            ))}
          </ul>
        )
        
        i = j - 1 // Skip processed lines
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(line)) {
        const listItems = []
        let j = i
        
        while (j < lines.length && /^\d+\.\s/.test(lines[j])) {
          listItems.push(lines[j].replace(/^\d+\.\s/, ''))
          j++
        }
        
        elements.push(
          <ol key={key} className="space-y-2 mb-4 ml-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-body-large leading-relaxed flex items-start">
                <span className="text-primary font-medium mr-3 flex-shrink-0 mt-0.5">
                  {idx + 1}.
                </span>
                <span>{parseInlineMarkdown(item)}</span>
              </li>
            ))}
          </ol>
        )
        
        i = j - 1
      }
      // Empty lines
      else if (line.trim() === '') {
        // Skip empty lines, spacing is handled by margin classes
        continue
      }
      // Regular paragraphs
      else {
        elements.push(
          <p key={key} className="text-body-large leading-relaxed mb-4">
            {parseInlineMarkdown(line)}
          </p>
        )
      }
    }

    return elements
  }

  // Parse inline markdown (bold, italic, links)
  const parseInlineMarkdown = (text: string): JSX.Element | string => {
    // Bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Italic text
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Links (basic implementation)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
    
    // If text contains HTML, render as HTML
    if (text.includes('<')) {
      return <span dangerouslySetInnerHTML={{ __html: text }} />
    }
    
    return text
  }

  return (
    <div className={`prose prose-slate max-w-none ${className || ''}`}>
      {parseMarkdown(content)}
    </div>
  )
}