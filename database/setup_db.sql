-- drop database if exists test;
-- create database if not exists test;

revoke all on schema public from public;
create schema if not exists app;

-- drop table if exists users;
create table if not exists app.users (
    id bigserial primary key,
    username varchar(30) not null unique,
    password varchar(60) not null,
    email varchar(40) not null,
    created_at timestamp not null default now()
);

create role if not exists games_app_admin with connection limit 10 login password '123' valid until '2022-06-01';
grant connect on database games_app to games_app_admin;
grant usage on schema app to games_app_admin;

grant select, insert, update, delete on app.users to games_app_admin; -- TRUNCATE | REFERENCES | TRIGGER
revoke insert (id, created_at), update (id, created_at) on app.users from games_app_admin;

grant usage on all sequences in schema app to games_app_admin;
grant execute on all functions in schema app to games_app_admin;