-- drop database if exists games_app;
-- create database if not exists games_app;

revoke all on schema public from public;

drop schema if exists app cascade;
create schema if not exists app;

drop type if exists perm cascade;
create type perm as enum ('basic', 'admin');

drop table if exists app.users;
create table if not exists app.users (
    id bigserial primary key,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    username varchar(30) not null unique,
    password varchar(60) not null,
    email varchar(40) not null unique,
    permissions perm not null default 'basic'
);

drop table if exists app.games;
create table if not exists app.games (
    id bigserial primary key,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    name varchar(30) not null unique
);

drop table if exists app.scores;
create table if not exists app.scores (
    id bigserial unique,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    user_id bigserial,
    game_id bigserial,
    score double precision not null,

    primary key (user_id, game_id),
    constraint fk_user foreign key(user_id) references app.users(id)
        on delete cascade
        on update cascade,
    constraint fk_game foreign key(game_id) references app.games(id)
        on delete restrict
        on update cascade
);

drop index if exists app.scores_id;
create index if not exists scores_id on app.scores (id);

DO
$$BEGIN
IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'games_app_admin') THEN
    EXECUTE 'REVOKE CONNECT ON DATABASE "games_app" FROM games_app_admin';
    EXECUTE 'REVOKE USAGE ON SCHEMA "app" FROM games_app_admin';
    EXECUTE 'REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA app FROM games_app_admin';
    EXECUTE 'REVOKE USAGE ON ALL SEQUENCES IN SCHEMA app FROM games_app_admin';
    EXECUTE 'REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA app FROM games_app_admin';
    EXECUTE 'DROP ROLE games_app_admin';
END IF;
END$$;

create role games_app_admin with connection limit 10 login password '123' valid until '2022-06-01';
grant connect on database games_app to games_app_admin;
grant usage on schema app to games_app_admin;

grant select, insert, update, delete on app.users to games_app_admin; -- TRUNCATE | REFERENCES | TRIGGER
revoke insert (id, created_at), update (id, created_at) on app.users from games_app_admin;

grant select, insert, update, delete on app.games to games_app_admin; -- TRUNCATE | REFERENCES | TRIGGER
revoke insert (created_at), update (id, created_at) on app.games from games_app_admin;

grant select, insert, update, delete on app.scores to games_app_admin; -- TRUNCATE | REFERENCES | TRIGGER
revoke insert (id, created_at), update (id, created_at) on app.scores from games_app_admin;

grant usage on all sequences in schema app to games_app_admin;
grant execute on all functions in schema app to games_app_admin;




insert into app.games (id, name) values (0, 'game.0');
insert into app.games (id, name) values (1, 'game.1');
insert into app.games (id, name) values (2, 'game.2');