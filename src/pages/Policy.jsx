import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { FileText, Upload, Plus, X, Trash2, CheckCircle2 } from 'lucide-react';

export default function Policy() {
  const policies = useQuery(api.policies.get) || [];
  const savePolicyMutation = useMutation(api.policies.save);
  const deletePolicyMutation = useMutation(api.policies.deletePolicy);
  const setActiveMutation = useMutation(api.policies.setActive);
  
  const [policyText, setPolicyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!policyText.trim()) return;
    
    setIsSubmitting(true);
    try {
      await savePolicyMutation({
        text: policyText.trim(),
        summary: `Policy saved on ${new Date().toLocaleDateString()}`
      });
      setPolicyText('');
    } catch (error) {
      console.error('Failed to save policy:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setPolicyText('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) {
      return;
    }
    
    setDeletingId(id);
    try {
      await deletePolicyMutation({ id });
    } catch (error) {
      console.error('Failed to delete policy:', error);
      alert('Failed to delete policy. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetActive = async (id) => {
    try {
      await setActiveMutation({ id });
    } catch (error) {
      console.error('Failed to set active policy:', error);
      alert('Failed to set active policy. Please try again.');
    }
  };

  const activePolicy = policies.find(p => p.is_current) || policies[0]; // Fallback to first if none marked active

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Policy Management</h1>
          <p className="text-gray-500 mt-1">Upload and manage your company policies</p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left: Upload Policy Text - Fixed/Non-scrollable container */}
        <div className="w-1/2 bg-white rounded-xl border border-gray-200 shadow-card p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4 flex-shrink-0">
            <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center">
              <Upload size={20} className="text-brand" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Upload Policy</h2>
              <p className="text-sm text-gray-500">Enter company policy text</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 mb-4">
              <textarea
                value={policyText}
                onChange={(e) => setPolicyText(e.target.value)}
                placeholder={`Paste or type your company policy here...

Example:
- Meal expenses are capped at RM 200 per person
- Receipts must be submitted within 7 days
- Alcohol expenses require manager approval...`}
                className="w-full h-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 flex-shrink-0">
              <button
                type="submit"
                disabled={!policyText.trim() || isSubmitting}
                className="flex-1 bg-brand text-white py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Save Policy
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={!policyText.trim()}
                className="px-4 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Right: Current Policies List - Scrollable */}
        <div className="w-1/2 bg-white rounded-xl border border-gray-200 shadow-card p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4 flex-shrink-0">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText size={20} className="text-gray-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Current Policies</h2>
              <p className="text-sm text-gray-500">
                {policies.length} policy{policies.length !== 1 ? 'ies' : 'y'} • {activePolicy ? '1 active' : 'None active'}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {policies.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <FileText size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm">No policies uploaded yet</p>
                <p className="text-gray-400 text-xs mt-1">Upload a policy on the left to get started</p>
              </div>
            ) : (
              policies.map((policy) => {
                const isActive = policy.is_current || (activePolicy?._id === policy._id);
                const isDeleting = deletingId === policy._id;
                
                return (
                  <div
                    key={policy._id}
                    className={`p-4 rounded-lg border transition-colors ${
                      isActive 
                        ? 'bg-brand/5 border-brand shadow-sm' 
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-xs text-gray-500">
                            Saved {policy.savedAt ? new Date(policy.savedAt).toLocaleDateString() : 'Recently'}
                          </div>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand text-white text-xs font-medium rounded-full">
                              <CheckCircle2 size={12} />
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                          {policy.text}
                        </p>
                      </div>
                    </div>
                    {policy.summary && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-500 mb-1">Summary</p>
                        <p className="text-xs text-gray-600">{policy.summary}</p>
                      </div>
                    )}
                    <div className="mt-4 pt-3 border-t border-gray-200 flex gap-2">
                      {!isActive && (
                        <button
                          onClick={() => handleSetActive(policy._id)}
                          className="flex-1 px-3 py-2 text-xs font-medium text-brand bg-white border border-brand rounded-lg hover:bg-brand/5 transition-colors"
                        >
                          Set as Active
                        </button>
                      )}
                      {isActive && (
                        <div className="flex-1 px-3 py-2 text-xs font-medium text-brand bg-brand/10 rounded-lg text-center">
                          Currently Active
                        </div>
                      )}
                      <button
                        onClick={() => handleDelete(policy._id)}
                        disabled={isDeleting}
                        className="px-3 py-2 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
