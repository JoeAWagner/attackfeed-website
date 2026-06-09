export interface FeedSource {
  url: string;
  source: string;
  category: string;
}

export const FEEDS: FeedSource[] = [
  // Attack & News Feeds
  { url: "https://feeds.feedburner.com/TheHackersNews", source: "The Hacker News", category: "news" },
  { url: "https://krebsonsecurity.com/feed/", source: "Krebs on Security", category: "news" },
  { url: "https://www.bleepingcomputer.com/feed/", source: "Bleeping Computer", category: "news" },
  { url: "https://www.darkreading.com/rss.xml", source: "Dark Reading", category: "news" },
  { url: "https://cyberscoop.com/feed/", source: "CyberScoop", category: "news" },
  { url: "https://hackread.com/feed/", source: "Hackread", category: "news" },
  { url: "https://www.infosecurity-magazine.com/rss/news/", source: "Infosecurity Magazine", category: "news" },
  { url: "https://feeds.feedburner.com/securityweek", source: "SecurityWeek", category: "news" },
  { url: "https://threatpost.com/feed/", source: "Threatpost", category: "news" },
  { url: "https://www.securitymagazine.com/rss/topic/2236", source: "Security Magazine", category: "news" },

  // Gov Alerts / ISAC
  { url: "https://www.cisa.gov/uscert/ncas/alerts.xml", source: "CISA Alerts", category: "gov-alerts" },
  { url: "https://www.cisa.gov/uscert/ncas/current-activity.xml", source: "CISA Current Activity", category: "gov-alerts" },
  { url: "https://www.ncsc.gov.uk/api/1/services/v1/report-rss-feed.xml", source: "UK NCSC", category: "gov-alerts" },
  { url: "https://www.cyber.gov.au/about-us/view-all-content/alerts-and-advisories/rss.xml", source: "Australian Cyber Security Centre", category: "gov-alerts" },
  { url: "https://www.cisecurity.org/feed/advisories", source: "CIS Advisories", category: "gov-alerts" },

  // Vulnerability Alerts
  { url: "https://www.zerodayinitiative.com/rss/published/", source: "Zero Day Initiative", category: "vulnerabilities" },
  { url: "https://www.exploit-db.com/rss.xml", source: "Exploit-DB", category: "vulnerabilities" },
  { url: "https://seclists.org/rss/fulldisclosure.rss", source: "Full Disclosure", category: "vulnerabilities" },
  { url: "https://www.rapid7.com/blog/tag/research/rss.xml", source: "Rapid7 Research", category: "vulnerabilities" },
  { url: "https://labs.watchtowr.com/rss/", source: "watchTowr Labs", category: "vulnerabilities" },
  { url: "https://googleprojectzero.blogspot.com/feeds/posts/default", source: "Google Project Zero", category: "vulnerabilities" },

  // Privacy & Governance
  { url: "https://www.theguardian.com/technology/privacy/rss", source: "The Guardian Privacy", category: "privacy" },
  { url: "https://www.eff.org/rss/updates.xml", source: "EFF Deeplinks", category: "privacy" },
  { url: "https://iapp.org/news/rss/", source: "IAPP", category: "privacy" },
  { url: "https://www.privacyaffairs.com/feed/", source: "Privacy Affairs", category: "privacy" },

  // Fraud & Scams
  { url: "https://www.consumer.ftc.gov/blog/feed", source: "FTC Consumer Alerts", category: "fraud" },
  { url: "https://www.ic3.gov/Media/News/rss", source: "FBI IC3", category: "fraud" },
  { url: "https://www.fraudwatchinternational.com/feed/", source: "FraudWatch International", category: "fraud" },
];
