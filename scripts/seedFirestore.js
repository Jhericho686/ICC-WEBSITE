import { db } from '../src/lib/firebase.js';
import { collection, getDocs, addDoc } from 'firebase/firestore';

const fallbackMembers = [
  { name: 'MELLY', real_name: 'Mark Joseph Tandang', in_game_name: 'Owner- ICC MELLY', role: 'Owner', cpm_id: 'Founder', car: 'Nissan Skyline GT-R (Founder)', hierarchy_order: 1, featured: true },
  { name: 'PATPAT', real_name: 'Patrick Carreon', in_game_name: '[Co-Owner] ICC-PATPAT (2912492)', role: 'Co-Owner', cpm_id: '2912492', car: 'ID: 2912492', hierarchy_order: 2, featured: true },
  { name: 'BLUEWORKS', real_name: 'Christian Torrecampo Tario', in_game_name: '[CO-OWNER]ICC - BLUEWORKS', role: 'Co-Owner', cpm_id: 'Co-Owner', car: 'BMW M4 Competition', hierarchy_order: 3, featured: true },
  { name: 'AJ ADU', real_name: 'Jayson Ramos', in_game_name: '[ President]ICC AJ ADU', role: 'President', cpm_id: 'President', car: 'Subaru WRX STI', hierarchy_order: 4, featured: true },
  { name: 'JEHEYSI', real_name: 'JC Marasigan', in_game_name: 'PRESIDENT ICC jeheysi (YX606679)', role: 'President', cpm_id: 'YX606679', car: 'Mazda RX-7 FD3S (YX606679)', hierarchy_order: 5, featured: true },
  { name: 'RAP', real_name: 'Ralph Mariño', in_game_name: 'ICC [PRESIDENT] (Rap) [QN224264]', role: 'President', cpm_id: 'QN224264', car: 'Mitsubishi Lancer Evo IX (QN224264)', hierarchy_order: 6, featured: true },
  { name: 'HIJUME', real_name: 'Prince Casaway', in_game_name: '[VP] (ICC-Hijume)(09252008)', role: 'Vice President', cpm_id: '09252008', car: 'Nissan Silvia S15 (09252008)', hierarchy_order: 7, featured: true },
  { name: 'SIR DOM', real_name: 'Dominic Denuevo II', in_game_name: 'VICE PRESEDENT- I SIR DOM I (BM120909)', role: 'Vice President', cpm_id: 'BM120909', car: 'Honda Civic Type-R (BM120909)', hierarchy_order: 8, featured: true },
  { name: 'CHACHA', real_name: 'Jhon Carl Bautista', in_game_name: '[VP] ICC CHACHA', role: 'Vice President', cpm_id: 'VP', car: 'CPM Spec', hierarchy_order: 9, featured: true },
  { name: 'YELICH', real_name: 'Ken Heindrich Narzoles', in_game_name: 'ICC-(ADMIN)-(N3KN3K)-QK168210', role: 'Admin', cpm_id: 'QK168210', car: 'CPM Spec (QK168210)', hierarchy_order: 10, featured: false },
  { name: 'NIO', real_name: 'Jhericho Rapiz', in_game_name: 'ICC | Nio | (EC446438) ADMIN', role: 'Admin', cpm_id: 'EC446438', car: 'Admin Spec (EC446438)', hierarchy_order: 11, featured: false },
  { name: 'NHOGZ', real_name: 'Nhogzkie Madera', in_game_name: 'ICC-ADMIN-東NHOGZ東', role: 'Admin', cpm_id: 'Admin', car: 'CPM Spec', hierarchy_order: 12, featured: false },
  { name: 'AZZY', real_name: 'Azy Siermento', in_game_name: '[ADMIN] ICC (Azzy✿) (AZZYYXX)', role: 'Admin', cpm_id: 'AZZYYXX', car: 'CPM Spec (AZZYYXX)', hierarchy_order: 13, featured: false },
  { name: 'Missche', real_name: 'Karla Mantos', in_game_name: 'Missche', role: 'Member', cpm_id: 'Member', car: 'CPM Spec', hierarchy_order: 14, featured: false },
  { name: 'bwisetor', real_name: 'Jhon Aerol Gonzaga', in_game_name: 'bwisetor', role: 'Member', cpm_id: 'Member', car: 'CPM Spec', hierarchy_order: 15, featured: false },
  { name: 'PRITS', real_name: 'Pret Zel', in_game_name: 'ICC (PRITS) (PRITSSS) MEMBER', role: 'Member', cpm_id: 'PRITSSS', car: 'CPM Spec (PRITSSS)', hierarchy_order: 16, featured: false },
  { name: 'kambal ni Joshua Garcia', real_name: 'Michael Viray Bondoc', in_game_name: 'kambal ni Joshua Garcia', role: 'Member', cpm_id: 'Member', car: 'CPM Spec', hierarchy_order: 17, featured: false },
  { name: 'Kapitan', real_name: 'Joey Lutap', in_game_name: 'Kapitan(NF093187)NEW MEMBER', role: 'New Member', cpm_id: 'NF093187', car: 'CPM Spec (NF093187)', hierarchy_order: 18, featured: false },
  { name: 'ICC (MANOK)', real_name: 'Alfon Jedric Romblon', in_game_name: 'ICC (MANOK) (AP634449) NEW MEMBER', role: 'New Member', cpm_id: 'AP634449', car: 'CPM Spec (AP634449)', hierarchy_order: 19, featured: false },
  { name: 'Jape', real_name: 'Jaf Justin Petacio', in_game_name: 'ICC (Jape) (YR237424) NEW MEMBER', role: 'New Member', cpm_id: 'YR237424', car: 'CPM Spec (YR237424)', hierarchy_order: 20, featured: false },
  { name: 'Zekee', real_name: 'Ezekiel Tanaleon', in_game_name: 'ICC (Zekee) (ZP660188) NEW MEMBER', role: 'New Member', cpm_id: 'ZP660188', car: 'CPM Spec (ZP660188)', hierarchy_order: 21, featured: false },
  { name: 'ICC-CUTE', real_name: 'Dwayne Rimando', in_game_name: 'ICC-CUTE (CA186858) NEW MEMBER', role: 'New Member', cpm_id: 'CA186858', car: 'CPM Spec (CA186858)', hierarchy_order: 22, featured: false },
];

