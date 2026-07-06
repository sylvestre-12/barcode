--
-- PostgreSQL database dump
--

\restrict pZtzhHJvfyYKW3s1LTqs6bcV1bec7JRIm3Die7BHOMBWVrD8w01ulSnUGXG1Gti

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Anomaly; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Anomaly" (
    id text NOT NULL,
    type text NOT NULL,
    severity text NOT NULL,
    description text NOT NULL,
    dismissed boolean DEFAULT false NOT NULL,
    detected_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    score double precision,
    user_id text NOT NULL
);


ALTER TABLE public."Anomaly" OWNER TO postgres;

--
-- Name: AttendanceRecord; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AttendanceRecord" (
    id text NOT NULL,
    barcode text NOT NULL,
    check_in timestamp(3) without time zone NOT NULL,
    check_out timestamp(3) without time zone,
    date timestamp(3) without time zone NOT NULL,
    duration_minutes integer,
    status text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    student_id text NOT NULL
);


ALTER TABLE public."AttendanceRecord" OWNER TO postgres;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    action text NOT NULL,
    ip_address text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    details jsonb,
    entity text NOT NULL,
    entity_id text,
    user_id text
);


ALTER TABLE public."AuditLog" OWNER TO postgres;

--
-- Name: Barcode; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Barcode" (
    id text NOT NULL,
    code text NOT NULL,
    student_id text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Barcode" OWNER TO postgres;

--
-- Name: LoginAttempt; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LoginAttempt" (
    id text NOT NULL,
    attempt_count integer DEFAULT 0 NOT NULL,
    locked_until timestamp(3) without time zone,
    last_attempt timestamp(3) without time zone,
    user_id text NOT NULL
);


ALTER TABLE public."LoginAttempt" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id text
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: OTP; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OTP" (
    id text NOT NULL,
    user_id text NOT NULL,
    code text NOT NULL,
    used boolean DEFAULT false NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OTP" OWNER TO postgres;

--
-- Name: Profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Profile" (
    id text NOT NULL,
    username text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    role text NOT NULL,
    barcode text,
    password text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    approved boolean DEFAULT false NOT NULL,
    email_verified boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Profile" OWNER TO postgres;

--
-- Name: Student; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Student" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    "qrCode" text NOT NULL,
    department text,
    year text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Student" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Anomaly; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Anomaly" (id, type, severity, description, dismissed, detected_at, score, user_id) FROM stdin;
\.


--
-- Data for Name: AttendanceRecord; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AttendanceRecord" (id, barcode, check_in, check_out, date, duration_minutes, status, created_at, updated_at, student_id) FROM stdin;
2e6f7956-6bcc-413b-8334-d317636dfdaf	STU-2603	2026-07-04 16:38:59.584	2026-07-04 16:40:59.171	2026-07-03 22:00:00	\N	present	2026-07-04 16:38:59.588	2026-07-04 16:40:59.173	aed1ff1e-797f-4f4c-a883-79bc506d2307
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuditLog" (id, action, ip_address, created_at, details, entity, entity_id, user_id) FROM stdin;
\.


--
-- Data for Name: Barcode; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Barcode" (id, code, student_id, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: LoginAttempt; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LoginAttempt" (id, attempt_count, locked_until, last_attempt, user_id) FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, type, title, message, read, created_at, user_id) FROM stdin;
\.


--
-- Data for Name: OTP; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OTP" (id, user_id, code, used, "expiresAt", created_at) FROM stdin;
\.


--
-- Data for Name: Profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Profile" (id, username, name, email, phone, role, barcode, password, created_at, approved, email_verified) FROM stdin;
f786d6b3-5876-46ca-a21b-c38148ca04ee	sylve	Sylve	120tegeri@gmail.com	+250786278111	admin	\N	$2b$10$Kch98LJDlXdZYxR7IAxtF.QvFfbTlJtnz9rgWy5Qg9pjDJQpOXbP.	2026-07-04 15:06:21.454	t	t
0f8748bd-ada5-4fbb-8392-bd1814aafc01	jess	uwineza	uwineza@gmail.com	+250786278000	staff	\N	$2b$10$Dj.Uu.oR.VF5VyKtXLhPreomRDPYyfnbiUuGvhe0kl6SWXny.L4xe	2026-07-04 15:07:41.974	t	f
13c0b3c5-a330-444a-8a79-8116fcf6ea7a	@aline	Aline	aline@gmail.com	+250786278100	supervisor	\N	$2b$10$3qQ6/6b4Nwxjd7RxGhP0w.UD6hdgEU4IloG5q8iMFXygxCmWBsH.u	2026-07-04 15:11:03.697	t	f
\.


