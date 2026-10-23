export interface Department {
  id: string;
  name: string;
  sector: string;
  code: string;
}

export interface Startup {
  id: string;
  name: string;
  dpiit_id: string;
  sector: string;
  verified: boolean;
  founder: string;
}

export interface Problem {
  id: string;
  department_id: string;
  department_name?: string;
  title: string;
  description: string;
  sector: string;
  budget_cap: number;
  deadline: string;
  status: 'open' | 'in_pilot' | 'converted';
  created_at: string;
  application_count?: number;
  active_pilot_id?: string;
}

export interface Application {
  id: string;
  problem_id: string;
  startup_id: string;
  startup?: Startup;
  pitch: string;
  status: 'submitted' | 'selected' | 'rejected';
  created_at: string;
  proposed_budget: number;
  pilot_timeline_weeks: number;
}

export interface Milestone {
  id: string;
  pilot_id: string;
  title: string;
  target: string;
  due_date: string;
  evidence_url?: string | null;
  status: 'pending' | 'submitted' | 'met' | 'missed';
  notes?: string;
}

export interface Pilot {
  id: string;
  application_id: string;
  problem_id: string;
  problem_title?: string;
  department_name?: string;
  startup_name?: string;
  startup_dpiit?: string;
  start_date: string;
  end_date: string;
  budget: number;
  contract_value?: number;
  status: 'active' | 'converted' | 'failed';
  milestones: Milestone[];
  converted_at?: string;
  contract_id?: string;
  record_hash?: string;
  rule_reference?: string;
}

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-1',
    name: 'Dept. of Drinking Water & Sanitation (Jal Jeevan Mission)',
    sector: 'Water & Sanitation',
    code: 'DDWS',
  },
  {
    id: 'dept-2',
    name: 'Ministry of Housing and Urban Affairs (Smart Cities Mission)',
    sector: 'Smart Mobility',
    code: 'MoHUA',
  },
  {
    id: 'dept-3',
    name: 'Ministry of Health & Family Welfare (NHM)',
    sector: 'Healthcare',
    code: 'MoHFW',
  },
];

export const INITIAL_STARTUPS: Startup[] = [
  {
    id: 'startup-1',
    name: 'AquaSense Analytics Pvt Ltd',
    dpiit_id: 'DIPP-89211',
    sector: 'Water & Sanitation',
    verified: true,
    founder: 'Rohan Deshmukh',
  },
  {
    id: 'startup-2',
    name: 'FlowMetrics Tech',
    dpiit_id: 'DIPP-44312',
    sector: 'Water & Sanitation',
    verified: true,
    founder: 'Ananya Sharma',
  },
  {
    id: 'startup-3',
    name: 'TerraHydro Labs',
    dpiit_id: 'DIPP-11029',
    sector: 'Water & Sanitation',
    verified: false, // unverified to showcase eligibility blocking
    founder: 'Karan Mehra',
  },
  {
    id: 'startup-4',
    name: 'UrbanPulse Mobility AI',
    dpiit_id: 'DIPP-99812',
    sector: 'Smart Mobility',
    verified: true,
    founder: 'Pooja Iyer',
  },
  {
    id: 'startup-5',
    name: 'NeuroCare Diagnostics',
    dpiit_id: 'DIPP-77112',
    sector: 'Healthcare',
    verified: true,
    founder: 'Dr. Vikram Malhotra',
  },
];

