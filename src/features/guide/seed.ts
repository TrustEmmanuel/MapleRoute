import type { Guide, GuideStep } from "./types";

export const GUIDE_SLUG = "express-entry-profile";
export const GUIDE_TITLE = "Create your Express Entry profile";

// Verified against the public pages on 2026-10-29. The old submit-profile URL
// now redirects to create-profile.html.
const CREATE_PROFILE_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/create-profile.html";
const DOCUMENTS_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents.html";
const SECURE_ACCOUNT_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/account.html";
const WHO_CAN_APPLY_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply.html";
const ROUNDS_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html";
const APPLY_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/apply-permanent-residence.html";
const AFTER_APPLY_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/after-apply.html";
const APPROVED_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/application-approved.html";
const BIOMETRICS_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/biometrics.html";
const MEDICAL_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/medical-exams/requirements-permanent-residents.html";
const POLICE_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/police-certificates.html";
const FEES_URL = "https://ircc.canada.ca/english/information/fees/fees.asp";
const LANGUAGE_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-test.html";
const ECA_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/education-assessment.html";
const NOC_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/find-national-occupation-code.html";
const PROOF_FUNDS_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html";
const VERIFIED_ON = "2026-10-29";

const SECTION_TITLES = [
  "Before you start (what to prepare)",
  "Log in or create your profile",
  "Personal details",
  "Check you're eligible",
  "Answer the online questionnaire and get your reference code",
  "Language results",
  "Education",
  "Work history",
  "Family details",
  "Review and submit",
  "Apply for permanent residence",
  "After you apply",
  "If we approve your application",
];

function sectionId(index: number) {
  const slug = SECTION_TITLES[index]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `section-${slug}`;
}

function step(
  value: Partial<GuideStep> &
    Pick<GuideStep, "id" | "sectionId" | "position" | "title" | "instruction">,
): GuideStep {
  return {
    fieldLabelOnOfficialPage: null,
    officialPageName: null,
    officialUrl: CREATE_PROFILE_URL,
    extraLinks: [],
    requiredDocuments: [],
    commonMistakes: [],
    boostTip: null,
    personalizationKey: null,
    status: "ready",
    sourceUrl: CREATE_PROFILE_URL,
    lastVerified: VERIFIED_ON,
    verifiedBy: null,
    screenshots: [],
    ...value,
  };
}

