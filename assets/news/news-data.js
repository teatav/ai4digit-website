/* AI4DigiT news: the single list behind the home page (latest 3) and news.html (all).
 *
 * To add a news item, add one object to NEWS. Order does not matter: items are
 * sorted by `date` (newest first) when shown. Put the picture in assets/news/.
 *   date   ISO date of the first day (used for sorting and <time datetime>)
 *   days   label on the timeline dot, e.g. "14–15" or "03"
 *   month  second line of the dot, "MM/YYYY"
 *   link   detail page (optional)
 */
const NEWS = [
  {
    date: "2026-07-14", days: "14–15", month: "07/2026",
    img: "assets/news/kickoff.jpg", link: "kickoff.html",
    tag:   { sq: "Event", en: "Event" },
    title: { sq: "Takimi Kick-Off i AI4DigiT", en: "AI4DigiT Kick-off Meeting" },
    desc:  { sq: "AI4DigiT u nis zyrtarisht, duke mbështetur transformimin digjital të NVM-ve dhe institucioneve publike shqiptare.",
             en: "AI4DigiT has officially launched, supporting the digital transformation of Albanian SMEs and public institutions." }
  },
  {
    date: "2026-09-15", days: "15–17", month: "09/2026",
    img: "assets/news/dortmund.jpg", link: "dortmund.html",
    tag:   { sq: "Event", en: "Event" },
    title: { sq: "AI4DigiT në EDIH Days të Digital Week Dortmund", en: "AI4DigiT at the EDIH Days of Digital Week Dortmund" },
    desc:  { sq: "AI4DigiT mori pjesë në EDIH Days @ Digital Week Dortmund, tri ditë networking dhe bashkëpunimi mes Qendrave Evropiane të Inovacionit Digjital.",
             en: "AI4DigiT took part in the EDIH Days @ Digital Week Dortmund, three days of networking and collaboration among European Digital Innovation Hubs." }
  }
];
