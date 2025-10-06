"use client";

import { useEffect } from "react";

export default function BotpressWidget() {
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.botpressWebChat) {
      const script = document.createElement('script');
      script.src = 'https://cdn.botpress.cloud/webchat/v3.3/webchat.js';
      script.async = true;
      script.onload = () => {
        // Poll until botpressWebChat is available
        const interval = setInterval(() => {
          if (window.botpressWebChat && window.botpressWebChat.init) {
            window.botpressWebChat.init({
              configUrl: 'https://files.bpcontent.cloud/2025/10/03/18/20251003181438-DXJX8HLH.json'
            });
            clearInterval(interval);
          }
        }, 100);
      };
      document.body.appendChild(script);
    }
  }, []);

  return null;
}