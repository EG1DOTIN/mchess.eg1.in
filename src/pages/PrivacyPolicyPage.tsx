import React, { useEffect } from 'react';
import { ConsentControl } from 'eg-web-core';

export const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | Marwadi Chess';
  }, []);

  return (
    <div className="box-100 bg-E3 main-master snug-top" style={{ marginTop: 0, paddingTop: 0 }}>
      <div className="row body snug-top" style={{ paddingTop: 0, marginTop: 0 }}>
        <div className="box-90 content snug-top" style={{ paddingTop: '20px', marginTop: 0, maxWidth: '1000px', margin: '0 auto', color: '#f8fafc', lineHeight: 1.7 }}>
          <div className="row">
            <div className="col-md-12">
              <h1 style={{ marginTop: 0, marginBottom: '20px', fontSize: '2rem', fontWeight: 700, color: '#f8fafc' }}>
                Privacy Policy
              </h1>
              <p>
                Marwadi Chess ("we", "our", or "us") operates the{' '}
                <a href="https://mchess.eg1.in" style={{ color: '#38bdf8' }}>
                  https://mchess.eg1.in
                </a>{' '}
                website.
              </p>
              <p>
                This page informs you of our policies regarding the collection, use, and disclosure of personal and diagnostic telemetry data when you use our Service (Marwadi Chess website) and the choices you have associated with that data.
              </p>
              <p>
                We use your data to provide, secure, and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy.
              </p>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#38bdf8', marginTop: '28px', marginBottom: '12px' }}>
                Information Collection And Use
              </h2>
              <p>
                We collect several different types of information for various purposes to provide, protect, and optimize our Service to you.
              </p>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc', marginTop: '20px', marginBottom: '8px' }}>
                Types of Data Collected
              </h3>
              <p>
                <strong>Personal Data</strong>
                <br />
                Marwadi Chess is an open educational and interactive portal and does not require user account registration, logins, or contact form submissions. If you choose to contact us directly via{' '}
                <a href="https://eg1.in/contact" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>
                  our contact page
                </a>
                , we use your submitted inquiry solely to respond to your request.
              </p>
              <p>
                <strong>Website Analytics &amp; Usage Data</strong>
                <br />
                When you access our Service, we automatically collect non-invasive telemetry and usage data ("Usage Data") to understand website traffic patterns and optimize user experience. This includes:
              </p>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                <li>
                  <strong>Device &amp; Browser Information:</strong> Operating system (e.g., Windows, macOS, Android, iOS, Linux, ChromeOS), browser type, browser version, preferred language, and screen resolution.
                </li>
                <li>
                  <strong>Network &amp; Approximate Location:</strong> Public Internet Protocol (IP) address, approximate geographic location (city, region, country, postal area), and Internet Service Provider (ISP) / Autonomous System (Org). We do <strong>not</strong> collect precise GPS coordinates.
                </li>
                <li>
                  <strong>Browsing Activity:</strong> Pages visited within our website, landing page, referring website, and timestamp of the visit.
                </li>
                <li>
                  <strong>Session Identifiers:</strong> Anonymous, temporary session tokens stored in browser <code>sessionStorage</code> to prevent duplicate traffic logging during a single browsing session.
                </li>
              </ul>
              <p>
                <strong>No Sale of Data Guarantee</strong>
                <br />
                We strictly respect your privacy.{' '}
                <strong>
                  We do NOT sell, rent, monetize, or trade visitor analytics or personal data with any third-party advertisers, brokers, or external entities.
                </strong>
              </p>
              <p>
                <strong>Tracking &amp; Storage Technologies</strong>
                <br />
                We use browser <code>sessionStorage</code> and <code>localStorage</code> to manage sessions, remember user preferences (such as chessboard settings and themes), and securely operate our Service. Unlike tracking cookies, our session storage does not follow you across third-party websites.
              </p>
              <p>
                <strong>Analytics Notice &amp; Opt-Out Choice</strong>
                <br />
                When you visit our website, a notice is presented informing you: <em>"We collect anonymous information to optimize tools/Apps performance."</em> with prominent <strong>[Decline]</strong> and <strong>[OK]</strong> buttons. Clicking <strong>Decline</strong> immediately halts telemetry collection and stores an opt-out flag in your browser's <code>localStorage</code> so no tracking occurs during future visits.
              </p>

              <div style={{ marginTop: '20px', marginBottom: '28px' }}>
                <ConsentControl title="Analytics & Telemetry Preferences" />
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#38bdf8', marginTop: '28px', marginBottom: '12px' }}>
                Use of Data
              </h2>
              <p>Marwadi Chess uses the collected data for legitimate operational purposes:</p>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                <li>To provide, operate, and maintain the Service</li>
                <li>To respond to your inquiries and support requests</li>
                <li>To monitor website traffic trends, aggregate visitor demographics, and optimize page performance</li>
                <li>To detect, prevent, and mitigate security threats, spam, bot attacks, and unauthorized access</li>
                <li>To analyze how our chess puzzles, opening traps, and educational articles are utilized</li>
              </ul>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#38bdf8', marginTop: '28px', marginBottom: '12px' }}>
                Transfer Of Data
              </h2>
              <p>
                Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.
              </p>
              <p>
                If you are located outside India and choose to provide information to us, please note that we transfer the data, including Personal Data, to India and process it there.
              </p>
              <p>
                Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
              </p>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#38bdf8', marginTop: '28px', marginBottom: '12px' }}>
                Disclosure Of Data &amp; Security
              </h2>
              <p>
                Marwadi Chess may disclose your Personal Data in the good faith belief that such action is necessary to comply with a legal obligation, protect and defend rights or property, or protect personal safety.
              </p>
              <p>
                The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure.
              </p>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#38bdf8', marginTop: '28px', marginBottom: '12px' }}>
                Contact
              </h2>
              <p>
                If you have any questions about this privacy policy, please contact us at{' '}
                <a href="https://eg1.in/contact" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>
                  https://eg1.in/contact
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
