import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const TermsOfService = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last Updated: January 24, 2026</p>

          <div className="prose prose-indigo max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to Paranet! These Terms of Service ("Terms") govern your access to and use of Paranet's website, mobile application, and services (collectively, the "Platform"). By accessing or using the Platform, you agree to be bound by these Terms and our Privacy Policy.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                If you do not agree to these Terms, you may not access or use the Platform. We reserve the right to modify these Terms at any time, and your continued use of the Platform constitutes acceptance of any changes.
              </p>
            </section>

            {/* Eligibility */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Eligibility</h2>
              <p className="text-gray-700 leading-relaxed">
                To use Paranet, you must:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                <li>Be at least 18 years of age</li>
                <li>Be a current or former first responder (law enforcement, fire service, EMS, dispatch, or related field)</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                We reserve the right to verify your first responder status and may request documentation or credentials. Accounts found to be fraudulent or misrepresenting affiliation will be terminated immediately.
              </p>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Account Registration and Security</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Account Creation</h3>
              <p className="text-gray-700 leading-relaxed">
                You may create an account using your email address or through third-party authentication providers (e.g., Google). You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.2 Account Security</h3>
              <p className="text-gray-700 leading-relaxed">
                You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
                <li>Use a strong, unique password</li>
                <li>Not share your account credentials with others</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Log out from shared or public devices</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.3 Account Termination</h3>
              <p className="text-gray-700 leading-relaxed">
                You may delete your account at any time through your account settings. We may suspend or terminate your account if you violate these Terms or engage in prohibited conduct.
              </p>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Permitted Uses</h3>
              <p className="text-gray-700 leading-relaxed">
                Paranet is designed for professional networking, knowledge sharing, and community building among first responders. You may use the Platform to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
                <li>Connect with other verified first responders</li>
                <li>Share professional experiences and insights</li>
                <li>Seek and provide career advice</li>
                <li>Discuss industry news and best practices</li>
                <li>Participate in training and educational content</li>
                <li>Search for job opportunities</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 Prohibited Conduct</h3>
              <p className="text-gray-700 leading-relaxed">
                You agree NOT to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
                <li><strong>Harassment:</strong> Harass, bully, threaten, or intimidate other users</li>
                <li><strong>Hate Speech:</strong> Post content that promotes hatred, violence, or discrimination</li>
                <li><strong>Misinformation:</strong> Spread false or misleading information</li>
                <li><strong>Illegal Activity:</strong> Use the Platform for any illegal purpose</li>
                <li><strong>Impersonation:</strong> Impersonate another person or organization</li>
                <li><strong>Spam:</strong> Send unsolicited messages or promotional content</li>
                <li><strong>Confidential Information:</strong> Share classified, sensitive, or confidential information</li>
                <li><strong>Intellectual Property:</strong> Violate copyrights, trademarks, or other intellectual property rights</li>
                <li><strong>Malicious Code:</strong> Upload viruses, malware, or harmful code</li>
                <li><strong>Scraping:</strong> Use automated tools to scrape or collect data</li>
                <li><strong>Account Manipulation:</strong> Create fake accounts or manipulate engagement metrics</li>
                <li><strong>Interference:</strong> Interfere with the Platform's operation or security</li>
              </ul>
            </section>

            {/* Content and Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Content and Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Your Content</h3>
              <p className="text-gray-700 leading-relaxed">
                You retain ownership of content you post on Paranet ("User Content"). By posting User Content, you grant Paranet a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, distribute, and display your content in connection with operating and promoting the Platform.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.2 Content Responsibility</h3>
              <p className="text-gray-700 leading-relaxed">
                You are solely responsible for your User Content. You represent and warrant that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
                <li>You own or have the necessary rights to post the content</li>
                <li>Your content does not violate any laws or third-party rights</li>
                <li>Your content is accurate and not misleading</li>
                <li>Your content does not contain confidential or classified information</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.3 Content Moderation</h3>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to review, remove, or modify any User Content that violates these Terms or is otherwise objectionable. We may also remove content in response to legal requests or to protect the safety of our users.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.4 Paranet's Intellectual Property</h3>
              <p className="text-gray-700 leading-relaxed">
                The Platform, including its design, features, code, and content (excluding User Content), is owned by Paranet and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            {/* Privacy and Data */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Privacy and Data Protection</h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Our collection and use of personal information is governed by our <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>. By using the Platform, you consent to our data practices as described in the Privacy Policy.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                You acknowledge that information you share on your profile and in public posts may be visible to other users. Use privacy settings to control who can see your information.
              </p>
            </section>

            {/* Subscriptions and Payments */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Subscriptions and Payments</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Free and Paid Services</h3>
              <p className="text-gray-700 leading-relaxed">
                Paranet offers both free and paid subscription tiers. Paid subscriptions provide access to premium features such as advanced analytics, priority support, and enhanced visibility.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.2 Billing</h3>
              <p className="text-gray-700 leading-relaxed">
                Subscription fees are billed in advance on a monthly or annual basis. By subscribing, you authorize us to charge your payment method for the applicable fees. All fees are non-refundable except as required by law.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.3 Cancellation</h3>
              <p className="text-gray-700 leading-relaxed">
                You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing period. You will continue to have access to paid features until the end of the billing period.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.4 Price Changes</h3>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to change subscription prices with 30 days' notice. Price changes will apply to subsequent billing periods.
              </p>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Third-Party Services and Links</h2>
              <p className="text-gray-700 leading-relaxed">
                The Platform may contain links to third-party websites, services, or content. We do not endorse or control these third parties and are not responsible for their content, privacy practices, or terms of service. Your use of third-party services is at your own risk.
              </p>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers and Limitations of Liability</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">9.1 "As Is" Service</h3>
              <p className="text-gray-700 leading-relaxed">
                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">9.2 No Professional Advice</h3>
              <p className="text-gray-700 leading-relaxed">
                Content on the Platform is for informational purposes only and does not constitute professional, legal, medical, or tactical advice. Always consult with qualified professionals and follow your agency's policies and procedures.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">9.3 User Content Disclaimer</h3>
              <p className="text-gray-700 leading-relaxed">
                We do not endorse, verify, or guarantee the accuracy of User Content. Users are responsible for evaluating the accuracy and reliability of information shared on the Platform.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">9.4 Limitation of Liability</h3>
              <p className="text-gray-700 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, PARANET SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR USE, ARISING OUT OF OR RELATED TO YOUR USE OF THE PLATFORM.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.
              </p>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify, defend, and hold harmless Paranet, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including legal fees) arising out of or related to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                <li>Your use of the Platform</li>
                <li>Your User Content</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
              </ul>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Dispute Resolution and Arbitration</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">11.1 Informal Resolution</h3>
              <p className="text-gray-700 leading-relaxed">
                If you have a dispute with Paranet, please contact us at <a href="mailto:support@paranet.tech" className="text-indigo-600 hover:underline">support@paranet.tech</a> to attempt to resolve the issue informally.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">11.2 Binding Arbitration</h3>
              <p className="text-gray-700 leading-relaxed">
                If we cannot resolve a dispute informally, any dispute arising out of or relating to these Terms or the Platform shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. Arbitration will take place in the United States.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">11.3 Class Action Waiver</h3>
              <p className="text-gray-700 leading-relaxed">
                You agree to resolve disputes on an individual basis only. You waive any right to participate in a class action lawsuit or class-wide arbitration.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">11.4 Exceptions</h3>
              <p className="text-gray-700 leading-relaxed">
                Either party may seek injunctive relief in court to protect intellectual property rights or prevent unauthorized use of the Platform.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms are governed by the laws of the United States and the State of California, without regard to conflict of law principles. Any legal action not subject to arbitration shall be brought exclusively in the federal or state courts located in California.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We may suspend or terminate your access to the Platform at any time, with or without cause or notice, including for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Harm to other users or the Platform</li>
                <li>Extended inactivity</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Upon termination, your right to use the Platform will immediately cease. Sections of these Terms that by their nature should survive termination will remain in effect.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may modify these Terms at any time. We will notify you of material changes by email or through a prominent notice on the Platform. Your continued use of the Platform after changes constitutes acceptance of the modified Terms.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                If you do not agree to the modified Terms, you must stop using the Platform and may delete your account.
              </p>
            </section>

            {/* Severability */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Severability</h2>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.
              </p>
            </section>

            {/* Entire Agreement */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Entire Agreement</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and Paranet regarding your use of the Platform and supersede any prior agreements.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about these Terms, please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> <a href="mailto:support@paranet.tech" className="text-indigo-600 hover:underline">support@paranet.tech</a></p>
                <p className="text-gray-700 mt-2"><strong>Legal:</strong> <a href="mailto:legal@paranet.tech" className="text-indigo-600 hover:underline">legal@paranet.tech</a></p>
                <p className="text-gray-700 mt-2"><strong>Website:</strong> <a href="https://paranet.tech" className="text-indigo-600 hover:underline">https://paranet.tech</a></p>
              </div>
            </section>

            {/* Acknowledgment */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">18. Acknowledgment</h2>
              <p className="text-gray-700 leading-relaxed">
                BY USING PARANET, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t">
            <p className="text-center text-gray-600">
              Thank you for being part of the Paranet community. Stay safe out there.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Link to="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
              <Link to="/privacy">
                <Button variant="outline">Privacy Policy</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
