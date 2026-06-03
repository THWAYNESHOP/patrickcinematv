export interface LiveTvChannel {
  id: string;
  name: string;
  category: ChannelCategory;
  streamUrl: string;
  isHD: boolean;
  logo?: string;
}

export type ChannelCategory =
  | 'UK Sports'
  | 'International Sports'
  | 'Setanta Sports'
  | 'Go3 Sports'
  | 'Balkan Sports'
  | 'Digi Sports'
  | 'Czech Sports'
  | 'Other Sports';

export const liveTvChannels: LiveTvChannel[] = [
  // UK Sports
  {
    id: 'tnt-sports-1-hd-uk',
    name: 'TNT Sports 1 HD',
    category: 'UK Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/Z6V9d48eGz/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'tnt-sports-2-hd-uk',
    name: 'TNT Sports 2 HD',
    category: 'UK Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/3Z76Abnp8N/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'tnt-sports-3-hd-uk',
    name: 'TNT Sports 3 HD',
    category: 'UK Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/r25HTg8Sx7/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'tnt-sports-4-hd-uk',
    name: 'TNT Sports 4 HD',
    category: 'UK Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/Ff54kV22Cg/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'sky-sport-arena-hd-uk',
    name: 'Sky Sport Arena HD',
    category: 'UK Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/uC3alP4H/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'sky-sports-action-hd-uk',
    name: 'Sky Sports Action HD',
    category: 'UK Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/fedegwwSe/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'sky-sport-mix-hd-uk',
    name: 'Sky Sport Mix HD',
    category: 'UK Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/VehBD92Q/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'sky-sports-golf-hd-uk',
    name: 'Sky Sports Golf HD',
    category: 'UK Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/alwFYkJK/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'sky-sports-cricket-hd-uk',
    name: 'Sky Sports Cricket HD',
    category: 'UK Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/cOwmjQnG/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'sky-sport-f1-hd-uk',
    name: 'Sky Sport F1 HD',
    category: 'UK Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/mMYFHBz8/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'sky-sport-football-hd-uk',
    name: 'Sky Sport Football HD',
    category: 'UK Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/LKGg4xhJ/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'sky-sport-main-event-hd-uk',
    name: 'Sky Sport Main Event HD',
    category: 'UK Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/zuatk8cz/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'sky-sport-news-hd-uk',
    name: 'Sky Sport News HD',
    category: 'UK Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/3IHoar5e/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'sky-sport-racing-hd-uk',
    name: 'Sky Sport Racing HD',
    category: 'UK Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/u9cU1TJZ/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'sky-sport-calcio-hd-it',
    name: 'Sky Sport Calcio HD',
    category: 'UK Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/hAfNs796B9/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },

  // International Sports
  {
    id: 'nba-tv-hd',
    name: 'NBA TV HD',
    category: 'International Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/xorKeNtEon/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'nhl-network',
    name: 'NHL Network',
    category: 'International Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/bAsKeterec/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: false,
  },
  {
    id: 'espn-hd',
    name: 'ESPN HD',
    category: 'International Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/rEntionEOp/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'fox-sport-1-hd',
    name: 'Fox Sport 1 HD',
    category: 'International Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/lOgencONiS/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'fox-sport-2-hd',
    name: 'Fox Sport 2 HD',
    category: 'International Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/quiCkTaNDE/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'cbc-sport-hd',
    name: 'CBC Sport HD',
    category: 'International Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/uhWq7W8LIJne/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'best4sport-tv-lv',
    name: 'Best4Sport TV',
    category: 'International Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/StrOnETrif/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: false,
  },

  // Setanta Sports
  {
    id: 'setanta-sports-ua',
    name: 'Setanta Sports UA',
    category: 'Setanta Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/XazEkCLbtM/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: false,
  },
  {
    id: 'setanta-sports-plus-ua',
    name: 'Setanta Sports + UA',
    category: 'Setanta Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/ANchoNjESC/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: false,
  },
  {
    id: 'upl-tv',
    name: 'UPL TV',
    category: 'Setanta Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/hfesfdhfjk/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: false,
  },
  {
    id: 'setanta-sports-1-eu',
    name: 'Setanta Sports 1 EU',
    category: 'Setanta Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/SetantaSportHD/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'setanta-sports-2-eu',
    name: 'Setanta Sports 2 EU',
    category: 'Setanta Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/SetantaEurasiaplus/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'setanta-sports-1-ge',
    name: 'Setanta Sports 1 GE',
    category: 'Setanta Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/REDICiFOuS/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: false,
  },
  {
    id: 'setanta-sports-1-md',
    name: 'Setanta Sports 1 MD',
    category: 'Setanta Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/vkgQ1Zw3ZF3W/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: false,
  },
  {
    id: 'setanta-qazaqstan',
    name: 'Setanta Qazaqstan',
    category: 'Setanta Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/icHYPTiCAG/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: false,
  },

  // Go3 Sports
  {
    id: 'go3-sport-1-hd',
    name: 'Go3 Sport 1 HD',
    category: 'Go3 Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/xVlZwIumys/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'go3-sport-2-hd',
    name: 'Go3 Sport 2 HD',
    category: 'Go3 Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/bjxBGRFBYR/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'go3-sport-3-hd',
    name: 'Go3 Sport 3 HD',
    category: 'Go3 Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/hwlYGiD7DJn8/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'go3-sport-4-hd',
    name: 'Go3 Sport 4 HD',
    category: 'Go3 Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/fgerHJifwhw4/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'go3-sport-open-hd',
    name: 'Go3 Sport Open HD',
    category: 'Go3 Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/obTrIngoUr/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },

  // Balkan Sports
  {
    id: 'max-sport-1-hd',
    name: 'Max Sport 1 HD',
    category: 'Balkan Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/imVJ0eJefpbM/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'max-sport-2-hd',
    name: 'Max Sport 2 HD',
    category: 'Balkan Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/t8bqPjUmEXYP/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'max-sport-3-hd',
    name: 'Max Sport 3 HD',
    category: 'Balkan Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/AUCDhnAEhYhL/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'diemasport-1-hd-bg',
    name: 'Diemasport 1 HD',
    category: 'Balkan Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/59Xxas4T4N/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'diemasport-2-hd-bg',
    name: 'Diemasport 2 HD',
    category: 'Balkan Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/yEa58Rr77G/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'diemasport-3-hd-bg',
    name: 'Diemasport 3 HD',
    category: 'Balkan Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/394taY3pEN/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'nova-sport-hd-bg',
    name: 'Nova Sport HD',
    category: 'Balkan Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/ASIlkyrOST/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'nova-sport-2-hd-bg',
    name: 'Nova Sport 2 HD',
    category: 'Balkan Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/yGMaNCTrio/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },

  // Digi Sports
  {
    id: 'digi-4k',
    name: 'Digi 4K',
    category: 'Digi Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/Wgerger44f/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'digi-sport-1-hd',
    name: 'Digi Sport 1 HD',
    category: 'Digi Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/UsEnSMArci/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'digi-sport-2-hd',
    name: 'Digi Sport 2 HD',
    category: 'Digi Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/GOnDepEJaP/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'digi-sport-3-hd',
    name: 'Digi Sport 3 HD',
    category: 'Digi Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/lvErOUTOEC/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'digi-sport-4-hd',
    name: 'Digi Sport 4 HD',
    category: 'Digi Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/RMOnaRysTL/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },

  // Czech Sports
  {
    id: 'sport-1-cz',
    name: 'Sport 1',
    category: 'Czech Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/a7yY2X33Vs/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: false,
  },
  {
    id: 'sport-2-cz',
    name: 'Sport 2',
    category: 'Czech Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/mn5P6S6d3F/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: false,
  },

  // Other Sports
  {
    id: 'eurosport-1-hd',
    name: 'Eurosport 1 HD',
    category: 'Other Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/EurosportHD/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
  {
    id: 'eurosport-2-hd',
    name: 'Eurosport 2 HD',
    category: 'Other Sports',
    streamUrl: 'http://ronaldo.tvfor.pro/Eurosport2HDRussia/tht6v98456np1k198n81n2t8?|User-Agent=http-user-agent=Lavf/56.15.102',
    isHD: true,
  },
];

export const channelCategories: ChannelCategory[] = [
  'UK Sports',
  'International Sports',
  'Setanta Sports',
  'Go3 Sports',
  'Balkan Sports',
  'Digi Sports',
  'Czech Sports',
  'Other Sports',
];
