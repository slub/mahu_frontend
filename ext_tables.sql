#
# Table structure for table 'fe_users'
#
CREATE TABLE fe_users (
  power_of_disposition tinyint(3) DEFAULT '0' NOT NULL,
  power_of_disposition_date_of_acceptance INT(11) DEFAULT '0' NOT NULL,
  position varchar(255) DEFAULT '' NOT NULL,
  expertise varchar(255) DEFAULT '' NOT NULL,
);