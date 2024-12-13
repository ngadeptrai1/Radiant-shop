create table roles
(
    id          integer     not null
        primary key,
    role_name   varchar(50) not null
        unique,
    description varchar(255)
);

alter table roles
    owner to "radiant-shop_owner";

