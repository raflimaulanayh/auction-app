import type { Auction, Bid, ProxyBid, User } from '../types'

export const DEMO_USERS: User[] = [
  { id: 'u-budi', name: 'Budi Santoso', email: 'budi@lelangin.id', role: 'buyer' },
  { id: 'u-sari', name: 'Sari Collection', email: 'sari@lelangin.id', role: 'seller' },
]

export const BOTS = [
  { id: 'u-andi', name: 'Andi P.' },
  { id: 'u-rina', name: 'Rina W.' },
  { id: 'u-dewi', name: 'Dewi K.' },
  { id: 'u-fajar', name: 'Fajar R.' },
]

// Free Unsplash photos (hotlinked via their CDN). Items without an entry fall back to
// the illustrated placeholder, which also covers photos that fail to load.
const PHOTOS: Record<string, string[]> = {
  'iphone-16-pro-max': [
    'photo-1727093493838-5a5f2da03b65',
    'photo-1727013884184-b313982327f3',
    'photo-1695822822491-d92cee704368',
    'photo-1695823018812-c684c980ede6',
  ],
  'rolex-submariner': [
    'photo-1662384197911-e82189f4dc60',
    'photo-1526045431048-f857369baa09',
    'photo-1681149530815-76c2e829c2d2',
  ],
  'vespa-sprint': [
    'photo-1623241207542-0a29432c0d1c',
    'photo-1619810148944-b8ae943b049a',
    'photo-1779168877350-46203d95556f',
    'photo-1638730177894-d4da3051261d',
  ],
  'lukisan-senja-ubud': [
    'photo-1688590987514-97a7bf2953bb',
    'photo-1775311406542-1e18d37f7012',
    'photo-1742672001310-a6fab9c25b92',
    'photo-1775311406662-e075f7c98dd4',
  ],
  'jordan-1-chicago': [
    'photo-1669205073423-5da5a5280572',
    'photo-1686931463322-916e93213d86',
    'photo-1565571323165-ab0ee8e01666',
  ],
  'macbook-pro-m4': [
    'photo-1541807084-5c52b6b3adef',
    'photo-1537498425277-c283d32ef9db',
    'photo-1611186871348-b1ce696e52c9',
    'photo-1651241678796-422d47d747ce',
  ],
  'koin-voc-1790': [
    'photo-1589180176337-503fed4bcfe0',
    'photo-1624295329185-13a841e9a268',
    'photo-1624365167573-80c5d1b7681f',
    'photo-1725790156908-26a251178d10',
  ],
  'sony-a7iv': [
    'photo-1603457893497-4de5ef1d8ab1',
    'photo-1552233706-c3ff6a3da279',
    'photo-1606986628470-26a67fa4730c',
    'photo-1552233707-a3185320d9a0',
  ],
  'keris-luk-9': ['photo-1702287721762-a0b2dc0f0e70', 'photo-1577081467890-d407baf6fc1f'],
  'ps5-pro-bundle': [
    'photo-1606144042614-b2417e99c4e3',
    'photo-1731405849985-8e5478dddc5e',
    'photo-1670535787435-63a39a5b8d32',
    'photo-1670535788315-6b7d64aa020c',
  ],
  'fender-strat-1978': [
    'photo-1763518372027-6978e6bf5885',
    'photo-1649520067033-ef64fee2d060',
    'photo-1632413190012-4a9591b7eb91',
  ],
}
const photo = (path: string) =>
  `https://images.unsplash.com/${path}?w=900&q=75&auto=format&fit=crop`

const MIN = 60_000
const HOUR = 60 * MIN

export interface DemoDb {
  auctions: Auction[]
  bids: Bid[]
  proxies: ProxyBid[]
  watchlist: Record<string, string[]>
}

