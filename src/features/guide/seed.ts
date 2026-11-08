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
const PR_PORTAL_URL = "https://prson-srpel.apps.cic.gc.ca/";
const PR_CONFIRM_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/pr-confirmation-portal.html";
const AFTER_APPLY_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/after-apply.html";
const APPROVED_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/application-approved.html";
const COPR_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/permanent-residents/status/copr.html";
const BIOMETRICS_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/biometrics.html";
const TRACKER_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-status-tracker.html";
const MEDICAL_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/medical-exams/requirements-permanent-residents.html";
const POLICE_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/police-certificates.html";
const FEES_URL = "https://ircc.canada.ca/english/information/fees/fees.asp";
const LANGUAGE_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-test.html";
const ECA_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/education-assessment.html";
// IRCC's designated-organization table links WES through wes.org/fswp, which
// redirects here.
const WES_ECA_URL = "https://www.wes.org/eca/";
const NOC_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/find-national-occupation-code.html";
const PROOF_FUNDS_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html";
const BOWP_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/pr-work-permits/bridging.html";
const EXTEND_WORK_PERMIT_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/extend/apply.html";
const VERIFIED_ON = "2026-10-29";

const SECTION_TITLES = [
  "Before you start (what to prepare)",
  "Sign in to your IRCC account",
  "Check you're eligible",
  "Start your Express Entry profile",
  "Personal details",
  "Contact details",
  "Study and languages",
  "Application details",
  "Representative",
  "Work history",
  "Review and submit",
  "After you submit",
  "Apply for permanent residence",
  "After you apply",
  "Bridging open work permit",
  "If we approve your application",
];

function sectionId(index: number) {
  const slug = SECTION_TITLES[index]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `section-${slug}`;
}

