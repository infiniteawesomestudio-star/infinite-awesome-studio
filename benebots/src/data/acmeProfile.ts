export const ACME_PROFILE = {
  companyName: "Acme Industries",
  companySize: "Mid-size employer, ~450 employees",
  planYear: "2026",

  medical: {
    hdhp: {
      name: "HDHP with HSA",
      deductible: { individual: 1600, family: 3200 },
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
    limit2026Family: 8550,
    catchUp55: 1000,
    employerSeed: 1000,
  },

  fsa: {
    healthFsa: { limit: 3300, carryover: 660 },
    limitedPurposeFsa: true,
    dependentCareFsa: { limit: 5000 },
  },

  retirement: {
    match: "100% of first 3%, 50% of next 2% (4% max)",
    rothOption: true,
    secure2CatchUp: true,
  },

  loa: {
    fmlaCovered: true,
    companyParentalLeave: "6 weeks fully paid",
    stateLeaveJurisdictions: ["CA", "NY", "WA"],
    stdCarrier: "The Hartford",
    ltdCarrier: "The Hartford",
    loaAdministrator: "Acme HR — hr@acme-demo.com",
    returnToWorkProcess: "Fitness-for-duty form required",
  },

  cobra: {
    administrator: "WEX Benefits",
    qualifyingEventWindow: 60,
  },
} as const