export const INITIAL_PROBLEMS: Problem[] = [
  {
    id: 'prob-101',
    department_id: 'dept-1',
    department_name: 'Dept. of Drinking Water & Sanitation',
    title: 'AI-Powered Acoustic Pipeline Leakage & Non-Revenue Water Detection',
    description:
      'Urgent requirement to detect micro-leakages in pressurized distribution pipelines without physical excavation. Solution must analyze acoustic telemetry from field sensors, report GPS pinpointing within 5 meters, and operate in dense rural-urban junction networks.',
    sector: 'Water & Sanitation',
    budget_cap: 1500000, // 15 Lakhs
    deadline: '2026-11-25',
    status: 'in_pilot',
    created_at: '2026-10-15T10:00:00Z',
    application_count: 3,
    active_pilot_id: 'pilot-b-live',
  },
  {
    id: 'prob-102',
    department_id: 'dept-1',
    department_name: 'Dept. of Drinking Water & Sanitation',
    title: 'Satellite Radar-Assisted Artificial Aquifer Recharge Site Identification',
    description:
      'Deploy interferometric synthetic aperture radar (InSAR) and multispectral terrain data to map subterranean recharge suitability for overexploited taluks in Rajasthan.',
    sector: 'Water & Sanitation',
    budget_cap: 1200000,
    deadline: '2026-11-20',
    status: 'converted',
    created_at: '2026-09-01T08:30:00Z',
    application_count: 2,
    active_pilot_id: 'pilot-a-finished',
  },
  {
    id: 'prob-103',
    department_id: 'dept-2',
    department_name: 'Ministry of Housing and Urban Affairs',
    title: 'Adaptive Edge-Computer Traffic Signal Control for Transit Corridors',
    description:
      'Real-time automated traffic signal prioritization for emergency vehicles and rapid transit corridors using existing CCTV feeds and edge inference modules.',
    sector: 'Smart Mobility',
    budget_cap: 2200000,
    deadline: '2026-12-05',
    status: 'open',
    created_at: '2026-10-20T14:15:00Z',
    application_count: 2,
  },
  {
    id: 'prob-104',
    department_id: 'dept-3',
    department_name: 'Ministry of Health & Family Welfare',
    title: 'Offline Handheld Smartphone AI Screening for Diabetic Retinopathy in Rural PHCs',
    description:
      'Smartphone-attachable optical fundus camera with on-device offline deep learning inference to triage diabetic retinopathy in remote community health centers.',
    sector: 'Healthcare',
    budget_cap: 1800000,
    deadline: '2026-12-10',
    status: 'open',
    created_at: '2026-10-22T09:00:00Z',
    application_count: 1,
  },
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-201',
    problem_id: 'prob-101',
    startup_id: 'startup-1',
    startup: INITIAL_STARTUPS[0],
    pitch:
      'AquaSense provides patented non-invasive hydrophone acoustic sensors connected to a 4G edge compute gateway. We have tested our ML leak-classification models in 3 tier-2 city water utilities with 94% precision and zero street disruption.',
    status: 'selected',
    created_at: '2026-10-16T11:20:00Z',
    proposed_budget: 1420000,
    pilot_timeline_weeks: 8,
  },
  {
    id: 'app-202',
    problem_id: 'prob-101',
    startup_id: 'startup-2',
    startup: INITIAL_STARTUPS[1],
    pitch:
      'FlowMetrics utilizes ultrasonic transit-time clamp-on flowmeters. While reliable for bulk flow, high soil dampening makes micro-leakage acoustic differentiation less effective without trenching.',
    status: 'rejected',
    created_at: '2026-10-17T15:45:00Z',
    proposed_budget: 1480000,
    pilot_timeline_weeks: 10,
  },
  {
    id: 'app-203',
    problem_id: 'prob-101',
    startup_id: 'startup-3',
    startup: INITIAL_STARTUPS[2],
    pitch:
      'TerraHydro offers soil resistivity tomography to detect water pooling subterranean leaks.',
    status: 'rejected',
    created_at: '2026-10-18T10:00:00Z',
    proposed_budget: 1350000,
    pilot_timeline_weeks: 8,
  },
];

