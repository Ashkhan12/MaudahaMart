const fs = require('fs');
let adminPortal = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

adminPortal = adminPortal.replace(/allTickets=\{props\.supportTickets\}/,
`allTickets={props.supportTickets}
        onToggleTicketStatus={props.onToggleTicketStatus}`);

fs.writeFileSync('src/components/AdminPortal.tsx', adminPortal);