--
-- Data for Name: Student; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Student" (id, "studentId", name, email, phone, "qrCode", department, year, created_at, updated_at) FROM stdin;
72ecbdff-37a3-46cd-8a19-4f2c8fc99892	STU-1068	Jean Claude Niyonzima	niyonzima.jeanclaude@gmail.com	\N	STU-1068	S5 A	\N	2026-07-04 15:21:31.824	2026-07-04 15:21:31.824
cf84fe90-4b7c-4572-8ab9-69156b5878e6	STU-5752	Aline Uwimana	uwimana.aline@gmail.com	\N	STU-5752	S5 A	\N	2026-07-04 15:21:58.564	2026-07-04 15:21:58.564
b81640fa-9c14-4986-8880-d47221635031	STU-3569	Eric Habimana	habimana.eric@gmail.com	\N	STU-3569	S5 B	\N	2026-07-04 15:22:18.288	2026-07-04 15:22:18.288
bec7f8dc-1aa1-421b-992c-830e585f0fa8	STU-1051	Claudine Mukamana	mukamana.claudine@gmail.com	\N	STU-1051	S5 B	\N	2026-07-04 15:22:34.114	2026-07-04 15:22:34.114
73f3d559-9976-4061-87eb-253da40128aa	STU-6796	Patrick Nshimiyimana	nshimiyimana.patrick@gmail.com	\N	STU-6796	S4 A	\N	2026-07-04 15:22:48.543	2026-07-04 15:22:48.543
998b0720-7fd4-4299-b4a9-66a57bd59512	STU-6866	Josiane Ingabire	ingabire.josiane@gmail.com	\N	STU-6866	S4 A	\N	2026-07-04 15:23:48.734	2026-07-04 15:23:48.734
cddee7fa-304f-423b-8ebe-f5abe4a073da	STU-8069	Emmanuel Uwizeye	uwizeye.emmanuel@gmail.com	\N	STU-8069	S4 B	\N	2026-07-04 15:24:07.284	2026-07-04 15:24:07.284
e5e93624-1366-4093-a8e2-d19a07e8671d	STU-1596	Beatrice Nyirahabimana	nyirahabimana.beatrice@gmail.com	\N	STU-1596	S4 B	\N	2026-07-04 15:24:34.481	2026-07-04 15:24:34.481
ffd728b8-8463-4a0b-ba44-cad55ddd77ee	STU-3954	David Nkurunziza	nkurunziza.david@gmail.com	\N	STU-3954	S6 A	\N	2026-07-04 15:24:47.106	2026-07-04 15:24:47.106
386a6ea4-8dd6-4eea-acca-e69a9112d619	STU-7600	Sandrine Uwase	uwase.sandrine@gmail.com	\N	STU-7600	S6 A	\N	2026-07-04 15:25:02.848	2026-07-04 15:25:02.848
7aa46704-7834-4e63-a7e0-c30409b97b23	STU-8160	Gilbert Manirakiza	manirakiza.gilbert@gmail.com	\N	STU-8160	S6 B	\N	2026-07-04 15:25:14.786	2026-07-04 15:25:14.786
0c0b1521-0604-41be-91c2-0d5982fae400	STU-3913	Chantal Uwera	uwera.chantal@gmail.com	\N	STU-3913	S6 B	\N	2026-07-04 15:25:33.406	2026-07-04 15:25:33.406
e7df01f4-625e-43e5-b3fb-c1e829f19769	STU-1962	Dieudonne Niyibizi	niyibizi.dieudonne@gmail.com	\N	STU-1962	S5 C	\N	2026-07-04 15:25:44.503	2026-07-04 15:25:44.503
087ba913-4232-43d6-b5de-e8cac23da894	STU-1141	Florence Mukarugwiza	mukarugwiza.florence@gmail.com	\N	STU-1141	S5 C	\N	2026-07-04 15:25:56.616	2026-07-04 15:25:56.616
286700e9-35f8-4f69-8f45-f5f461df697d	STU-6723	Jean Paul Bizimana	bizimana.jeanpaul@gmail.com	\N	STU-6723	S4 C	\N	2026-07-04 15:26:07.135	2026-07-04 15:26:07.135
596ac3cf-f8a7-47d0-ad7a-40caad6bb7de	STU-6516	Alice Uwitonze	uwitonze.alice@gmail.com	\N	STU-6516	S4 C	\N	2026-07-04 15:26:22.67	2026-07-04 15:26:22.67
8290e2ee-f1b9-4a84-b5be-e29abbe98e09	STU-7445	Fabrice Rukundo	rukundo.fabrice@gmail.com	\N	STU-7445	S6 C	\N	2026-07-04 15:26:34.047	2026-07-04 15:26:34.047
3c8ec0f4-5a98-4628-99fd-ec93733813c1	STU-2503	Prisca Nyiraneza	nyiraneza.prisca@gmail.com	\N	STU-2503	S6 C	\N	2026-07-04 15:26:47.683	2026-07-04 15:26:47.683
1fe7c864-ed46-419b-8ba7-b59148408036	STU-7119	Kevin Niyomugabo	niyomugabo.kevin@gmail.com	\N	STU-7119	S5 A	\N	2026-07-04 15:26:57.4	2026-07-04 15:26:57.4
aed1ff1e-797f-4f4c-a883-79bc506d2307	STU-2603	Diane Uwamahoro	uwamahoro.diane@gmail.com	\N	STU-2603	S5 A	\N	2026-07-04 15:27:29.249	2026-07-04 15:27:29.249
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
1b5c36fb-8b09-43ea-b47e-6b6e03dd2ee2	f99ee9fa81775caffdc8e1507239645e547fa9ec76b725749e51149a8a115ba0	2026-07-04 07:59:30.405596-07	20260703204647_init	\N	\N	2026-07-04 07:59:30.208775-07	1
3fc1494b-ff77-4051-a5fe-f22da9cd0054	43ab4a5b9755a754e3eb46239fe1f9995fcf3bd670da184bba1ab655226714ef	2026-07-04 07:59:30.417577-07	20260703224531_add_approval_system	\N	\N	2026-07-04 07:59:30.407712-07	1
08e6f9e0-43f6-4fec-9670-da7ec6835377	112378a986327fbc5d2fd3e3083f13f44acb9fbceedbc1314ee1485dde106436	2026-07-04 07:59:30.577944-07	20260704131522_clean_student_attendance	\N	\N	2026-07-04 07:59:30.4206-07	1
a6d3869a-3764-42dd-858e-91a306009a15	1e1c06f55ef44aadad5555c107bfc57a06ca854f0ece9db12898fda007ca9082	2026-07-04 07:59:34.494944-07	20260704145934_add_email_verified	\N	\N	2026-07-04 07:59:34.418272-07	1
\.


