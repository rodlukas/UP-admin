--
-- PostgreSQL database dump
--

-- Dumped from database version 11.3
-- Dumped by pg_dump version 11.3

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
-- Data for Name: admin_client; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_client (id, firstname, surname, phone, email, note, active) FROM stdin;
1	Lukáš	Rod	777777777	test@test.cz	grafomotorika	t
3	Vladimír	Novotný				t
2	Jan	Novák				f
\.


--
-- Data for Name: admin_course; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_course (id, name, visible, duration, color) FROM stdin;
1	Feuersteinova metoda	t	30	#2EA0BA
2	Kurz Slabika	t	30	#D2527F
3	RoPraTem	t	40	#C0392B
4	Máme doma leváka	f	20	#446CB3
\.


--
-- Data for Name: admin_application; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_application (id, note, client_id, course_id) FROM stdin;
1	od srpna 2019	1	1
2	od března 2020	3	2
3	v březnu 2019 se neozvali, skupina s Vláďou	2	2
\.


--
-- Data for Name: admin_attendancestate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_attendancestate (id, name, visible, "default", excused) FROM stdin;
1	OK	t	t	f
2	omluven	t	f	t
3	nepřišel	t	f	f
\.


--
-- Data for Name: admin_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_group (id, name, course_id, active) FROM stdin;
1	Kurz Slabika 1	2	t
\.


--
-- Data for Name: admin_lecture; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_lecture (id, start, duration, course_id, group_id, canceled) FROM stdin;
5	\N	30	1	\N	f
4	2019-07-12 15:00:00+02	30	1	\N	f
7	2019-07-17 16:00:00+02	30	1	\N	f
8	2019-07-14 15:00:00+02	30	1	\N	f
9	\N	30	1	\N	f
6	2019-07-10 15:00:00+02	30	1	\N	t
2	\N	40	3	\N	f
10	2019-07-17 18:00:00+02	40	3	\N	f
1	2019-06-20 08:44:00+02	32	1	\N	f
12	2019-07-10 05:00:00+02	45	2	1	f
11	2019-07-25 17:00:00+02	45	2	1	f
13	2019-07-09 05:08:00+02	45	2	1	t
\.


--
-- Data for Name: admin_attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) FROM stdin;
5	t	1	3	5	
4	t	1	3	4	
7	f	1	3	7	
8	f	1	3	8	
6	t	2	3	6	matka nestíhá - vrací se z tábora
9	t	1	3	9	Náhrada lekce (10. 7. 2019)
2	t	1	1	2	
10	f	1	1	10	
1	t	1	1	1	půjčen bzučák
11	t	1	3	11	
13	t	1	3	12	
14	t	1	1	12	
12	t	3	1	11	
15	t	2	3	13	
16	t	2	1	13	
\.


--
-- Data for Name: admin_membership; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_membership (id, client_id, group_id, prepaid_cnt) FROM stdin;
4	3	1	1
1	1	1	3
\.


--
-- Name: admin_application_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_application_id_seq', 3, true);


--
-- Name: admin_attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_attendance_id_seq', 16, true);


--
-- Name: admin_attendancestate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_attendancestate_id_seq', 3, true);


--
-- Name: admin_client_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_client_id_seq', 3, true);


--
-- Name: admin_course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_course_id_seq', 4, true);


--
-- Name: admin_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_group_id_seq', 1, true);


--
-- Name: admin_lecture_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_lecture_id_seq', 13, true);


--
-- Name: admin_membership_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_membership_id_seq', 4, true);


--
-- PostgreSQL database dump complete
--

