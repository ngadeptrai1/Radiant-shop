create table users
(
    active        boolean not null,
    blocked       boolean not null,
    enabled       boolean not null,
    created_date  timestamp(6),
    id            bigint generated by default as identity
        primary key,
    updated_date  timestamp(6),
    provider      varchar(50),
    email         varchar(100),
    full_name     varchar(100),
    provider_id   varchar(100)
        unique,
    username      varchar(100)
        unique,
    password      varchar(255),
    customer_type varchar(255),
    phone_num     varchar(50)
);

alter table users
    owner to "radiant-shop_owner";