function shot(id: string, storagePath: string, altText: string) {
  return { id, storagePath, altText, position: 0, highlights: [] };
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
      id: "step-sign-in-secure-account",
      sectionId: sectionId(1),
      position: 0,
      title: "Sign in to your IRCC secure account",
      instruction:
        "Open the IRCC secure account page in your second tab. Sign in with your GCKey username and password, or with a Canadian Interac® Sign-In Partner.\nIf you don't have an account, register for one first. Use a password you don't use anywhere else — MapleRoute never asks for your username or password.",
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
      id: "step-account-home",
      sectionId: sectionId(1),
      position: 1,
      title: "Open an application you haven't submitted",
      instruction:
        "After you sign in, you land on your account home. It has two parts: “View the applications you submitted” and “Continue an application you haven't submitted”.\nYou're starting a new profile, so use the second one. Don't look for Express Entry in the submitted table — it stays empty until you submit.",
      sourceUrl: SECURE_ACCOUNT_URL,
      officialPageName: "Your account home",
      screenshots: [
        shot(
          "seed-shot-account-home",
          "/guide/express-entry-profile-account.png",
          "IRCC account home with the empty “View the applications you submitted” table and the “Continue an application you haven't submitted” section below it.",
        ),
      ],
      commonMistakes: [
        "Looking in “View the applications you submitted” for a profile that doesn't exist yet.",
      ],
    }),
  ],
  2: [
    step({
      id: "step-personal-reference-code",
      sectionId: sectionId(2),
      position: 0,
      title: "Start an application without a personal reference code",
      instruction:
        "The next page asks for a Personal Reference Code. If you used the Come to Canada tool and have one, enter it.\nIf you don't have one, choose “I do not have a Personal Reference Code”. Then, under “Determine your eligibility and apply online”, choose “Express Entry (EE)”.\nDon't choose the visitor visa, study or work permit button, and don't choose International Experience Canada — those start a different application.",
      sourceUrl: SECURE_ACCOUNT_URL,
      officialPageName: "Personal reference code",
      fieldLabelOnOfficialPage: "I do not have a Personal Reference Code",
      screenshots: [
        shot(
          "seed-shot-prc",
          "/guide/express-entry-profile-prc.png",
          "IRCC Personal Reference Code page with the “I do not have a Personal Reference Code” option and the Express Entry (EE) button under “Determine your eligibility and apply online”.",
        ),
      ],
      commonMistakes: [
        "Choosing International Experience Canada (IEC) instead of Express Entry.",
        "Using a personal reference code from a different application.",
      ],
    }),
    step({
      id: "step-eligibility-questionnaire",
      sectionId: sectionId(2),
      position: 1,
      title: "Answer the eligibility questionnaire",
      instruction:
        "The page “Find out if you're eligible to apply” asks about your language test scores, your work and study history, your family and where you'd like to live.\nAnswer every required question about yourself, using the scores printed on your test report rather than an estimate. “Save and Exit Questionnaire” lets you stop and come back.\nThe notice at the bottom says these answers are for reference only — no immigration decision is made from them.",
      sourceUrl: CREATE_PROFILE_URL,
      officialPageName: "Find out if you're eligible to apply",
      fieldLabelOnOfficialPage:
        "Enter the test score for Speaking, Listening, Reading and Writing",
      screenshots: [
        shot(
          "seed-shot-eligibility",
          "/guide/express-entry-profile-eligibility.png",
          "Eligibility questionnaire page titled “Find out if you're eligible to apply” with required dropdowns for the Speaking, Listening, Reading and Writing test scores.",
        ),
      ],
      commonMistakes: [
        "Entering a guessed test score instead of the one on your report.",
        "Ticking a province you wouldn't actually live in.",
        "Stopping halfway — you need to finish the questionnaire to see your result.",
      ],
    }),
    step({
      id: "step-check-eligibility-result",
      sectionId: sectionId(2),
      position: 2,
      title: "Read your results and continue",
      instruction:
        "The last page is “Your results”. If it says “Based on your answers, you appear to be eligible for Express Entry”, you can keep going.\nIt also lists what comes next. Step 1 is completing the Express Entry Profile Builder, reviewing the profile and submitting it. Step 2 is the confirmation page and a message in your account after you submit.\nChoose “Continue” to open the profile builder.",
      sourceUrl: CREATE_PROFILE_URL,
      officialPageName: "Your results",
      extraLinks: [{ label: "Who can apply", url: WHO_CAN_APPLY_URL }],
      screenshots: [
        shot(
          "seed-shot-results",
          "/guide/express-entry-profile-results.png",
          "“Your results” page saying you appear to be eligible for Express Entry, with Step 1 and Step 2 explained and a Continue button.",
        ),
      ],
      commonMistakes: [
        "Choosing “Exit questionnaire” instead of “Continue”.",
        "Reading “appear to be eligible” as a final decision — it only means you can build a profile.",
      ],
    }),
  ],
  3: [
    step({
      id: "step-open-profile-builder",
      sectionId: sectionId(3),
      position: 0,
      title: "Open the six forms in your profile",
      instruction:
        "“Continue” opens your profile checklist — the page titled with your name and “Candidate Express Entry”.\nIt lists six forms: Personal details, Contact details, Study and languages, Application details, Representative and Work history. Each row has a status and a button to start or update that form.\nWork down the list in this order. After each form, save and exit and check that its status moves from “Not started” to “In progress”, then “Complete”.\nIf you're married or common-law, a separate accompanying spouse form also appears.",
      sourceUrl: CREATE_PROFILE_URL,
      officialPageName: "Candidate Express Entry",
      screenshots: [
        shot(
          "seed-shot-checklist",
          "/guide/express-entry-profile-checklist.png",
          "Candidate Express Entry checklist with six forms — Personal details, Contact details, Study and languages, Application details, Representative and Work history — each marked Not started.",
        ),
      ],
      commonMistakes: [
        "Jumping to Work history before the personal forms are complete.",
        "Leaving a form “In progress” and expecting to submit.",
      ],
    }),
  ],
  4: [
    step({
      id: "step-personal-names",
      sectionId: sectionId(4),
      position: 0,
      title: "Fill in names, personal description and marital status",
      instruction:
        "Open Personal details. It's a list of sections that open one at a time. Start with Names.\nEnter your last name(s) and first name(s) exactly as they appear on the passport you'll use. The page says to use the name on your passport, travel document or national identity document.\nChoose Next to save the name and open the next section: Personal description, then Marital status. Answer each one and keep choosing Next.",
      sourceUrl: CREATE_PROFILE_URL,
      officialPageName: "Personal details",
      fieldLabelOnOfficialPage: "Last name(s) and First name(s)",
      requiredDocuments: [
        {
          name: "Your passport",
          description:
            "Use the passport you'll apply with. Copy the name exactly as printed on the photo page.",
        },
      ],
      screenshots: [
        shot(
          "seed-shot-personal-names",
          "/guide/express-entry-profile-personal-details.png",
          "Personal details form with the Names section open showing Last name(s) and First name(s), and Personal description, Marital status and ID documents - summary listed below.",
        ),
      ],
      commonMistakes: [
        "Using a nickname or a married name that isn't on the passport you'll use.",
        "Leaving out a hyphen or space that appears on the passport.",
      ],
    }),
    step({
      id: "step-personal-id-document",
      sectionId: sectionId(4),
      position: 1,
      title: "Add your passport under ID documents",
      instruction:
        "Under “ID documents - summary”, answer whether you have a passport or National ID document. For Express Entry, add your passport.\nPick the document type, copy the Document Number exactly as shown on the document, choose the country or territory of issue, and enter the issue and expiry dates. Choose “Save and add”.\nThe document then appears in the table below, where you can use Modify or Delete row. The page notes you'll need a valid passport when you're invited to apply, so use the passport you'll still have then.",
      sourceUrl: CREATE_PROFILE_URL,
      officialPageName: "Personal details — ID documents",
      fieldLabelOnOfficialPage:
        "Document Number (exactly as shown on the document)",
      requiredDocuments: [
        {
          name: "Your passport",
          description:
            "The document number, country of issue, issue date and expiry date all come from the photo page.",
        },
      ],
      screenshots: [
        shot(
          "seed-shot-passport",
          "/guide/express-entry-profile-passport.png",
          "ID documents - summary table with one passport row showing document number, country of issue, issue date and expiry date, plus Save and add.",
        ),
      ],
      commonMistakes: [
        "Reformatting the document number instead of copying it exactly as printed.",
        "Adding an ID card when the application asks for a passport.",
        "Using a passport that will expire soon after you apply.",
      ],
    }),
    step({
      id: "step-immigration-history",
      sectionId: sectionId(4),
      position: 2,
      title: "Answer your immigration history and citizenship",
      instruction:
        "“Immigration history and citizenships” asks whether you've applied to Immigration, Refugees and Citizenship Canada before, and whether you've applied for Express Entry before. Answer Yes only for applications you actually made.\nIf you have a Unique Client Identifier (UCI), enter it. It appears on letters and permits IRCC has sent you. Don't guess it — leave it blank if you don't have one. MapleRoute never stores it.\nThen add every country of citizenship and your country of residence.",
      sourceUrl: CREATE_PROFILE_URL,
      officialPageName: "Personal details — Immigration history and citizenships",
      fieldLabelOnOfficialPage: "Unique Client Identifier (UCI)",
      screenshots: [
        shot(
          "seed-shot-immigration",
          "/guide/express-entry-profile-immigration.png",
          "Immigration history and citizenships section asking about previous IRCC applications, previous Express Entry applications, the UCI field, countries of citizenship and country of residence.",
        ),
      ],
      commonMistakes: [
        "Answering No to a previous application IRCC can see in its records.",
        "Guessing a UCI instead of copying it from an IRCC letter.",
        "Leaving out a second citizenship.",
      ],
    }),
    step({
      id: "step-family-and-relatives",
      sectionId: sectionId(4),
      position: 3,
      title: "Enter your family size, funds and relatives in Canada",
      instruction:
        "“Family” asks how many family members you have. Count yourself, your spouse or partner, and dependent children — including their dependent children. Enter the total, not just the people coming with you.\nThen enter how much money, in Canadian dollars, you'll bring to Canada to support yourself and your family. Check the proof of funds table for the minimum for your family size before you type an amount.\nAfter Family, open “Relatives in Canada”. If you have a relative who is a Canadian citizen or permanent resident, 18 or older and living in Canada, answer Yes, then add who they are, the province or territory, and the relationship.",
      sourceUrl: PROOF_FUNDS_URL,
      officialPageName: "Personal details — Family / Relatives in Canada",
      fieldLabelOnOfficialPage:
        "How many family members does [your name] have?",
      requiredDocuments: [
        {
          name: "Proof of funds",
          description:
            "The minimum amount depends on your family size. Check the official table before you enter a figure.",
          link: PROOF_FUNDS_URL,
        },
      ],
      screenshots: [
        shot(
          "seed-shot-family",
          "/guide/express-entry-profile-family.png",
          "Family section with the number of family members and the amount of money in Canadian dollars, and Relatives in Canada listed below.",
        ),
      ],
      commonMistakes: [
        "Counting only yourself instead of everyone in your family.",
        "Entering funds below the minimum for your family size.",
        "Listing a relative who doesn't live in Canada.",
      ],
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
        "If you studied outside Canada, you need an ECA to get points for your education. Use an organization IRCC designates: WES, ICAS, CES, IQAS or BCIT.\nIf you use WES, order its ECA for immigration — the report WES sends to IRCC. A standard WES evaluation (document-by-document or course-by-course) is for jobs or school and can't be used instead.\nThe assessment must be less than 5 years old when you complete your profile and when you apply, and it must assess the credential you're claiming.\nIf all your education is Canadian, you don't need an ECA. Choose that option below.",
      officialUrl: ECA_URL,
      sourceUrl: ECA_URL,
      officialPageName: "Educational credential assessment",
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
          whereToGetIt:
            "World Education Services (WES) is one of the organizations IRCC designates. Order the WES ECA for immigration, not a standard evaluation.",
          link: WES_ECA_URL,
        },
      ],
      commonMistakes: [
        "Using an organization that isn't designated by IRCC.",
        "Ordering a standard WES evaluation instead of the WES ECA for IRCC.",
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
      requiredDocuments: [
        { name: "Passport or travel document" },
        { name: "Language test results" },
        { name: "Proof of education or an educational credential assessment" },
        { name: "Proof of work experience" },
        { name: "Proof of funds" },
        { name: "Police certificates" },
        { name: "Job offer (if you have one)", optional: true },
        { name: "Trade certificate (if you have one)", optional: true },
        { name: "Provincial nomination (if you have one)", optional: true },
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
  5: [
    step({
      id: "step-contact-details",
      sectionId: sectionId(5),
      position: 0,
      title: "Add the email IRCC should use",
      instruction:
        "Open Contact details. Enter an email address you check often — IRCC writes to it about your profile and any invitation to apply.\nChoose the language IRCC should use to write to you: English or French.\nRead the address back before you save. A wrong or abandoned email can hide an invitation.",
      sourceUrl: SECURE_ACCOUNT_URL,
      officialPageName: "Contact details",
      fieldLabelOnOfficialPage: "Email address",
      screenshots: [
        shot(
          "seed-shot-contact-email",
          "/guide/express-entry-profile-email.png",
          "Contact details form with the Email address field, the note about correspondence and the Previous button.",
        ),
      ],
      commonMistakes: [
        "Using a work or school email you might lose access to.",
        "Making a typo in the address.",
        "Using an inbox nobody checks — invitation messages are time-limited.",
      ],
    }),
  ],
  6: [
    step({
      id: "step-education-history",
      sectionId: sectionId(6),
      position: 0,
      title: "Add your secondary and post-secondary study",
      instruction:
        "Open Study and languages and start with your education history. The form assesses your secondary and post-secondary periods of study.\nAdd each program: full-time or part-time, your standing at the end, the country and city, the name of the school or institution, and the level of education. Choose “Save and add” after each one.\nBegin with secondary school (high school). Leaving it out can lower the education points you're claiming.",
      sourceUrl: ECA_URL,
      officialPageName: "Study and languages — Education history",
      fieldLabelOnOfficialPage: "Level of education",
      requiredDocuments: [
        {
          name: "Diplomas, degrees and transcripts",
          description:
            "The details on the form come from these documents: school name, city, country, dates and the level of education.",
        },
      ],
      screenshots: [
        shot(
          "seed-shot-education",
          "/guide/express-entry-profile-education.png",
          "Study details form with full-time/part-time study, standing at the end of study period, country of study, city/town, school name and level of education.",
        ),
      ],
      commonMistakes: [
        "Leaving out high school.",
        "Choosing a level of education higher than the credential you actually completed.",
        "Mixing up the city and country of the school.",
      ],
    }),
    step({
      id: "step-education-details",
      sectionId: sectionId(6),
      position: 1,
      title: "Answer the follow-up questions about the program",
      instruction:
        "After you add a program, the form asks follow-up questions about it. If you studied in Canada, it asks for the Designated Learning Institution (DLI) number — find it on your acceptance letter or on IRCC's DLI list rather than guessing.\nIt also asks whether more than half the program was English or French as a second language, whether you studied in Canada on an award that required you to return home, whether at least 50% of the courses were in person, and whether the program lasted at least 8 months and was full-time.\nAnswer for that one program only. These answers affect which study points you can claim.",
      sourceUrl: ECA_URL,
      officialPageName: "Study and languages — Study details",
      fieldLabelOnOfficialPage:
        "What is the Designated Learning Institution (DLI) number of the school?",
      screenshots: [
        shot(
          "seed-shot-study-questions",
          "/guide/express-entry-profile-study-questions.png",
          "Study follow-up questions including the DLI number, English or French as a second language, an award requiring return home, in-person learning, and 8-month study questions.",
        ),
      ],
      commonMistakes: [
        "Guessing the DLI number.",
        "Answering the 8-month questions for a shorter program.",
      ],
    }),
    step({
      id: "step-profile-eca",
      sectionId: sectionId(6),
      position: 2,
      title: "Add your Educational Credential Assessment",
      instruction:
        "If you studied outside Canada, add your Educational Credential Assessment. Choose the organization that issued the report — for example World Education Services — then enter the date the report was issued and the ECA certificate number.\nChoose the level of education (Canadian equivalent) exactly as your report states it. Don't choose a higher level than the report gives you.\nThe report must be less than 5 years old and must assess the credential you're claiming.",
      sourceUrl: ECA_URL,
      officialPageName: "Study and languages — Educational Credential Assessment",
      fieldLabelOnOfficialPage: "ECA certificate number",
      requiredDocuments: [
        {
          name: "ECA report",
          description:
            "The report from a designated organization showing what your credential is equal to in Canada.",
          whereToGetIt:
            "World Education Services (WES) is one of the organizations IRCC designates. Order the WES ECA for immigration, not a standard evaluation.",
          link: WES_ECA_URL,
        },
      ],
      screenshots: [
        shot(
          "seed-shot-eca-form",
          "/guide/express-entry-profile-eca.png",
          "Educational Credential Assessment form with the issuing organization, date the ECA report was issued, ECA certificate number and the Canadian equivalent level of education dropdown.",
        ),
      ],
      commonMistakes: [
        "Claiming a Canadian-equivalent level higher than the report states.",
        "Using an ECA that's more than 5 years old.",
        "Using an organization that isn't designated by IRCC.",
      ],
    }),
    step({
      id: "step-profile-language-test",
      sectionId: sectionId(6),
      position: 3,
      title: "Add your language test and its dates",
      instruction:
        "Under Official languages, add the language test you're using. Choose the test — for example IELTS — then the test version, for example IELTS General Training.\nEnter the date of the language test and the date of the test results. They can be different, so copy each one from the report.\nExpress Entry accepts CELPIP-General, IELTS General Training and PTE Core for English, and TEF Canada and TCF Canada for French.",
      sourceUrl: LANGUAGE_URL,
      officialPageName: "Study and languages — Official languages",
      fieldLabelOnOfficialPage: "Language test version",
      requiredDocuments: [
        {
          name: "Language test report",
          description:
            "You'll need the test type, version, test date, results date, form number and the score for each ability.",
        },
      ],
      screenshots: [
        shot(
          "seed-shot-language-test-form",
          "/guide/express-entry-profile-test-result.png",
          "Language test form with the test type, test version, date of language test and date of test results.",
        ),
      ],
      commonMistakes: [
        "Choosing IELTS Academic — Express Entry needs IELTS General Training.",
        "Swapping the test date and the results date.",
        "Choosing a version that doesn't match your report.",
      ],
    }),
    step({
      id: "step-language-scores",
      sectionId: sectionId(6),
      position: 4,
      title: "Enter your test number, PIN and scores",
      instruction:
        "Enter the language test result form or certificate number and the Language test PIN from your report.\nThen enter the score for each ability — Speaking, Reading, Listening and Writing — exactly as printed on the report. Don't convert them to CLB levels; IRCC does that.\nThe last question asks whether you've also taken an approved test for French. Answer No if you haven't.",
      sourceUrl: LANGUAGE_URL,
      officialPageName: "Study and languages — Official languages",
      fieldLabelOnOfficialPage:
        "Language test result form or certificate number",
      screenshots: [
        shot(
          "seed-shot-language-scores",
          "/guide/express-entry-profile-language.png",
          "Language test form with the form or certificate number, Language test PIN, Speaking, Reading, Listening and Writing scores, and the French test question.",
        ),
      ],
      commonMistakes: [
        "Entering CLB levels instead of the scores on the report.",
        "Leaving the PIN blank.",
        "Answering Yes to the French question without a French test result.",
      ],
    }),
  ],
  7: [
    step({
      id: "step-provinces-of-interest",
      sectionId: sectionId(7),
      position: 0,
      title: "Choose the provinces you'd consider",
      instruction:
        "Open Application details and find “Provinces and territories of interest”. It asks which provinces or territories you'd consider living in.\nTick every one you'd genuinely accept — provincial nominee programs look at this answer. There's also an “All Provinces and Territories” option if you're open to anywhere.\nAt least one choice is required.",
      sourceUrl: CREATE_PROFILE_URL,
      officialPageName: "Application details — Provinces and territories of interest",
      fieldLabelOnOfficialPage:
        "Which Provinces or Territories would [your name] consider living in?",
      screenshots: [
        shot(
          "seed-shot-provinces",
          "/guide/express-entry-profile-provinces.png",
          "Provinces and territories of interest checklist from Alberta to Yukon, with an All Provinces and Territories option.",
        ),
      ],
      commonMistakes: [
        "Ticking a province you wouldn't actually move to.",
        "Leaving the question blank — it's required.",
      ],
    }),
    step({
      id: "step-nomination",
      sectionId: sectionId(7),
      position: 1,
      title: "Declare any provincial nomination",
      instruction:
        "“Nomination and selection” asks whether you've received a nomination certificate from a province or territory.\nAnswer Yes only if you hold a valid certificate, then choose the province that issued it. If you don't have one, answer No — you can still be invited through the federal programs.\nA nomination adds CRS points, so keep the certificate nearby in case IRCC asks for it.",
      sourceUrl: CREATE_PROFILE_URL,
      officialPageName: "Application details — Nomination and selection",
      fieldLabelOnOfficialPage:
        "Has [your name] received a nomination certificate from a province or territory?",
      screenshots: [
        shot(
          "seed-shot-nomination",
          "/guide/express-entry-profile-nomination.png",
          "Nomination and selection section asking whether a nomination certificate was received and which province issued it.",
        ),
      ],
      commonMistakes: [
        "Answering Yes without a valid nomination certificate.",
        "Choosing the wrong province for the nomination.",
      ],
    }),
  ],
  8: [
    step({
      id: "step-representative",
      sectionId: sectionId(8),
      position: 0,
      title: "Say whether anyone represents you",
      instruction:
        "The Representative form asks whether you want to let IRCC share your information with a person who deals with IRCC for you — an immigration consultant, a lawyer, a friend or a family member.\nAnswer No if you're handling the application yourself. If you appoint someone, you'll add their details in the follow-up questions.\nYou can only appoint a paid representative who is authorized by IRCC.",
      sourceUrl: CREATE_PROFILE_URL,
      officialPageName: "Representative",
      fieldLabelOnOfficialPage:
        "Does [your name] want to allow IRCC to give their information to an appointed person?",
      screenshots: [
        shot(
          "seed-shot-representative",
          "/guide/express-entry-profile-representative.png",
          "Representative section explaining appointed representatives, with a required dropdown to choose whether to allow IRCC to share information.",
        ),
      ],
      commonMistakes: [
        "Naming a paid agent who isn't authorized by IRCC.",
        "Appointing someone without telling them they'll receive your messages.",
      ],
    }),
  ],
  9: [
    step({
      id: "step-primary-occupation",
      sectionId: sectionId(9),
      position: 0,
      title: "Add your primary occupation",
      instruction:
        "Open Work history. “Primary occupation” asks for the five-digit NOC code of the job you're basing the application on. Use the code you found during preparation.\nSearch for the code or title on the form and pick the match whose duties describe your job, not just a similar title.\nThen enter the date you first became qualified to practise in that occupation. The page's help text explains which date to use for trades occupations and for other jobs.",
      sourceUrl: NOC_URL,
      officialPageName: "Work history — Occupation",
      fieldLabelOnOfficialPage: "Primary occupation (Five-digit NOC Code)",
      requiredDocuments: [
        {
          name: "Proof of work experience",
          description:
            "Reference letters listing your duties, hours worked, and start and end dates.",
        },
      ],
      screenshots: [
        shot(
          "seed-shot-occupation",
          "/guide/express-entry-profile-occupation.png",
          "Occupation section with a five-digit NOC code search, the selected occupation, and the date first qualified to practise.",
        ),
      ],
      commonMistakes: [
        "Choosing a code by job title alone instead of matching the duties.",
        "Using an old 4-digit NOC code — Express Entry uses the 5-digit NOC 2021.",
        "Entering a qualification date you can't support with documents.",
      ],
    }),
    step({
      id: "step-add-jobs",
      sectionId: sectionId(9),
      position: 1,
      title: "Add each job you're claiming",
      instruction:
        "Add the jobs you're using for this application one at a time: employer, job title, NOC code and the dates you worked there.\nThe form also asks whether you were working in Canada on a valid work permit, whether you were studying full-time while doing the job, and which category the job falls under. Answer for that job only.\nChoose “Save and add” after each one.",
      sourceUrl: CREATE_PROFILE_URL,
      officialPageName: "Work history — Add a job",
      fieldLabelOnOfficialPage:
        "Which of these categories does [your name]'s job fall under?",
      screenshots: [
        shot(
          "seed-shot-work-history-form",
          "/guide/express-entry-profile-work-history.png",
          "Work history form asking whether the job was in Canada on a valid work permit, whether you were studying full-time, and the job category, with Save and add.",
        ),
      ],
      commonMistakes: [
        "Claiming a job you can't support with a reference letter.",
        "Leaving gaps between jobs that you can't explain.",
        "Marking a foreign job as Canadian work experience.",
      ],
    }),
    step({
      id: "step-review-work-history",
      sectionId: sectionId(9),
      position: 2,
      title: "Check the work history table",
      instruction:
        "The jobs you save appear in a table under Work history, with the dates, job title, NOC code, employer and country for each one. Use Modify or Delete row to fix anything.\nCheck that the dates line up with your reference letters and don't overlap unless the jobs really did.\nBelow the table is an optional “Research” section — you can skip it if you don't want to take part.",
      sourceUrl: CREATE_PROFILE_URL,
      officialPageName: "Work history — Saved jobs",
      screenshots: [
        shot(
          "seed-shot-work-history-table",
          "/guide/express-entry-profile-hub.png",
          "Saved work history table listing each job with its dates, job title, five-digit NOC code, employer and country, with Modify and Delete options.",
        ),
      ],
      commonMistakes: [
        "Dates that don't match the reference letters.",
        "Overlapping jobs you didn't actually hold at the same time.",
      ],
    }),
  ],
  10: [
    step({
      id: "step-review-completeness",
      sectionId: sectionId(10),
      position: 0,
      title: "Review every form before you submit",
      instruction:
        "Go back to the checklist. Every form should now say “Complete”. Open each one and use “Check for completeness” — it flags required questions you left blank.\nCompare the details with your documents: names and dates on your passport, the scores on your test report, the ECA certificate number and your reference letters.\nIf you're married or common-law, review the accompanying spouse form as well. IRCC gives you 60 days to complete and submit a profile once you've started it, so check the date in your account.",
      sourceUrl: CREATE_PROFILE_URL,
      officialPageName: "Candidate Express Entry",
      screenshots: [
        shot(
          "seed-shot-profile-form-status",
          "/guide/express-entry-profile-form-status.png",
          "Candidate Express Entry page listing each form with its status — Complete or Not started — and an Update form or Start form button.",
        ),
      ],
      commonMistakes: [
        "Submitting with a form still marked “In progress”.",
        "Skipping a family member who should be included.",
      ],
    }),
    step({
      id: "step-declaration",
      sectionId: sectionId(10),
      position: 1,
      title: "Sign the declaration and submit",
      instruction:
        "On the Declaration page, read the statement, choose “I agree” in the required dropdown, and check that your name appears in the signature line.\nThe signature says that by submitting you're electronically signing the application, and that the information and the documents are true and genuine.\nIf the page asks you to set a security question, do it now and keep the answer somewhere safe. Then choose “Transmit” once.",
      sourceUrl: CREATE_PROFILE_URL,
      officialPageName: "Declaration",
      fieldLabelOnOfficialPage: "I agree",
      screenshots: [
        shot(
          "seed-shot-declaration",
          "/guide/express-entry-profile-declaration.png",
          "Declaration page with the “I agree” selection, the Signature statement and the Transmit button.",
        ),
      ],
      commonMistakes: [
        "Clicking Transmit before every form is complete.",
        "Forgetting the security question answer.",
      ],
    }),
  ],
  11: [
    step({
      id: "step-profile-status",
      sectionId: sectionId(11),
      position: 0,
      title: "Check that your profile was submitted",
      instruction:
        "After you choose Transmit, IRCC shows a page confirming your profile has been submitted and sends a confirmation message to your account.\nYour account home now shows “Your Express Entry profile status” — you should see “You are a candidate”, your profile number, the date you submitted it and the date it expires.\nIf you don't see the confirmation, read your messages before you transmit again.",
      sourceUrl: SECURE_ACCOUNT_URL,
      officialPageName: "Your Express Entry profile status",
      extraLinks: [
        { label: "IRCC secure account", url: SECURE_ACCOUNT_URL },
      ],
      screenshots: [
        shot(
          "seed-shot-profile-status",
          "/guide/express-entry-profile-status.png",
          "Express Entry profile status page saying you are a candidate, with the latest update, candidate information, profile number and expiry date.",
        ),
      ],
      commonMistakes: [
        "Transmitting a second time because the confirmation page didn't load.",
      ],
    }),
    step({
      id: "step-see-score",
      sectionId: sectionId(11),
      position: 1,
      title: "See what you're eligible for and your CRS score",
      instruction:
        "Scroll down your profile to “What am I eligible for?”. It lists Federal Skilled Worker, Provincial Nominee Program, Canadian Experience Class and Federal Skilled Trades as Met or Not Met.\nBelow that is your Comprehensive ranking system (CRS) score — the number IRCC uses to rank you in the pool.\nMet only means you qualify for that program. To apply for permanent residence you still need an invitation in a round of invitations. Note the date your profile expires, because you'll need a new profile after that.",
      officialUrl: ROUNDS_URL,
      sourceUrl: ROUNDS_URL,
      officialPageName: "Your Express Entry profile",
      extraLinks: [
        { label: "Rounds of invitations", url: ROUNDS_URL },
      ],
      screenshots: [
        shot(
          "seed-shot-crs",
          "/guide/express-entry-profile-crs.png",
          "“What am I eligible for?” table showing each program as Met or Not Met, with the Comprehensive ranking system score below.",
        ),
      ],
      commonMistakes: [
        "Reading “Met” as an invitation to apply.",
        "Missing the profile expiry date.",
      ],
    }),
  ],
  12: [
    step({
      id: "step-ita-open-invitation",
      sectionId: sectionId(12),
      position: 0,
      title: "Start your permanent residence application",
      instruction:
        "Sign in to your IRCC secure account and open the new message from IRCC. Your invitation letter shows the date, the program you were invited under (for example Canadian Experience Class), the round of invitations and your CRS score.\nScroll to “Continue an application you haven't submitted”. The row “Permanent Residency” shows the date it was created and “Days left to submit”. Choose Continue application.\nYour invitation is valid for 60 days. Choose Decline Invitation only if you mean to refuse it — that can't be undone.",
      officialUrl: APPLY_URL,
      sourceUrl: APPLY_URL,
      officialPageName: "Apply for permanent residence",
      extraLinks: [
        { label: "Apply for permanent residence", url: APPLY_URL },
      ],
      screenshots: [
        shot(
          "seed-shot-ita-start",
          "/guide/express-entry-ita-start.png",
          "Invitation letter in the IRCC secure account, showing the date, Express Entry profile, the applicant's name and the program invited under (Canadian Experience Class).",
        ),
      ],
      requiredDocuments: [
        {
          name: "Invitation letter",
          description:
            "The message in your IRCC account. It shows the date, the program and your 60-day deadline — save a copy.",
        },
      ],
      commonMistakes: [
        "Choosing Decline Invitation by mistake — the invitation is lost.",
        "Waiting until the last days of the 60-day window.",
      ],
    }),
    step({
      id: "step-ita-eligibility-questions",
      sectionId: sectionId(12),
      position: 1,
      title: "Answer the eligibility and fee questions",
      instruction:
        "The application opens with “Find out if you're eligible to apply”. Answer the questions about the people in your application — for example whether you have children and whether you have a spouse or common-law partner. These answers decide who is included and what fees you pay.\nThe same page explains the fees: the processing fee must be paid through your account with this application, by credit card. The Right of Permanent Residence Fee (RPRF) can be paid now or later. Choose “Application Fees and RPRF” so everything is paid at once — IRCC refunds the RPRF if the application is refused.",
      officialUrl: APPLY_URL,
      sourceUrl: APPLY_URL,
      officialPageName: "Apply for permanent residence",
      extraLinks: [
        { label: "Apply for permanent residence", url: APPLY_URL },
        { label: "Official fee list", url: FEES_URL },
      ],
      screenshots: [
        shot(
          "seed-shot-ita-eligibility",
          "/guide/express-entry-ita-eligibility.png",
          "“Find out if you're eligible to apply” page explaining that Express Entry processing fees are paid through the account with the application, which cards are accepted, and that the right of permanent residence fee is explained below.",
        ),
      ],
      commonMistakes: [
        "Selecting only the application fees and then forgetting the RPRF before IRCC issues the documents.",
      ],
    }),
    step({
      id: "step-ita-pay-fees",
      sectionId: sectionId(12),
      position: 2,
      title: "Pay the fees and keep the receipt",
      instruction:
        "The fee summary lists the processing fee for each adult, the RPRF for each adult and the biometrics fee, with the total. Pay by credit card (Visa, Mastercard, American Express, JCB or China Union Pay).\nAmounts change, so check the official fee list before you pay. The receipt stays in your account.",
      officialUrl: FEES_URL,
      sourceUrl: FEES_URL,
      officialPageName: "Fee list",
      extraLinks: [
        { label: "Official fee list", url: FEES_URL },
      ],
      screenshots: [
        shot(
          "seed-shot-ita-fees",
          "/guide/express-entry-ita-fees.png",
          "Summary of fees table with the permanent resident application fee, right of permanent residence fee and biometric fee for the applicant and spouse, and the total. The amounts shown are an example from 2024; check the official fee list.",
        ),
      ],
      requiredDocuments: [
        {
          name: "Payment receipt",
          description:
            "IRCC stores the receipt in your account after payment. Keep a copy with your application records.",
        },
      ],
      commonMistakes: [
        "Paying only the processing fee and forgetting the right of permanent residence fee.",
        "Paying the biometrics fee twice.",
      ],
    }),
    step({
      id: "step-ita-forms",
      sectionId: sectionId(12),
      position: 3,
      title: "Work through the seven forms",
      instruction:
        "After payment you land on “Permanent Residence application”. The checklist “Candidate Permanent Residency” lists seven forms: Personal details, Contact details, Study and languages, Application details, Representative, Work history and Personal history.\nEach row shows In progress or Complete and a Continue form or Update form button. You can complete the forms in any order, and Save and exit keeps your answers.\nAccompanying family members have their own form list below yours, with only the forms that apply to them. Work through every row until all show a green Complete.",
      officialUrl: APPLY_URL,
      sourceUrl: APPLY_URL,
      officialPageName: "Permanent Residence application",
      extraLinks: [
        { label: "Apply for permanent residence", url: APPLY_URL },
      ],
      screenshots: [
        shot(
          "seed-shot-ita-hub",
          "/guide/express-entry-ita-hub.png",
          "Application checklist listing Personal details, Contact details, Study and languages, Application details, Representative, Work history and Personal history, each with In progress or Complete and a Continue form or Update form button.",
        ),
      ],
      commonMistakes: [
        "Submitting while a form still shows In progress.",
        "Completing your own forms but leaving an accompanying family member's forms untouched.",
      ],
    }),
    step({
      id: "step-ita-personal-details",
      sectionId: sectionId(12),
      position: 4,
      title: "Personal details",
      instruction:
        "Personal details repeats what you entered in your profile:\n• Names — exactly as printed on your passport, including any previous names.\n• Personal description — date and country of birth, height in centimetres and in feet/inches, and eye colour.\n• Marital status — with the date your marriage or common-law relationship started.\n• ID documents — passport type, number, country of issue, and issue and expiry dates.\n• Immigration history and citizenship — previous applications to Canada, your UCI if you have one, and your countries of citizenship.\n• Family — how many people the application covers, the funds you bring, relatives in Canada, and your parents, spouse and children.\nIRCC compares these answers with your profile and the documents you upload, so keep them consistent. MapleRoute never asks you to enter these details.",
      officialUrl: APPLY_URL,
      sourceUrl: APPLY_URL,
      officialPageName: "Permanent Residence application — Personal details",
      screenshots: [
        shot(
          "seed-shot-ita-personal",
          "/guide/express-entry-ita-personal.png",
          "Personal details section with height in centimetres, height in feet and inches, eye colour and the Previous and Next buttons.",
        ),
      ],
      commonMistakes: [
        "A name that doesn't match the passport exactly.",
        "Leaving out a previous name you've used.",
      ],
    }),
    step({
      id: "step-ita-contact-details",
      sectionId: sectionId(12),
      position: 5,
      title: "Contact details and address history",
      instruction:
        "Contact details has five parts:\n• Language of correspondence — English or French.\n• Telephone/fax — the number where IRCC can reach you, with the country code, and whether it's in Canada or the US.\n• Email address — use one you check every day.\n• Mailing address — where IRCC can send correspondence.\n• Address history — every address in the past 10 years, or since your 18th birthday, with no gaps. Mark your current address.",
      officialUrl: APPLY_URL,
      sourceUrl: APPLY_URL,
      officialPageName: "Permanent Residence application — Contact details",
      screenshots: [
        shot(
          "seed-shot-ita-contact",
          "/guide/express-entry-ita-contact.png",
          "Contact details section with Language of correspondence, Telephone/fax, Email address, Mailing address and Address history, each marked complete.",
        ),
      ],
      commonMistakes: [
        "Leaving a gap in the address history.",
        "Using an email address you rarely check — IRCC sends requests there.",
      ],
    }),
    step({
      id: "step-ita-study-languages",
      sectionId: sectionId(12),
      position: 6,
      title: "Study and languages",
      instruction:
        "Study and languages repeats the evidence behind your score:\n• Education history — every period of study, whether you finished high school, field of study, dates, school, city and country, full- or part-time, and standing.\n• ECA — whether you have an Educational Credential Assessment from the last five years, the organization that issued it, its date and the ECA number.\n• Official languages — the test you took, the date, and the scores for Speaking, Reading, Listening and Writing exactly as printed on your report. Enter the test scores, not CLB levels; IRCC converts them.",
      officialUrl: APPLY_URL,
      sourceUrl: APPLY_URL,
      officialPageName: "Permanent Residence application — Study and languages",
      screenshots: [
        shot(
          "seed-shot-ita-languages",
          "/guide/express-entry-ita-languages.png",
          "Study and languages section with the language test date, certificate number, Speaking, Reading, Listening and Writing scores, and the French test question answered No.",
        ),
      ],
      extraLinks: [
        { label: "Language test results", url: LANGUAGE_URL },
        { label: "Educational Credential Assessment", url: ECA_URL },
      ],
      requiredDocuments: [
        {
          name: "Language test report",
          description:
            "The same test report you used in your profile. Keep it until the decision.",
          link: LANGUAGE_URL,
        },
        {
          name: "ECA report",
          description:
            "If you're claiming education completed outside Canada, the assessment from an IRCC-designated organization.",
          link: ECA_URL,
        },
      ],
      commonMistakes: [
        "Entering CLB levels instead of the scores printed on the test report.",
        "Using an ECA that is more than five years old.",
      ],
    }),
    step({
      id: "step-ita-application-details",
      sectionId: sectionId(12),
      position: 7,
      title: "Application details and representative",
      instruction:
        "Application details asks which province or territory you intend to live in, and whether you have a nomination certificate — answer Yes only if a province or territory nominated you.\nRepresentative asks whether you're using an authorized representative. If you're completing the application yourself, answer No. If someone represents you, they must be authorized by IRCC, and you give their details here.",
      officialUrl: APPLY_URL,
      sourceUrl: APPLY_URL,
      officialPageName: "Permanent Residence application — Application details",
      screenshots: [
        shot(
          "seed-shot-ita-representative",
          "/guide/express-entry-ita-representative.png",
          "Application/profile details page with the Representative section asking whether to appoint a representative, answered No, and Save and exit and Check for completeness buttons.",
        ),
      ],
      commonMistakes: [
        "Answering Yes to a nomination when you don't have a certificate.",
        "Naming a paid agent who isn't authorized by IRCC.",
      ],
    }),
    step({
      id: "step-ita-work-history",
      sectionId: sectionId(12),
      position: 8,
      title: "Work history",
      instruction:
        "Work history asks for your primary occupation — the five-digit NOC code your application is based on — and the date you first became qualified for it. Then add every job in the past 10 years: employer, job title, NOC code, dates, hours per week, whether it's your current job, country and city, and whether you were self-employed.\nThe Research questions that follow ask whether you have a job offer, whether you checked that your education and experience match your primary occupation, and whether you have a certificate of qualification. Answer No when they don't apply.",
      officialUrl: NOC_URL,
      sourceUrl: APPLY_URL,
      officialPageName: "Permanent Residence application — Work history",
      screenshots: [
        shot(
          "seed-shot-ita-work-history",
          "/guide/express-entry-ita-work-history.png",
          "Work history entry with hours per week, five-digit NOC code, job title, employer/company name, self-employed checkbox, country/territory, city/town and a Save and add button.",
        ),
      ],
      extraLinks: [
        { label: "Find your NOC", url: NOC_URL },
      ],
      requiredDocuments: [
        {
          name: "Employment records",
          description:
            "Reference letters and records for the job you rely on, listing duties, hours worked and start and end dates.",
        },
      ],
      commonMistakes: [
        "Dropping a job because it wasn't in your field — IRCC expects the full 10-year history.",
        "Using a different NOC code from the one you were invited under.",
      ],
    }),
    step({
      id: "step-ita-personal-history",
      sectionId: sectionId(12),
      position: 9,
      title: "Personal history, travel and statutory questions",
      instruction:
        "Personal history covers your life in the last 10 years, or since your 18th birthday:\n• Personal activities — what you were doing at each point (employed, studying, unemployed and so on). Start with the most recent and don't leave gaps.\n• Travel history — every trip outside your country of citizenship or residence in the last 10 years.\n• Statutory questions — questions about refusals, criminal charges and other admissibility issues. Answer every one truthfully; a Yes answer asks you to explain.",
      officialUrl: APPLY_URL,
      sourceUrl: APPLY_URL,
      officialPageName: "Permanent Residence application — Personal history",
      screenshots: [
        shot(
          "seed-shot-ita-personal-history",
          "/guide/express-entry-ita-personal-history.png",
          "Personal activities entry with activity type Employment, start and end month and year, an Ongoing checkbox, a description field, employer name and country.",
        ),
      ],
      commonMistakes: [
        "A gap between a job ending and school starting.",
        "Leaving out a short trip in the travel history.",
      ],
    }),
    step({
      id: "step-ita-medical",
      sectionId: sectionId(12),
      position: 10,
      title: "Get your immigration medical exam",
      instruction:
        "An immigration medical exam (IME) from an IRCC panel physician is required for permanent residence. Your family members need one too, even if they aren't coming with you.\nIf you already completed an IME for an earlier application and you're in Canada, you may not need another. IRCC asks for the IMM 1017B form or your IME number (unique medical identifier) from that exam.\nIf you've never done one, book with a panel physician before you submit. IRCC may also send instructions after you submit.",
      officialUrl: MEDICAL_URL,
      sourceUrl: MEDICAL_URL,
      officialPageName: "Documents for Express Entry: Medical exams",
      extraLinks: [
        { label: "Medical exams", url: MEDICAL_URL },
      ],
      requiredDocuments: [
        {
          name: "Medical exam proof",
          description:
            "The IMM 1017B form or your IME number from a panel physician. The exam is valid for 12 months.",
          link: MEDICAL_URL,
        },
      ],
      screenshots: [
        shot(
          "seed-shot-ita-medical",
          "/guide/express-entry-ita-medical.png",
          "IRCC Medical exams page explaining that an immigration medical exam from a panel physician is required for permanent residence, including for family members.",
        ),
      ],
      commonMistakes: [
        "Using a doctor who isn't an IRCC panel physician.",
        "Booking the exam for yourself only and not for your family members.",
      ],
    }),
    step({
      id: "step-ita-upload-documents",
      sectionId: sectionId(12),
      position: 11,
      title: "Upload your documents",
      instruction:
        "Open “Your document checklist”. Each required document shows Not provided with an Upload file button — for example passports/travel documents, marriage licence/certificate, proof of the upfront medical exam, education diplomas/degrees, police certificate, employment records, proof of means of financial support and a digital photo.\nChoose the ? next to a document to read the format and size rules before you upload. Upload clear colour scans or photos; if a document isn't in English or French, include a certified translation.\nOptional documents include Client Information, where you can upload a Letter of Explanation. Each family member has their own checklist under yours.",
      officialUrl: `${APPLY_URL}#documents`,
      sourceUrl: APPLY_URL,
      officialPageName: "Your document checklist",
      extraLinks: [
        { label: "Documents to upload", url: `${APPLY_URL}#documents` },
      ],
      requiredDocuments: [
        {
          name: "Passports/travel documents",
          description:
            "A clear scan or photo of the photo page. Every family member included needs one.",
        },
        {
          name: "Marriage licence/certificate",
          description:
            "IRCC adds this to your checklist when you're married or in a common-law partnership.",
        },
        {
          name: "Proof of upfront medical exam",
          description:
            "The IMM 1017B form or IME number from your panel physician.",
          link: MEDICAL_URL,
        },
        {
          name: "Education (diplomas/degrees)",
          description:
            "Diplomas or degrees for the education you're claiming, with the ECA report if you have one.",
        },
        {
          name: "Police certificates",
          description:
            "For every country you stayed in for 6 months in a row or longer in the last 10 years. The certificate for the country you live in now must be issued no more than 6 months before you submit.",
          link: POLICE_URL,
        },
        {
          name: "Employment records",
          description:
            "Reference letters and records for the job you rely on, listing duties, hours and dates.",
        },
        {
          name: "Proof of funds",
          description:
            "The amount depends on your family size. Check the official proof of funds page.",
        },
        {
          name: "Digital photo",
          description:
            "A photo that meets IRCC's photo rules. The ? next to the row explains them.",
        },
      ],
      screenshots: [
        shot(
          "seed-shot-ita-checklist",
          "/guide/express-entry-ita-checklist.png",
          "Document checklist with rows for passports, marriage certificate, medical exam proof, education, police certificate, employment records, proof of funds and digital photo, each marked Not provided with an Upload file button.",
        ),
      ],
      commonMistakes: [
        "Uploading a blurry phone photo — IRCC needs a clear colour scan.",
        "Skipping the certified translation for a document that isn't in English or French.",
        "Using a police certificate that is older than the 6-month rule for the country you live in now.",
      ],
    }),
    step({
      id: "step-ita-declaration",
      sectionId: sectionId(12),
      position: 12,
      title: "Review, declare and submit",
      instruction:
        "Open each form and check it one last time, then continue to the declaration:\n• Read the declaration and choose I agree.\n• Type your given name(s) and last name exactly as they appear on your passport.\n• Answer the security question (for example, your favourite town).\n• Choose Sign — this is your electronic signature.\nSubmit before the 60-day deadline. The confirmation and your receipt stay in your account.",
      officialUrl: APPLY_URL,
      sourceUrl: APPLY_URL,
      officialPageName: "Permanent Residence application — Declaration",
      screenshots: [
        shot(
          "seed-shot-ita-declaration",
          "/guide/express-entry-ita-declaration.png",
          "Declaration and electronic signature page with an I agree selection, given name and last name fields, a security question and the Sign button.",
        ),
      ],
      commonMistakes: [
        "Signing while a form still shows In progress.",
        "Submitting after the 60-day deadline.",
      ],
    }),
  ],
  13: [
    step({
      id: "step-after-submit-aor",
      sectionId: sectionId(13),
      position: 0,
      title: "Check for your acknowledgement (AOR)",
      instruction:
        "After you submit, IRCC sends an acknowledgement of receipt to your account. It confirms the application is in the queue and shows your application number.\nCheck your account and email regularly. Requests for more documents, a new medical exam or updated police certificates arrive as messages there.",
      officialUrl: AFTER_APPLY_URL,
      sourceUrl: AFTER_APPLY_URL,
      officialPageName: "After you apply",
      extraLinks: [
        { label: "After you apply", url: AFTER_APPLY_URL },
        { label: "Application Status Tracker", url: TRACKER_URL },
      ],
      lastVerified: "2026-10-31",
      screenshots: [
        shot(
          "seed-shot-aor",
          "/guide/express-entry-aor.png",
          "IRCC Application Status Tracker sign-in page, with the note that the tool can only be used after you receive an acknowledgement of receipt (AOR).",
        ),
      ],
      commonMistakes: [
        "Missing a request because you stopped checking the email on the application.",
      ],
    }),
    step({
      id: "step-give-biometrics",
      sectionId: sectionId(13),
      position: 1,
      title: "Give your biometrics within 30 days",
      instruction:
        "After you apply, IRCC sends a letter asking for your fingerprints and photo. Give your biometrics at a collection point within 30 days of the letter.\nIf you miss the deadline, your application may be delayed.",
      officialUrl: BIOMETRICS_URL,
      sourceUrl: BIOMETRICS_URL,
      officialPageName: "Biometrics",
      extraLinks: [
        { label: "Biometrics", url: BIOMETRICS_URL },
        { label: "After you apply", url: AFTER_APPLY_URL },
      ],
      requiredDocuments: [
        {
          name: "Biometrics instruction letter",
          description:
            "IRCC sends it after you apply. Bring it to the collection point.",
        },
      ],
      lastVerified: "2026-10-31",
      screenshots: [
        shot(
          "seed-shot-biometrics",
          "/guide/express-entry-biometrics.png",
          "IRCC After you apply page, Get your fingerprints and photo (biometrics) taken section: IRCC sends a letter, the fee is paid when you apply, and you have 30 days from the date on the letter.",
        ),
      ],
      commonMistakes: [
        "Waiting for a second reminder — the 30 days start from the letter.",
      ],
    }),
    step({
      id: "step-track-application",
      sectionId: sectionId(13),
      position: 2,
      title: "Track your application and answer requests",
      instruction:
        "Check your IRCC secure account for your application status and messages. IRCC may ask for more documents, a new medical exam or updated police certificates.\nReply before the deadline in the request. The decision also appears in your account.",
      officialUrl: AFTER_APPLY_URL,
      sourceUrl: AFTER_APPLY_URL,
      officialPageName: "After you apply",
      extraLinks: [
        { label: "After you apply", url: AFTER_APPLY_URL },
        { label: "Application Status Tracker", url: TRACKER_URL },
      ],
      lastVerified: "2026-10-31",
      screenshots: [
        shot(
          "seed-shot-track",
          "/guide/express-entry-tracker.png",
          "IRCC Application Status Tracker showing a Canadian Experience Class application with the status In Progress and the Applicants and pending actions section below.",
        ),
      ],
    }),
  ],
  14: [
    step({
      id: "step-bowp-eligibility",
      sectionId: sectionId(14),
      position: 0,
      title: "Check that you're eligible for a BOWP",
      instruction:
        "A bridging open work permit (BOWP) lets you keep working while IRCC processes your permanent residence application. These instructions cover applications through the Federal Skilled Worker Program, Canadian Experience Class and Federal Skilled Trades Program.\nTo be eligible, you must live in Canada and intend to live outside Quebec when you apply. You must be the principal applicant, have submitted a complete permanent residence application that passed the completeness check, and have your acknowledgement of receipt (AOR) letter. You also need valid temporary resident status and a valid work permit, an expired work permit with maintained status as a worker, or be eligible to restore your status and get a work permit.\nA profile in the Express Entry pool is not an application for permanent residence, so you can only apply for a BOWP after you apply for permanent residence.\nYou can leave Canada while IRCC processes the application. If you leave after your work permit expires, you can't work until the new application is approved.",
      officialUrl: BOWP_URL,
      sourceUrl: BOWP_URL,
      officialPageName: "Bridging open work permit for permanent residence applicants",
      extraLinks: [
        {
          label: "Bridging open work permit for permanent residence applicants",
          url: BOWP_URL,
        },
      ],
      lastVerified: "2026-10-31",
      screenshots: [
        shot(
          "seed-shot-bowp-eligibility",
          "/guide/express-entry-bowp-eligibility.png",
          "Express Entry section of the BOWP page: the programs it covers, the Who can apply for a BOWP requirements and the note about leaving Canada while the application is in process.",
        ),
      ],
      commonMistakes: [
        "Applying for a BOWP while you're only in the Express Entry pool — a profile is not an application for permanent residence.",
        "Applying while you live outside Canada, or while you intend to live in Quebec.",
      ],
    }),
    step({
      id: "step-bowp-maintain-status",
      sectionId: sectionId(14),
      position: 1,
      title: "If you're not eligible yet, protect your status",
      instruction:
        "If you don't have your AOR yet, don't let your work permit expire while you wait for an invitation to apply. Maintain your status in Canada by extending your work permit.\nYour employer may need to get a new Labour Market Impact Assessment or submit a new offer of employment for you to do this.",
      officialUrl: BOWP_URL,
      sourceUrl: BOWP_URL,
      officialPageName: "Bridging open work permit for permanent residence applicants",
      extraLinks: [
        { label: "Extend your work permit", url: EXTEND_WORK_PERMIT_URL },
      ],
      lastVerified: "2026-10-31",
      screenshots: [
        shot(
          "seed-shot-bowp-not-eligible",
          "/guide/express-entry-bowp-not-eligible.png",
          "Warning box headed If you're not eligible for a BOWP yet: don't let your work permit expire, extend it, and your employer may need a new Labour Market Impact Assessment or a new offer of employment.",
        ),
      ],
      commonMistakes: [
        "Letting your work permit expire while you wait for the AOR.",
      ],
    }),
    step({
      id: "step-bowp-documents",
      sectionId: sectionId(14),
      position: 2,
      title: "Include your AOR letter with the BOWP application",
      instruction:
        "When you submit your BOWP application, include the supporting documents listed in the document checklist and a copy of your acknowledgement of receipt letter.\nIf you apply online, upload the AOR letter in the “Client information” field.",
      officialUrl: BOWP_URL,
      sourceUrl: BOWP_URL,
      officialPageName: "Bridging open work permit for permanent residence applicants",
      extraLinks: [
        {
          label: "Supporting documents for a BOWP",
          url: BOWP_URL,
        },
      ],
      lastVerified: "2026-10-31",
      requiredDocuments: [
        {
          name: "Acknowledgement of receipt (AOR) letter",
          description:
            "IRCC sends it to your account after it gets your permanent residence application. Include a copy with your BOWP application.",
        },
      ],
      screenshots: [
        shot(
          "seed-shot-bowp-documents",
          "/guide/express-entry-bowp-documents.png",
          "Supporting documents section listing the document checklist and a copy of the acknowledgement of receipt letter, with a note to upload the letter in the Client information field when applying online.",
        ),
      ],
    }),
    step({
      id: "step-bowp-apply",
      sectionId: sectionId(14),
      position: 3,
      title: "Apply as an open work permit",
      instruction:
        "Follow the instructions for extending or changing the conditions on your work permit. When you apply, select “Open work permit” as the type of work permit and pay the work permit processing fee and the open work permit holder fee.\nIn most cases you must apply online. If you're having problems applying online, you can apply on paper.",
      officialUrl: BOWP_URL,
      sourceUrl: BOWP_URL,
      officialPageName: "Bridging open work permit for permanent residence applicants",
      extraLinks: [
        {
          label: "Extend or change the conditions on your work permit",
          url: EXTEND_WORK_PERMIT_URL,
        },
      ],
      lastVerified: "2026-10-31",
      screenshots: [
        shot(
          "seed-shot-bowp-apply",
          "/guide/express-entry-bowp-how-to-apply.png",
          "How to apply section: follow the extending or changing conditions instructions, select Open work permit, pay both the work permit processing fee and the open work permit holder fee, and apply online in most cases.",
        ),
      ],
      commonMistakes: [
        "Choosing a closed work permit — a BOWP is an open work permit.",
      ],
    }),
  ],
  15: [
    step({
      id: "step-confirm-pr",
      sectionId: sectionId(15),
      position: 0,
      title: "Confirm your permanent residence in the PR Portal",
      instruction:
        "If IRCC approves your application while you're in Canada, they email you to confirm your permanent residence in the PR Portal. Sign in, choose Confirmation of permanent residence under Category, confirm you're in Canada, and provide the address and photo they ask for. Your electronic Confirmation of Permanent Residence (eCOPR) is then available in the portal.\nIf you're outside Canada, IRCC issues a Confirmation of Permanent Residence (COPR) and, when you need one, a permanent resident visa.",
      officialUrl: PR_CONFIRM_URL,
      sourceUrl: PR_CONFIRM_URL,
      officialPageName: "Confirm your permanent residence from within Canada",
      extraLinks: [
        {
          label: "Confirm your permanent residence from within Canada",
          url: PR_CONFIRM_URL,
        },
        { label: "Permanent Residence Portal", url: PR_PORTAL_URL },
      ],
      screenshots: [
        shot(
          "seed-shot-confirm-pr",
          "/guide/express-entry-confirm-pr.png",
          "PR Portal confirmation page with the In-Canada declaration ticked, the Submit declaration button and the heading for Step 2: Documents required.",
        ),
      ],
      commonMistakes: [
        "Ignoring the portal email — the confirmation waits for you.",
        "Entering an address you won't be living at when the card is mailed.",
      ],
    }),
    step({
      id: "step-check-copr",
      sectionId: sectionId(15),
      position: 1,
      title: "Check your COPR details",
      instruction:
        "Check every detail on your eCOPR or COPR — your name, date of birth, passport details and the expiry date. Tell IRCC straight away if something is wrong.\nThe COPR is your proof of permanent residence until your PR card arrives.",
      officialUrl: COPR_URL,
      sourceUrl: COPR_URL,
      officialPageName: "Confirmation of Permanent Residence document",
      extraLinks: [
        {
          label: "Confirmation of Permanent Residence document",
          url: COPR_URL,
        },
        { label: "If we approve your application", url: APPROVED_URL },
      ],
      lastVerified: "2026-10-31",
      screenshots: [
        shot(
          "seed-shot-copr",
          "/guide/express-entry-copr.png",
          "Official sample of the Confirmation of Permanent Residence form showing the fields to check: family name, given name, date of birth, UCI, document number, travel document, country of issue and expiry date.",
        ),
      ],
      commonMistakes: [
        "Booking travel before checking the expiry date on the COPR and visa.",
      ],
    }),
    step({
      id: "step-travel-canada",
      sectionId: sectionId(15),
      position: 2,
      title: "Travel to Canada before they expire",
      instruction:
        "If you're outside Canada, you must travel to Canada before your COPR and visa expire. At the border, show your COPR to the border services officer.\nKeep your COPR with your passport — you'll need it when you arrive.",
      officialUrl: COPR_URL,
      sourceUrl: COPR_URL,
      officialPageName: "Confirmation of Permanent Residence document",
      extraLinks: [
        {
          label: "Confirmation of Permanent Residence document",
          url: COPR_URL,
        },
        { label: "If we approve your application", url: APPROVED_URL },
      ],
      lastVerified: "2026-10-31",
      screenshots: [
        shot(
          "seed-shot-travel",
          "/guide/express-entry-travel.png",
          "IRCC Confirmation of Permanent Residence page: if you're outside Canada, you must travel to Canada and present your COPR at a Canadian port of entry before the validity date on the COPR.",
        ),
      ],
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
    version: "0.15.0",
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
