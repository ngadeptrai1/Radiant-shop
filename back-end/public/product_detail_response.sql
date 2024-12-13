create table product_detail_response
(
    id           bigint  not null
        primary key,
    active       boolean not null,
    color        varchar(255),
    discount     integer not null,
    product_name varchar(255),
    quantity     integer not null,
    sale_price   bigint,
    thumbnail    varchar(255)
);

alter table product_detail_response
    owner to "radiant-shop_owner";