--
-- Name: Anomaly Anomaly_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Anomaly"
    ADD CONSTRAINT "Anomaly_pkey" PRIMARY KEY (id);


--
-- Name: AttendanceRecord AttendanceRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AttendanceRecord"
    ADD CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Barcode Barcode_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Barcode"
    ADD CONSTRAINT "Barcode_pkey" PRIMARY KEY (id);


--
-- Name: LoginAttempt LoginAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LoginAttempt"
    ADD CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OTP OTP_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OTP"
    ADD CONSTRAINT "OTP_pkey" PRIMARY KEY (id);


--
-- Name: Profile Profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "Profile_pkey" PRIMARY KEY (id);


--
-- Name: Student Student_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Barcode_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Barcode_code_key" ON public."Barcode" USING btree (code);


--
-- Name: Profile_barcode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Profile_barcode_key" ON public."Profile" USING btree (barcode);


--
-- Name: Profile_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Profile_email_key" ON public."Profile" USING btree (email);


--
-- Name: Student_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Student_email_key" ON public."Student" USING btree (email);


--
-- Name: Student_qrCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Student_qrCode_key" ON public."Student" USING btree ("qrCode");


--
-- Name: Student_studentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Student_studentId_key" ON public."Student" USING btree ("studentId");


--
-- Name: Anomaly Anomaly_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Anomaly"
    ADD CONSTRAINT "Anomaly_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AttendanceRecord AttendanceRecord_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AttendanceRecord"
    ADD CONSTRAINT "AttendanceRecord_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AuditLog AuditLog_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Barcode Barcode_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Barcode"
    ADD CONSTRAINT "Barcode_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LoginAttempt LoginAttempt_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LoginAttempt"
    ADD CONSTRAINT "LoginAttempt_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OTP OTP_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OTP"
    ADD CONSTRAINT "OTP_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict pZtzhHJvfyYKW3s1LTqs6bcV1bec7JRIm3Die7BHOMBWVrD8w01ulSnUGXG1Gti

