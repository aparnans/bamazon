drop database if exists bamazom;

CREATE DATABASE bamazom;

USE bamazom;

CREATE TABLE products(
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NOT NULL,
  department_name VARCHAR(45) NOT NULL,
  price double,
  stock_quantity INT default 0,
  PRIMARY KEY (item_id)
);

create table users(
	userid INT not null auto_increment,
    password varchar(100) not null,
    username varchar(200) not null,
    address varchar(500),
    zipcode varchar(10),
    PRIMARY KEY (userid)
);

insert into users
(username, password, address, zipcode)
values('Diana','Diana#pwd','121 11th street', '10003');

insert into users
(username, password, address, zipcode)
values('Patric','Patric#pwd','130 20th street', '48127');

insert into users
(username, password, address, zipcode)
values('Sam','Sam#pwd','145 23rd street', '45377');
