const fs = require('fs');
let sam = fs.readFileSync('src/components/ServiceAreaManager.tsx', 'utf8');

// Add onToggleTicketStatus to props
sam = sam.replace(/allTickets\?\:\s*any\[\]\s*\}/, "allTickets?: any[], onToggleTicketStatus?: (id: string, status: 'open' | 'resolved') => void }");
sam = sam.replace(/allTickets\s*\}\:/, "allTickets, onToggleTicketStatus }:");

// Fix Resolve Ticket button
sam = sam.replace(
  /<span className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer flex items-center gap-1">Resolve Ticket &rarr;<\/span>/,
  '<button type="button" onClick={() => onToggleTicketStatus && onToggleTicketStatus(t.id, \'resolved\')} className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer flex items-center gap-1">Resolve Ticket &rarr;</button>'
);

// Fix Configure Area button
sam = sam.replace(
  /<button type="button" className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer">/g,
  '<button type="button" onClick={() => alert(\'Map configuration will open in full-screen modal\')} className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer">'
);

fs.writeFileSync('src/components/ServiceAreaManager.tsx', sam);
