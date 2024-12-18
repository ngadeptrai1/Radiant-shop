create table wish_lists
(
    active     boolean      not null,
    id         bigint generated by default as identity
        primary key,
    like_date  timestamp(6) not null,
    product_id bigint
        constraint fk4qono9ul297stprxj4y1eeqkn
            references products,
    user_id    bigint
        constraint fk3kbccdqnejdlic97xr5xbfjcf
            references users
);

alter table wish_lists
    owner to "radiant-shop_owner";

