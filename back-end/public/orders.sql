create table orders
(
    active             boolean not null,
    total_items        integer not null,
    created_date       timestamp(6),
    final_amount       bigint  not null,
    id                 bigint  not null
        primary key,
    shipping_cost      bigint,
    total_order_amount bigint  not null,
    updated_date       timestamp(6),
    user_id            bigint
        constraint fk32ql8ubntj5uh44ph9659tiih
            references users,
    voucher_amount     bigint,
    address            text,
    email              varchar(255),
    full_name          varchar(255),
    note               text,
    payment_method     varchar(255),
    payment_status     varchar(255),
    phone_number       varchar(255),
    status             varchar(255),
    voucher_code       varchar(255)
        constraint fkjynko9si3ntkswko8h8cljtk0
            references vouchers (code),
    type               varchar(255),
    reason             varchar(255)
);

alter table orders
    owner to "radiant-shop_owner";

