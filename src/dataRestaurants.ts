import { Restaurant, TrainQuery } from './types';

export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Maudaha Biryani Palace',
    nameHi: 'मौदहा बिरयानी पैलेस',
    rating: 4.8,
    deliveryTime: '20-30 mins',
    deliveryTimeHi: '20-30 मिनट',
    minOrder: 150,
    area: 'Maudaha',
    address: 'Near Galla Mandi Chauraha, Maudaha',
    addressHi: 'गल्ला मंडी चौराहा के पास, मौदहा',
    cuisine: 'Mughlai & North Indian',
    cuisineHi: 'मुगलई और उत्तर भारतीय',
    banner: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop',
    menu: [
      {
        id: 'food-1-1',
        name: 'Maudaha Special Chicken Biryani',
        nameHi: 'मौदहा स्पेशल चिकन बिरयानी',
        price: 180,
        category: 'nonveg',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=200&auto=format&fit=crop',
        description: 'Mouth-watering, richly spiced basmati rice layered with marinated chicken, served with raita.',
        descriptionHi: 'दही के रायते के साथ परोसी जाने वाली, मसालों से भरपूर बासमती चावल और मैरीनेटेड चिकन की स्वादिष्ट बिरयानी।'
      },
      {
        id: 'food-1-2',
        name: 'Royal Veg Hyderabadi Biryani',
        nameHi: 'रॉयल वेज हैदराबादी बिरयानी',
        price: 140,
        category: 'veg',
        image: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?q=80&w=200&auto=format&fit=crop',
        description: 'Aromatic basmati rice cooked with fresh seasonal vegetables, mint, saffron, and rich spices.',
        descriptionHi: 'ताजी मौसमी सब्जियों, पुदीना, केसर और समृद्ध मसालों के साथ पकाए गए सुगंधित बासमती चावल।'
      },
      {
        id: 'food-1-3',
        name: 'Chicken Seekh Kebab (4 Pcs)',
        nameHi: 'चिकन सीख कबाब (4 पीस)',
        price: 160,
        category: 'nonveg',
        image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=200&auto=format&fit=crop',
        description: 'Minced chicken blended with authentic spices, grilled to perfection on skewers.',
        descriptionHi: 'असली मसालों के साथ मिश्रित कीमा बनाया हुआ चिकन, सीखों पर पूर्णता से पकाया गया।'
      },
      {
        id: 'food-1-4',
        name: 'Mughlai Rumali Roti',
        nameHi: 'मुगलई रुमाली रोटी',
        price: 15,
        category: 'veg',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=200&auto=format&fit=crop',
        description: 'Super thin, soft wheat flatbread thrown and baked on a dome-shaped wok.',
        descriptionHi: 'गुंबद के आकार की कड़ाही पर सेंकी गई बेहद पतली और मुलायम गेहूं की रोटी।'
      }
    ]
  },
  {
    id: 'rest-2',
    name: 'Bundelkhand Highway Dhaba',
    nameHi: 'बुंदेलखंड हाईवे ढाबा',
    rating: 4.6,
    deliveryTime: '25-35 mins',
    deliveryTimeHi: '25-35 मिनट',
    minOrder: 120,
    area: 'Maudaha',
    address: 'National Highway 34, near Station Road, Maudaha',
    addressHi: 'राष्ट्रीय राजमार्ग 34, स्टेशन रोड के पास, मौदहा',
    cuisine: 'Authentic Desi Thali & Dhaba Style',
    cuisineHi: 'असली देसी थाली और ढाबा शैली',
    banner: 'https://images.unsplash.com/photo-1585938338392-50a59970d8ee?q=80&w=600&auto=format&fit=crop',
    menu: [
      {
        id: 'food-2-1',
        name: 'Special Bundeli Veg Thali',
        nameHi: 'विशेष बुंदेली वेज थाली',
        price: 150,
        category: 'veg',
        image: 'https://images.unsplash.com/photo-1585938338392-50a59970d8ee?q=80&w=200&auto=format&fit=crop',
        description: 'Complete meal with Dal Tadka, Seasonal Sabzi, Paneer Curry, Rice, 3 Butter Rotis, and Salad.',
        descriptionHi: 'दाल तड़का, मौसमी सब्जी, पनीर करी, चावल, 3 बटर रोटी और सलाद के साथ पूरा भोजन।'
      },
      {
        id: 'food-2-2',
        name: 'Dhaba Style Sev Tamatar',
        nameHi: 'ढाबा स्टाइल सेव टमाटर',
        price: 110,
        category: 'veg',
        image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=200&auto=format&fit=crop',
        description: 'Crispy sev cooked in a spicy, tangy tomato gravy with fresh coriander.',
        descriptionHi: 'ताजे धनिये के साथ मसालेदार, तीखी टमाटर की ग्रेवी में पकाई गई कुरकुरी सेव।'
      },
      {
        id: 'food-2-3',
        name: 'Desi Kadhi Chawal Combo',
        nameHi: 'देसी कढ़ी चावल कॉम्बो',
        price: 99,
        category: 'veg',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=200&auto=format&fit=crop',
        description: 'Gram flour pakodas in a tangy yogurt-based curry, served with steamed basmati rice.',
        descriptionHi: 'तीखी दही आधारित करी में बेसन के पकौड़े, उबले हुए बासमती चावल के साथ परोसे जाते हैं।'
      },
      {
        id: 'food-2-4',
        name: 'Tandoori Butter Roti',
        nameHi: 'तंदूरी बटर रोटी',
        price: 12,
        category: 'veg',
        image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=200&auto=format&fit=crop',
        description: 'Clay-oven baked whole wheat bread brushed with premium butter.',
        descriptionHi: 'मिट्टी के तंदूर में पकी हुई गेहूं की रोटी, जिस पर बटर लगाया गया है।'
      }
    ]
  },
  {
    id: 'rest-3',
    name: 'Gupta Sweets & Chat Corner',
    nameHi: 'गुप्ता स्वीट्स एंड चाट कॉर्नर',
    rating: 4.7,
    deliveryTime: '15-25 mins',
    deliveryTimeHi: '15-25 मिनट',
    minOrder: 80,
    area: 'Maudaha',
    address: 'Rahmaniya Chauraha, Maudaha',
    addressHi: 'रहमानिया चौराहा, मौदहा',
    cuisine: 'Sweets, Snacks & Street Food',
    cuisineHi: 'मिठाइयां, स्नैक्स और स्ट्रीट फूड',
    banner: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop',
    menu: [
      {
        id: 'food-3-1',
        name: 'Desi Ghee Samosa-Jalebi Combo',
        nameHi: 'देसी घी समोसा-जलेबी कॉम्बो',
        price: 60,
        category: 'sweet',
        image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=200&auto=format&fit=crop',
        description: '2 Crispy hot potato samosas paired with 100g crunchy, hot syrup-filled Jalebi.',
        descriptionHi: '2 कुरकुरे गरमागरम आलू समोसे और 100 ग्राम कुरकुरी, रसभरी गरमागरम जलेबी का मेल।'
      },
      {
        id: 'food-3-2',
        name: 'Deluxe Chole Bhature',
        nameHi: 'डीलक्स छोले भटूरे',
        price: 90,
        category: 'veg',
        image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=200&auto=format&fit=crop',
        description: '2 fluffy bhaturas served with spicy, tangy dark chole, pickles, and onions.',
        descriptionHi: 'मसालेदार, चटपटे काले छोले, अचार और प्याज के साथ परोसे जाने वाले 2 फूले हुए भटूरे।'
      },
      {
        id: 'food-3-3',
        name: 'Maudaha Tikki Chat (Plate)',
        nameHi: 'मौदहा टिक्की चाट (प्लेट)',
        price: 50,
        category: 'veg',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=200&auto=format&fit=crop',
        description: 'Crispy fried potato patties topped with sweet yogurt, green and tamarind chutneys, and sev.',
        descriptionHi: 'मीठी दही, हरी और इमली की चटनी, और बारीक सेव से सजी कुरकुरी तली हुई आलू की टिक्की।'
      },
      {
        id: 'food-3-4',
        name: 'Kesar Pista Dry Fruit Lassi',
        nameHi: 'केसर पिस्ता ड्राई फ्रूट लस्सी',
        price: 60,
        category: 'beverage',
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=200&auto=format&fit=crop',
        description: 'Thick, creamy churned sweet yogurt topped with saffron strands, pistachios, and almonds.',
        descriptionHi: 'केसर, पिस्ता और बादाम के टुकड़ों से सजी गाढ़ी, मलाईदार मीठी मथानी लस्सी।'
      }
    ]
  },
  {
    id: 'rest-4',
    name: 'Krishna Pure Veg Restaurant',
    nameHi: 'कृष्णा प्योर वेज रेस्टोरेंट',
    rating: 4.5,
    deliveryTime: '20-30 mins',
    deliveryTimeHi: '20-30 मिनट',
    minOrder: 100,
    area: 'Maudaha',
    address: 'Subhash Nagar, opposite State Bank, Maudaha',
    addressHi: 'सुभाष नगर, स्टेट बैंक के सामने, मौदहा',
    cuisine: 'Pure Veg Chinese & Paneer Specials',
    cuisineHi: 'शुद्ध शाकाहारी चीनी और पनीर स्पेशल',
    banner: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=600&auto=format&fit=crop',
    menu: [
      {
        id: 'food-4-1',
        name: 'Premium Shahi Paneer',
        nameHi: 'प्रीमियम शाही पनीर',
        price: 140,
        category: 'veg',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=200&auto=format&fit=crop',
        description: 'Cottage cheese cubes simmered in a rich, velvety onion, tomato, cashew, and cream gravy.',
        descriptionHi: 'प्याज, टमाटर, काजू और क्रीम की मखमली ग्रेवी में पकाए गए पनीर के टुकड़े।'
      },
      {
        id: 'food-4-2',
        name: 'Veg Hakka Noodles',
        nameHi: 'वेज हक्का नूडल्स',
        price: 90,
        category: 'veg',
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=200&auto=format&fit=crop',
        description: 'Stir-fried noodles tossed with crunchy carrots, cabbage, capsicum, and oriental sauces.',
        descriptionHi: 'कुरकुरी गाजर, पत्तागोभी, शिमला मिर्च और चीनी सॉस के साथ तेज आंच पर भूने गए नूडल्स।'
      },
      {
        id: 'food-4-3',
        name: 'Paneer Butter Masala',
        nameHi: 'पनीर बटर मसाला',
        price: 130,
        category: 'veg',
        image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=200&auto=format&fit=crop',
        description: 'Smooth and spicy paneer curry cooked with loads of butter, cream, and Kasuri Methi.',
        descriptionHi: 'ढेर सारे मक्खन, क्रीम और कसूरी मेथी के साथ पकाई गई मखमली पनीर करी।'
      },
      {
        id: 'food-4-4',
        name: 'Sweet Gulab Jamun (2 Pcs)',
        nameHi: 'मीठे गुलाब जामुन (2 पीस)',
        price: 40,
        category: 'sweet',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=200&auto=format&fit=crop',
        description: 'Soft, golden-fried milk solids soaked in warm cardamom-infused sugar syrup.',
        descriptionHi: 'इलायची की खुशबू वाली गर्म चीनी की चाशनी में भीगे हुए मुलायम सुनहरे तले मावे के गोले।'
      }
    ]
  }
];

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
