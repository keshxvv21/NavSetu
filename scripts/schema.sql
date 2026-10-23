-- NavSetu Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor to initialize or reset tables.

-- Drop existing tables if re-initializing
DROP TABLE IF EXISTS adoptions CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS pilots CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS startups CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Departments
CREATE TABLE departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE
);

-- 2. Startups
CREATE TABLE startups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dpiit_id TEXT NOT NULL UNIQUE,
  sector TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  founder TEXT NOT NULL
);

-- 3. Users (Seeded demo logins)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('department', 'startup')),
  org_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Problems
CREATE TABLE problems (
  id TEXT PRIMARY KEY,
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sector TEXT NOT NULL,
  budget_cap NUMERIC NOT NULL,
  deadline DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_pilot', 'converted')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Applications
CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  startup_id TEXT NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  pitch TEXT NOT NULL,
  proposed_budget NUMERIC NOT NULL,
  pilot_timeline_weeks INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'selected', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_problem_startup UNIQUE (problem_id, startup_id)
);

-- 6. Pilots
CREATE TABLE pilots (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'converted', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Milestones
CREATE TABLE milestones (
  id TEXT PRIMARY KEY,
  pilot_id TEXT NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target TEXT NOT NULL,
  due_date DATE NOT NULL,
  evidence_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'met', 'missed'))
);

-- 8. Contracts (with SHA-256 record_hash)
CREATE TABLE contracts (
  id TEXT PRIMARY KEY,
  pilot_id TEXT NOT NULL UNIQUE REFERENCES pilots(id) ON DELETE CASCADE,
  contract_value NUMERIC NOT NULL,
  converted_at TIMESTAMPTZ DEFAULT NOW(),
  rule_reference TEXT NOT NULL,
  record_hash TEXT NOT NULL
);

-- 9. Adoptions (Inter-departmental scaling)
CREATE TABLE adoptions (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  adopted_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  CONSTRAINT uq_contract_department UNIQUE (contract_id, department_id)
);

-- Indexes for performance
CREATE INDEX idx_problems_dept ON problems(department_id);
CREATE INDEX idx_problems_status ON problems(status);
CREATE INDEX idx_applications_prob ON applications(problem_id);
CREATE INDEX idx_milestones_pilot ON milestones(pilot_id);
CREATE INDEX idx_contracts_hash ON contracts(record_hash);
