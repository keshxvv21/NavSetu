-- ==============================================================================
-- NavSetu - Supabase Postgres Database Schema
-- Smart India Hackathon 2026 | 24-Hour Hackathon Build
-- ==============================================================================
-- Description:
-- Complete production-grade PostgreSQL schema for NavSetu.
-- Includes:
--   1. Extensions and Schema Primitives
--   2. 9 Core Tables with Constraints and Indexes
--   3. State-Machine Rules & Automation Triggers
--   4. Pilot Conversion & Canonical Hashing (SHA-256) Functions
--   5. Immutability Enforcement for Converted Records
--   6. Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable pgcrypto for UUID generation and cryptographic hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------------------------
-- 1. DEPARTMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sector TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. STARTUPS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS startups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    dpiit_id TEXT NOT NULL UNIQUE,
    sector TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 3. USERS TABLE
-- ------------------------------------------------------------------------------
-- Roles: 'department' and 'startup' only. No platform-admin.
-- Foreign key rule:
--   - If role = 'department', org_id must reference departments.id
--   - If role = 'startup', org_id must reference startups.id
--   Enforced via fn_validate_user_org trigger below.
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('department', 'startup')),
    org_id UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 4. PROBLEMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    sector TEXT NOT NULL,
    budget_cap NUMERIC NOT NULL CHECK (budget_cap > 0),
    deadline TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_pilot', 'converted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 5. APPLICATIONS TABLE
-- ------------------------------------------------------------------------------
-- A startup can apply once per problem.
-- Startup must be verified before application can be created or marked selected.
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    pitch TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'selected', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_applications_problem_startup UNIQUE (problem_id, startup_id)
);

-- ------------------------------------------------------------------------------
-- 6. PILOTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pilots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL CHECK (end_date >= start_date),
    budget NUMERIC NOT NULL CHECK (budget > 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'converted', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 7. MILESTONES TABLE
-- ------------------------------------------------------------------------------
-- Evidence is a URL string only. No file storage tables.
-- evidence_url must be non-null when status is 'submitted', 'met', or 'missed'.
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pilot_id UUID NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date DATE NOT NULL,
    target TEXT NOT NULL, -- Measurable success criterion, e.g. "reduce processing time by 30%"
    evidence_url TEXT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'met', 'missed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_milestone_evidence_url CHECK (
        status = 'pending' OR evidence_url IS NOT NULL
    )
);

-- ------------------------------------------------------------------------------
-- 8. CONTRACTS TABLE
-- ------------------------------------------------------------------------------
-- Stores the tamper-evident justification record hash computed on conversion.
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pilot_id UUID NOT NULL UNIQUE REFERENCES pilots(id) ON DELETE RESTRICT,
    contract_value NUMERIC NOT NULL CHECK (contract_value > 0),
    converted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    rule_reference TEXT NULL,
    record_hash TEXT NOT NULL, -- SHA-256 hex digest
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 9. ADOPTIONS TABLE
-- ------------------------------------------------------------------------------
-- Enables scaling: another department adopts an already proven solution.
CREATE TABLE IF NOT EXISTS adoptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    adopted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_adoptions_contract_department UNIQUE (contract_id, department_id)
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_department_id ON problems(department_id);
CREATE INDEX IF NOT EXISTS idx_applications_problem_id ON applications(problem_id);
CREATE INDEX IF NOT EXISTS idx_applications_startup_id ON applications(startup_id);
CREATE INDEX IF NOT EXISTS idx_pilots_application_id ON pilots(application_id);
CREATE INDEX IF NOT EXISTS idx_pilots_status ON pilots(status);
CREATE INDEX IF NOT EXISTS idx_milestones_pilot_id ON milestones(pilot_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status);
CREATE INDEX IF NOT EXISTS idx_contracts_pilot_id ON contracts(pilot_id);
CREATE INDEX IF NOT EXISTS idx_contracts_record_hash ON contracts(record_hash);
CREATE INDEX IF NOT EXISTS idx_adoptions_contract_id ON adoptions(contract_id);
CREATE INDEX IF NOT EXISTS idx_adoptions_department_id ON adoptions(department_id);

-- ==============================================================================
-- TRIGGERS & STATE MACHINE ENFORCEMENT
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Helper: updated_at timestamp refresher
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_departments_touch ON departments;
CREATE TRIGGER trg_departments_touch BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION fn_touch_updated_at();

DROP TRIGGER IF EXISTS trg_startups_touch ON startups;
CREATE TRIGGER trg_startups_touch BEFORE UPDATE ON startups FOR EACH ROW EXECUTE FUNCTION fn_touch_updated_at();

DROP TRIGGER IF EXISTS trg_users_touch ON users;
CREATE TRIGGER trg_users_touch BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION fn_touch_updated_at();

DROP TRIGGER IF EXISTS trg_problems_touch ON problems;
CREATE TRIGGER trg_problems_touch BEFORE UPDATE ON problems FOR EACH ROW EXECUTE FUNCTION fn_touch_updated_at();