export const INITIAL_PILOTS: Pilot[] = [
  {
    id: 'pilot-b-live',
    application_id: 'app-201',
    problem_id: 'prob-101',
    problem_title: 'AI-Powered Acoustic Pipeline Leakage & Non-Revenue Water Detection',
    department_name: 'Dept. of Drinking Water & Sanitation',
    startup_name: 'AquaSense Analytics Pvt Ltd',
    startup_dpiit: 'DIPP-89211',
    start_date: '2026-10-18',
    end_date: '2026-12-15',
    budget: 1420000,
    contract_value: 1420000,
    status: 'active',
    rule_reference: 'Rule 149(viii) GFR 2017 / GeM Startup Runway Direct Award',
    milestones: [
      {
        id: 'm-1',
        pilot_id: 'pilot-b-live',
        title: 'Sensor Grid Calibration & Baseline Acoustic Mapping',
        target: 'Deploy and calibrate 25 acoustic telemetry nodes across 10km transmission network; establish ambient noise baseline.',
        due_date: '2026-10-25',
        evidence_url: 'https://github.com/aquasense-gov/telemetry-pilot-logs/tree/baseline-cal',
        status: 'met',
        notes: 'Department field inspector validated calibration curves on Oct 24.',
      },
      {
        id: 'm-2',
        pilot_id: 'pilot-b-live',
        title: 'Edge ML Anomaly Classification & False-Positive Suppression',
        target: 'False-positive alarm rate under 5% under variable nighttime and high daytime pump vibration pressure.',
        due_date: '2026-11-05',
        evidence_url: 'https://aquasense-benchmarks.cloud/reports/m2-anomaly-verification.pdf',
        status: 'met',
        notes: 'False positive rate recorded at 3.8% across 144 operating hours.',
      },
      {
        id: 'm-3',
        pilot_id: 'pilot-b-live',
        title: 'Municipal GIS Integration & Auto-Workorder Dispatch',
        target: 'Dispatch GPS incident coordinates directly into Jal Board GIS portal within 10 seconds of acoustic burst verification.',
        due_date: '2026-11-15',
        evidence_url: 'https://drive.google.com/file/d/demo-gis-dispatch-screen/view',
        status: 'missed',
        notes: 'API timeout occurred during peak municipal database synchronization window.',
      },
      {
        id: 'm-4',
        pilot_id: 'pilot-b-live',
        title: 'Leakage Localization & Turnaround Time Reduction',
        target: 'Pinpoint simulated and natural leaks within 5 meters; reduce mean detection-to-repair turnaround time by >= 30%.',
        due_date: '2026-11-20',
        evidence_url: 'https://loom.com/share/aquasense-leakage-localization-proof-audit',
        status: 'submitted',
        notes: 'Ready for Department Review in Live Demonstration.',
      },
      {
        id: 'm-5',
        pilot_id: 'pilot-b-live',
        title: 'Continuous System Reliability & Uptime Audit',
        target: 'Maintain 99.0% telemetry uptime and operational data integrity over 7 consecutive days of pilot monitoring.',
        due_date: '2026-11-25',
        evidence_url: 'https://grafana.aquasense.org/public-dashboards/uptime-pilot-b',
        status: 'submitted',
        notes: 'Ready for Department Review in Live Demonstration.',
      },
    ],
  },
  {
    id: 'pilot-a-finished',
    application_id: 'app-199',
    problem_id: 'prob-102',
    problem_title: 'Satellite Radar-Assisted Artificial Aquifer Recharge Site Identification',
    department_name: 'Dept. of Drinking Water & Sanitation',
    startup_name: 'AquaSense Analytics Pvt Ltd',
    startup_dpiit: 'DIPP-89211',
    start_date: '2026-09-05',
    end_date: '2026-10-10',
    budget: 1150000,
    contract_value: 1150000,
    status: 'converted',
    converted_at: '2026-10-12T16:30:00Z',
    contract_id: 'CNT-2026-JAL-0881',
    record_hash: '7f9a2b8e3d4c1a5f6e8b0d2c4e6a8f0b2d4e6a8f0b2d4e6a8f0b2d4e6a8f0b2d',
    rule_reference: 'Rule 149(viii) GFR 2017 / Startup Runway Mandate',
    milestones: [
      {
        id: 'ma-1',
        pilot_id: 'pilot-a-finished',
        title: 'SAR Interferometry Baseline Map of Target Taluks',
        target: 'Deliver high-resolution 10m subsidence and permeability contour maps.',
        due_date: '2026-09-15',
        evidence_url: 'https://geo-portal.aquasense.org/gis/sar-taluk-01',
        status: 'met',
      },
      {
        id: 'ma-2',
        pilot_id: 'pilot-a-finished',
        title: 'Hydrogeological Field Ground-Truthing',
        target: 'Confirm minimum 85% correlation between satellite predictive model and borehole telemetry.',
        due_date: '2026-09-28',
        evidence_url: 'https://geo-portal.aquasense.org/reports/ground-truth-verified.pdf',
        status: 'met',
      },
      {
        id: 'ma-3',
        pilot_id: 'pilot-a-finished',
        title: 'Final Recharge Action Matrix & Implementation Toolkit',
        target: 'Deliver actionable civil engineering site specs for 12 recharge shafts.',
        due_date: '2026-10-08',
        evidence_url: 'https://drive.google.com/file/d/recharge-action-matrix-final',
        status: 'met',
      },
    ],
  },
];
