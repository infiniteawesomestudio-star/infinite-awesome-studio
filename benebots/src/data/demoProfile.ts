// Sample clients used for the public BeneBots demos. All fictional.
// CLIENTS drives the multi-tenant client switcher; demos read the active one
// from ClientContext. DEMO_PROFILE remains the default (first client).

const demoCo = {
  id: "demo-co",
  companyName: "Demo Co",
  companySize: "Mid-size employer, ~450 employees",
  planYear: "2026",

  medical: {
    hdhp: {
      name: "HDHP with HSA",
      // Must meet the IRS 2026 HDHP minimum deductible ($1,700/$3,400) or the
      // plan is not HSA-qualified. Rev. Proc. 2025-19.
      deductible: { individual: 1700, family: 3400 },
      oopm: { individual: 4000, family: 8000 },
      employerHsaSeed: 1000,
      coinsurance: "80% after deductible",
    },
    ppo: {
      name: "PPO",
      deductible: { individual: 500, family: 1000 },
      oopm: { individual: 3500, family: 7000 },
      primaryCareCopay: 30,
      specialistCopay: 55,
      coinsurance: "80% after deductible",
    },
  },

  dental: {
    carrier: "Delta Dental PPO",
    preventive: "100%",
    basic: "80% after deductible",
    major: "50% after deductible",
    ortho: "50% up to $2,000 lifetime",
    annualMax: 2500,
  },

  vision: { carrier: "VSP" },

  hsa: {
    limit2026Individual: 4400,
    limit2026Family: 8750,
    catchUp55: 1000,
    employerSeed: 1000,
  },

  fsa: {
    healthFsa: { limit: 3400, carryover: 680 },
    limitedPurposeFsa: true,
    dependentCareFsa: { limit: 7500 },
  },

  retirement: {
    match: "100% of first 3%, 50% of next 2% (4% max)",
    rothOption: true,
    secure2CatchUp: true,
  },

  loa: {
    fmlaCovered: true,
    companyParentalLeave: "6 weeks",
    stateLeaveJurisdictions: ["CA", "NY", "WA"],
    stdCarrier: "The Hartford",
    ltdCarrier: "The Hartford",
    loaAdministrator: "Demo Co HR, hr@democo.example",
    returnToWorkProcess: "Fitness-for-duty form required",
  },

  cobra: {
    administrator: "WEX Benefits",
    qualifyingEventWindow: 60,
  },

  claims: {
    medicalCarrier: "Aetna",
    memberServicesPhone: "1-800-872-3862",
    memberPortal: "aetna.com/member",
    appealDeadlineDays: 180,
    externalReviewAvailable: true,
    priorAuthList: "Available on the Aetna provider portal and aetna.com/member",
    nsaCompliant: true,
    ideoContractStatus: "Demo Co's Aetna network is a fully credentialed PPO. Balance billing protections apply for emergency services and non-emergency care at in-network facilities.",
    hrClaimsContact: "Demo Co HR, hr@democo.example",
  },

  // Stewardship report metrics (fictional claims experience)
  stewardshipClaims: {
    totalSpend: 3_420_000,
    memberMonths: 5_200,
    pmpm: 658,
    topCostDrivers: [
      { category: "Musculoskeletal", pct: 18, trend: "+6%" },
      { category: "Cardiovascular", pct: 14, trend: "+3%" },
      { category: "Mental Health", pct: 12, trend: "+11%" },
      { category: "Oncology", pct: 9, trend: "+2%" },
    ],
    genericFillRate: 87,
    erVisits: 142,
    preventiveCompliance: 72,
    peerPmpm: 631,
    hdhpUptake: 40,
    peerHdhpUptake: 52,
  },
}

export type Client = typeof demoCo

// Contrasting 2nd client: larger manufacturer, different carriers, leaner design.
const northpoint: Client = {
  id: "northpoint",
  companyName: "Northpoint Manufacturing",
  companySize: "Large employer, ~1,800 employees",
  planYear: "2026",

  medical: {
    hdhp: {
      name: "HDHP with HSA",
      deductible: { individual: 2000, family: 4000 },
      oopm: { individual: 5000, family: 10000 },
      employerHsaSeed: 500,
      coinsurance: "70% after deductible",
    },
    ppo: {
      name: "PPO",
      deductible: { individual: 750, family: 1500 },
      oopm: { individual: 4000, family: 8000 },
      primaryCareCopay: 35,
      specialistCopay: 70,
      coinsurance: "70% after deductible",
    },
  },

  dental: {
    carrier: "MetLife PPO",
    preventive: "100%",
    basic: "80% after deductible",
    major: "50% after deductible",
    ortho: "50% up to $1,500 lifetime",
    annualMax: 1500,
  },

  vision: { carrier: "EyeMed" },

  hsa: {
    limit2026Individual: 4400,
    limit2026Family: 8750,
    catchUp55: 1000,
    employerSeed: 500,
  },

  fsa: {
    healthFsa: { limit: 3400, carryover: 680 },
    limitedPurposeFsa: true,
    dependentCareFsa: { limit: 7500 },
  },

  retirement: {
    match: "50% of first 6% (3% max)",
    rothOption: true,
    secure2CatchUp: true,
  },

  loa: {
    fmlaCovered: true,
    companyParentalLeave: "4 weeks",
    stateLeaveJurisdictions: ["OH", "TX"],
    stdCarrier: "Lincoln Financial",
    ltdCarrier: "Lincoln Financial",
    loaAdministrator: "Northpoint People Ops, leave@northpoint.example",
    returnToWorkProcess: "Fitness-for-duty form required",
  },

  cobra: {
    administrator: "WEX Benefits",
    qualifyingEventWindow: 60,
  },

  claims: {
    medicalCarrier: "UnitedHealthcare",
    memberServicesPhone: "1-866-633-2446",
    memberPortal: "myuhc.com",
    appealDeadlineDays: 180,
    externalReviewAvailable: true,
    priorAuthList: "Available on the UnitedHealthcare provider portal and myuhc.com",
    nsaCompliant: true,
    ideoContractStatus: "Northpoint Manufacturing's UnitedHealthcare network is a fully credentialed PPO. Balance billing protections apply for emergency services and non-emergency care at in-network facilities.",
    hrClaimsContact: "Northpoint People Ops, benefits@northpoint.example",
  },

  stewardshipClaims: {
    totalSpend: 11_800_000,
    memberMonths: 21_600,
    pmpm: 546,
    topCostDrivers: [
      { category: "Musculoskeletal", pct: 22, trend: "+9%" },
      { category: "Injury & Trauma", pct: 13, trend: "+5%" },
      { category: "Cardiovascular", pct: 11, trend: "+2%" },
      { category: "Diabetes", pct: 8, trend: "+4%" },
    ],
    genericFillRate: 84,
    erVisits: 540,
    preventiveCompliance: 61,
    peerPmpm: 560,
    hdhpUptake: 58,
    peerHdhpUptake: 52,
  },
}

export const CLIENTS: Client[] = [demoCo, northpoint]

// Default client (back-compat for any direct importers).
export const COMPANY_NAME = demoCo.companyName
export const DEMO_PROFILE: Client = demoCo