DROP TRIGGER IF EXISTS trg_applications_touch ON applications;
CREATE TRIGGER trg_applications_touch BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION fn_touch_updated_at();

DROP TRIGGER IF EXISTS trg_pilots_touch ON pilots;
CREATE TRIGGER trg_pilots_touch BEFORE UPDATE ON pilots FOR EACH ROW EXECUTE FUNCTION fn_touch_updated_at();

DROP TRIGGER IF EXISTS trg_milestones_touch ON milestones;
CREATE TRIGGER trg_milestones_touch BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION fn_touch_updated_at();

-- ------------------------------------------------------------------------------
-- 1. Users Org Reference Validation Trigger
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_validate_user_org()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.org_id IS NOT NULL THEN
        IF NEW.role = 'department' THEN
            IF NOT EXISTS (SELECT 1 FROM departments WHERE id = NEW.org_id) THEN
                RAISE EXCEPTION 'Invalid org_id: Department with ID % does not exist', NEW.org_id;
            END IF;
        ELSIF NEW.role = 'startup' THEN
            IF NOT EXISTS (SELECT 1 FROM startups WHERE id = NEW.org_id) THEN
                RAISE EXCEPTION 'Invalid org_id: Startup with ID % does not exist', NEW.org_id;
            END IF;
        ELSE
            RAISE EXCEPTION 'Invalid role: %', NEW.role;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_validate_org ON users;
CREATE TRIGGER trg_users_validate_org
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION fn_validate_user_org();

-- ------------------------------------------------------------------------------
-- 2. Applications Validation & State Machine Trigger
-- ------------------------------------------------------------------------------
-- Startup must be verified before its application can be created or marked selected.
-- Application transitions:
--   submitted -> selected | rejected
--   selected and rejected have no outgoing transitions.
CREATE OR REPLACE FUNCTION fn_validate_application()
RETURNS TRIGGER AS $$
DECLARE
    v_is_verified BOOLEAN;
BEGIN
    -- Check DPIIT verification status of the startup
    SELECT verified INTO v_is_verified FROM startups WHERE id = NEW.startup_id;
    IF v_is_verified IS NULL OR v_is_verified = false THEN
        RAISE EXCEPTION 'Startup % must be DPIIT verified before applying or being selected', NEW.startup_id;
    END IF;

    -- On UPDATE: validate state transitions
    IF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'selected' AND NEW.status <> 'selected' THEN
            RAISE EXCEPTION 'Invalid transition: Application is selected and cannot change status';
        END IF;
        IF OLD.status = 'rejected' AND NEW.status <> 'rejected' THEN
            RAISE EXCEPTION 'Invalid transition: Application is rejected and cannot change status';
        END IF;
        IF OLD.status = 'submitted' AND NEW.status NOT IN ('selected', 'rejected', 'submitted') THEN
            RAISE EXCEPTION 'Invalid transition: submitted application can only transition to selected or rejected';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_applications_validate ON applications;
CREATE TRIGGER trg_applications_validate
    BEFORE INSERT OR UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION fn_validate_application();

-- ------------------------------------------------------------------------------
-- 3. Application Selected Automation Trigger
-- ------------------------------------------------------------------------------
-- Selecting one application for a problem:
--   - Rejects all other submitted applications for that problem.
--   - Updates problem status to 'in_pilot'.
--   - Creates exactly one pilot and associated default milestones (if not already existing).
CREATE OR REPLACE FUNCTION fn_on_application_selected()
RETURNS TRIGGER AS $$
DECLARE
    v_problem RECORD;
    v_pilot_id UUID;
    v_start DATE;
    v_end DATE;