const fallbackPastCollabs = [
  { clan: 'VELOCITY MOTORSPORTS', type: 'Joint Car Meet & Cruise', date: 'Aug 2026', image: '/gallery/icc-meet-grand-gathering.png', highlight: 'Largest multi-clan cruise event on Mountain Pass Server', featured: true },
  { clan: 'APEX DRIFT COLLECTIVE', type: 'Inter-Clan Drift Battle', date: 'Jul 2026', image: '/gallery/icc-meet-drift-sunset.png', highlight: 'Official Tandem Drift Championship – ICC secured 1st place', featured: true },
  { clan: 'CPM CONTENT STUDIO', type: 'TikTok / YouTube Video Shoot', date: 'Jun 2026', image: '/gallery/icc-meet-parking-showcase.png', highlight: 'Cinematic livery showcase video reaching 500K+ views', featured: false },
  { clan: 'STREET KINGS ALLIANCE', type: 'Clan Alliance / Partnership', date: 'May 2026', image: '/gallery/icc-meet-bridge-lineup.png', highlight: 'Cross-clan drag wars event at Airport Strip', featured: false },
];

const fallbackVideos = [
  { title: 'ICC CLAN MEETS & TOUGE DRIFT // VOL. 1', youtube_url: '/videos/icc-montage-1.mp4', thumbnail_url: '/gallery/icc-meet-touge-pass.png', category: 'Touge & Drift', description: 'Cinematic Car Parking Multiplayer clan assembly, convoy lines, and mountain pass high speed runs.', featured: true },
  { title: 'STANCE & PERFORMANCE SHOWCASE // VOL. 2', youtube_url: '/videos/icc-montage-2.mp4', thumbnail_url: '/gallery/icc-meet-grand-gathering.png', category: 'Car Meet & Cruise', description: 'Custom liveries, stance camber builds, and tandem drift runs from the official ICC community roster.', featured: true },
];

