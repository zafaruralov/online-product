CREATE TYPE order_status as ENUM ('new', 'delivering', 'finished');

CREATE TABLE orders (
    id uuid PRIMARY KEY,
    status order_status DEFAULT 'new',
    assigned_to uuid REFERENCES users (id) DEFAULT null,
    customer_id uuid NOT NULL REFERENCES users (id)
);

CREATE TABLE order_products (
    order_id uuid REFERENCES orders (id),
    product_id uuid REFERENCES products (id)
);