export function createSeed(now = Date.now()): DemoDb {
  const base = { extendedCount: 0, createdAt: now - 2 * HOUR }
  const auctions: Auction[] = [
    {
      ...base,
      id: 'iphone-16-pro-max',
      title: 'iPhone 16 Pro Max 256GB — Desert Titanium',
      description:
        'Garansi resmi iBox s/d Agustus 2027. Battery health 100%, fullset dengan kotak dan kabel original. Mulus tanpa lecet, selalu pakai case.',
      category: 'electronics',
      sellerId: 'u-sari',
      sellerName: 'Sari Collection',
      type: 'english',
      startsAt: now - 3 * HOUR,
      endsAt: now + 2.5 * MIN,
      startingPrice: 15_000_000,
      currentPrice: 17_500_000,
      reservePrice: 18_000_000,
      buyNowPrice: 24_000_000,
    },
    {
      ...base,
      id: 'rolex-submariner',
      title: 'Rolex Submariner Date 126610LN (2023)',
      description:
        'Box & papers lengkap, kartu garansi internasional 2023. Kondisi 98%, baru servis. Sertifikat keaslian dari watch specialist Jakarta.',
      category: 'watches',
      sellerId: 'u-sari',
      sellerName: 'Sari Collection',
      type: 'english',
      startsAt: now - 5 * HOUR,
      endsAt: now + 45 * MIN,
      startingPrice: 150_000_000,
      currentPrice: 163_000_000,
      reservePrice: 180_000_000,
    },
    {
      ...base,
      id: 'vespa-sprint',
      title: 'Vespa Sprint S 150 i-get 2022 — Matt Black',
      description:
        'Odometer 6.200 km, pajak hidup, servis rutin di dealer resmi. Surat lengkap BPKB & STNK a/n sendiri.',
      category: 'vehicles',
      sellerId: 'u-galeri',
      sellerName: 'Garasi Kemang',
      type: 'english',
      startsAt: now - HOUR,
      endsAt: now + 3 * HOUR,
      startingPrice: 30_000_000,
      currentPrice: 31_500_000,
    },
    {
      ...base,
      id: 'lukisan-senja-ubud',
      title: "Lukisan Minyak 'Senja di Ubud' 120×80 cm",
      description:
        'Karya asli pelukis Bali, cat minyak di atas kanvas, 2019. Termasuk bingkai kayu jati dan sertifikat keaslian bertanda tangan seniman.',
      category: 'art',
      sellerId: 'u-galeri',
      sellerName: 'Galeri Nusantara',
      type: 'dutch',
      startsAt: now - 3 * MIN,
      endsAt: now + 40 * MIN,
      startingPrice: 25_000_000,
      currentPrice: 25_000_000,
      floorPrice: 8_000_000,
      decrement: 500_000,
      intervalSec: 20,
    },
    {
      ...base,
      id: 'jordan-1-chicago',
      title: "Nike Air Jordan 1 Retro High OG 'Chicago Lost & Found'",
      description:
        'Size EU 43, deadstock (belum pernah dipakai), lengkap dengan box dan kertas. Dibeli dari SNKRS.',
      category: 'fashion',
      sellerId: 'u-sari',
      sellerName: 'Sari Collection',
      type: 'dutch',
      startsAt: now - MIN,
      endsAt: now + 30 * MIN,
      startingPrice: 9_000_000,
      currentPrice: 9_000_000,
      floorPrice: 3_000_000,
      decrement: 250_000,
      intervalSec: 15,
    },
    {
      ...base,
      id: 'macbook-pro-m4',
      title: 'MacBook Pro 14" M4 Pro 24GB / 1TB — Space Black',
      description:
        'Segel, garansi resmi Indonesia 1 tahun. Lelang tertutup: tawaran tidak terlihat peserta lain.',
      category: 'electronics',
      sellerId: 'u-sari',
      sellerName: 'Sari Collection',
      type: 'sealed',
      startsAt: now - 2 * HOUR,
      endsAt: now + 2 * HOUR,
      startingPrice: 25_000_000,
      currentPrice: 25_000_000,
    },
    {
      ...base,
      id: 'koin-voc-1790',
      title: 'Koin Emas VOC 1790 — Duit Ducat Holland',
      description:
        'Koin emas asli era VOC, berat 3,5 gram. Telah diverifikasi numismatis, kondisi XF (extremely fine).',
      category: 'collectibles',
      sellerId: 'u-galeri',
      sellerName: 'Numismatik Antik',
      type: 'sealed',
      startsAt: now - 26 * HOUR,
      endsAt: now - 10 * MIN,
      startingPrice: 5_000_000,
      currentPrice: 5_000_000,
    },
    {
      ...base,
      id: 'sony-a7iv',
      title: 'Sony A7 IV + FE 24-70mm f/2.8 GM II',
      description: 'Shutter count 3.100, mulus, lengkap dengan 2 baterai original dan tas kamera.',
      category: 'electronics',
      sellerId: 'u-sari',
      sellerName: 'Sari Collection',
      type: 'english',
      startsAt: now + 20 * MIN,
      endsAt: now + 24 * HOUR,
      startingPrice: 28_000_000,
      currentPrice: 28_000_000,
    },
    {
      ...base,
      id: 'hermes-birkin-30',
      title: 'Hermès Birkin 30 Togo Gold GHW',
      description:
        'Stamp Z (2021), fullset dengan receipt butik Singapura. Kondisi very good, sudut tidak aus.',
      category: 'fashion',
      sellerId: 'u-galeri',
      sellerName: 'Luxe Preloved',
      type: 'english',
      startsAt: now - 10 * HOUR,
      endsAt: now + 26 * HOUR,
      startingPrice: 250_000_000,
      currentPrice: 262_000_000,
      reservePrice: 280_000_000,
    },
    {
      ...base,
      id: 'keris-luk-9',
      title: 'Keris Pusaka Luk 9 Pamor Beras Wutah',
      description:
        'Tangguh Mataram, warangka kayu timoho. Dilengkapi surat keterangan dari pakar tosan aji.',
      category: 'collectibles',
      sellerId: 'u-galeri',
      sellerName: 'Numismatik Antik',
      type: 'english',
      startsAt: now - 30 * HOUR,
      endsAt: now - HOUR,
      startingPrice: 8_000_000,
      currentPrice: 12_500_000,
      winnerId: 'u-budi',
    },
    {
      ...base,
      id: 'ps5-pro-bundle',
      title: 'PlayStation 5 Pro + 2 DualSense Edge',
      description: 'Garansi resmi Sony Indonesia, pemakaian 2 bulan. Bonus 3 game fisik.',
      category: 'electronics',
      sellerId: 'u-sari',
      sellerName: 'Sari Collection',
      type: 'dutch',
      startsAt: now + 10 * MIN,
      endsAt: now + 70 * MIN,
      startingPrice: 14_000_000,
      currentPrice: 14_000_000,
      floorPrice: 9_000_000,
      decrement: 200_000,
      intervalSec: 30,
    },
    {
      ...base,
      id: 'fender-strat-1978',
      title: 'Fender Stratocaster 1978 Vintage Sunburst',
      description: 'All original, neck lurus, fret 80%. Termasuk hardcase original Fender.',
      category: 'collectibles',
      sellerId: 'u-galeri',
      sellerName: 'Garasi Kemang',
      type: 'sealed',
      startsAt: now - HOUR,
      endsAt: now + 5 * HOUR,
      startingPrice: 35_000_000,
      currentPrice: 35_000_000,
    },
  ]

  let n = 0
  const bid = (
    auctionId: string,
    userId: string,
    userName: string,
    amount: number,
    agoMin: number,
  ) => ({
    id: `seed-${n++}`,
    auctionId,
    userId,
    userName,
    amount,
    at: now - agoMin * MIN,
  })

  const bids: Bid[] = [
    bid('iphone-16-pro-max', 'u-rina', 'Rina W.', 15_000_000, 170),
    bid('iphone-16-pro-max', 'u-budi', 'Budi Santoso', 15_500_000, 140),
    bid('iphone-16-pro-max', 'u-dewi', 'Dewi K.', 16_200_000, 90),
    bid('iphone-16-pro-max', 'u-budi', 'Budi Santoso', 16_800_000, 40),
    bid('iphone-16-pro-max', 'u-andi', 'Andi P.', 17_500_000, 6),
    bid('rolex-submariner', 'u-fajar', 'Fajar R.', 150_000_000, 280),
    bid('rolex-submariner', 'u-dewi', 'Dewi K.', 158_000_000, 120),
    bid('rolex-submariner', 'u-fajar', 'Fajar R.', 163_000_000, 25),
    bid('vespa-sprint', 'u-andi', 'Andi P.', 30_000_000, 50),
    bid('vespa-sprint', 'u-rina', 'Rina W.', 31_500_000, 20),
    bid('hermes-birkin-30', 'u-dewi', 'Dewi K.', 255_000_000, 400),
    bid('hermes-birkin-30', 'u-fajar', 'Fajar R.', 262_000_000, 200),
    bid('keris-luk-9', 'u-andi', 'Andi P.', 9_000_000, 1500),
    bid('keris-luk-9', 'u-budi', 'Budi Santoso', 11_000_000, 900),
    bid('keris-luk-9', 'u-rina', 'Rina W.', 12_000_000, 300),
    bid('keris-luk-9', 'u-budi', 'Budi Santoso', 12_500_000, 70),
    // Sealed bids — hidden from other participants until the auction closes.
    bid('macbook-pro-m4', 'u-andi', 'Andi P.', 27_500_000, 100),
    bid('macbook-pro-m4', 'u-rina', 'Rina W.', 29_000_000, 60),
    bid('macbook-pro-m4', 'u-fajar', 'Fajar R.', 26_000_000, 30),
    bid('koin-voc-1790', 'u-budi', 'Budi Santoso', 8_200_000, 300),
    bid('koin-voc-1790', 'u-andi', 'Andi P.', 7_500_000, 200),
    bid('koin-voc-1790', 'u-rina', 'Rina W.', 6_000_000, 100),
    bid('fender-strat-1978', 'u-dewi', 'Dewi K.', 38_000_000, 40),
  ]

  // Andi defends the iPhone up to 18.5jt — demonstrates proxy bidding against Budi.
  const proxies: ProxyBid[] = [
    { auctionId: 'iphone-16-pro-max', userId: 'u-andi', userName: 'Andi P.', max: 18_500_000 },
  ]

  for (const a of auctions) {
    if (PHOTOS[a.id]) a.images = PHOTOS[a.id].map(photo)
  }

  return {
    auctions,
    bids,
    proxies,
    watchlist: { 'u-budi': ['rolex-submariner', 'lukisan-senja-ubud'] },
  }
}
