create table password_reset_tokens
(
    id          bigint generated by default as identity
        primary key,
    expiry_date timestamp(6),
    token       varchar(255),
    user_id     bigint not null
        constraint ukla2ts67g4oh2sreayswhox1i6
            unique
        constraint fkk3ndxg5xp6v7wd4gjyusp15gq
            references users
);

alter table password_reset_tokens
    owner to "radiant-shop_owner";
