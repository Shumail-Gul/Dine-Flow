'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download, Copy, Check } from 'lucide-react';

export default function QRCodeGeneratorPage() {
  const [adminId, setAdminId] = useState('');
  const [copied, setCopied] = useState(false);
  const [menuUrl, setMenuUrl] = useState('');

  useEffect(() => {
    // Retrieve user profile stored during login
    const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (user._id) {
      setAdminId(user._id);
      const url = `${window.location.origin}/menu?adminId=${user._id}`;
      setMenuUrl(url);
    }
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `menu-qr-code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
          <QrCode className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Table QR Code</h1>
          <p className="text-xs text-slate-500">Scan or share this link to view your public menu</p>
        </div>
      </div>

      {menuUrl ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl inline-block border border-slate-100">
            <QRCodeSVG
              id="qr-code-svg"
              value={menuUrl}
              size={220}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl text-xs font-mono text-slate-700 overflow-hidden">
            <span className="truncate flex-1 px-2">{menuUrl}</span>
            <button
              onClick={copyToClipboard}
              className="bg-white hover:bg-slate-50 text-slate-900 px-3 py-1.5 rounded-lg font-sans font-bold flex items-center gap-1.5 border border-slate-200 shadow-sm transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={downloadQRCode}
              className="w-full bg-slate-900 hover:bg-amber-600 text-white py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" /> Download Printable QR Code
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
          Loading QR Code details...
        </div>
      )}
    </div>
  );
}