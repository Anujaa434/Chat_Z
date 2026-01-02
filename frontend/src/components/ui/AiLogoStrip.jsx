// src/components/ui/AiLogoStrip.jsx
import React from "react";
import { GoCopilot } from "react-icons/go";

/* --- AI ICONS --- */

const GeminiLogo = () => (
  <svg
    className="ai-logo-icon-svg"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
  >
    <path
      d="M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z"
      fill="url(#gemi_grad)"
    />
    <defs>
      <radialGradient
        id="gemi_grad"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="matrix(16.1326 5.4553 -43.70045 129.2322 1.588 6.503)"
      >
        <stop offset=".067" stopColor="#9168C0" />
        <stop offset=".343" stopColor="#5684D1" />
        <stop offset=".672" stopColor="#1BA1E3" />
      </radialGradient>
    </defs>
  </svg>
);

const ClaudeLogo = () => (
  <svg
    className="ai-logo-icon-svg"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
  >
    <rect fill="#CC9B7A" width="512" height="512" rx="104.187" ry="105.042" />
    <path
      fill="#1F1F1E"
      fillRule="nonzero"
      d="M318.663 149.787h-43.368l78.952 212.423 43.368.004-78.952-212.427zm-125.326 0l-78.952 212.427h44.255l15.932-44.608 82.846-.004 16.107 44.612h44.255l-79.126-212.427h-45.317zm-4.251 128.341l26.91-74.701 27.083 74.701h-53.993z"
    />
  </svg>
);

const OpenAILogo = () => (
  <svg
    className="ai-logo-icon-svg"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M26.153 11.46a6.888 6.888 0 0 0-.608-5.73 7.117 7.117 0 0 0-3.29-2.93 7.238 7.238 0 0 0-4.41-.454 7.065 7.065 0 0 0-2.41-1.742A7.15 7.15 0 0 0 12.514 0a7.216 7.216 0 0 0-4.217 1.346 7.061 7.061 0 0 0-2.603 3.539 7.12 7.12 0 0 0-2.734 1.188A7.012 7.012 0 0 0 .966 8.268a6.979 6.979 0 0 0 .88 8.273 6.89 6.89 0 0 0 .607 5.729 7.117 7.117 0 0 0 3.29 2.93 7.238 7.238 0 0 0 4.41.454 7.061 7.061 0 0 0 2.409 1.742c.92.404 1.916.61 2.923.604a7.215 7.215 0 0 0 4.22-1.345 7.06 7.06 0 0 0 2.605-3.543 7.116 7.116 0 0 0 2.734-1.187 7.01 7.01 0 0 0 1.993-2.196 6.978 6.978 0 0 0-.884-8.27Z"
      fill="currentColor"
    />
  </svg>
);

const MetaIconOutline = () => (
  <svg
    className="ai-logo-icon-svg"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 287.56 191"
  >
    <path
      fill="#0081fb"
      d="M31.06,126c0,11,2.41,19.41,5.56,24.51A19,19,0,0,0,53.19,160c8.1,0,15.51-2,29.79-21.76..."
    />
  </svg>
);

const SparkLogo = () => (
  <span className="ai-logo-icon-svg" style={{ fontSize: 26 }}>
    ✨
  </span>
);

/* order of AIs in the loop */
const logos = [
  <GeminiLogo />,
  <ClaudeLogo />,
  <OpenAILogo />,
  <GoCopilot className="ai-logo-icon-svg" />,
  <MetaIconOutline />,
  <SparkLogo />,
];

export default function AiLogoStrip() {
  // duplicate logos so CSS can loop seamlessly
  const all = [...logos, ...logos];

  return (
    <div className="ai-strip-root">
      {/* center block: strip + small caption */}
      <div className="ai-strip-center">
        <div className="ai-strip-viewport">
          <div className="ai-strip-track">
            {all.map((logo, i) => (
              <div className="ai-logo-chip" key={i}>
                <div className="ai-logo-icon">{logo}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="ai-strip-caption">
          All your favourite AI models in one workspace.
        </p>
      </div>

      {/* bottom: ChatZ pill + description */}
      <div className="ai-strip-footer">
        <span className="brand-pill">CHATZ</span>
        <p className="overlay-text">
          Your personal AI assistant workspace.
        </p>
      </div>
    </div>
  );
}
