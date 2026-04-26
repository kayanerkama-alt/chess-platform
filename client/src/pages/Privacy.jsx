import React from 'react';

export default function Privacy() {
  return (
    <div className="legal-page">
      <h1>Privacy Policy</h1>
      <p className="legal-updated">Last updated: 2023</p>

      <section>
        <h2>Introduction</h2>
        <p>
          UCX Chess Platform ("we", "our", "us") is committed to protecting your privacy. 
          This Privacy Policy explains how we collect, use, and safeguard your information 
          when you use our chess platform. This project was founded in 2023 by Kayan Erkama 
          as part of the UCX initiative.
        </p>
      </section>

      <section>
        <h2>Information We Collect</h2>
        <p>We collect only the minimum information necessary to provide our service:</p>
        <ul>
          <li><strong>Username:</strong> A username you choose during registration.</li>
          <li><strong>Password:</strong> Your password is hashed using bcrypt (12 rounds) and never stored in plain text.</li>
          <li><strong>Game Data:</strong> Your chess game history and preferences.</li>
        </ul>
        <p>We do <strong>NOT</strong> collect:</p>
        <ul>
          <li>Email addresses</li>
          <li>Real names</li>
          <li>Location data</li>
          <li>Device fingerprints</li>
          <li>Browsing history</li>
          <li>Any third-party analytics or tracking data</li>
        </ul>
      </section>

      <section>
        <h2>How We Protect Your Data</h2>
        <ul>
          <li>All passwords are hashed with bcrypt (12 salt rounds).</li>
          <li>Authentication uses secure HTTP-only cookies with strict SameSite policy.</li>
          <li>JWT tokens are signed with cryptographically secure keys.</li>
          <li>The database uses WAL mode for data integrity.</li>
          <li>Encryption keys are stored securely in the database and persist across server restarts.</li>
          <li>All data is stored in an encrypted SQLite database on the server.</li>
        </ul>
      </section>

      <section>
        <h2>No Ads or Tracking</h2>
        <p>
          UCX Chess Platform does not display advertisements, use tracking pixels, 
          employ third-party analytics services, or share any data with third parties. 
          We do not use cookies for tracking purposes - only for essential authentication.
        </p>
      </section>

      <section>
        <h2>Data Retention</h2>
        <p>
          Your account data is retained as long as your account exists. You may request 
          deletion of your account and all associated data at any time.
        </p>
      </section>

      <section>
        <h2>Your Rights</h2>
        <ul>
          <li>Right to access your personal data</li>
          <li>Right to delete your account and all associated data</li>
          <li>Right to export your game history</li>
          <li>Right to modify your account settings</li>
        </ul>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          For any privacy-related inquiries, please reach out through the UCX project channels.
        </p>
      </section>
    </div>
  );
}
