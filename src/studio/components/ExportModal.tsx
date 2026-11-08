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
} from 'lucide-react';
import { useCardStore } from '../state/useCardStore';

export const ExportModal: React.FC = () => {
  const { isExportModalOpen, setIsExportModalOpen, repo, config } = useCardStore();
  const [activeTab, setActiveTab] = useState<'download' | 'readme' | 'meta'>('download');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isExportModalOpen) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownload = async (format: 'png' | 'svg' | 'png2x') => {
    try {
      setIsExporting(true);
      // In Milestone 5, the full dynamic export endpoint /api/card/[owner]/[repo] will be live
      // For Milestone 3 client download, we can trigger client-side SVG download or API fetch
      const filename = `${repo.name}-social-preview.${format === 'svg' ? 'svg' : 'png'}`;

      // Call API export or fallback
      const url = `/api/card/${repo.owner.login}/${repo.name}?format=${format === 'svg' ? 'svg' : 'png'}&scale=${format === 'png2x' ? '2' : '1'}`;
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(blobUrl);
      } else {
        // Fallback info notification
        alert(`Direct image download will be fully active in Milestone 5. You can copy the dynamic README snippet now!`);
      }
    } catch {
      alert(`Exporting format ${format}...`);
    } finally {
      setIsExporting(false);
    }
  };

  const markdownSnippet = `[![${config.title || repo.name}](https://gitcardx.dev/api/card/${repo.owner.login}/${repo.name})](https://gitcardx.dev/${repo.owner.login}/${repo.name})`;

  const htmlMetaSnippet = `<meta property="og:image" content="https://gitcardx.dev/api/card/${repo.owner.login}/${repo.name}" />\n<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:image" content="https://gitcardx.dev/api/card/${repo.owner.login}/${repo.name}" />`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-zinc-100">Export Repository Card</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsExportModalOpen(false)}
            className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="px-6 pt-3 border-b border-zinc-800 flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('download')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
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
            className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
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
            className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'meta'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Website Meta Tags</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5">
          {activeTab === 'download' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Download the official <strong className="text-zinc-200">1280×640 px</strong> banner ready to be uploaded in your repository settings under <span className="font-mono text-zinc-300">General → Social preview</span>.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDownload('png')}
                  disabled={isExporting}
                  className="p-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/20 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Standard PNG</span>
                  <span className="text-[10px] opacity-75 font-mono">1280 × 640 px</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload('png2x')}
                  disabled={isExporting}
                  className="p-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition-all border border-zinc-700 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Ultra HD (@2x)</span>
                  <span className="text-[10px] text-zinc-400 font-mono">2560 × 1280 px</span>
                </button>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <a
                  href={`https://github.com/${repo.owner.login}/${repo.name}/settings`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 hover:underline"
                >
                  <span>Go to GitHub Repo Settings</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => handleDownload('svg')}
                  className="text-xs text-zinc-400 hover:text-zinc-200 font-mono"
                >
                  Download raw SVG
                </button>
              </div>
            </div>
          )}

          {activeTab === 'readme' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Paste this snippet at the very top of your repository <span className="font-mono text-zinc-300">README.md</span> to display a real-time banner that updates automatically whenever your repo gets new stars or releases.
              </p>

              <div className="relative">
                <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                  {markdownSnippet}
                </pre>
                <button
                  type="button"
                  onClick={() => handleCopy(markdownSnippet, 'readme')}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1 transition-colors"
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

          {activeTab === 'meta' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Add these Open Graph tags to your project documentation or homepage <span className="font-mono text-zinc-300">&lt;head&gt;</span> to generate high-conversion preview cards when shared on X, LinkedIn, Discord, and Slack.
              </p>

              <div className="relative">
                <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                  {htmlMetaSnippet}
                </pre>
                <button
                  type="button"
                  onClick={() => handleCopy(htmlMetaSnippet, 'meta')}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1 transition-colors"
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
    </div>
  );
};
