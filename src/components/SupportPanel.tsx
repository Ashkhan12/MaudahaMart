/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, AlertCircle, LifeBuoy, Clock, ChevronRight, HelpCircle } from 'lucide-react';
import { SupportTicket, SupportMessage, Language, RegisteredUser } from '../types';

interface SupportPanelProps {
  supportTickets: SupportTicket[];
  activeUserId: string;
  users: RegisteredUser[];
  onAddTicket: (subject: string, category: string, firstMessage: string) => void;
  onAddMessage: (ticketId: string, text: string) => void;
  language: Language;
}

export default function SupportPanel({
  supportTickets,
  activeUserId,
  users,
  onAddTicket,
  onAddMessage,
  language
}: SupportPanelProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  
  // New ticket state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Order Issue');
  const [firstMessage, setFirstMessage] = useState('');

  // New message reply state
  const [replyText, setReplyText] = useState('');

  const currentUser = users.find(u => u.id === activeUserId);
  const userTickets = supportTickets.filter(t => t.userId === activeUserId);
  const selectedTicket = supportTickets.find(t => t.id === selectedTicketId && t.userId === activeUserId);

  const categories = [
    { value: 'Order Issue', labelEn: '🛒 Order / Delivery Issue', labelHi: '🛒 ऑर्डर / डिलीवरी समस्या' },
    { value: 'Refund / Payment', labelEn: '💰 Refund / Payment', labelHi: '💰 वापसी / भुगतान' },
    { value: 'App Issue', labelEn: '📱 App Technical Issue', labelHi: '📱 ऐप तकनीकी समस्या' },
    { value: 'Feedback', labelEn: '⭐ General Feedback', labelHi: '⭐ सामान्य प्रतिक्रिया' },
    { value: 'Other', labelEn: '❓ Other Query', labelHi: '❓ अन्य प्रश्न' }
  ];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !firstMessage.trim()) return;

    onAddTicket(subject.trim(), category, firstMessage.trim());
    
    // Reset form
    setSubject('');
    setCategory('Order Issue');
    setFirstMessage('');
    setShowCreateForm(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicketId) return;

    onAddMessage(selectedTicketId, replyText.trim());
    setReplyText('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* Left side: Tickets List (4 cols) */}
        <div className="lg:col-span-4 border-r border-slate-150 flex flex-col h-full bg-slate-50/40">
          <div className="p-6 border-b border-slate-100 bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-inner">
                <LifeBuoy className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-800 tracking-tight">
                  {language === 'en' ? 'Support Center' : 'सहायता केंद्र'}
                </h2>
                <p className="text-[11px] text-slate-400 font-bold leading-normal mt-0.5">
                  {language === 'en' ? 'Direct chat with Maudaha Admin' : 'मौदहा एडमिन से सीधी बातचीत'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 shrink-0 bg-white border-b border-slate-100">
            <button type="button"
              onClick={() => {
                setShowCreateForm(true);
                setSelectedTicketId(null);
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-2xl text-xs font-extrabold transition duration-200 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/15 cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{language === 'en' ? 'Raise Support Query' : 'नई सहायता क्वेरी दर्ज करें'}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[500px] scrollbar-thin">
            {userTickets.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3 bg-white/50 rounded-2xl m-2 border border-dashed border-slate-200">
                <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <HelpCircle className="h-6 w-6 stroke-[1.5]" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-600">
                    {language === 'en' ? 'No support queries found' : 'कोई सहायता क्वेरी नहीं मिली'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-normal">
                    {language === 'en' ? 'Need help? Click the green button above to open a query ticket.' : 'मदद की ज़रूरत है? क्वेरी टिकट खोलने के लिए ऊपर दिए गए बटन पर क्लिक करें।'}
                  </p>
                </div>
              </div>
            ) : (
              userTickets.map((ticket) => {
                const latestMsg = ticket.messages[ticket.messages.length - 1];
                const isSelected = selectedTicketId === ticket.id;

                return (
                  <div
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicketId(ticket.id);
                      setShowCreateForm(false);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between group ${
                      isSelected 
                        ? 'bg-emerald-500/10 border-emerald-500 shadow-sm shadow-emerald-500/5' 
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wide truncate max-w-[120px]">
                        {ticket.category}
                      </span>
                      <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                        ticket.status === 'open' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        <span className={`h-1 w-1 rounded-full ${ticket.status === 'open' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                        {ticket.status === 'open' 
                          ? (language === 'en' ? 'OPEN' : 'सक्रिय') 
                          : (language === 'en' ? 'RESOLVED' : 'हल')}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-800 text-xs mt-3 line-clamp-1 group-hover:text-emerald-700 transition">
                      {ticket.subject}
                    </h4>

                    {latestMsg && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-medium bg-slate-50 p-1.5 rounded-lg border border-slate-100 mt-2">
                        <strong className="text-slate-700 font-bold">
                          {latestMsg.sender === 'admin' ? (language === 'en' ? 'Admin' : 'एडमिन') : (language === 'en' ? 'You' : 'आप')}:
                        </strong>{' '}
                        {latestMsg.text}
                      </p>
                    )}

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-mono font-bold">
                      <span>#{ticket.id.toUpperCase()}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-300" />
                        {ticket.createdAt}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right side: Chat Window / Creation Form (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-slate-50/10">
          {showCreateForm ? (
            /* Support ticket creation form */
            <div className="p-6 sm:p-8 space-y-6 flex-1 bg-white overflow-y-auto">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-black text-slate-800 tracking-tight">
                  {language === 'en' ? 'Describe Your Concern' : 'अपनी समस्या का विवरण दें'}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1 leading-normal">
                  {language === 'en' ? 'Please supply relevant order details or specific queries for swift support.' : 'शीघ्र सहायता के लिए कृपया प्रासंगिक विवरण या विशिष्ट प्रश्न प्रदान करें।'}
                </p>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      {language === 'en' ? 'Query Category' : 'प्रश्न श्रेणी'}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50/50 focus:bg-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition"
                    >
                      {categories.map((c) => (
                        <option key={c.value} value={c.value}>
                          {language === 'hi' ? c.labelHi : c.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      {language === 'en' ? 'Subject Summary' : 'संक्षिप्त विषय'}
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={language === 'en' ? "e.g., Delivery delayed near Chauraha" : "उदा., चौराहे के पास डिलीवरी में देरी"}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50/50 focus:bg-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    {language === 'en' ? 'Detailed Message' : 'विस्तृत संदेश'}
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={firstMessage}
                    onChange={(e) => setFirstMessage(e.target.value)}
                    placeholder={language === 'en' ? "Explain your issue with items, location, or payment details here..." : "आइटम, स्थान या भुगतान विवरण के साथ अपनी समस्या को यहाँ विस्तार से समझाएं..."}
                    className="w-full p-4 border border-slate-200 rounded-2xl text-xs font-semibold bg-slate-50/50 focus:bg-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition duration-200 cursor-pointer"
                  >
                    {language === 'en' ? 'Cancel' : 'रद्द करें'}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition duration-200 flex items-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{language === 'en' ? 'Submit Ticket' : 'टिकट जमा करें'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : selectedTicket ? (
            /* Active ticket chat area */
            <div className="flex flex-col h-full flex-1">
              {/* Ticket header */}
              <div className="p-5 border-b border-slate-150 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md uppercase tracking-wider font-mono">
                      {selectedTicket.category}
                    </span>
                    <span className={`text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full ${
                      selectedTicket.status === 'open' 
                        ? 'bg-amber-100 text-amber-800 animate-pulse' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {selectedTicket.status === 'open' 
                        ? (language === 'en' ? '● OPEN' : '● सक्रिय') 
                        : (language === 'en' ? '✓ RESOLVED' : '✓ हल')}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-800 mt-2.5">{selectedTicket.subject}</h3>
                </div>

                <div className="text-[10px] font-mono text-slate-400 font-bold self-start sm:self-auto text-left sm:text-right">
                  <p>{language === 'en' ? 'Created:' : 'बनाया गया:'} {selectedTicket.createdAt}</p>
                  <p className="mt-1 bg-slate-100 px-2 py-0.5 rounded text-slate-600 inline-block">ID: #{selectedTicket.id.toUpperCase()}</p>
                </div>
              </div>

              {/* Message scroll list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[400px] bg-slate-50/30 scrollbar-thin">
                {selectedTicket.messages.map((msg) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold text-slate-500">
                          {isAdmin ? `🛡️ ${msg.senderName} (${language === 'en' ? 'Admin' : 'एडमिन'})` : msg.senderName}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono font-medium">
                          {msg.timestamp}
                        </span>
                      </div>
                      <div className={`p-4 rounded-2xl max-w-[80%] text-xs font-semibold leading-relaxed shadow-xs ${
                        isAdmin 
                          ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none font-medium' 
                          : 'bg-emerald-600 text-white rounded-tr-none font-bold shadow-md shadow-emerald-600/5'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply box */}
              <div className="p-4 border-t border-slate-150 bg-white shrink-0">
                {selectedTicket.status === 'resolved' ? (
                  <div className="bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold p-3 rounded-2xl flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>
                      {language === 'en' 
                        ? 'This query is marked as resolved. You can raise a new query if you still have concerns.' 
                        : 'यह प्रश्न हल के रूप में चिह्नित है। समस्या होने पर नया टिकट दर्ज कर सकते हैं।'}
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleSendReply} className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={language === 'en' ? "Write a message to Admin..." : "एडमिन के लिए एक संदेश लिखें..."}
                      className="flex-1 px-4 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/5 rounded-xl text-xs font-bold outline-none transition"
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl transition flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/15 cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            /* Default fallback state */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/20">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 stroke-[1.5] mb-5 shadow-inner">
                <LifeBuoy className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-800 text-sm font-black uppercase tracking-wider">
                {language === 'en' ? 'Maudaha Resident Support Console' : 'मौदहा निवासी सहायता कंसोल'}
              </p>
              <p className="text-xs text-slate-400 mt-2 max-w-sm font-bold leading-normal">
                {language === 'en' 
                  ? 'Select an existing ticket from the left sidebar or click "Raise Support Query" to start a new inquiry with Maudaha Mart Admin.' 
                  : 'सक्रिय पूछताछ शुरू करने के लिए बाईं ओर की सूची से कोई टिकट चुनें या "सहायता क्वेरी दर्ज करें" पर क्लिक करें।'}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
