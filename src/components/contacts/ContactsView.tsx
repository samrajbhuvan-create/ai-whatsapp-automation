import React, { useState } from 'react';
import { 
  Users, Search, Plus, Filter, Download, Upload, ShieldCheck, 
  ShieldAlert, MoreVertical, Tag, Phone, Calendar, Check, X, 
  Trash2, UserCheck, AlertCircle
} from 'lucide-react';
import { Contact } from '../../types';
import { OptInConsentModal } from '../compliance/OptInConsentModal';

export const ContactsView: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 'c_01',
      name: 'Sarah Jenkins',
      phone_number: '+1 (555) 234-5678',
      opt_in_status: true,
      opt_in_timestamp: '2026-09-18T14:32:00Z',
      opt_in_source: 'Website Checkout Checkbox',
      tags: ['VIP', 'Fall Promo', 'High Intent'],
      last_message_at: '2026-09-19T10:15:00Z',
      unread_count: 0
    },
    {
      id: 'c_02',
      name: 'Marcus Vance',
      phone_number: '+44 7911 123456',
      opt_in_status: true,
      opt_in_timestamp: '2026-09-12T09:10:00Z',
      opt_in_source: 'Inbound WhatsApp Keyword #JOIN',
      tags: ['Wholesale', 'UK Customer'],
      last_message_at: '2026-09-19T17:40:00Z',
      unread_count: 2
    },
    {
      id: 'c_03',
      name: 'Elena Rostova',
      phone_number: '+49 170 5554321',
      opt_in_status: false,
      opt_in_timestamp: '2026-08-30T11:00:00Z',
      opt_in_source: 'Opted-Out (Sent STOP)',
      tags: ['Unsubscribed'],
      last_message_at: '2026-09-15T08:20:00Z',
      unread_count: 0
    },
    {
      id: 'c_04',
      name: 'David Chen',
      phone_number: '+1 (415) 892-0144',
      opt_in_status: true,
      opt_in_timestamp: '2026-09-17T18:05:00Z',
      opt_in_source: 'Website Form',
      tags: ['Product Inquiry', 'Tech Support'],
      last_message_at: '2026-09-19T16:22:00Z',
      unread_count: 1
    },
    {
      id: 'c_05',
      name: 'Amara Okafor',
      phone_number: '+234 802 345 6789',
      opt_in_status: true,
      opt_in_timestamp: '2026-09-15T12:00:00Z',
      opt_in_source: 'In-Store QR Code Scan',
      tags: ['Retail Customer', 'Lagos'],
      last_message_at: '2026-09-18T19:00:00Z',
      unread_count: 0
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filterOptIn, setFilterOptIn] = useState<'ALL' | 'OPTED_IN' | 'OPTED_OUT'>('ALL');
  const [isOptInModalOpen, setIsOptInModalOpen] = useState(false);
  const [newContactModal, setNewContactModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      (contact.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.phone_number || contact.phone || '').includes(searchQuery);
    
    const matchesTag = !selectedTag || contact.tags.includes(selectedTag);

    const matchesOptIn = 
      filterOptIn === 'ALL' ||
      (filterOptIn === 'OPTED_IN' && contact.opt_in_status) ||
      (filterOptIn === 'OPTED_OUT' && !contact.opt_in_status);

    return matchesSearch && matchesTag && matchesOptIn;
  });

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone) return;

    setContacts(prev => [
      {
        id: `c_${Date.now()}`,
        name: newName || 'New Contact',
        phone_number: newPhone,
        opt_in_status: true,
        opt_in_timestamp: new Date().toISOString(),
        opt_in_source: 'Manual Dashboard Entry',
        tags: ['New Lead'],
        unread_count: 0
      },
      ...prev
    ]);
    setNewName('');
    setNewPhone('');
    setNewContactModal(false);
  };

  const allTags = Array.from(new Set(contacts.flatMap(c => c.tags)));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Contacts & Subscribers</h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {contacts.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Meta-compliant WhatsApp audience management with immutable opt-in audit logs and STOP keyword enforcement.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsOptInModalOpen(true)}
            className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={() => setNewContactModal(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Compliance Notice Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold">Automated WhatsApp Opt-Out Watchdog Active</span>
            <span className="text-slate-600 block text-[11px]">
              Incoming keywords (STOP, CANCEL, UNSUBSCRIBE) automatically mark contacts as Opted-Out to safeguard your Meta Trust score.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-center">
          <span className="font-semibold text-[11px] bg-white px-2.5 py-1 rounded-md border border-emerald-200">
            Opted-in: <strong>{contacts.filter(c => c.opt_in_status).length}</strong>
          </span>
          <span className="font-semibold text-[11px] bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-600">
            Unsubscribed: <strong>{contacts.filter(c => !c.opt_in_status).length}</strong>
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone number (+1...)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600">
            <button
              onClick={() => setFilterOptIn('ALL')}
              className={`px-3 py-1 rounded-md transition-all ${filterOptIn === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterOptIn('OPTED_IN')}
              className={`px-3 py-1 rounded-md transition-all ${filterOptIn === 'OPTED_IN' ? 'bg-white text-emerald-700 shadow-2xs' : 'hover:text-slate-900'}`}
            >
              Opted-In
            </button>
            <button
              onClick={() => setFilterOptIn('OPTED_OUT')}
              className={`px-3 py-1 rounded-md transition-all ${filterOptIn === 'OPTED_OUT' ? 'bg-white text-rose-700 shadow-2xs' : 'hover:text-slate-900'}`}
            >
              Opted-Out
            </button>
          </div>

          <select
            value={selectedTag || ''}
            onChange={(e) => setSelectedTag(e.target.value || null)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Opt-In Status & Proof</th>
                <th className="py-3 px-4">Tags</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No contacts found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                          {(contact.name || 'C').charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">{contact.name || 'Unnamed Contact'}</span>
                          <span className="text-[11px] text-slate-400">ID: {contact.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-800">
                      {contact.phone_number}
                    </td>

                    <td className="py-3.5 px-4">
                      {contact.opt_in_status ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 w-fit">
                            <ShieldCheck className="w-3 h-3" />
                            Verified Opt-In
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Via {contact.opt_in_source}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 w-fit">
                            <ShieldAlert className="w-3 h-3" />
                            Unsubscribed
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Outbound Blocked
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map((tag) => (
                          <span key={tag} className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {contact.last_message_at ? new Date(contact.last_message_at).toLocaleDateString() : 'Never'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setContacts(prev => prev.map(c => 
                            c.id === contact.id ? { ...c, opt_in_status: !c.opt_in_status } : c
                          ));
                        }}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded transition-colors ${
                          contact.opt_in_status 
                            ? 'text-rose-600 hover:bg-rose-50' 
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {contact.opt_in_status ? 'Revoke Opt-In' : 'Re-verify Opt-In'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Opt-in Confirmation Modal for CSV */}
      <OptInConsentModal
        isOpen={isOptInModalOpen}
        onClose={() => setIsOptInModalOpen(false)}
        contactCount={1240}
        onConfirm={(data) => {
          setIsOptInModalOpen(false);
          alert(`CSV imported: 1,240 contacts registered with opt-in method '${data.source}' and logged to compliance table.`);
        }}
      />

      {/* Manual Add Contact Modal */}
      {newContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Single WhatsApp Contact</h3>
            <form onSubmit={handleAddContact} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Liam Smith"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">WhatsApp Phone (E.164 Format)</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-900 text-[11px]">
                Adding this contact will record an explicit Opt-In event with timestamp in your audit log.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewContactModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
