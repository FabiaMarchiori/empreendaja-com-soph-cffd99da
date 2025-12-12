CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



SET default_table_access_method = heap;

--
-- Name: protected_tools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.protected_tools (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    description text,
    icon text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: protected_tools protected_tools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.protected_tools
    ADD CONSTRAINT protected_tools_pkey PRIMARY KEY (id);


--
-- Name: protected_tools protected_tools_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.protected_tools
    ADD CONSTRAINT protected_tools_slug_key UNIQUE (slug);


--
-- Name: protected_tools Authenticated users can read tools; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read tools" ON public.protected_tools FOR SELECT TO authenticated USING (true);


--
-- Name: protected_tools; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.protected_tools ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


