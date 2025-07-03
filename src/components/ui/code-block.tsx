import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  children: string;
  className?: string;
  inline?: boolean;
}

const CodeBlock = ({ children, className, inline = false }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const language = className?.replace('language-', '') || 'text';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code className="bg-white/10 text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between bg-gray-800/50 border border-white/10 rounded-t-lg px-4 py-2">
        <span className="text-gray-300 text-sm font-mono">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 w-8 p-0 hover:bg-white/10 opacity-70 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4 text-gray-300" />
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: '0 0 8px 8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderTop: 'none',
          fontSize: '14px',
          lineHeight: '1.5',
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;