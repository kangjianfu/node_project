
DROP TABLE IF EXISTS `customer`;

CREATE TABLE `customer` (
  `id` varchar(64) NOT NULL,
  `name` varchar(100),
  `password` varchar(200) NOT NULL,
  `email` varchar(50),
  `phone` varchar(16) NOT NULL,
  `logo` varchar(100) DEFAULT NULL COMMENT '保存个人头像的url',
  `create_time` datetime NOT NULL,
  `update_time` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
