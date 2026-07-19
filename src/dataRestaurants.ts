import { Restaurant, TrainQuery } from './types';

export const INITIAL_RESTAURANTS: Restaurant[] = [];

export const STATIC_TRAINS = [
  {
    number: '11110',
    name: 'Bundelkhand Express',
    route: 'VGL Jhansi to Prayagraj',
    origin: 'VGL Jhansi (VGLJ)',
    destination: 'Prayagraj Junction (PRYJ)',
    scheduledArrival: '10:45 AM',
    scheduledDeparture: '10:47 AM',
    platform: 'Platform 1',
    stops: ['VGL Jhansi', 'Banda', 'Maudaha', 'Bharuwa Sumerpur', 'Kanpur Central', 'Prayagraj'],
    liveStatusTemplate: [
      'Departed Banda Junction. 18 km remaining to Maudaha. Running on time.',
      'Approaching Maudaha Railway Station (MUSD). Arriving on Platform 1 in 5 minutes.',
      'Arrived at Maudaha Station. Halting for 2 minutes. Boarding is active.',
      'Departed Maudaha Station. Next stop Bharuwa Sumerpur (BSPR).'
    ]
  },
  {
    number: '15010',
    name: 'Chitrakoot Express',
    route: 'Jabalpur to Kanpur Central',
    origin: 'Jabalpur (JBP)',
    destination: 'Kanpur Central (CNB)',
    scheduledArrival: '04:20 PM',
    scheduledDeparture: '04:22 PM',
    platform: 'Platform 2',
    stops: ['Jabalpur', 'Satna', 'Chitrakoot', 'Banda', 'Maudaha', 'Kanpur Central'],
    liveStatusTemplate: [
      'Departed Chitrakoot Dham. Running delayed by 15 minutes.',
      'Departed Banda Junction. Delayed by 12 minutes. Expected arrival at Maudaha is 04:32 PM.',
      'Arrived at Maudaha Station. Platform 2. Delayed by 10 minutes.',
      'Departed Maudaha. Heading towards Kanpur Central.'
    ]
  },
  {
    number: '12184',
    name: 'Pratapgarh SF Express',
    route: 'Bhopal to Pratapgarh',
    origin: 'Bhopal Junction (BPL)',
    destination: 'Pratapgarh Junction (PBH)',
    scheduledArrival: '01:15 AM',
    scheduledDeparture: '01:17 AM',
    platform: 'Platform 1',
    stops: ['Bhopal', 'Jhansi', 'Banda', 'Maudaha', 'Kanpur Central', 'Lucknow', 'Pratapgarh'],
    liveStatusTemplate: [
      'Departed Jhansi Junction. Running on time.',
      'Departed Banda. Expected arrival at Maudaha at 01:15 AM sharp.',
      'Arrived at Maudaha Station. Platform 1. Night halting active.',
      'Departed Maudaha Station. Next stop Kanpur Central.'
    ]
  },
  {
    number: '11801',
    name: 'Jhansi Prayagraj Link Express',
    route: 'Jhansi to Prayagraj Link',
    origin: 'VGL Jhansi (VGLJ)',
    destination: 'Prayagraj Junction (PRYJ)',
    scheduledArrival: '08:30 AM',
    scheduledDeparture: '08:32 AM',
    platform: 'Platform 1',
    stops: ['VGL Jhansi', 'Mauranipur', 'Banda', 'Maudaha', 'Sumerpur', 'Prayagraj'],
    liveStatusTemplate: [
      'Departed Mauranipur. Delayed by 25 minutes.',
      'Departed Banda. Expected at Maudaha at 08:55 AM.',
      'Arrived at Maudaha Station. Halting on Platform 1.',
      'Departed Maudaha Station. Proceeding to Bharuwa Sumerpur.'
    ]
  }
];
