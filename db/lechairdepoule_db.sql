-- Database generated with pgModeler (PostgreSQL Database Modeler).
-- pgModeler version: 1.1.5
-- PostgreSQL version: 17.0
-- Project Site: pgmodeler.io
-- Model Author: ---

-- Database creation must be performed outside a multi lined SQL file. 
-- These commands were put in this file only as a convenience.
-- 
-- object: lechairdepoule_db | type: DATABASE --
-- DROP DATABASE IF EXISTS lechairdepoule_db;
CREATE DATABASE lechairdepoule_db;
-- ddl-end --


-- object: public.user_roles | type: TYPE --
-- DROP TYPE IF EXISTS public.user_roles CASCADE;
CREATE TYPE public.user_roles AS
ENUM ('admin','contributor');
-- ddl-end --
ALTER TYPE public.user_roles OWNER TO postgres;
-- ddl-end --

-- object: public.invited_emails | type: TABLE --
-- DROP TABLE IF EXISTS public.invited_emails CASCADE;
CREATE TABLE public.invited_emails (
	email varchar(255) NOT NULL,
	role public.user_roles,
	CONSTRAINT invited_emails_pk PRIMARY KEY (email)
);
-- ddl-end --
ALTER TABLE public.invited_emails OWNER TO postgres;
-- ddl-end --

-- object: public.users | type: TABLE --
-- DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
	id serial NOT NULL,
	email varchar(255) NOT NULL,
	auth_provider_name varchar(32) NOT NULL,
	auth_provider_id varchar(64) NOT NULL,
	role public.user_roles,
	CONSTRAINT users_pk PRIMARY KEY (id),
	CONSTRAINT email_uq UNIQUE (email),
	CONSTRAINT auth_provider_key_uq UNIQUE (auth_provider_name,auth_provider_id)
);
-- ddl-end --
ALTER TABLE public.users OWNER TO postgres;
-- ddl-end --


