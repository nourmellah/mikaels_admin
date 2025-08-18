CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table: public.admin
CREATE TABLE IF NOT EXISTS public.admin
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    username character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password_hash text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    refresh_token text COLLATE pg_catalog."default",
    CONSTRAINT admin_pkey PRIMARY KEY (id),
    CONSTRAINT admin_username_key UNIQUE (username)
);

-- Type: cost_frequency
DROP TYPE IF EXISTS public.cost_frequency;
CREATE TYPE public.cost_frequency AS ENUM
    ('one_time', 'daily', 'weekly', 'monthly', 'yearly');

-- Type: cost_type
DROP TYPE IF EXISTS public.cost_type;
CREATE TYPE public.cost_type AS ENUM
    ('fixed', 'variable');

-- Type: session_status
DROP TYPE IF EXISTS public.session_status;
CREATE TYPE public.session_status AS ENUM
    ('PENDING', 'COMPLETED', 'CANCELLED');

-- Table: public.teachers
CREATE TABLE IF NOT EXISTS public.teachers
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    first_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    last_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default",
    phone character varying(20) COLLATE pg_catalog."default",
    salary numeric(10,3) NOT NULL DEFAULT 0.000,
    image_url character varying(255) COLLATE pg_catalog."default",
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT teachers_pkey PRIMARY KEY (id)
);

-- Table: public.groups
CREATE TABLE IF NOT EXISTS public.groups
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    level character varying(5) COLLATE pg_catalog."default" NOT NULL,
    start_date date,
    end_date date,
    weekly_hours integer NOT NULL DEFAULT 10,
    total_hours integer NOT NULL DEFAULT 0,
    price numeric(10,3) NOT NULL DEFAULT 0.000,
    teacher_id uuid,
    image_url character varying(255) COLLATE pg_catalog."default",
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT groups_pkey1 PRIMARY KEY (id),
    CONSTRAINT groups_teacher_id_fkey1 FOREIGN KEY (teacher_id)
        REFERENCES public.teachers (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL
);

