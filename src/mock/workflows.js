// Workflow templates and steps (used by SelectWorkflow)
const workflows = [
  {
    code: "WITH_LOAN",
    name: "Loan",
    description: "Full process when customer applies for loan.",
    steps: [
      "Bank selection and create loan file login (generate Loan Login Number).",
      "Prepare Agreement Draft and submit to bank.",
      "Receive Loan Sanction Letter.",
      "Collect 20% OCR Payment from customer.",
      "Verify all documents completely.",
      "Upload Original ATS online.",
      "Collect signatures (Customer, Bank, JDA).",
      "Take photo of Bank Demand Draft (DD).",
      "Apply property file in JDA office.",
      "Receive property Patta from JDA.",
      "Register Patta officially.",
      "Submit registered Patta to bank and receive DD.",
      "Submit DD in bank and after clearance collect remaining 20% payment and close file."
    ]
  },
  {
    code: "WITHOUT_LOAN",
    name: "Without Loan",
    description: "Standard cash process without bank involvement.",
    steps: [
      "Generate ATS Draft.",
      "Verify Draft.",
      "Print Original Agreement.",
      "Get Customer & JDA File Signatures.",
      "Apply for Patta in JDA.",
      "Receive Patta.",
      "Register Patta.",
      "Upload Registered Patta Copy & Agreement Original Copy.",
      "Mark File Status = Closed."
    ]
  },
  {
    code: "WITHOUT_7DAY_CLOSED",
    name: "Without Loan - Quick Closure (7 Days)",
    description: "Used when customer pays full amount early for fast closure.",
    steps: [
      "Receive 100% payment.",
      "Apply for Patta in JDA.",
      "Receive Patta.",
      "Register Patta.",
      "Upload Registered Patta Copy & Agreement Original Copy.",
      "Close file within 7 days from payment received."
    ]
  },
  {
    code: "AGREEMENT_REGISTRY_PROCESS",
    name: "Agreement & Registry",
    description: "Focused flow for agreement drafting and registry without loan.",
    steps: [
      "Prepare agreement draft and share for approval.",
      "Collect required signatures for agreement.",
      "Submit agreement for registry slot booking.",
      "Complete registry at sub-registrar office.",
      "Upload registered agreement and supporting documents.",
      "Mark agreement registry process as closed."
    ]
  }
];

export default workflows;