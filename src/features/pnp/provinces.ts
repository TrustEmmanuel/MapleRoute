export type PnpProgram = {
  code: string;
  name: string;
  programName: string;
  url: string;
  focus: string;
  model: string;
  streamLink?: { label: string; url: string };
  streamNote?: string;
};

export const PNP_LAST_VERIFIED = "2026-10-29";

export const PNP_SOURCE_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html";

export const PNP_PROGRAMS: PnpProgram[] = [
  {
    code: "on",
    name: "Ontario",
    programName: "Ontario Immigrant Nominee Program (OINP)",
    url: "https://www.ontario.ca/page/ontario-immigrant-nominee-program-oinp",
    focus:
      "The largest nominee program in Canada, with streams for workers already in the labour market and for Express Entry candidates.",
    model:
      "Ontario has been consolidating its streams. As of today the province lists the Ontario Workforce Priority stream as the one taking applications and marks its earlier streams as closed.",
    streamLink: {
      label: "See which Ontario streams are open",
      url: "https://www.ontario.ca/page/ontario-immigrant-nominee-program-streams",
    },
    streamNote:
      "Guides written for Ontario's older job offer, graduate or Express Entry streams are out of date — check the live stream list before you apply.",
  },
  {
    code: "bc",
    name: "British Columbia",
    programName: "BC Provincial Nominee Program (BC PNP)",
    url: "https://www.welcomebc.ca/immigrate-to-b-c/about-the-bc-provincial-nominee-program",
    focus:
      "Points-based, with strong pathways for technology, healthcare and trades workers, and for graduates of BC schools.",
    model:
      "You register an expression of interest, get a score, and BC invites the highest scorers in regular draws. A separate aligned route exists for people already in the Express Entry pool.",
  },
  {
    code: "ab",
    name: "Alberta",
    programName: "Alberta Advantage Immigration Program (AAIP)",
    url: "https://www.alberta.ca/alberta-advantage-immigration-program",
    focus:
      "Employer- and occupation-focused, with a technology pathway and streams for people already working in Alberta.",
    model:
      "Most routes need a job offer from an Alberta employer. Alberta also runs a dedicated technology pathway and streams for people already working in the province.",
  },
  {
    code: "sk",
    name: "Saskatchewan",
    programName: "Saskatchewan Immigrant Nominee Program (SINP)",
    url: "https://www.saskatchewan.ca/residents/moving-to-saskatchewan/live-in-saskatchewan/by-immigrating/saskatchewan-immigrant-nominee-program",
    focus:
      "Built around occupations in demand, graduates of Saskatchewan schools, and workers with a Saskatchewan employer.",
    model:
      "Saskatchewan scores an expression of interest and invites candidates by occupation and points. Some routes sit inside Express Entry; others run on the paper process.",
  },
  {
    code: "mb",
    name: "Manitoba",
    programName: "Manitoba Provincial Nominee Program (MPNP)",
    url: "https://immigratemanitoba.com/mpnp/",
    focus:
      "Weighs your ties to Manitoba — family, past work or study — alongside your ability to settle and find work.",
    model:
      "Manitoba uses a points system where a close relative, past study or past work in the province counts heavily. Candidates are invited from a pool in regular draws.",
  },
  {
    code: "ns",
    name: "Nova Scotia",
    programName: "Nova Scotia Nominee Program (NSNP)",
    url: "https://liveinnovascotia.com/",
    focus:
      "Targets occupations in demand and people with Nova Scotia work experience, and runs a stream for physicians.",
    model:
      "Nova Scotia selects by occupation and by work experience in the province. Several routes are linked to Express Entry, and there is a separate stream for physicians.",
  },
  {
    code: "nb",
    name: "New Brunswick",
    programName: "New Brunswick Provincial Nominee Program (NBPNP)",
    url: "https://www.gnb.ca/en/topic/family-home-community/immigration/provincial-nominee-program.html",
    focus:
      "Employer-driven, with streams built around a job offer from a New Brunswick employer.",
    model:
      "New Brunswick is primarily employer-driven: a New Brunswick employer offers you a job and supports the nomination. Some routes connect to Express Entry.",
  },
  {
    code: "pe",
    name: "Prince Edward Island",
    programName: "PEI Provincial Nominee Program (PEI PNP)",
    url: "https://www.princeedwardisland.ca/en/topic/immigrate-to-pei-as-a-worker",
    focus:
      "A small annual intake aimed at workers with a PEI employer and at entrepreneurs starting a business.",
    model:
      "PEI invites candidates from an expression of interest pool, mostly people with a job offer from a PEI employer. Business candidates follow a separate entrepreneur route.",
  },
  {
    code: "nl",
    name: "Newfoundland and Labrador",
    programName: "Newfoundland and Labrador Provincial Nominee Program (NLPNP)",
    url: "https://www.gov.nl.ca/immigration/immigrating-to-newfoundland-and-labrador/provincial-nominee-program/overview/",
    focus:
      "Mostly employer-driven — a job offer from a Newfoundland and Labrador employer carries the most weight.",
    model:
      "A Newfoundland and Labrador employer offers you a job and the province nominates you. A small number of nominations are released each year, so timing matters.",
  },
  {
    code: "yt",
    name: "Yukon",
    programName: "Yukon Nominee Program (YNP)",
    url: "https://yukon.ca/en/immigration/apply-immigrate-yukon/immigrate-yukon",
    focus:
      "A small, employer-driven program: a Yukon employer nominates you, and the territory reviews the application.",
    model:
      "The employer applies with you. Yukon reviews the job and the employer first, then your qualifications. The annual intake is small and fills quickly.",
  },
  {
    code: "nt",
    name: "Northwest Territories",
    programName: "Northwest Territories Nominee Program (NTNP)",
    url: "https://www.immigratenwt.ca/immigrate-here",
    focus:
      "Employer-driven with a Francophone stream, and a small number of nominations each year.",
    model:
      "An NWT employer applies on your behalf. The territory also runs a stream for French-speaking candidates, and its annual allocation is small.",
  },
];

export function findPnpProgram(code: string) {
  return PNP_PROGRAMS.find((program) => program.code === code) ?? null;
}
