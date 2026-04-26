import { useState } from "react";


export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-2xl font-semibold mb-3">What We Collect</h2>
          <p className="mb-3">
            When you consent to analytics, we collect anonymous usage data including:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Page views and navigation patterns</li>
            <li>Feature usage statistics</li>
            <li>Device type and browser information</li>
            <li>Session duration and interaction times</li>
            <li>Geographic location (country/region only)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">What We Don't Collect</h2>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Personal information (names, emails, addresses)</li>
            <li>Financial data or transaction details</li>
            <li>Wallet addresses or private keys</li>
            <li>IP addresses (we use anonymized tracking)</li>
            <li>Any data that could identify you personally</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">How We Use Your Data</h2>
          <p className="mb-3">
            The anonymous data helps us:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Improve user experience and interface design</li>
            <li>Identify and fix technical issues</li>
            <li>Understand which features are most valuable</li>
            <li>Optimize performance and loading times</li>
            <li>Make data-driven product decisions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Your Control</h2>
          <p className="mb-3">
            You have full control over your privacy:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>You can opt-out at any time</li>
            <li>Your choice is stored locally in your browser</li>
            <li>No cookies are used for tracking</li>
            <li>You can clear your consent choice by clearing browser data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Data Security</h2>
          <p>
            All data is transmitted securely and stored with industry-standard encryption. 
            We never sell or share your data with third parties. Analytics data is aggregated 
            and cannot be traced back to individual users.
          </p>
        </section>
      </div>
    </div>
  );
}
