--
-- PostgreSQL database dump
--

-- Dumped from database version 12.2
-- Dumped by pg_dump version 12.2

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

INSERT INTO public.admin_client (id, firstname, surname, phone, email, note, active) VALUES (3, 'Vladimír', 'Novotný', '', '', '', true);
INSERT INTO public.admin_client (id, firstname, surname, phone, email, note, active) VALUES (2, 'Jan', 'Novák', '', '', '', false);
INSERT INTO public.admin_client (id, firstname, surname, phone, email, note, active) VALUES (4, 'Lukáš', 'Rod', '111222333', 'info@lukasrod.cz', ':)', true);
INSERT INTO public.admin_client (id, firstname, surname, phone, email, note, active) VALUES (1, 'Pavel', 'Rod', '777777777', 'test@test.cz', 'grafomotorika', true);
INSERT INTO public.admin_client (id, firstname, surname, phone, email, note, active) VALUES (5, 'Anna', 'Horáková', '', '', 'doporučení od logo', true);


--
-- Data for Name: admin_course; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.admin_course (id, name, visible, duration, color) VALUES (1, 'Feuersteinova metoda', true, 30, '#2EA0BA');
INSERT INTO public.admin_course (id, name, visible, duration, color) VALUES (2, 'Kurz Slabika', true, 30, '#D2527F');
INSERT INTO public.admin_course (id, name, visible, duration, color) VALUES (3, 'RoPraTem', true, 40, '#C0392B');
INSERT INTO public.admin_course (id, name, visible, duration, color) VALUES (4, 'Máme doma leváka', false, 20, '#446CB3');
INSERT INTO public.admin_course (id, name, visible, duration, color) VALUES (5, 'Rozvoj grafomotoriky', true, 30, '#F39C12');


--
-- Data for Name: admin_application; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.admin_application (id, note, client_id, course_id, created_at) VALUES (1, 'od srpna 2019', 1, 1, '2019-07-05');
INSERT INTO public.admin_application (id, note, client_id, course_id, created_at) VALUES (2, 'od března 2020', 3, 2, '2020-01-30');
INSERT INTO public.admin_application (id, note, client_id, course_id, created_at) VALUES (3, 'v březnu 2019 se neozvali, skupina s Vláďou', 2, 2, '2019-02-01');


--
-- Data for Name: admin_attendancestate; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.admin_attendancestate (id, name, visible, "default", excused) VALUES (1, 'OK', true, true, false);
INSERT INTO public.admin_attendancestate (id, name, visible, "default", excused) VALUES (2, 'omluven', true, false, true);
INSERT INTO public.admin_attendancestate (id, name, visible, "default", excused) VALUES (3, 'nepřišel', true, false, false);


--
-- Data for Name: admin_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.admin_group (id, name, course_id, active) VALUES (1, 'Kurz Slabika 1', 2, true);
INSERT INTO public.admin_group (id, name, course_id, active) VALUES (2, 'Kurz Slabika 2', 2, false);
INSERT INTO public.admin_group (id, name, course_id, active) VALUES (3, 'RoPraTem 1', 3, true);
INSERT INTO public.admin_group (id, name, course_id, active) VALUES (4, 'GMT 1', 5, true);