BEGIN
    IF NEW.status = 'selected' AND (OLD.status IS NULL OR OLD.status <> 'selected') THEN
        -- 1. Reject all other submitted applications for this problem
        UPDATE applications
        SET status = 'rejected', updated_at = now()
        WHERE problem_id = NEW.problem_id
          AND id <> NEW.id
          AND status = 'submitted';

        -- 2. Update problem status to in_pilot
        SELECT * INTO v_problem FROM problems WHERE id = NEW.problem_id;
        IF v_problem.status = 'open' THEN
            UPDATE problems
            SET status = 'in_pilot', updated_at = now()
            WHERE id = NEW.problem_id;
        END IF;

        -- 3. Ensure exactly one pilot exists for this application
        SELECT id INTO v_pilot_id FROM pilots WHERE application_id = NEW.id;
        IF v_pilot_id IS NULL THEN
            v_start := CURRENT_DATE;
            v_end := GREATEST(CURRENT_DATE + INTERVAL '60 days', v_problem.deadline::date);

            INSERT INTO pilots (application_id, start_date, end_date, budget, status)
            VALUES (NEW.id, v_start, v_end, v_problem.budget_cap, 'active')
            RETURNING id INTO v_pilot_id;

            -- Create standard 4 pilot milestones
            INSERT INTO milestones (pilot_id, title, due_date, target, status)
            VALUES
                (v_pilot_id, 'Milestone 1: Project Setup & Baseline Metrics', v_start + INTERVAL '14 days', 'Establish environment, integrations, and baseline performance metrics', 'pending'),
                (v_pilot_id, 'Milestone 2: Prototype Deployment & Sandboxing', v_start + INTERVAL '30 days', 'Deploy working prototype in department sandbox environment', 'pending'),
                (v_pilot_id, 'Milestone 3: Field Testing & Key Performance Indicator Validation', v_start + INTERVAL '45 days', 'Demonstrate minimum 30% operational efficiency improvement against baseline', 'pending'),
                (v_pilot_id, 'Milestone 4: Security Audit & Department Acceptance Sign-off', v_end, 'Complete security evaluation, documentation, and stakeholder review', 'pending');
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_applications_on_selected ON applications;
CREATE TRIGGER trg_applications_on_selected
    AFTER UPDATE OF status ON applications
    FOR EACH ROW EXECUTE FUNCTION fn_on_application_selected();

-- ------------------------------------------------------------------------------
-- 4. Problem State Machine & Immutability Trigger
-- ------------------------------------------------------------------------------
-- Problem transitions:
--   open -> in_pilot
--   in_pilot -> converted
--   in_pilot -> open (ONLY if no active pilot exists; otherwise reject)
--   converted has no outgoing transitions.
-- Immutability: Converted problem is read-only.
CREATE OR REPLACE FUNCTION fn_problem_state_machine()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow administrative bypass if session parameter is explicitly activated
    IF current_setting('navsetu.bypass_immutability', true) = 'on' THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        IF OLD.status = 'converted' THEN
            RAISE EXCEPTION 'Problem % is converted and immutable; cannot be deleted', OLD.id;
        END IF;
        RETURN OLD;
    END IF;

    -- Converted problems cannot be modified
    IF OLD.status = 'converted' THEN
        RAISE EXCEPTION 'Problem % is converted and immutable; no further modifications are permitted', OLD.id;
    END IF;

    -- Validate state transitions
    IF OLD.status = 'open' THEN
        IF NEW.status NOT IN ('open', 'in_pilot') THEN
            RAISE EXCEPTION 'Invalid problem transition from % to %; open problems can only transition to in_pilot', OLD.status, NEW.status;
        END IF;
    ELSIF OLD.status = 'in_pilot' THEN
        IF NEW.status = 'open' THEN
            -- in_pilot -> open is allowed only if no active pilot exists
            IF EXISTS (
                SELECT 1
                FROM pilots p
                JOIN applications a ON p.application_id = a.id
                WHERE a.problem_id = OLD.id AND p.status = 'active'
            ) THEN
                RAISE EXCEPTION 'Cannot revert problem to open while an active pilot exists';
            END IF;
        ELSIF NEW.status NOT IN ('in_pilot', 'converted') THEN
            RAISE EXCEPTION 'Invalid problem transition from % to %; in_pilot problems can only transition to converted or open', OLD.status, NEW.status;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_problems_state_machine ON problems;
CREATE TRIGGER trg_problems_state_machine
    BEFORE UPDATE OR DELETE ON problems
    FOR EACH ROW EXECUTE FUNCTION fn_problem_state_machine();

-- ------------------------------------------------------------------------------
-- 5. Pilot State Machine & Immutability Trigger
-- ------------------------------------------------------------------------------
-- Pilot transitions:
--   active -> converted | failed
--   converted and failed have no outgoing transitions.
-- Immutability: Converted pilot cannot be modified or deleted.
CREATE OR REPLACE FUNCTION fn_pilot_state_machine()
RETURNS TRIGGER AS $$
BEGIN
    IF current_setting('navsetu.bypass_immutability', true) = 'on' THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        IF OLD.status = 'converted' THEN
            RAISE EXCEPTION 'Pilot % is converted and immutable; cannot be deleted', OLD.id;
        END IF;
        RETURN OLD;
    END IF;

    IF OLD.status = 'converted' THEN
        RAISE EXCEPTION 'Pilot % is converted and immutable; no modifications permitted', OLD.id;
    END IF;

    IF OLD.status = 'failed' AND NEW.status <> 'failed' THEN
        RAISE EXCEPTION 'Pilot % is failed and has no outgoing transitions', OLD.id;
    END IF;

    IF OLD.status = 'active' AND NEW.status NOT IN ('active', 'converted', 'failed') THEN
        RAISE EXCEPTION 'Invalid pilot status transition from % to %', OLD.status, NEW.status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pilots_state_machine ON pilots;
CREATE TRIGGER trg_pilots_state_machine
    BEFORE UPDATE OR DELETE ON pilots
    FOR EACH ROW EXECUTE FUNCTION fn_pilot_state_machine();