const SEED_STEPS: Record<number, GuideStep[]> = {
  1: [
    step({
      id: "step-open-official-page",
      sectionId: sectionId(1),
      position: 0,
      title: "Open the official page in a new tab",
      instruction:
        "Open the official “Create your profile and enter the pool” page and keep it in a second tab, next to MapleRoute.\nYou'll do everything on that page. MapleRoute only tells you what to do next and lets you tick each step off once it's done there.\nOn a phone, open the page in your browser first, then come back here — you'll switch between the two.",
      officialPageName: "Create your profile and enter the pool",
      extraLinks: [
        { label: "Get your documents ready", url: DOCUMENTS_URL },
      ],
    }),
    step({
      id: "step-register-secure-account",
      sectionId: sectionId(1),
      position: 1,
      title: "Register for an IRCC secure account",
      instruction:
        "If you don't have an IRCC secure account yet, create one before you start the profile.\nOn the official sign-in page, look for “Create an account” and choose “Register for an account”.\nIf you already have an account, skip this step and go to the next one. MapleRoute never asks for your sign-in details.",
      officialUrl: SECURE_ACCOUNT_URL,
      sourceUrl: SECURE_ACCOUNT_URL,
      officialPageName: "IRCC secure account",
      extraLinks: [
        { label: "Open the IRCC secure account page", url: SECURE_ACCOUNT_URL },
      ],
      screenshots: [
        {
          id: "seed-shot-register-account",
          storagePath: "/guide/ircc-sign-in-or-register.png",
          altText:
            "Official IRCC secure account page. The Register for an account button is on the right, next to the Sign in options.",
          position: 0,
          highlights: [
            {
              x: 50.2,
              y: 16.6,
              w: 24.2,
              h: 6.8,
              label: "Register for an account",
            },
          ],
        },
      ],
    }),
    step({
      id: "step-sign-in-secure-account",
      sectionId: sectionId(1),
      position: 2,
      title: "Sign in to your IRCC secure account",
      instruction:
        "On the official sign-in page, sign in with your GCKey username and password, or with a Canadian Interac® Sign-In Partner.\nIf you just created your account, use the details you set up. If you don't have an account, go back one step and register first.\nUse a password you don't use anywhere else. MapleRoute will never ask for it.",
      officialUrl: SECURE_ACCOUNT_URL,
      sourceUrl: SECURE_ACCOUNT_URL,
      officialPageName: "IRCC secure account",
      extraLinks: [
        { label: "Sign in to your IRCC secure account", url: SECURE_ACCOUNT_URL },
      ],
      commonMistakes: [
        "Sharing your IRCC password with anyone, including a guide or agent.",
        "Reusing a password from another website.",
      ],
      screenshots: [
        {
          id: "seed-shot-sign-in",
          storagePath: "/guide/ircc-sign-in-or-register.png",
          altText:
            "Official IRCC secure account page showing GCKey username and password, Canadian Interac Sign-In Partner, and Register for an account.",
          position: 0,
          highlights: [
            {
              x: 17.2,
              y: 16.6,
              w: 24.8,
              h: 6.8,
              label: "Sign in with GCKey",
            },
          ],
        },
      ],
    }),
    step({
      id: "step-create-express-entry-profile",
      sectionId: sectionId(1),
      position: 3,
      title: "Create your Express Entry profile",
      instruction:
        "Once you're signed in, start a new Express Entry profile from your account. The official page calls this “Create your profile and enter the pool”.\nWhen the profile form opens, come back here. The next steps walk you through the first fields one at a time, next to the official form.\nTick this step only after the profile form is open in your other tab.",
      officialPageName: "Create your profile and enter the pool",
    }),
  ],
  2: [
    step({
      id: "step-enter-surname",
      sectionId: sectionId(2),
      position: 0,
      title: "Enter your surname",
      instruction:
        "On the official form, find the field for your surname.\nType it exactly as it appears on the passport you'll use for this application. Keep the spelling, spaces and hyphens the same.\nIf your passport has no family name, IRCC says to enter all your given names in the surname field and leave the given name field blank.",
      officialPageName: "Personal details",
      fieldLabelOnOfficialPage: "Surname (family name)",
      requiredDocuments: [
        {
          name: "Your passport",
          description:
            "Use the passport you'll apply with. Copy the name exactly as printed on the photo page.",
        },
      ],
      commonMistakes: [
        "Using a nickname or a shortened surname instead of the passport spelling.",
        "Leaving out a hyphen or space that appears on the passport.",
        "Typing a name from a different passport than the one you'll apply with.",
      ],
      // Exact field label and order still need a screenshot from the product
      // owner before normal users see this step.
      status: "draft",
      lastVerified: null,
    }),
    step({
      id: "step-enter-given-names",
      sectionId: sectionId(2),
      position: 1,
      title: "Enter your given name(s)",
      instruction:
        "Find the field for your given name(s) on the same form.\nType every given name exactly as it appears on your passport, in the same order. If your passport shows two given names, enter both.\nIf your passport has no family name and you entered all your names in the surname field, leave this field blank.",
      officialPageName: "Personal details",
      fieldLabelOnOfficialPage: "Given name(s)",
      commonMistakes: [
        "Entering only one name when the passport shows more than one given name.",
        "Changing the order of your given names.",
        "Putting your surname in the given-name field.",
      ],
      status: "draft",
      lastVerified: null,
    }),
    step({
      id: "step-check-name-matches-passport",
      sectionId: sectionId(2),
      position: 2,
      title: "Check your name matches your passport",
      instruction:
        "Before you move on, compare what you typed with the two lines of letters and numbers at the bottom of your passport photo page (the machine-readable zone).\nThe spelling, order and punctuation should match. Fix anything that doesn't.",
      officialPageName: "Personal details",
      commonMistakes: [
        "Skipping this check and finding the mismatch later, after the profile is submitted.",
      ],
      status: "draft",
      lastVerified: null,
    }),
  ],
  0: [
    step({
      id: "step-language-test",
      sectionId: sectionId(0),
      position: 0,
      title: "Take an approved language test",
      instruction:
        "Express Entry accepts these English tests: CELPIP-General, IELTS General Training and PTE Core. For French, it accepts TEF Canada and TCF Canada.\nTake the test before you create the profile. Your results must be less than 2 years old on the day you complete your profile and on the day you apply.\nBook directly with the test organization. When your report arrives, enter the CLB level for each ability below so MapleRoute can check your preparation.",
      officialUrl: LANGUAGE_URL,
      sourceUrl: LANGUAGE_URL,
      officialPageName: "Language test results",
      extraLinks: [
        { label: "Language test results", url: LANGUAGE_URL },
      ],
      screenshots: [
        {
          id: "seed-shot-language-test",
          storagePath: "/guide/express-entry-language-test.png",
          altText:
            "Official IRCC Language test results page with the Take a language test section and the list of tests IRCC accepts.",
          position: 0,
          highlights: [
            {
              x: 9.7,
              y: 26.4,
              w: 28.5,
              h: 6.2,
              label: "Language test results",
            },
          ],
        },
      ],
      requiredDocuments: [
        {
          name: "Language test report",
          description:
            "The report from CELPIP, IELTS, PTE, TEF or TCF. You'll need the test date and the scores for all four abilities.",
          link: LANGUAGE_URL,
        },
      ],
      commonMistakes: [
        "Taking IELTS Academic — Express Entry needs IELTS General Training.",
        "Letting the test expire: results older than 2 years don't count.",
        "Entering an estimate instead of the CLB levels printed on your report.",
      ],
      boostTip:
        "CLB 9 or higher in all four abilities gives the strongest language points in Express Entry.",
    }),
    step({
      id: "step-eca",
      sectionId: sectionId(0),
      position: 1,
      title: "Get an Educational Credential Assessment (ECA)",
      instruction:
        "If you studied outside Canada, you need an ECA to get points for your education. Use an organization IRCC designates: WES, ICAS, CES, IQAS or BCIT.\nThe assessment must be less than 5 years old when you complete your profile and when you apply, and it must assess the credential you're claiming.\nIf all your education is Canadian, you don't need an ECA. Choose that option below.",
      officialUrl: ECA_URL,
      sourceUrl: ECA_URL,
      officialPageName: "Educational credential assessment",
      extraLinks: [
        { label: "Educational credential assessment (ECA)", url: ECA_URL },
      ],
      screenshots: [
        {
          id: "seed-shot-eca",
          storagePath: "/guide/express-entry-eca.png",
          altText:
            "Official IRCC Educational credential assessment page explaining what an ECA is and who needs one.",
          position: 0,
          highlights: [
            {
              x: 9.7,
              y: 26.2,
              w: 45,
              h: 6.4,
              label: "Educational credential assessment",
            },
          ],
        },
      ],
      requiredDocuments: [
        {
          name: "ECA report",
          description:
            "The report from the designated organization, showing what your credential is equal to in Canada.",
          link: ECA_URL,
        },
      ],
      commonMistakes: [
        "Using an organization that isn't designated by IRCC.",
        "Ordering an assessment for a different credential than the one you're claiming.",
        "Letting the ECA expire — it's valid for 5 years.",
      ],
      boostTip:
        "Order the ECA early. It can take several weeks, and the profile asks for the report number.",
    }),
    step({
      id: "step-find-noc",
      sectionId: sectionId(0),
      position: 2,
      title: "Find your NOC code and TEER level",
      instruction:
        "Open the official NOC search and match your job by the main duties you actually did, not by the job title. Write down the 5-digit NOC 2021 code.\nThe second digit of the code is your TEER level. Federal Skilled Worker and Canadian Experience Class need work experience in TEER 0, 1, 2 or 3. Federal Skilled Trades only accepts specific NOC groups.\nEnter your code below to check it before you start the profile.",
      officialUrl: NOC_URL,
      sourceUrl: NOC_URL,
      officialPageName: "Find your National Occupational Classification (NOC)",
      extraLinks: [
        {
          label: "Find your National Occupational Classification (NOC)",
          url: NOC_URL,
        },
      ],
      screenshots: [
        {
          id: "seed-shot-noc",
          storagePath: "/guide/express-entry-noc.png",
          altText:
            "Official IRCC Find your National Occupational Classification (NOC) page with the NOC 2021 notice and the TEER categories table.",
          position: 0,
          highlights: [
            {
              x: 9.7,
              y: 26.2,
              w: 68.5,
              h: 6.4,
              label: "Find your NOC",
            },
          ],
        },
      ],
      requiredDocuments: [
        {
          name: "Proof of work experience",
          description:
            "Reference letters from your employers that list your duties, the hours you worked and your start and end dates.",
        },
      ],
      commonMistakes: [
        "Choosing a code by job title alone instead of matching the duties.",
        "Claiming work that wasn't paid or wasn't in the occupation you're relying on.",
        "Using an old 4-digit NOC code — Express Entry uses the 5-digit NOC 2021.",
      ],
    }),
    step({
      id: "step-prepare-documents",
      sectionId: sectionId(0),
      position: 3,
      title: "Get your documents ready",
      instruction:
        "Open the official “Get your documents ready” page and gather what it asks for. Keep the files or reference numbers nearby so you don't have to stop halfway through the profile.\nThe page lists a passport or travel document, language test results, proof of education or an educational credential assessment, proof of work experience, proof of funds, police certificates and any job offer, trade certificate or provincial nomination you have.\nIf your passport expires within 6 months of the day you apply, renew it first and update your passport information later.",
      officialUrl: DOCUMENTS_URL,
      sourceUrl: DOCUMENTS_URL,
      officialPageName: "Get your documents ready",
      extraLinks: [
        { label: "Get your documents ready", url: DOCUMENTS_URL },
      ],
      screenshots: [
        {
          id: "seed-shot-documents",
          storagePath: "/guide/express-entry-documents.png",
          altText:
            "Official IRCC Get your documents ready page listing the passport, language test results, education assessment, job offer, work experience, proof of funds, police certificates and provincial nomination.",
          position: 0,
          highlights: [
            {
              x: 27,
              y: 14,
              w: 28,
              h: 12,
              label: "Documents to prepare",
            },
          ],
        },
      ],
    }),
  ],
  3: [
    step({
      id: "step-check-eligibility",
      sectionId: sectionId(3),
      position: 0,
      title: "Check you're eligible before you build the profile",
      instruction:
        "Express Entry has three programs: Federal Skilled Worker, Canadian Experience Class and Federal Skilled Trades.\nOpen the official “Who can apply” page and check which one fits your situation. The profile will only let you submit if you meet the rules for at least one program.",
      officialUrl: WHO_CAN_APPLY_URL,
      sourceUrl: WHO_CAN_APPLY_URL,
      officialPageName: "Who can apply",
      extraLinks: [
        { label: "Who can apply", url: WHO_CAN_APPLY_URL },
      ],
    }),
  ],
  4: [
    step({
      id: "step-personal-reference-code",
      sectionId: sectionId(4),
      position: 0,
      title: "Enter your personal reference code, if you have one",
      instruction:
        "If you used the Come to Canada tool, the profile will ask for your personal reference code. Enter it when prompted. If you didn't use that tool, you won't have one.",
      fieldLabelOnOfficialPage: "Personal reference code",
    }),
  ],
  9: [
    step({
      id: "step-submit-profile",
      sectionId: sectionId(9),
      position: 0,
      title: "Submit your profile within 60 days",
      instruction:
        "Submit the profile when it's complete. You have 60 days to complete and submit your Express Entry profile. After that, you'll have to start again.\nOnce you submit, IRCC checks which programs you may be eligible for and puts your profile in the pool.",
      officialPageName: "Create your profile and enter the pool",
    }),
    step({
      id: "step-wait-for-invitation",
      sectionId: sectionId(9),
      position: 1,
      title: "Wait for an invitation in a round of invitations",
      instruction:
        "Submitting your profile puts you in the Express Entry pool. IRCC ranks candidates by CRS score and holds rounds of invitations.\nCheck the latest rounds and your IRCC account. You can only apply for permanent residence if IRCC sends you an invitation to apply.\nAn invitation is valid for 60 days only, so start the application as soon as you get one.",
      officialUrl: ROUNDS_URL,
      sourceUrl: ROUNDS_URL,
      officialPageName: "Rounds of invitations",
      extraLinks: [
        { label: "Rounds of invitations", url: ROUNDS_URL },
      ],
    }),
  ],
  10: [
    step({
      id: "step-apply-fill-form",
      sectionId: sectionId(10),
      position: 0,
      title: "Fill out the permanent residence application",
      instruction:
        "Open your invitation in your IRCC secure account and fill out the permanent residence application form.\nYour invitation to apply is valid for 60 days only. You can save and come back, but don't wait until the last day.\nAnswer for yourself and every family member included in the application.",
      officialUrl: APPLY_URL,
      sourceUrl: APPLY_URL,
      officialPageName: "Apply for permanent residence",
      extraLinks: [
        { label: "Apply for permanent residence", url: APPLY_URL },
      ],
      commonMistakes: [
        "Missing the 60-day deadline — the invitation expires.",
        "Leaving out a family member who should be included in the application.",
      ],
    }),
    step({
      id: "step-apply-documents",
      sectionId: sectionId(10),
      position: 1,
      title: "Upload your documents",
      instruction:
        "Upload colour scans of the documents your application asks for. At this stage this can include police certificates, proof of funds, birth and marriage certificates, digital photos and your medical exam results.\nIf a document isn't in English or French, include a certified translation.\nCheck the official page for the full list and the rules for each document.",
      officialUrl: `${APPLY_URL}#documents`,
      sourceUrl: APPLY_URL,
      officialPageName: "Apply for permanent residence — Upload your documents",
      extraLinks: [
        { label: "Documents to upload", url: `${APPLY_URL}#documents` },
      ],
      requiredDocuments: [
        {
          name: "Police certificates",
          description:
            "For every country you stayed in for 6 months in a row or longer in the last 10 years. The certificate for the country you live in now must be issued no more than 6 months before you submit.",
          link: POLICE_URL,
        },
        {
          name: "Medical exam",
          description:
            "Get it after your invitation and before you submit, from an IRCC panel physician. It is valid for 12 months.",
          link: MEDICAL_URL,
        },
        {
          name: "Proof of funds",
          description:
            "The amount depends on your family size. Check the official proof of funds page before you submit.",
        },
        {
          name: "Digital photo",
          description:
            "The application asks for a digital photo to confirm your identity. Check the photo rules on the official page.",
        },
      ],
      commonMistakes: [
        "Uploading a police certificate that is older than the 6-month rule for the country you live in now.",
        "Doing the medical exam before the invitation — it must be after the invitation and before you submit.",
      ],
    }),
    step({
      id: "step-apply-fees",
      sectionId: sectionId(10),
      position: 2,
      title: "Pay the fees",
      instruction:
        "Pay the application fees online and keep the receipt — you'll upload it with your application.\nCurrent amounts on the official fee list: $1,590 for the application with the right of permanent residence fee, or $990 without it. Biometrics are $85 per person, or $170 for a family of 2 or more.\nFees change, so check the official fee list before you pay.",
      officialUrl: FEES_URL,
      sourceUrl: FEES_URL,
      officialPageName: "Fee list",
      extraLinks: [
        { label: "Official fee list", url: FEES_URL },
      ],
      requiredDocuments: [
        {
          name: "Payment receipt",
          description: "Upload the receipt with your application.",
        },
      ],
      commonMistakes: [
        "Paying only the processing fee and forgetting the right of permanent residence fee.",
        "Paying the biometrics fee twice.",
      ],
    }),
    step({
      id: "step-apply-submit",
      sectionId: sectionId(10),
      position: 3,
      title: "Submit before your invitation expires",
      instruction:
        "Check the application and documents one last time, then submit. Your invitation to apply is valid for 60 days only.\nAfter you submit, keep an eye on your IRCC account for requests and your biometrics letter.",
      officialUrl: APPLY_URL,
      sourceUrl: APPLY_URL,
      officialPageName: "Apply for permanent residence",
      commonMistakes: [
        "Submitting after the 60-day deadline.",
        "Forgetting to upload the fee receipt.",
      ],
    }),
  ],
  11: [
    step({
      id: "step-give-biometrics",
      sectionId: sectionId(11),
      position: 0,
      title: "Give your biometrics within 30 days",
      instruction:
        "After you apply, IRCC sends a letter asking for your fingerprints and photo. Give your biometrics at a collection point within 30 days of the letter.\nIf you miss the deadline, your application may be delayed.",
      officialUrl: BIOMETRICS_URL,
      sourceUrl: BIOMETRICS_URL,
      officialPageName: "Biometrics",
      extraLinks: [
        { label: "Biometrics", url: BIOMETRICS_URL },
      ],
      requiredDocuments: [
        {
          name: "Biometrics instruction letter",
          description:
            "IRCC sends it after you apply. Bring it to the collection point.",
        },
      ],
      commonMistakes: [
        "Waiting for a second reminder — the 30 days start from the letter.",
      ],
    }),
    step({
      id: "step-track-application",
      sectionId: sectionId(11),
      position: 1,
      title: "Track your application and answer requests",
      instruction:
        "Check your IRCC secure account for your application status and messages. IRCC may ask for more documents, a new medical exam or updated police certificates.\nReply before the deadline in the request. The decision also appears in your account.",
      officialUrl: AFTER_APPLY_URL,
      sourceUrl: AFTER_APPLY_URL,
      officialPageName: "After you apply",
      extraLinks: [
        { label: "After you apply", url: AFTER_APPLY_URL },
      ],
    }),
  ],
  12: [
    step({
      id: "step-check-copr",
      sectionId: sectionId(12),
      position: 0,
      title: "Check your COPR and visa",
      instruction:
        "If your application is approved, IRCC mails you a Confirmation of Permanent Residence (COPR) and a permanent resident visa.\nCheck that every detail is correct and note the expiry date. Tell IRCC straight away if something is wrong.",
      officialUrl: APPROVED_URL,
      sourceUrl: APPROVED_URL,
      officialPageName: "If we approve your application",
      extraLinks: [
        { label: "If we approve your application", url: APPROVED_URL },
      ],
      commonMistakes: [
        "Booking travel before checking the expiry date on the COPR and visa.",
      ],
    }),
    step({
      id: "step-travel-canada",
      sectionId: sectionId(12),
      position: 1,
      title: "Travel to Canada before they expire",
      instruction:
        "You must travel to Canada before your COPR and visa expire. At the border, show your COPR to the border services officer.\nKeep your COPR with your passport — you'll need it when you arrive.",
      officialUrl: APPROVED_URL,
      sourceUrl: APPROVED_URL,
      officialPageName: "If we approve your application",
    }),
  ],
};