const fallbackGallery = [
  { title: 'Mountain Touge Clan Assembly', image_url: '/gallery/icc-meet-touge-pass.png', category: 'Meets', author: 'ICC Photography', creator_role: 'Photographer', car: 'Subaru WRX STI / BRZ Squad' },
  { title: 'Grand Clan Gathering Full Roster', image_url: '/gallery/icc-meet-grand-gathering.png', category: 'Meets', author: 'ICC Photography', creator_role: 'Photographer', car: 'Full ICC Lineup' },
  { title: 'Airport Strip Stance Showcase', image_url: '/gallery/icc-meet-parking-showcase.png', category: 'Meets', author: 'ICC Photography', creator_role: 'Photographer', car: 'Multi-Chassis Meet' },
  { title: 'Civic Custom Stance Spec [DY 696]', image_url: '/gallery/icc-build-honda-dy696.png', category: 'Builds', author: 'ICC_TITAN', car: 'Honda Civic Custom' },
  { title: 'Lexus LFA & Spoon Pit Hangout', image_url: '/gallery/icc-meet-lexus-lfa-honda.png', category: 'Builds', author: 'ICC_GHOST', car: 'Lexus LFA V10' },
  { title: 'BMW E36 Stance Clean Fitment', image_url: '/gallery/icc-build-bmw-e36-stance.png', category: 'Builds', author: 'ICC_VIPER', car: 'BMW M3 E36 Coupe' },
  { title: 'Porsche GT Stance Track Livery', image_url: '/gallery/icc-build-porsche-stance.png', category: 'Builds', author: 'ICC_KAI', car: 'Porsche 911 GT' },
  { title: 'Midnight Multi-Level Garage Meet', image_url: '/gallery/icc-meet-night-garage.png', category: 'Meets', author: 'ICC Photography', car: 'Midnight Fleet' },
];

const fallbackEvents = [
  { title: 'ICC GRAND STANCE CAR MEET & SHOWCASE', event_date: new Date(Date.now() + 86400000 * 3).toISOString(), location: 'City 1 - Marina Docks (Server ICC-MAIN)', category: 'Car Meet', description: 'Our weekly signature clan gathering. Clean builds only, livery contest, and night cruise around the loop.', status: 'upcoming' },
  { title: 'MIDNIGHT TOUGE DRIFT BATTLE // CUP 4', event_date: new Date(Date.now() + 86400000 * 7).toISOString(), location: 'Mountain Pass Section 3 (Tandem Server)', category: 'Tournament', description: 'Bracket drift battle tournament with judge scoring on angle, clipping points, and proximity.', status: 'upcoming' },
  { title: 'HIGH SPEED AIRPORT STRIP DRAG WARS', event_date: new Date(Date.now() + 86400000 * 12).toISOString(), location: 'Desert Airport Runway (Speed Server)', category: 'Drag Race', description: 'AWD vs RWD classes. 400m standing quarter-mile shootout. Exclusive winner roles awarded in Discord.', status: 'upcoming' },
];

async function seed() {
  console.log('Seeding Firestore collections...');

  // 1. Members
  const memSnap = await getDocs(collection(db, 'members'));
  if (memSnap.empty) {
    console.log('Seeding members...');
    for (const m of fallbackMembers) {
      await addDoc(collection(db, 'members'), { ...m, created_at: new Date().toISOString() });
    }
    console.log('Members seeded:', fallbackMembers.length);
  } else {
    console.log('Members already exist:', memSnap.size);
  }

  // 2. Past Collaborations
  const pastSnap = await getDocs(collection(db, 'past_collaborations'));
  if (pastSnap.empty) {
    console.log('Seeding past_collaborations...');
    for (const p of fallbackPastCollabs) {
      await addDoc(collection(db, 'past_collaborations'), { ...p, created_at: new Date().toISOString() });
    }
    console.log('Past collaborations seeded:', fallbackPastCollabs.length);
  } else {
    console.log('Past collaborations already exist:', pastSnap.size);
  }

  // 3. Videos
  const vidSnap = await getDocs(collection(db, 'videos'));
  if (vidSnap.empty) {
    console.log('Seeding videos...');
    for (const v of fallbackVideos) {
      await addDoc(collection(db, 'videos'), { ...v, created_at: new Date().toISOString() });
    }
    console.log('Videos seeded:', fallbackVideos.length);
  } else {
    console.log('Videos already exist:', vidSnap.size);
  }

  // 4. Gallery
  const galSnap = await getDocs(collection(db, 'gallery'));
  if (galSnap.empty) {
    console.log('Seeding gallery...');
    for (const g of fallbackGallery) {
      await addDoc(collection(db, 'gallery'), { ...g, created_at: new Date().toISOString() });
    }
    console.log('Gallery seeded:', fallbackGallery.length);
  } else {
    console.log('Gallery already exist:', galSnap.size);
  }

  // 5. Events
  const evtSnap = await getDocs(collection(db, 'events'));
  if (evtSnap.empty) {
    console.log('Seeding events...');
    for (const e of fallbackEvents) {
      await addDoc(collection(db, 'events'), { ...e, created_at: new Date().toISOString() });
    }
    console.log('Events seeded:', fallbackEvents.length);
  } else {
    console.log('Events already exist:', evtSnap.size);
  }

  console.log('ALL SEEDING COMPLETED SUCCESSFULLY!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