-- ------------------------------------------------------------------------------
-- 6. Milestone State Machine & Immutability Trigger
-- ------------------------------------------------------------------------------
-- Milestone transitions:
--   pending -> submitted
--   submitted -> met | missed
--   met and missed have no outgoing transitions.
--   evidence_url must be non-null when status becomes submitted, met, or missed.
-- Immutability: Milestones of a converted pilot cannot be modified or deleted.
CREATE OR REPLACE FUNCTION fn_milestone_state_machine()
RETURNS TRIGGER AS $$
DECLARE
    v_pilot_status TEXT;
BEGIN
    IF current_setting('navsetu.bypass_immutability', true) = 'on' THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        SELECT status INTO v_pilot_status FROM pilots WHERE id = OLD.pilot_id;
        IF v_pilot_status = 'converted' THEN
            RAISE EXCEPTION 'Cannot delete milestone % belonging to converted pilot %', OLD.id, OLD.pilot_id;
        END IF;
        RETURN OLD;
    END IF;

    -- Check parent pilot status for immutability
    SELECT status INTO v_pilot_status FROM pilots WHERE id = NEW.pilot_id;
    IF v_pilot_status = 'converted' THEN
        RAISE EXCEPTION 'Cannot modify milestone %: parent pilot % is converted and immutable', OLD.id, OLD.pilot_id;
    END IF;

    -- Validate evidence_url requirement
    IF NEW.status IN ('submitted', 'met', 'missed') AND (NEW.evidence_url IS NULL OR btrim(NEW.evidence_url) = '') THEN
        RAISE EXCEPTION 'Milestone % requires a non-empty evidence_url when status is %', NEW.id, NEW.status;
    END IF;

    -- Validate status transitions
    IF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'met' AND NEW.status <> 'met' THEN
            RAISE EXCEPTION 'Milestone % is met and cannot change status', OLD.id;
        END IF;
        IF OLD.status = 'missed' AND NEW.status <> 'missed' THEN
            RAISE EXCEPTION 'Milestone % is missed and cannot change status', OLD.id;
        END IF;
        IF OLD.status = 'pending' AND NEW.status NOT IN ('pending', 'submitted') THEN
            RAISE EXCEPTION 'Milestone can only transition from pending to submitted';
        END IF;
        IF OLD.status = 'submitted' AND NEW.status NOT IN ('submitted', 'met', 'missed') THEN
            RAISE EXCEPTION 'Milestone can only transition from submitted to met or missed';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_milestones_state_machine ON milestones;
CREATE TRIGGER trg_milestones_state_machine
    BEFORE UPDATE OR DELETE ON milestones
    FOR EACH ROW EXECUTE FUNCTION fn_milestone_state_machine();

-- ------------------------------------------------------------------------------
-- 7. Contracts Immutability Trigger
-- ------------------------------------------------------------------------------
-- Contract data is tamper-evident and immutable once converted.
CREATE OR REPLACE FUNCTION fn_contracts_immutability()
RETURNS TRIGGER AS $$
BEGIN
    IF current_setting('navsetu.bypass_immutability', true) = 'on' THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Contract % is immutable and cannot be deleted', OLD.id;
    END IF;

    -- Allow initial hash computation if record_hash was PENDING
    IF TG_OP = 'UPDATE' THEN
        IF OLD.record_hash IS NOT NULL AND OLD.record_hash <> 'PENDING' THEN
            RAISE EXCEPTION 'Contract % is immutable and cannot be modified', OLD.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_contracts_immutability ON contracts;
CREATE TRIGGER trg_contracts_immutability
    BEFORE UPDATE OR DELETE ON contracts
    FOR EACH ROW EXECUTE FUNCTION fn_contracts_immutability();