-- Table: public.students
CREATE TABLE IF NOT EXISTS public.students
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    first_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    last_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default",
    phone character varying(20) COLLATE pg_catalog."default",
    group_id uuid,
    level character varying(5) COLLATE pg_catalog."default" NOT NULL DEFAULT '0'::character varying,
    has_cv boolean NOT NULL DEFAULT false,
    image_url character varying(255) COLLATE pg_catalog."default",
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT students_pkey PRIMARY KEY (id),
    CONSTRAINT fk_students_group FOREIGN KEY (group_id)
        REFERENCES public.groups (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- Table: public.student_wallets
CREATE TABLE IF NOT EXISTS public.student_wallets
(
    student_id uuid NOT NULL,
    balance numeric(10,3) NOT NULL DEFAULT 0,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT student_wallets_pkey PRIMARY KEY (student_id),
    CONSTRAINT student_wallets_student_id_fkey FOREIGN KEY (student_id)
        REFERENCES public.students (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Table: public.student_wallet_transactions
CREATE TABLE IF NOT EXISTS public.student_wallet_transactions
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    amount numeric(10,3) NOT NULL,
    kind text COLLATE pg_catalog."default" NOT NULL,
    related_registration_id uuid,
    note text COLLATE pg_catalog."default",
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT student_wallet_transactions_pkey PRIMARY KEY (id),
    CONSTRAINT student_wallet_transactions_student_id_fkey FOREIGN KEY (student_id)
        REFERENCES public.students (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT student_wallet_transactions_kind_check CHECK (kind = ANY (ARRAY['DEPOSIT'::text, 'APPLY_TO_REGISTRATION'::text, 'REFUND'::text, 'ADJUSTMENT'::text]))
);

-- Table: public.group_schedules
CREATE TABLE IF NOT EXISTS public.group_schedules
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    group_id uuid,
    day_of_week smallint NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT group_schedules_pkey PRIMARY KEY (id),
    CONSTRAINT group_schedules_group_id_fkey FOREIGN KEY (group_id)
        REFERENCES public.groups (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT chk_time_order CHECK (end_time > start_time),
    CONSTRAINT group_schedules_day_of_week_check CHECK (day_of_week >= 0 AND day_of_week <= 6)
);

-- Table: public.group_sessions
CREATE TABLE IF NOT EXISTS public.group_sessions
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    group_id uuid,
    session_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_makeup boolean NOT NULL DEFAULT false,
    status session_status NOT NULL DEFAULT 'PENDING'::session_status,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT group_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT group_sessions_group_id_session_date_start_time_end_time_key UNIQUE (group_id, session_date, start_time, end_time),
    CONSTRAINT group_sessions_group_id_fkey FOREIGN KEY (group_id)
        REFERENCES public.groups (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT chk_time_order_sess CHECK (end_time > start_time)
);

-- Table: public.cost_templates
CREATE TABLE IF NOT EXISTS public.cost_templates
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    group_id uuid,
    amount numeric(10,3) NOT NULL,
    frequency cost_frequency NOT NULL DEFAULT 'one_time'::cost_frequency,
    start_date date NOT NULL DEFAULT CURRENT_DATE,
    next_due_date date NOT NULL DEFAULT CURRENT_DATE,
    notes text COLLATE pg_catalog."default",
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT cost_templates_new_pkey PRIMARY KEY (id),
    CONSTRAINT cost_templates_new_group_id_fkey FOREIGN KEY (group_id)
        REFERENCES public.groups (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT cost_templates_new_amount_check CHECK (amount >= 0::numeric)
);

-- Table: public.costs
CREATE TABLE IF NOT EXISTS public.costs
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    cost_template_id uuid,
    group_id uuid,
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    due_date date,
    amount numeric(10,3) NOT NULL,
    paid boolean NOT NULL DEFAULT false,
    paid_date date,
    notes text COLLATE pg_catalog."default",
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT costs_new_pkey1 PRIMARY KEY (id),
    CONSTRAINT costs_new_cost_template_id_fkey FOREIGN KEY (cost_template_id)
        REFERENCES public.cost_templates (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT costs_new_group_id_fkey1 FOREIGN KEY (group_id)
        REFERENCES public.groups (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT costs_new_amount_check1 CHECK (amount >= 0::numeric),
    CONSTRAINT costs_new_check1 CHECK (cost_template_id IS NOT NULL OR name IS NOT NULL)
);

-- Table: public.registrations
CREATE TABLE IF NOT EXISTS public.registrations
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    group_id uuid NOT NULL,
    agreed_price numeric(10,3) NOT NULL,
    deposit_pct smallint NOT NULL DEFAULT 50,
    discount_amount numeric(10,3) NOT NULL DEFAULT 0.000,
    registration_date date NOT NULL DEFAULT CURRENT_DATE,
    status character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'active'::character varying,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT registrations_pkey PRIMARY KEY (id),
    CONSTRAINT registrations_student_id_group_id_key UNIQUE (student_id, group_id),
    CONSTRAINT registrations_group_id_fkey FOREIGN KEY (group_id)
        REFERENCES public.groups (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT registrations_student_id_fkey FOREIGN KEY (student_id)
        REFERENCES public.students (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT registrations_deposit_pct_check CHECK (deposit_pct >= 0 AND deposit_pct <= 100)
);

-- Table: public.payments
CREATE TABLE IF NOT EXISTS public.payments
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    registration_id uuid NOT NULL,
    amount numeric(10,3) NOT NULL,
    date date NOT NULL DEFAULT CURRENT_DATE,
    is_paid boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT payments_pkey PRIMARY KEY (id),
    CONSTRAINT payments_registration_id_fkey FOREIGN KEY (registration_id)
        REFERENCES public.registrations (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT payments_amount_check CHECK (amount >= 0::numeric)
);

-- Table: public.teacher_payments
CREATE TABLE IF NOT EXISTS public.teacher_payments
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    teacher_id uuid NOT NULL,
    group_id uuid NOT NULL,
    total_hours numeric(10,2) NOT NULL,
    rate numeric(10,3) NOT NULL,
    amount numeric(10,3) NOT NULL,
    paid boolean NOT NULL DEFAULT false,
    paid_date date,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT teacher_payments_pkey PRIMARY KEY (id),
    CONSTRAINT teacher_payments_group_id_fkey FOREIGN KEY (group_id)
        REFERENCES public.groups (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT teacher_payments_teacher_id_fkey FOREIGN KEY (teacher_id)
        REFERENCES public.teachers (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

------------------

-- View: public.teacher_group_dues
CREATE OR REPLACE VIEW public.teacher_group_dues
 AS
 SELECT g.teacher_id,
    g.id AS group_id,
    COALESCE(sum(EXTRACT(epoch FROM gs.end_time - gs.start_time) / 3600::numeric), 0::numeric)::numeric(10,2) AS total_hours,
    t.salary AS rate,
    (COALESCE(sum(EXTRACT(epoch FROM gs.end_time - gs.start_time) / 3600::numeric), 0::numeric) * t.salary)::numeric(10,3) AS amount_due
   FROM groups g
     JOIN teachers t ON g.teacher_id = t.id
     LEFT JOIN group_sessions gs ON gs.group_id = g.id AND gs.status = 'COMPLETED'::session_status
  GROUP BY g.teacher_id, g.id, t.salary;

-- View: public.group_active_months
CREATE OR REPLACE VIEW public.group_active_months
 AS
 SELECT g.id AS group_id,
    date_trunc('month'::text, gs.gs)::date AS month_start
   FROM groups g
     CROSS JOIN LATERAL generate_series(date_trunc('month'::text, g.start_date::timestamp with time zone)::date::timestamp with time zone, date_trunc('month'::text, COALESCE(g.end_date, CURRENT_DATE)::timestamp with time zone)::date::timestamp with time zone, '1 mon'::interval) gs(gs);

-- View: public.active_groups_per_month
CREATE OR REPLACE VIEW public.active_groups_per_month
 AS
 SELECT month_start,
    count(*)::numeric AS num_groups
   FROM group_active_months
  GROUP BY month_start;

-- View: public.general_costs
CREATE OR REPLACE VIEW public.general_costs
 AS
 SELECT sum(amount)::numeric(10,3) AS total_general,
    sum(amount) FILTER (WHERE paid)::numeric(10,3) AS general_paid,
    sum(amount) FILTER (WHERE NOT paid)::numeric(10,3) AS general_unpaid
   FROM costs
  WHERE group_id IS NULL;

-- View: public.general_costs_allocated
CREATE OR REPLACE VIEW public.general_costs_allocated
 AS
 SELECT g.id AS group_id,
    COALESCE(sum(c.amount) FILTER (WHERE c.paid), 0::numeric)::numeric(10,3) AS allocated_general_paid,
    COALESCE(sum(c.amount) FILTER (WHERE NOT c.paid), 0::numeric)::numeric(10,3) AS allocated_general_unpaid
   FROM groups g
     LEFT JOIN costs c ON c.group_id IS NULL AND date_trunc('month'::text, c.due_date::timestamp with time zone) >= date_trunc('month'::text, g.start_date::timestamp with time zone) AND date_trunc('month'::text, c.due_date::timestamp with time zone) <= date_trunc('month'::text, g.end_date::timestamp with time zone)
  GROUP BY g.id;

-- View: public.general_costs_monthly
CREATE OR REPLACE VIEW public.general_costs_monthly
 AS
 SELECT date_trunc('month'::text, due_date::timestamp with time zone)::date AS month_start,
    COALESCE(sum(amount) FILTER (WHERE paid), 0::numeric)::numeric(10,3) AS paid_total,
    COALESCE(sum(amount) FILTER (WHERE NOT paid), 0::numeric)::numeric(10,3) AS unpaid_total
   FROM costs c
  WHERE group_id IS NULL
  GROUP BY (date_trunc('month'::text, due_date::timestamp with time zone)::date);


-- View: public.group_specific_costs
CREATE OR REPLACE VIEW public.group_specific_costs
 AS
 SELECT group_id,
    sum(amount)::numeric(10,3) AS total_cost,
    sum(amount) FILTER (WHERE paid)::numeric(10,3) AS paid_cost,
    sum(amount) FILTER (WHERE NOT paid)::numeric(10,3) AS unpaid_cost
   FROM costs c
  WHERE group_id IS NOT NULL
  GROUP BY group_id;

-- View: public.student_payments_per_group
CREATE OR REPLACE VIEW public.student_payments_per_group
 AS
 SELECT r.id AS registration_id,
    s.id AS student_id,
    s.first_name,
    s.last_name,
    g.id AS group_id,
    g.name AS group_name,
    r.agreed_price,
    r.deposit_pct,
    r.discount_amount,
    COALESCE(sum(p.amount), 0::numeric)::numeric(10,3) AS total_paid,
    (r.agreed_price - r.discount_amount - COALESCE(sum(p.amount), 0::numeric))::numeric(10,3) AS outstanding_amount
   FROM registrations r
     JOIN students s ON r.student_id = s.id
     JOIN groups g ON r.group_id = g.id
     LEFT JOIN payments p ON p.registration_id = r.id AND p.is_paid = true
  GROUP BY r.id, s.id, s.first_name, s.last_name, g.id, g.name, r.agreed_price, r.deposit_pct, r.discount_amount;


-- View: public.group_external_cost_share
CREATE OR REPLACE VIEW public.group_external_cost_share AS
WITH per_month AS (
  SELECT
    gm.group_id,
    gcm.month_start,
    ag.num_groups,
    gcm.paid_total,
    gcm.unpaid_total,
    (gcm.paid_total + gcm.unpaid_total)                      AS total_ext_month,
    (gcm.paid_total  / NULLIF(ag.num_groups, 0))             AS alloc_paid_month,
    (gcm.unpaid_total / NULLIF(ag.num_groups, 0))            AS alloc_unpaid_month
  FROM group_active_months gm
  JOIN general_costs_monthly gcm USING (month_start)
  JOIN active_groups_per_month ag USING (month_start)
)
SELECT
  g.id   AS group_id,
  g.name AS group_name,

  -- Allocated to this group across its active months
  COALESCE(SUM(per_month.alloc_paid_month),   0)::numeric(10,3)   AS allocated_general_paid,
  COALESCE(SUM(per_month.alloc_unpaid_month), 0)::numeric(10,3)   AS allocated_general_unpaid,
  (COALESCE(SUM(per_month.alloc_paid_month), 0)
   + COALESCE(SUM(per_month.alloc_unpaid_month), 0))::numeric(10,3) AS allocated_general_total,

  -- Total external (unassigned) costs across the months this group is active
  COALESCE(SUM(per_month.paid_total),   0)::numeric(10,3)         AS external_paid_active_months,
  COALESCE(SUM(per_month.unpaid_total), 0)::numeric(10,3)         AS external_unpaid_active_months,
  (COALESCE(SUM(per_month.paid_total), 0)
   + COALESCE(SUM(per_month.unpaid_total), 0))::numeric(10,3)     AS external_total_active_months,

  -- Percent shares over the group's active months
  CASE
    WHEN COALESCE(SUM(per_month.paid_total), 0) > 0
    THEN ROUND(
      COALESCE(SUM(per_month.alloc_paid_month), 0)
      / SUM(per_month.paid_total) * 100.0, 3
    )
    ELSE 0
  END::numeric(10,3) AS external_share_pct_paid,

  CASE
    WHEN COALESCE(SUM(per_month.unpaid_total), 0) > 0
    THEN ROUND(
      COALESCE(SUM(per_month.alloc_unpaid_month), 0)
      / SUM(per_month.unpaid_total) * 100.0, 3
    )
    ELSE 0
  END::numeric(10,3) AS external_share_pct_unpaid,

  CASE
    WHEN COALESCE(SUM(per_month.paid_total + per_month.unpaid_total), 0) > 0
    THEN ROUND(
      (COALESCE(SUM(per_month.alloc_paid_month), 0)
       + COALESCE(SUM(per_month.alloc_unpaid_month), 0))
      / SUM(per_month.paid_total + per_month.unpaid_total) * 100.0, 3
    )
    ELSE 0
  END::numeric(10,3) AS external_share_pct_total
FROM per_month
JOIN groups g ON g.id = per_month.group_id
GROUP BY g.id, g.name;

-- View: public.group_cost_summary
CREATE OR REPLACE VIEW public.group_cost_summary
AS
WITH tp AS (
  SELECT
    teacher_payments.teacher_id,
    teacher_payments.group_id,
    SUM(teacher_payments.amount)::numeric(10,3) AS paid_amount
  FROM teacher_payments
  WHERE teacher_payments.paid = true
  GROUP BY teacher_payments.teacher_id, teacher_payments.group_id
),
allocated_per_group AS (
  SELECT
    gm.group_id,
    COALESCE(SUM(gcm.paid_total   / NULLIF(ag.num_groups, 0::numeric)), 0::numeric)::numeric(10,3)   AS allocated_general_paid,
    COALESCE(SUM(gcm.unpaid_total / NULLIF(ag.num_groups, 0::numeric)), 0::numeric)::numeric(10,3)   AS allocated_general_unpaid
  FROM group_active_months gm
  JOIN general_costs_monthly gcm USING (month_start)
  JOIN active_groups_per_month ag USING (month_start)
  GROUP BY gm.group_id
),
-- Denominators: total external (unassigned) costs across months each group is active
external_denoms AS (
  SELECT
    gm.group_id,
    COALESCE(SUM(gcm.paid_total),   0)::numeric(10,3) AS ext_paid_total,
    COALESCE(SUM(gcm.unpaid_total), 0)::numeric(10,3) AS ext_unpaid_total,
    (COALESCE(SUM(gcm.paid_total), 0) + COALESCE(SUM(gcm.unpaid_total), 0))::numeric(10,3) AS ext_total
  FROM group_active_months gm
  JOIN general_costs_monthly gcm USING (month_start)
  GROUP BY gm.group_id
)
SELECT
  g.id AS group_id,
  g.name AS group_name,
  tg.total_hours,
  tg.rate,
  tg.amount_due AS teacher_amount_due,
  COALESCE(tp.paid_amount, 0::numeric)::numeric(10,3) AS teacher_paid,
  (tg.amount_due - COALESCE(tp.paid_amount, 0::numeric))::numeric(10,3) AS teacher_unpaid,
  COALESCE(sp.total_cost, 0::numeric)::numeric(10,3) AS group_total_cost,
  COALESCE(sp.paid_cost, 0::numeric)::numeric(10,3) AS group_paid_cost,
  COALESCE(sp.unpaid_cost, 0::numeric)::numeric(10,3) AS group_unpaid_cost,
  COALESCE(ga.allocated_general_paid, 0::numeric)::numeric(10,3) AS general_paid,
  COALESCE(ga.allocated_general_unpaid, 0::numeric)::numeric(10,3) AS general_unpaid,
  (tg.amount_due
     - COALESCE(tp.paid_amount, 0::numeric)
     + COALESCE(sp.unpaid_cost, 0::numeric)
     + COALESCE(ga.allocated_general_unpaid, 0::numeric)
  )::numeric(10,3) AS total_outstanding,

  -- NEW: percentage shares of external (unassigned) costs over the group's active months
  CASE
    WHEN COALESCE(ed.ext_paid_total, 0) > 0
      THEN ROUND(COALESCE(ga.allocated_general_paid, 0::numeric) / NULLIF(ed.ext_paid_total, 0) * 100.0, 3)
    ELSE 0::numeric
  END::numeric(10,3) AS external_share_pct_paid,

  CASE
    WHEN COALESCE(ed.ext_unpaid_total, 0) > 0
      THEN ROUND(COALESCE(ga.allocated_general_unpaid, 0::numeric) / NULLIF(ed.ext_unpaid_total, 0) * 100.0, 3)
    ELSE 0::numeric
  END::numeric(10,3) AS external_share_pct_unpaid,

  CASE
    WHEN COALESCE(ed.ext_total, 0) > 0
      THEN ROUND(
        (COALESCE(ga.allocated_general_paid, 0::numeric) + COALESCE(ga.allocated_general_unpaid, 0::numeric))
        / NULLIF(ed.ext_total, 0) * 100.0, 3
      )
    ELSE 0::numeric
  END::numeric(10,3) AS external_share_pct_total

FROM groups g
LEFT JOIN teacher_group_dues    tg ON tg.group_id = g.id
LEFT JOIN tp                    ON tp.teacher_id = tg.teacher_id AND tp.group_id = tg.group_id
LEFT JOIN group_specific_costs  sp ON sp.group_id = g.id
LEFT JOIN allocated_per_group   ga ON ga.group_id = g.id
LEFT JOIN external_denoms       ed ON ed.group_id = g.id;

-- View: public.dashboard_metrics
CREATE OR REPLACE VIEW public.dashboard_metrics
 AS
 WITH month_bounds AS (
         SELECT date_trunc('month'::text, CURRENT_DATE::timestamp with time zone)::date AS month_start,
            (date_trunc('month'::text, CURRENT_DATE::timestamp with time zone) + '1 mon'::interval)::date AS month_end
        )
 SELECT (COALESCE(( SELECT sum(payments.amount) AS sum
           FROM payments
          WHERE payments.is_paid), 0::numeric) - COALESCE(( SELECT sum(teacher_payments.amount) AS sum
           FROM teacher_payments
          WHERE teacher_payments.paid), 0::numeric) - COALESCE(( SELECT sum(costs.amount) AS sum
           FROM costs
          WHERE costs.paid), 0::numeric))::numeric(10,3) AS net_cash_all_time,
    COALESCE(( SELECT sum(p.amount) AS sum
           FROM payments p
             JOIN month_bounds mb ON p.date >= mb.month_start AND p.date < mb.month_end
          WHERE p.is_paid), 0::numeric)::numeric(10,3) AS student_paid_monthly,
    COALESCE(( SELECT sum(r.agreed_price) AS sum
           FROM registrations r
             JOIN month_bounds mb ON r.registration_date >= mb.month_start AND r.registration_date < mb.month_end), 0::numeric)::numeric(10,3) AS student_expected_monthly,
    COALESCE(( SELECT sum(tp.amount) AS sum
           FROM teacher_payments tp
             JOIN month_bounds mb ON tp.paid_date >= mb.month_start AND tp.paid_date < mb.month_end
          WHERE tp.paid), 0::numeric)::numeric(10,3) AS teacher_paid_monthly,
    COALESCE(( SELECT sum(EXTRACT(epoch FROM gs.end_time - gs.start_time) / 3600.0 * tg.rate) AS sum
           FROM group_sessions gs
             JOIN teacher_group_dues tg ON tg.group_id = gs.group_id
             JOIN month_bounds mb ON gs.session_date >= mb.month_start AND gs.session_date < mb.month_end), 0::numeric)::numeric(10,3) AS teacher_expected_monthly,
    COALESCE(( SELECT sum(c.amount) AS sum
           FROM costs c
             JOIN month_bounds mb ON c.paid_date >= mb.month_start AND c.paid_date < mb.month_end
          WHERE c.paid), 0::numeric)::numeric(10,3) AS cost_paid_monthly,
    COALESCE(( SELECT sum(c.amount) AS sum
           FROM costs c
             JOIN month_bounds mb ON c.due_date >= mb.month_start AND c.due_date < mb.month_end), 0::numeric)::numeric(10,3) AS cost_expected_monthly;

-- View: public.dashboard_sessions_today
CREATE OR REPLACE VIEW public.dashboard_sessions_today
 AS
 WITH today AS (
         SELECT CURRENT_DATE AS dt,
            EXTRACT(dow FROM CURRENT_DATE)::integer AS dow
        )
 SELECT 'Planifié'::text AS source,
    g.name AS group_name,
    (t.first_name::text || ' '::text) || t.last_name::text AS teacher_name,
    today.dt AS session_date,
    (to_char(s.start_time::interval, 'HH24:MI'::text) || '–'::text) || to_char(s.end_time::interval, 'HH24:MI'::text) AS "time"
   FROM group_schedules s
     JOIN today ON s.day_of_week = today.dow
     JOIN groups g ON g.id = s.group_id
     LEFT JOIN teachers t ON t.id = g.teacher_id
  WHERE NOT (EXISTS ( SELECT 1
           FROM group_sessions gs
          WHERE gs.group_id = s.group_id AND gs.session_date = today.dt AND gs.start_time = s.start_time AND gs.end_time = s.end_time))
UNION ALL
 SELECT 'Effectué'::text AS source,
    g.name AS group_name,
    (t.first_name::text || ' '::text) || t.last_name::text AS teacher_name,
    gs.session_date,
    (to_char(gs.start_time::interval, 'HH24:MI'::text) || '–'::text) || to_char(gs.end_time::interval, 'HH24:MI'::text) AS "time"
   FROM group_sessions gs
     JOIN today ON gs.session_date = today.dt
     JOIN groups g ON g.id = gs.group_id
     LEFT JOIN teachers t ON t.id = g.teacher_id;

-- View: public.dashboard_timeseries_12mo
CREATE OR REPLACE VIEW public.dashboard_timeseries_12mo
 AS
 WITH months AS (
         SELECT generate_series(date_trunc('month'::text, CURRENT_DATE::timestamp with time zone) - '11 mons'::interval, date_trunc('month'::text, CURRENT_DATE::timestamp with time zone), '1 mon'::interval)::date AS month_start
        ), p AS (
         SELECT date_trunc('month'::text, p_1.date::timestamp with time zone)::date AS m,
            sum(p_1.amount)::numeric(10,3) AS payments_paid
           FROM payments p_1
          WHERE p_1.is_paid = true
          GROUP BY (date_trunc('month'::text, p_1.date::timestamp with time zone)::date)
        ), c AS (
         SELECT date_trunc('month'::text, c_1.paid_date::timestamp with time zone)::date AS m,
            sum(c_1.amount)::numeric(10,3) AS costs_paid
           FROM costs c_1
          WHERE c_1.paid = true AND c_1.paid_date IS NOT NULL
          GROUP BY (date_trunc('month'::text, c_1.paid_date::timestamp with time zone)::date)
        ), tp AS (
         SELECT date_trunc('month'::text, tp_1.paid_date::timestamp with time zone)::date AS m,
            sum(tp_1.amount)::numeric(10,3) AS teacher_paid
           FROM teacher_payments tp_1
          WHERE tp_1.paid = true AND tp_1.paid_date IS NOT NULL
          GROUP BY (date_trunc('month'::text, tp_1.paid_date::timestamp with time zone)::date)
        )
 SELECT m.month_start,
    to_char(m.month_start::timestamp with time zone, 'YYYY-MM'::text) AS month,
    COALESCE(p.payments_paid, 0::numeric)::numeric(10,3) AS payments_paid,
    COALESCE(c.costs_paid, 0::numeric)::numeric(10,3) AS costs_paid,
    COALESCE(tp.teacher_paid, 0::numeric)::numeric(10,3) AS teacher_paid,
    (COALESCE(c.costs_paid, 0::numeric) + COALESCE(tp.teacher_paid, 0::numeric))::numeric(10,3) AS costs_total,
    (COALESCE(p.payments_paid, 0::numeric) - (COALESCE(c.costs_paid, 0::numeric) + COALESCE(tp.teacher_paid, 0::numeric)))::numeric(10,3) AS profit
   FROM months m
     LEFT JOIN p ON p.m = m.month_start
     LEFT JOIN c ON c.m = m.month_start
     LEFT JOIN tp ON tp.m = m.month_start
  ORDER BY m.month_start;

CREATE INDEX IF NOT EXISTS idx_payments_date_paid ON payments(date) WHERE is_paid;
CREATE INDEX IF NOT EXISTS idx_costs_paid_date_paid ON costs(paid_date) WHERE paid;
CREATE INDEX IF NOT EXISTS idx_teacher_payments_paid_date_paid ON teacher_payments(paid_date) WHERE paid;
