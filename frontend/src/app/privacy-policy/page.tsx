'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto p-4 sm:p-8 bg-gray-50">
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
          
          <div className="mb-6">
            <Link href="/privacy" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Privacy Center
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-indigo-600" />
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500 mt-2">Last updated: {currentDate}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 prose prose-indigo max-w-none text-gray-700">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg text-sm mb-8 not-prose">
              <strong>Disclaimer:</strong> This is an application privacy notice explaining technical behavior. It should be reviewed by an appropriate legal professional before being used as a formal legal policy for a public commercial product.
            </div>

            <h3 className="text-gray-900 font-bold text-lg mt-6 mb-2">1. Introduction</h3>
            <p className="mb-4">
              Welcome to MindVault AI. Your privacy and the security of your journal entries are our top priority. This Privacy Policy explains exactly how we handle, store, and process your personal information.
            </p>

            <h3 className="text-gray-900 font-bold text-lg mt-6 mb-2">2. Information We Store</h3>
            <p className="mb-4">
              We store the journal entries you explicitly create, which include the title, content, creation timestamp, and any optional goal associations. Additionally, if you use AI features, we store the resulting metadata (such as derived mood, themes, and summary). We also store data related to any Goals you create.
            </p>

            <h3 className="text-gray-900 font-bold text-lg mt-6 mb-2">3. How Journal Data Is Used</h3>
            <p className="mb-4">
              Your journal data is used strictly to provide you with the application's core functionality: viewing past entries, tracking mood streaks, and generating personalized growth insights. Your data is not sold, shared, or used for external marketing purposes.
            </p>

            <h3 className="text-gray-900 font-bold text-lg mt-6 mb-2">4. Firebase Authentication</h3>
            <p className="mb-4">
              We use Google Firebase Authentication to handle account identity securely. Firebase manages your login credentials (such as your email and password or OAuth tokens).
            </p>

            <h3 className="text-gray-900 font-bold text-lg mt-6 mb-2">5. Firestore Data Storage</h3>
            <p className="mb-4">
              Your journal and goal data is stored in Firebase Firestore. The database structure isolates your data using your unique authenticated user ID. Strict Firestore Security Rules ensure that your data can only be read, modified, or deleted by your authenticated account. 
            </p>

            <h3 className="text-gray-900 font-bold text-lg mt-6 mb-2">6. Gemini / AI Processing</h3>
            <p className="mb-4">
              MindVault AI uses Google Gemini to provide intelligent journal analysis. When you use AI-powered features, relevant journal information is sent securely from our backend server to the Gemini API. 
              Depending on the feature, this may include full journal content (e.g., when analyzing a specific entry) or just extracted metadata (e.g., when generating a macro-report). API credentials remain safely on our server and are never exposed to your browser. Please consult Google's current privacy documentation regarding how Gemini processes API requests.
            </p>

            <h3 className="text-gray-900 font-bold text-lg mt-6 mb-2">7. Data Security</h3>
            <p className="mb-4">
              We employ standard security practices via Firebase's managed infrastructure to protect your data during transit and at rest. Access to the backend API is guarded by authentication middleware that verifies your identity token on every request.
            </p>

            <h3 className="text-gray-900 font-bold text-lg mt-6 mb-2">8. Data Export</h3>
            <p className="mb-4">
              You maintain control over your data. You may export a complete copy of all your journal entries (in JSON or CSV format) at any time through the Privacy Center.
            </p>

            <h3 className="text-gray-900 font-bold text-lg mt-6 mb-2">9. Data Deletion</h3>
            <p className="mb-4">
              You can permanently delete individual journal entries or wipe all your journal data entirely via the Privacy Center. Deletions are processed immediately in the Firestore database. Note that deleting all journal data does not automatically delete your Firebase Authentication account identity.
            </p>

            <h3 className="text-gray-900 font-bold text-lg mt-6 mb-2">10. Third-Party Services</h3>
            <p className="mb-4">
              Our core infrastructure relies on Google Cloud (Firebase Authentication, Firestore) and Google Gemini for AI analysis. We do not integrate third-party trackers or ad networks into your private journal experience.
            </p>

            <h3 className="text-gray-900 font-bold text-lg mt-6 mb-2">11. User Controls</h3>
            <p className="mb-4">
              Through the Privacy Center, you are empowered to view data statistics, export your records, or completely destroy your records. 
            </p>

            <h3 className="text-gray-900 font-bold text-lg mt-6 mb-2">12. Policy Updates</h3>
            <p className="mb-4">
              We may occasionally update this policy to reflect changes in our technology stack or data practices. The "Last updated" date at the top of this page will always indicate the most recent revision.
            </p>

            <h3 className="text-gray-900 font-bold text-lg mt-6 mb-2">13. Contact Information</h3>
            <p className="mb-4">
              If you have questions about this policy or your data, please contact the application administrator.
            </p>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
