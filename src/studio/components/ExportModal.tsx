'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  ExternalLink,
  Code2,
  FileImage,
  Sparkles,
  ClipboardCheck,
  SunMoon,
} from 'lucide-react';
import { useCardStore } from '../state/useCardStore';

export const ExportModal: React.FC = () => {
  const { isExportModalOpen, setIsExportModalOpen, repo, config } = useCardStore();
  const [activeTab, setActiveTab] = useState<'download' | 'readme' | 'meta'>('download');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [linkTarget, setLinkTarget] = useState<'gitcardx' | 'github' | 'none'>('gitcardx');
  const [readmeSnippetFormat, setReadmeSnippetFormat] = useState<'markdown' | 'picture'>('picture');

  if (!isExportModalOpen) return null;

  const owner = repo.owner.login;
  const repoName = repo.name;

  const handleCopy = async (text: string, type: string) => {
    let success = false;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        success = true;
      } catch (err) {
        console.warn('navigator.clipboard.writeText failed, using fallback', err);
      }
    }

    if (!success && typeof document !== 'undefined') {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.error('ExecCommand copy failed:', err);
      }
    }

    if (success) {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  const handleCopyImageToClipboard = async () => {
    try {
      setIsExporting(true);
      const res = await fetch('/api/card/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo,
          config,
          format: 'png',
          scale: 1,
        }),
      });

      if (!res.ok) throw new Error('Failed to render card image');
      const blob = await res.blob();

      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopiedType('image');
        setTimeout(() => setCopiedType(null), 2000);
      } else {
        // Fallback: If browser restricts direct image clipboard write, trigger immediate download
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${repoName}-social-preview.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        setCopiedType('image');
        setTimeout(() => setCopiedType(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
      handleDownload('png');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = async (format: 'png' | 'svg' | 'png2x') => {
    try {
      setIsExporting(true);
      const isSvg = format === 'svg';
      const is2x = format === 'png2x';
      const filename = `${repoName}-social-preview${is2x ? '@2x' : ''}.${isSvg ? 'svg' : 'png'}`;

      const res = await fetch('/api/card/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo,
          config,
          format: isSvg ? 'svg' : 'png',
          scale: is2x ? 2 : 1,
        }),
      });

      if (!res.ok) throw new Error('Failed to render export file');

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Export download error:', err);
      alert('Failed to download card file.');
    } finally {
      setIsExporting(false);
    }
  };

  // Determine target link for README snippet
  const targetUrl =
    linkTarget === 'gitcardx'
      ? `https://gitcardx.dev/${owner}/${repoName}?ref=readme`
      : linkTarget === 'github'
        ? `https://github.com/${owner}/${repoName}`
        : null;

  const markdownSnippet = targetUrl
    ? `[![${config.title || repoName}](https://gitcardx.dev/api/card/${owner}/${repoName}.png)](${targetUrl})`
    : `![${config.title || repoName}](https://gitcardx.dev/api/card/${owner}/${repoName}.png)`;

  const pictureSnippet = targetUrl
    ? `<a href="${targetUrl}">\n  <picture>\n    <source media="(prefers-color-scheme: dark)" srcset="https://gitcardx.dev/api/card/${owner}/${repoName}.png?theme=dark" />\n    <source media="(prefers-color-scheme: light)" srcset="https://gitcardx.dev/api/card/${owner}/${repoName}.png?theme=light" />\n    <img src="https://gitcardx.dev/api/card/${owner}/${repoName}.png" alt="${config.title || repoName} Preview" width="100%" />\n  </picture>\n</a>`
    : `<picture>\n  <source media="(prefers-color-scheme: dark)" srcset="https://gitcardx.dev/api/card/${owner}/${repoName}.png?theme=dark" />\n  <source media="(prefers-color-scheme: light)" srcset="https://gitcardx.dev/api/card/${owner}/${repoName}.png?theme=light" />\n  <img src="https://gitcardx.dev/api/card/${owner}/${repoName}.png" alt="${config.title || repoName} Preview" width="100%" />\n</picture>`;

  const htmlMetaSnippet = `<meta property="og:title" content="${config.title || repoName}" />\n<meta property="og:description" content="${config.tagline || repo.description || ''}" />\n<meta property="og:image" content="https://gitcardx.dev/api/card/${owner}/${repoName}.png" />\n<meta property="og:image:width" content="1280" />\n<meta property="og:image:height" content="640" />\n<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:image" content="https://gitcardx.dev/api/card/${owner}/${repoName}.png" />`;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-zinc-100">Export & Integrate Card</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsExportModalOpen(false)}
            className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3 border-b border-zinc-800 flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('download')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'download'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileImage className="w-4 h-4" />
            <span>GitHub Social Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('readme')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'readme'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Dynamic README Hero</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('meta')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'meta'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Website Meta Tags</span>
          </button>
        </div>

        {/* Tab 1: Download */}
        {activeTab === 'download' && (
          <div className="p-6 flex flex-col gap-5">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Download the official <strong className="text-zinc-200">1280×640 px</strong> banner
              ready to upload in your repository settings under{' '}
              <span className="font-mono text-zinc-300 bg-zinc-950 px-1 py-0.5 rounded border border-zinc-800">
                General → Social preview
              </span>
              .
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDownload('png')}
                disabled={isExporting}
                className="p-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Standard PNG</span>
                <span className="text-[10px] opacity-75 font-mono">1280 × 640 px</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownload('png2x')}
                disabled={isExporting}
                className="p-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-100 font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition-all border border-zinc-700 active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Ultra HD (@2x)</span>
                <span className="text-[10px] text-zinc-400 font-mono">2560 × 1280 px</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyImageToClipboard}
                disabled={isExporting}
                className="flex-1 py-2 px-3 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 border border-zinc-700/60 transition-colors cursor-pointer"
              >
                {copiedType === 'image' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied PNG to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Copy PNG to Clipboard</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleDownload('svg')}
                disabled={isExporting}
                className="py-2 px-4 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs font-mono border border-zinc-700/60 transition-colors cursor-pointer"
              >
                Download SVG
              </button>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Need to upload to GitHub?</span>
              <a
                href={`https://github.com/${owner}/${repoName}/settings`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1.5 hover:underline"
              >
                <span>
                  Open {owner}/{repoName} Settings
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Tab 2: Dynamic README Hero */}
        {activeTab === 'readme' && (
          <div className="p-6 flex flex-col gap-4">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Embed this snippet at the top of your repository{' '}
              <span className="font-mono text-zinc-300">README.md</span>. It pulls directly from the
              CDN API and reflects real-time stars, releases, and metrics.
            </p>

            {/* Options Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Format:</span>
                <button
                  type="button"
                  onClick={() => setReadmeSnippetFormat('picture')}
                  className={`px-2 py-1 rounded font-semibold transition-colors ${
                    readmeSnippetFormat === 'picture'
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <SunMoon className="w-3 h-3 inline mr-1" />
                  Dark/Light Adaptive &lt;picture&gt;
                </button>
                <button
                  type="button"
                  onClick={() => setReadmeSnippetFormat('markdown')}
                  className={`px-2 py-1 rounded font-semibold transition-colors ${
                    readmeSnippetFormat === 'markdown'
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Standard Markdown
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Click target:</span>
                <select
                  value={linkTarget}
                  onChange={(e) => setLinkTarget(e.target.value as 'gitcardx' | 'github' | 'none')}
                  className="bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-zinc-200 outline-none"
                >
                  <option value="gitcardx">GitCardX Studio Page</option>
                  <option value="github">GitHub Repo</option>
                  <option value="none">No link (image only)</option>
                </select>
              </div>
            </div>

            {/* Code Block */}
            <div className="relative">
              <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap max-h-48">
                {readmeSnippetFormat === 'picture' ? pictureSnippet : markdownSnippet}
              </pre>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    readmeSnippetFormat === 'picture' ? pictureSnippet : markdownSnippet,
                    'readme'
                  )
                }
                className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedType === 'readme' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Website Meta Tags */}
        {activeTab === 'meta' && (
          <div className="p-6 flex flex-col gap-4">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Include these Open Graph and Twitter Card tags in your documentation or website{' '}
              <span className="font-mono text-zinc-300">&lt;head&gt;</span> to generate
              high-conversion previews across social feeds.
            </p>

            <div className="relative">
              <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap max-h-56">
                {htmlMetaSnippet}
              </pre>
              <button
                type="button"
                onClick={() => handleCopy(htmlMetaSnippet, 'meta')}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedType === 'meta' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