-- ==============================================================================
-- CONVERSION ELIGIBILITY & CANONICAL HASHING FUNCTIONS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- can_convert_pilot(pilot_id uuid, [p_contract_value numeric])
-- ------------------------------------------------------------------------------
-- Returns JSON: { "eligible": boolean, "reasons": [...] }
-- A pilot may convert only if:
--   1. Pilot status is 'active'
--   2. Every milestone for the pilot is 'met' or 'missed'; none are 'pending' or 'submitted'
--   3. At least 70% of milestones are 'met'
--   4. Contract value is within the related problem's budget_cap
--   5. Pilot end date has not been exceeded without an extension
CREATE OR REPLACE FUNCTION can_convert_pilot(
    p_pilot_id UUID,
    p_contract_value NUMERIC DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_pilot RECORD;
    v_problem RECORD;
    v_total_milestones INT;
    v_unreviewed_count INT;
    v_met_count INT;
    v_met_ratio NUMERIC;
    v_contract_value NUMERIC;
    v_reasons TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- 1. Fetch Pilot
    SELECT * INTO v_pilot FROM pilots WHERE id = p_pilot_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'eligible', false,
            'reasons', jsonb_build_array(format('Pilot with ID %s not found', p_pilot_id))
        );
    END IF;

    -- 2. Fetch Related Problem
    SELECT pr.* INTO v_problem
    FROM problems pr
    JOIN applications ap ON ap.problem_id = pr.id
    WHERE ap.id = v_pilot.application_id;

    -- Check 1: Pilot status is 'active'
    IF v_pilot.status <> 'active' THEN
        v_reasons := array_append(
            v_reasons,
            format('Pilot status is "%s"; only active pilots can be converted', v_pilot.status)
        );
    END IF;

    -- Check 2 & 3: Milestones counts and review completeness
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status IN ('pending', 'submitted')),
        COUNT(*) FILTER (WHERE status = 'met')
    INTO v_total_milestones, v_unreviewed_count, v_met_count
    FROM milestones
    WHERE pilot_id = p_pilot_id;

    IF v_total_milestones = 0 THEN
        v_reasons := array_append(
            v_reasons,
            'Pilot has no milestones; at least one milestone is required for conversion'
        );
    ELSE
        IF v_unreviewed_count > 0 THEN
            v_reasons := array_append(
                v_reasons,
                format('%s milestone(s) are pending or submitted; all milestones must be reviewed (met or missed)', v_unreviewed_count)
            );
        END IF;

        v_met_ratio := (v_met_count::NUMERIC / v_total_milestones::NUMERIC);
        IF v_met_ratio < 0.70 THEN
            v_reasons := array_append(
                v_reasons,
                format('Milestone success rate is %s%% (%s of %s met); at least 70%% of milestones must be met',
                    ROUND(v_met_ratio * 100, 1), v_met_count, v_total_milestones)
            );
        END IF;
    END IF;

    -- Check 4: Contract value is within the problem's budget_cap
    IF p_contract_value IS NOT NULL AND p_contract_value > 0 THEN
        v_contract_value := p_contract_value;
    ELSE
        SELECT contract_value INTO v_contract_value FROM contracts WHERE pilot_id = p_pilot_id;
        IF v_contract_value IS NULL THEN
            v_contract_value := v_pilot.budget;
        END IF;
    END IF;

    IF v_problem.budget_cap IS NOT NULL AND v_contract_value > v_problem.budget_cap THEN
        v_reasons := array_append(
            v_reasons,
            format('Contract value (%s) exceeds problem budget cap (%s)', v_contract_value, v_problem.budget_cap)
        );
    END IF;

    -- Check 5: Pilot end date has not been exceeded without an extension
    IF v_pilot.end_date < CURRENT_DATE THEN
        v_reasons := array_append(
            v_reasons,
            format('Pilot end date (%s) has passed without an approved extension', v_pilot.end_date)
        );
    END IF;

    IF cardinality(v_reasons) = 0 THEN
        RETURN jsonb_build_object(
            'eligible', true,
            'reasons', '[]'::jsonb
        );
    ELSE
        RETURN jsonb_build_object(
            'eligible', false,
            'reasons', to_jsonb(v_reasons)
        );
    END IF;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- build_contract_canonical_text(contract_id uuid)