--
-- Data for Name: admin_lecture; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (5, NULL, 30, 1, NULL, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (4, date_trunc('week', current_date) + INTERVAL '1 day' + TIME '11:00', 30, 1, NULL, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (7, date_trunc('week', current_date) + INTERVAL '1 day' + TIME '16:00', 30, 1, NULL, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (8, date_trunc('week', current_date) + INTERVAL '1 day' + TIME '17:00', 30, 1, NULL, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (9, NULL, 30, 1, NULL, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (6, date_trunc('week', current_date) + INTERVAL '1 day' + TIME '18:00', 30, 1, NULL, true);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (2, NULL, 40, 3, NULL, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (10, date_trunc('week', current_date) + INTERVAL '1 day' + TIME '19:00', 40, 3, NULL, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (1, date_trunc('week', current_date) + INTERVAL '2 day' + TIME '14:00', 32, 1, NULL, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (12, date_trunc('week', current_date) + INTERVAL '2 day' + TIME '16:00', 45, 2, 1, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (11, date_trunc('week', current_date) + INTERVAL '2 day' + TIME '17:00', 45, 2, 1, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (13, date_trunc('week', current_date) + INTERVAL '2 day' + TIME '18:00', 45, 2, 1, true);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (14, date_trunc('week', current_date) + INTERVAL '2 day' + TIME '19:00', 45, 2, 2, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (15, date_trunc('week', current_date) + INTERVAL '4 day' + TIME '15:00', 45, 2, 2, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (16, date_trunc('week', current_date) + INTERVAL '4 day' + TIME '16:00', 45, 2, 2, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (17, date_trunc('week', current_date) + INTERVAL '4 day' + TIME '17:00', 45, 2, 2, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (18, date_trunc('week', current_date) + INTERVAL '4 day' + TIME '19:00', 45, 2, 2, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (20, NULL, 30, 5, NULL, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (19, date_trunc('week', current_date) + INTERVAL '7 day' + TIME '10:00', 35, 5, NULL, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (22, date_trunc('week', current_date) - INTERVAL '7 day' + TIME '9:00', 45, 5, 4, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (21, date_trunc('week', current_date) + INTERVAL '9 day' + TIME '8:00', 45, 5, 4, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (23, current_date + TIME '14:00', 32, 1, NULL, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (24, current_date + TIME '12:00', 32, 1, NULL, false);
INSERT INTO public.admin_lecture (id, start, duration, course_id, group_id, canceled) VALUES (25, current_date + TIME '8:00', 45, 5, 4, false);


--
-- Data for Name: admin_attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (5, true, 1, 3, 5, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (4, true, 1, 3, 4, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (7, false, 1, 3, 7, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (8, false, 1, 3, 8, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (6, true, 2, 3, 6, 'matka nestíhá - vrací se z tábora');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (9, true, 1, 3, 9, 'Náhrada lekce (10. 7. 2019)');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (2, true, 1, 1, 2, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (10, false, 1, 1, 10, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (1, true, 1, 1, 1, 'půjčen bzučák');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (11, true, 1, 3, 11, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (13, true, 1, 3, 12, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (14, true, 1, 1, 12, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (12, true, 3, 1, 11, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (15, true, 2, 3, 13, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (16, true, 2, 1, 13, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (18, true, 1, 1, 14, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (17, true, 1, 3, 14, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (20, true, 1, 1, 15, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (19, true, 1, 3, 15, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (21, true, 1, 3, 16, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (22, true, 1, 1, 16, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (23, true, 1, 3, 17, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (24, true, 1, 1, 17, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (25, true, 1, 3, 18, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (26, true, 1, 1, 18, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (28, true, 1, 5, 20, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (27, true, 1, 5, 19, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (30, true, 1, 4, 21, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (31, true, 1, 5, 22, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (32, false, 1, 4, 22, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (33, false, 1, 1, 22, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (29, false, 2, 5, 21, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (34, true, 1, 1, 23, 'půjčen bzučák');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (35, true, 1, 1, 24, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (36, false, 2, 5, 25, '');
INSERT INTO public.admin_attendance (id, paid, attendancestate_id, client_id, lecture_id, note) VALUES (37, true, 1, 4, 25, 'půjčena kniha');


--
-- Data for Name: admin_membership; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.admin_membership (id, client_id, group_id, prepaid_cnt) VALUES (4, 3, 1, 1);
INSERT INTO public.admin_membership (id, client_id, group_id, prepaid_cnt) VALUES (1, 1, 1, 3);
INSERT INTO public.admin_membership (id, client_id, group_id, prepaid_cnt) VALUES (6, 3, 2, 7);
INSERT INTO public.admin_membership (id, client_id, group_id, prepaid_cnt) VALUES (5, 1, 2, 5);
INSERT INTO public.admin_membership (id, client_id, group_id, prepaid_cnt) VALUES (7, 2, 3, 0);
INSERT INTO public.admin_membership (id, client_id, group_id, prepaid_cnt) VALUES (8, 4, 3, 0);
INSERT INTO public.admin_membership (id, client_id, group_id, prepaid_cnt) VALUES (9, 4, 4, 0);
INSERT INTO public.admin_membership (id, client_id, group_id, prepaid_cnt) VALUES (10, 5, 4, 0);
INSERT INTO public.admin_membership (id, client_id, group_id, prepaid_cnt) VALUES (11, 1, 4, 0);


--
-- Name: admin_application_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_application_id_seq', 3, true);


--
-- Name: admin_attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_attendance_id_seq', 33, true);


--
-- Name: admin_attendancestate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_attendancestate_id_seq', 3, true);


--
-- Name: admin_client_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_client_id_seq', 5, true);


--
-- Name: admin_course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_course_id_seq', 5, true);


--
-- Name: admin_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_group_id_seq', 4, true);


--
-- Name: admin_lecture_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_lecture_id_seq', 22, true);


--
-- Name: admin_membership_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_membership_id_seq', 11, true);


--
-- PostgreSQL database dump complete
--

