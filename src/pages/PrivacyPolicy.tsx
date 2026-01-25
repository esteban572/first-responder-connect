import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Paranet</span>
          </Link>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last Updated: January 24, 2026</p>

          <div className="prose prose-indigo max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to Paranet ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our first responder networking platform.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                By using Paranet, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Account Information:</strong> Name, email address, password, profile photo, and professional details</li>
                <li><strong>Profile Information:</strong> Department, rank, certifications, credentials, years of service, and bio</li>
                <li><strong>Content:</strong> Posts, comments, messages, photos, videos, and other content you create or share</li>
                <li><strong>Credentials:</strong> Professional certifications, training records, and license information</li>
                <li><strong>Organization Information:</strong> Agency name, department details, and organizational affiliations</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Usage Data:</strong> Pages viewed, features used, time spent, and interaction patterns</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
                <li><strong>Location Data:</strong> General location based on IP address (we do not track precise GPS location)</li>
                <li><strong>Cookies and Tracking:</strong> Session data, preferences, and analytics information</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.3 Information from Third Parties</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>OAuth Providers:</strong> When you sign in with Google, we receive your name, email, and profile photo</li>
                <li><strong>Payment Processors:</strong> Billing information processed through Stripe (we do not store credit card details)</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">We use your information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Provide Services:</strong> Create and manage your account, enable networking features, and deliver platform functionality</li>
                <li><strong>Communication:</strong> Send notifications, alerts, updates, and respond to your inquiries</li>
                <li><strong>Personalization:</strong> Customize your experience, recommend connections, and show relevant content</li>
                <li><strong>Safety and Security:</strong> Verify credentials, prevent fraud, enforce policies, and protect user safety</li>
                <li><strong>Analytics:</strong> Understand usage patterns, improve features, and optimize performance</li>
                <li><strong>Legal Compliance:</strong> Comply with legal obligations and respond to lawful requests</li>
                <li><strong>Marketing:</strong> Send promotional content (you can opt out at any time)</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Share Your Information</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 With Other Users</h3>
              <p className="text-gray-700 leading-relaxed">
                Your profile information, posts, and public content are visible to other verified first responders on the platform. You can control visibility settings in your account preferences.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 With Service Providers</h3>
              <p className="text-gray-700 leading-relaxed">
                We share information with trusted third-party service providers who help us operate our platform:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
                <li><strong>Supabase:</strong> Database and authentication services</li>
                <li><strong>Vercel:</strong> Hosting and deployment</li>
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>Analytics Providers:</strong> Usage analytics and performance monitoring</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.3 Legal Requirements</h3>
              <p className="text-gray-700 leading-relaxed">
                We may disclose your information if required by law, court order, or government request, or to protect the rights, property, or safety of Paranet, our users, or the public.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.4 Business Transfers</h3>
              <p className="text-gray-700 leading-relaxed">
                If Paranet is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
              </p>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                <li>Encryption of data in transit (HTTPS/TLS)</li>
                <li>Encryption of sensitive data at rest</li>
                <li>Secure authentication with OAuth 2.0</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and monitoring</li>
                <li>Secure password hashing (bcrypt)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            {/* Your Rights and Choices */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights and Choices</h2>
              <p className="text-gray-700 leading-relaxed mb-4">You have the following rights regarding your information:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails</li>
                <li><strong>Privacy Settings:</strong> Control who can see your profile and content</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise these rights, contact us at <a href="mailto:privacy@paranet.tech" className="text-indigo-600 hover:underline">privacy@paranet.tech</a>
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your information for as long as your account is active or as needed to provide services. When you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal or regulatory purposes.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Paranet is not intended for users under 18 years of age. We do not knowingly collect information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            {/* International Users */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Users</h2>
              <p className="text-gray-700 leading-relaxed">
                Paranet is based in the United States. If you access our services from outside the U.S., your information may be transferred to, stored, and processed in the U.S. By using our services, you consent to this transfer.
              </p>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                <li>Keep you signed in</li>
                <li>Remember your preferences</li>
                <li>Analyze usage patterns</li>
                <li>Improve platform performance</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                You can control cookies through your browser settings, but disabling cookies may affect platform functionality.
              </p>
            </section>

            {/* Third-Party Links */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Third-Party Links</h2>
              <p className="text-gray-700 leading-relaxed">
                Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice on our platform. Your continued use of Paranet after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions or concerns about this Privacy Policy, please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> <a href="mailto:privacy@paranet.tech" className="text-indigo-600 hover:underline">privacy@paranet.tech</a></p>
                <p className="text-gray-700 mt-2"><strong>Website:</strong> <a href="https://paranet.tech" className="text-indigo-600 hover:underline">https://paranet.tech</a></p>
              </div>
            </section>

            {/* California Privacy Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. California Privacy Rights (CCPA)</h2>
              <p className="text-gray-700 leading-relaxed">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to opt-out of the sale of personal information (we do not sell your information)</li>
                <li>Right to deletion of personal information</li>
                <li>Right to non-discrimination for exercising your rights</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise these rights, contact us at <a href="mailto:privacy@paranet.tech" className="text-indigo-600 hover:underline">privacy@paranet.tech</a>
              </p>
            </section>

            {/* GDPR Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. European Privacy Rights (GDPR)</h2>
              <p className="text-gray-700 leading-relaxed">
                If you are in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                <li>Right of access to your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise these rights, contact us at <a href="mailto:privacy@paranet.tech" className="text-indigo-600 hover:underline">privacy@paranet.tech</a>
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t">
            <p className="text-center text-gray-600">
              Thank you for trusting Paranet with your information. We are committed to protecting your privacy.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Link to="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
              <Link to="/terms">
                <Button variant="outline">Terms of Service</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