-- ------------------------------------------------------------------------------
-- Internal helper producing the exact, deterministic canonical JSON string.
-- Rules:
--   - Object keys sorted alphabetically at every hierarchy level
--   - Fixed field order with NO whitespace after delimiters
--   - Dates serialized as ISO 8601 strings
--   - Numbers serialized consistently
--   - Milestones sorted deterministically by id ASC
CREATE OR REPLACE FUNCTION build_contract_canonical_text(p_contract_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_contract RECORD;
    v_pilot RECORD;
    v_app RECORD;
    v_problem RECORD;
    v_dept RECORD;
    v_startup RECORD;
    v_milestones_text TEXT;
    v_canonical_text TEXT;
BEGIN
    -- 1. Fetch Contract
    SELECT * INTO v_contract FROM contracts WHERE id = p_contract_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Contract % not found', p_contract_id;
    END IF;

    -- 2. Fetch Pilot
    SELECT * INTO v_pilot FROM pilots WHERE id = v_contract.pilot_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pilot % not found for contract %', v_contract.pilot_id, p_contract_id;
    END IF;

    -- 3. Fetch Application
    SELECT * INTO v_app FROM applications WHERE id = v_pilot.application_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application % not found for pilot %', v_pilot.application_id, v_pilot.id;
    END IF;

    -- 4. Fetch Problem
    SELECT * INTO v_problem FROM problems WHERE id = v_app.problem_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Problem % not found for application %', v_app.problem_id, v_app.id;
    END IF;

    -- 5. Fetch Department
    SELECT * INTO v_dept FROM departments WHERE id = v_problem.department_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Department % not found for problem %', v_problem.department_id, v_problem.id;
    END IF;

    -- 6. Fetch Startup
    SELECT * INTO v_startup FROM startups WHERE id = v_app.startup_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Startup % not found for application %', v_app.startup_id, v_app.id;
    END IF;

    -- 7. Fetch Milestones sorted deterministically by id
    SELECT COALESCE(
        '[' || string_agg(
            format(
                '{"due_date":%s,"evidence_url":%s,"id":%s,"status":%s,"target":%s,"title":%s}',
                to_json(to_char(m.due_date, 'YYYY-MM-DD')),
                CASE WHEN m.evidence_url IS NULL THEN 'null' ELSE to_json(m.evidence_url) END,
                to_json(m.id::text),
                to_json(m.status::text),
                to_json(m.target),
                to_json(m.title)
            ),
            ',' ORDER BY m.id
        ) || ']',
        '[]'
    )
    INTO v_milestones_text
    FROM milestones m
    WHERE m.pilot_id = v_pilot.id;

    -- 8. Assemble canonical JSON text with alphabetical keys at every level:
    -- Top-level keys:
    --   1. contract_id
    --   2. contract_value
    --   3. converted_at
    --   4. department: { id, name }
    --   5. milestones: [ { due_date, evidence_url, id, status, target, title } ]
    --   6. pilot: { budget, end_date, id, start_date, status }
    --   7. problem: { id, title }
    --   8. rule_reference
    --   9. startup: { id, name }
    v_canonical_text := format(
        '{"contract_id":%s,"contract_value":%s,"converted_at":%s,"department":{"id":%s,"name":%s},"milestones":%s,"pilot":{"budget":%s,"end_date":%s,"id":%s,"start_date":%s,"status":%s},"problem":{"id":%s,"title":%s},"rule_reference":%s,"startup":{"id":%s,"name":%s}}',
        to_json(v_contract.id::text),
        to_json(v_contract.contract_value::DOUBLE PRECISION),
        to_json(to_char(v_contract.converted_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')),
        to_json(v_dept.id::text),
        to_json(v_dept.name),
        v_milestones_text,
        to_json(v_pilot.budget::DOUBLE PRECISION),
        to_json(to_char(v_pilot.end_date, 'YYYY-MM-DD')),
        to_json(v_pilot.id::text),
        to_json(to_char(v_pilot.start_date, 'YYYY-MM-DD')),
        to_json(v_pilot.status::text),
        to_json(v_problem.id::text),
        to_json(v_problem.title),
        CASE WHEN v_contract.rule_reference IS NULL THEN 'null' ELSE to_json(v_contract.rule_reference) END,
        to_json(v_startup.id::text),
        to_json(v_startup.name)
    );

    RETURN v_canonical_text;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- build_contract_record(contract_id uuid)
-- ------------------------------------------------------------------------------
-- Returns the canonical JSON record object for inspection and verification.
CREATE OR REPLACE FUNCTION build_contract_record(p_contract_id UUID)
RETURNS JSON AS $$
BEGIN
    RETURN build_contract_canonical_text(p_contract_id)::json;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- hash_contract_record(contract_id uuid)
-- ------------------------------------------------------------------------------
-- Computes the SHA-256 hash of the canonical JSON string and returns lowercase hex.
CREATE OR REPLACE FUNCTION hash_contract_record(p_contract_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_canonical_text TEXT;
BEGIN
    v_canonical_text := build_contract_canonical_text(p_contract_id);
    RETURN encode(sha256(v_canonical_text::bytea), 'hex');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- convert_pilot(pilot_id uuid, contract_value numeric, rule_reference text)
-- ------------------------------------------------------------------------------
-- Complete conversion workflow executed in one transactional function:
--   1. Runs can_convert_pilot checks.
--   2. Inserts contract row with initial PENDING hash.
--   3. Computes record_hash using hash_contract_record.
--   4. Updates pilot status to 'converted'.
--   5. Updates problem status to 'converted'.
--   6. Locks the record as immutable.
CREATE OR REPLACE FUNCTION convert_pilot(
    p_pilot_id UUID,
    p_contract_value NUMERIC DEFAULT NULL,
    p_rule_reference TEXT DEFAULT 'GFR Rule 194 / GeM Direct Pilot Purchase'
)
RETURNS JSONB AS $$
DECLARE
    v_check JSONB;
    v_pilot RECORD;
    v_app RECORD;
    v_contract_id UUID;
    v_contract_value NUMERIC;
    v_hash TEXT;
BEGIN
    -- 1. Verify eligibility
    v_check := can_convert_pilot(p_pilot_id, p_contract_value);
    IF (v_check->>'eligible')::BOOLEAN = false THEN
        RAISE EXCEPTION 'Cannot convert pilot: %', v_check->'reasons';
    END IF;

    SELECT * INTO v_pilot FROM pilots WHERE id = p_pilot_id;
    SELECT * INTO v_app FROM applications WHERE id = v_pilot.application_id;

    v_contract_value := COALESCE(p_contract_value, v_pilot.budget);

    -- Temporarily set bypass so the conversion function can transition immutable state
    PERFORM set_config('navsetu.bypass_immutability', 'on', true);

    -- 2. Insert contract row if not exists
    SELECT id INTO v_contract_id FROM contracts WHERE pilot_id = p_pilot_id;
    IF v_contract_id IS NULL THEN
        INSERT INTO contracts (pilot_id, contract_value, rule_reference, record_hash)
        VALUES (p_pilot_id, v_contract_value, p_rule_reference, 'PENDING')
        RETURNING id INTO v_contract_id;
    ELSE
        UPDATE contracts
        SET contract_value = v_contract_value,
            rule_reference = p_rule_reference,
            record_hash = 'PENDING'
        WHERE id = v_contract_id;
    END IF;

    -- 3. Update Pilot & Problem status to 'converted' before computing final canonical hash
    UPDATE pilots SET status = 'converted', updated_at = now() WHERE id = p_pilot_id;
    UPDATE problems SET status = 'converted', updated_at = now() WHERE id = v_app.problem_id;

    -- 4. Compute canonical hash of the converted record
    v_hash := hash_contract_record(v_contract_id);

    -- 5. Store record_hash
    UPDATE contracts SET record_hash = v_hash WHERE id = v_contract_id;

    -- Re-enable immutability
    PERFORM set_config('navsetu.bypass_immutability', 'off', true);

    RETURN jsonb_build_object(
        'success', true,
        'contract_id', v_contract_id,
        'record_hash', v_hash
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- reset_demo_data()
-- ------------------------------------------------------------------------------
-- Administrative function to reset all demo data cleanly in a single transaction.
-- Bypasses immutability triggers and truncates tables in cascade order.
CREATE OR REPLACE FUNCTION reset_demo_data()
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('navsetu.bypass_immutability', 'on', true);
    TRUNCATE TABLE adoptions, contracts, milestones, pilots, applications, problems, users, startups, departments CASCADE;
    PERFORM set_config('navsetu.bypass_immutability', 'off', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilots ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoptions ENABLE ROW LEVEL SECURITY;

-- Helper functions to extract current user context from auth.uid()
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_org_id()
RETURNS UUID AS $$
    SELECT org_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 1. Departments Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS p_departments_select ON departments;
CREATE POLICY p_departments_select ON departments
    FOR SELECT TO public
    USING (true); -- Public verification and browsing require department names

DROP POLICY IF EXISTS p_departments_manage ON departments;
CREATE POLICY p_departments_manage ON departments
    FOR ALL TO authenticated
    USING (id = current_user_org_id() AND current_user_role() = 'department')
    WITH CHECK (id = current_user_org_id() AND current_user_role() = 'department');

-- ------------------------------------------------------------------------------
-- 2. Startups Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS p_startups_select ON startups;
CREATE POLICY p_startups_select ON startups
    FOR SELECT TO public
    USING (true); -- Public verification and problem applicant reviews require startup metadata

DROP POLICY IF EXISTS p_startups_update ON startups;
CREATE POLICY p_startups_update ON startups
    FOR UPDATE TO authenticated
    USING (id = current_user_org_id() AND current_user_role() = 'startup')
    WITH CHECK (id = current_user_org_id() AND current_user_role() = 'startup');

-- ------------------------------------------------------------------------------
-- 3. Users Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS p_users_select_self ON users;
CREATE POLICY p_users_select_self ON users
    FOR SELECT TO authenticated
    USING (id = auth.uid());

-- ------------------------------------------------------------------------------
-- 4. Problems Policies
-- ------------------------------------------------------------------------------
-- Startups & Public can read open problems
-- Department users can read and create their own problems
DROP POLICY IF EXISTS p_problems_select ON problems;
CREATE POLICY p_problems_select ON problems
    FOR SELECT TO public
    USING (
        status = 'open'
        OR department_id = current_user_org_id()
        OR EXISTS (
            SELECT 1 FROM applications a
            WHERE a.problem_id = problems.id
              AND a.startup_id = current_user_org_id()
        )
        OR status = 'converted' -- Public verify can read problem title
    );

DROP POLICY IF EXISTS p_problems_department_insert ON problems;
CREATE POLICY p_problems_department_insert ON problems
    FOR INSERT TO authenticated
    WITH CHECK (
        department_id = current_user_org_id()
        AND current_user_role() = 'department'
    );

DROP POLICY IF EXISTS p_problems_department_update ON problems;
CREATE POLICY p_problems_department_update ON problems
    FOR UPDATE TO authenticated
    USING (
        department_id = current_user_org_id()
        AND current_user_role() = 'department'
    )
    WITH CHECK (
        department_id = current_user_org_id()
        AND current_user_role() = 'department'
    );

-- ------------------------------------------------------------------------------
-- 5. Applications Policies
-- ------------------------------------------------------------------------------
-- Department users can view applications for their department's problems
-- Startup users can create and view only their own applications
DROP POLICY IF EXISTS p_applications_select ON applications;
CREATE POLICY p_applications_select ON applications
    FOR SELECT TO authenticated
    USING (
        startup_id = current_user_org_id()
        OR EXISTS (
            SELECT 1 FROM problems p
            WHERE p.id = applications.problem_id
              AND p.department_id = current_user_org_id()
        )
    );

DROP POLICY IF EXISTS p_applications_startup_insert ON applications;
CREATE POLICY p_applications_startup_insert ON applications
    FOR INSERT TO authenticated
    WITH CHECK (
        startup_id = current_user_org_id()
        AND current_user_role() = 'startup'
    );

DROP POLICY IF EXISTS p_applications_department_update ON applications;
CREATE POLICY p_applications_department_update ON applications
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM problems p
            WHERE p.id = applications.problem_id
              AND p.department_id = current_user_org_id()
        )
    );

-- ------------------------------------------------------------------------------
-- 6. Pilots Policies
-- ------------------------------------------------------------------------------
-- Department users can read pilots for their problems
-- Startup users can read pilots for their selected applications
DROP POLICY IF EXISTS p_pilots_select ON pilots;
CREATE POLICY p_pilots_select ON pilots
    FOR SELECT TO public
    USING (
        status = 'converted' -- Needed for public contract verification
        OR EXISTS (
            SELECT 1 FROM applications a
            JOIN problems p ON a.problem_id = p.id
            WHERE a.id = pilots.application_id
              AND (
                  p.department_id = current_user_org_id()
                  OR a.startup_id = current_user_org_id()
              )
        )
    );

DROP POLICY IF EXISTS p_pilots_department_update ON pilots;
CREATE POLICY p_pilots_department_update ON pilots
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM applications a
            JOIN problems p ON a.problem_id = p.id
            WHERE a.id = pilots.application_id
              AND p.department_id = current_user_org_id()
        )
    );

-- ------------------------------------------------------------------------------
-- 7. Milestones Policies
-- ------------------------------------------------------------------------------
-- Startups can submit evidence for their pilot's milestones
-- Department users can review (mark met/missed) milestones for their pilots
DROP POLICY IF EXISTS p_milestones_select ON milestones;
CREATE POLICY p_milestones_select ON milestones
    FOR SELECT TO public
    USING (
        EXISTS (
            SELECT 1 FROM pilots p
            JOIN applications a ON p.application_id = a.id
            JOIN problems pr ON a.problem_id = pr.id
            WHERE p.id = milestones.pilot_id
              AND (
                  p.status = 'converted' -- Public verify needs to read milestones
                  OR pr.department_id = current_user_org_id()
                  OR a.startup_id = current_user_org_id()
              )
        )
    );

DROP POLICY IF EXISTS p_milestones_startup_submit ON milestones;
CREATE POLICY p_milestones_startup_submit ON milestones
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM pilots p
            JOIN applications a ON p.application_id = a.id
            WHERE p.id = milestones.pilot_id
              AND a.startup_id = current_user_org_id()
              AND current_user_role() = 'startup'
        )
    )
    WITH CHECK (
        status IN ('pending', 'submitted')
    );