export function createSeedGuide(): Guide {
  return {
    id: "guide-express-entry",
    slug: GUIDE_SLUG,
    title: GUIDE_TITLE,
    description:
      "A step-by-step companion for the official IRCC Express Entry profile. Keep canada.ca open in another tab and follow along here. MapleRoute is an independent guide and is not affiliated with IRCC.",
    version: "0.6.1",
    status: "draft",
    sections: SECTION_TITLES.map((title, index) => ({
      id: sectionId(index),
      position: index,
      title,
      summary: null,
      estimatedMinutes: null,
      estimatedCostText: null,
      steps: SEED_STEPS[index] ?? [],
    })),
  };
}

export function createEmptyStep(sectionIdValue: string, position: number): GuideStep {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `step-local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sectionId: sectionIdValue,
    position,
    title: "New step",
    instruction: "",
    fieldLabelOnOfficialPage: null,
    officialPageName: null,
    officialUrl: null,
    extraLinks: [],
    requiredDocuments: [],
    commonMistakes: [],
    boostTip: null,
    personalizationKey: null,
    status: "draft",
    sourceUrl: null,
    lastVerified: null,
    verifiedBy: null,
    screenshots: [],
  };
}

export function createEmptySection(position: number) {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `section-local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    position,
    title: "New section",
    summary: null,
    estimatedMinutes: null,
    estimatedCostText: null,
    steps: [],
  };
}
