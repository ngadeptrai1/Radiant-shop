create table colors
(
    active       boolean      not null,
    id           integer generated by default as identity
        primary key,
    created_date timestamp(6),
    updated_date timestamp(6),
    hex_code     varchar(255) not null,
    name         varchar(255)
);

alter table colors
    owner to "radiant-shop_owner";

