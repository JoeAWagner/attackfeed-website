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
  { url: "https://www.theregister.com/security/headlines.atom", source: "The Register", category: "news" },
  { url: "https://cyberscoop.com/feed/", source: "CyberScoop", category: "news" },
  { url: "https://hackread.com/feed/", source: "Hackread", category: "news" },
  { url: "https://www.infosecurity-magazine.com/rss/news/", source: "Infosecurity Magazine", category: "news" },
  { url: "https://feeds.feedburner.com/securityweek", source: "SecurityWeek", category: "news" },
  { url: "https://www.wired.com/feed/category/security/latest/rss", source: "Wired Security", category: "news" },
  { url: "https://www.securitymagazine.com/rss/topic/2236", source: "Security Magazine", category: "news" },

  // Gov Alerts / ISAC
  { url: "https://www.cisa.gov/uscert/ncas/alerts.xml", source: "CISA Alerts", category: "gov-alerts" },
  { url: "https://www.cisa.gov/uscert/ncas/current-activity.xml", source: "CISA Current Activity", category: "gov-alerts" },
  { url: "https://www.cisa.gov/news.xml", source: "CISA News", category: "gov-alerts" },
  { url: "https://www.ncsc.gov.uk/api/1/services/v1/report-rss-feed.xml", source: "UK NCSC", category: "gov-alerts" },
  { url: "https://www.cisecurity.org/feed/advisories", source: "CIS Advisories", category: "gov-alerts" },

  // Vulnerability Alerts
  { url: "https://www.zerodayinitiative.com/rss/published/", source: "Zero Day Initiative", category: "vulnerabilities" },
  { url: "https://www.exploit-db.com/rss.xml", source: "Exploit-DB", category: "vulnerabilities" },
  { url: "https://seclists.org/rss/fulldisclosure.rss", source: "Full Disclosure", category: "vulnerabilities" },
  { url: "https://research.checkpoint.com/feed/", source: "Check Point Research", category: "vulnerabilities" },
  { url: "https://labs.watchtowr.com/rss/", source: "watchTowr Labs", category: "vulnerabilities" },
  { url: "https://googleprojectzero.blogspot.com/feeds/posts/default", source: "Google Project Zero", category: "vulnerabilities" },
  { url: "https://unit42.paloaltonetworks.com/feed/", source: "Palo Alto Unit 42", category: "vulnerabilities" },
  { url: "https://www.mandiant.com/resources/blog/rss.xml", source: "Mandiant", category: "vulnerabilities" },

  // Privacy & Governance
  { url: "https://www.eff.org/rss/updates.xml", source: "EFF Deeplinks", category: "privacy" },
  { url: "https://www.proofpoint.com/us/rss.xml", source: "Proofpoint", category: "privacy" },
  { url: "https://www.privacyaffairs.com/feed/", source: "Privacy Affairs", category: "privacy" },
  { url: "https://nakedsecurity.sophos.com/feed/", source: "Sophos Naked Security", category: "privacy" },

  // Fraud & Scams
  { url: "https://www.ic3.gov/PSA/RSS", source: "FBI IC3", category: "fraud" },
  { url: "https://www.ftc.gov/feeds/press-release-consumer-protection.xml", source: "FTC Consumer Protection", category: "fraud" },
  { url: "https://krebsonsecurity.com/category/web-fraud-2-0/feed/", source: "Krebs on Security", category: "fraud" },
  { url: "https://blog.knowbe4.com/rss.xml", source: "KnowBe4", category: "fraud" },
  { url: "https://www.malwarebytes.com/blog/feed/index.xml", source: "Malwarebytes Labs", category: "fraud" },
];