DROP POLICY IF EXISTS p_milestones_department_review ON milestones;
CREATE POLICY p_milestones_department_review ON milestones
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM pilots p
            JOIN applications a ON p.application_id = a.id
            JOIN problems pr ON a.problem_id = pr.id
            WHERE p.id = milestones.pilot_id
              AND pr.department_id = current_user_org_id()
              AND current_user_role() = 'department'
        )
    );

-- ------------------------------------------------------------------------------
-- 8. Contracts Policies
-- ------------------------------------------------------------------------------
-- Anyone (including public / unauthenticated) can view contracts for verification.
DROP POLICY IF EXISTS p_contracts_select ON contracts;
CREATE POLICY p_contracts_select ON contracts
    FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS p_contracts_department_insert ON contracts;
CREATE POLICY p_contracts_department_insert ON contracts
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM pilots p
            JOIN applications a ON p.application_id = a.id
            JOIN problems pr ON a.problem_id = pr.id
            WHERE p.id = contracts.pilot_id
              AND pr.department_id = current_user_org_id()
              AND current_user_role() = 'department'
        )
    );

-- ------------------------------------------------------------------------------
-- 9. Adoptions Policies
-- ------------------------------------------------------------------------------
-- Anyone can view adoptions (Adoption Page shows proven scaled solutions)
-- Department users can adopt a contract on behalf of their department
DROP POLICY IF EXISTS p_adoptions_select ON adoptions;
CREATE POLICY p_adoptions_select ON adoptions
    FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS p_adoptions_department_insert ON adoptions;
CREATE POLICY p_adoptions_department_insert ON adoptions
    FOR INSERT TO authenticated
    WITH CHECK (
        department_id = current_user_org_id()
        AND current_user_role() = 'department'
    );
