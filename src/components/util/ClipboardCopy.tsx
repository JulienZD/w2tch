import { useEffect, useRef, useState } from 'react';

type ClipboardCopyProps = {
  text: string;
};

export const ClipboardCopy: React.FC<ClipboardCopyProps> = ({ text }) => {
  const browser = typeof window !== 'undefined';
  const [copied, setCopied] = useState(false);
  const [timeout, setTimeoutRef] = useState<NodeJS.Timeout | undefined>(undefined);

  const ref = useRef<HTMLSpanElement>(null);
  const showClipboard = text && browser && 'clipboard' in navigator;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Thanks to Tim Down for the selection logic: https://stackoverflow.com/a/6150060/16573484
    const selectAllTextContent = () => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      if (!selection) return;

      selection.removeAllRanges();
      selection.addRange(range);
    };

    element.addEventListener('click', selectAllTextContent);

    return () => {
      element.removeEventListener('click', selectAllTextContent);
    };
  }, []);

  const copyTextToClipboard = async () => {
    if (!text || !browser || !('clipboard' in navigator)) return;

    clearTimeout(timeout);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeoutRef(
        setTimeout(() => {
          setCopied(false);
        }, 1250)
      );
    } catch {
      // No clipboard permission
    }
  };

  return (
    <div
      className={`min-h-12 mt-0 flex items-center overflow-x-scroll rounded bg-base-300 pl-2 pr-0 ${
        !text ? 'py-2' : ''
      }`}
    >
      <span className="grow whitespace-nowrap">{text && <span ref={ref}>{text}</span>}</span>
      {showClipboard && (
        <button
          onClick={copyTextToClipboard}
          className={`btn sticky right-0 ml-1 min-w-[4.25rem] rounded-tl-none rounded-bl-none py-2 pl-2 pr-2 text-xs ${
            copied ? 'btn-success' : ''
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      )}
    </div>
  );
};
