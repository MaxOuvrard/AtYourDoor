-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_postId_fkey`;

-- DropForeignKey
ALTER TABLE `Post` DROP FOREIGN KEY `Post_userId_fkey`;

-- DropTable
DROP TABLE `Comment`;

-- DropTable
DROP TABLE `Post`;

-- AlterTable: add new User fields
ALTER TABLE `User`
    ADD COLUMN `lastName` VARCHAR(191) NULL,
    ADD COLUMN `phone`    VARCHAR(191) NULL;

-- CreateTable Restaurant
CREATE TABLE `Restaurant` (
    `id`          VARCHAR(191) NOT NULL,
    `name`        VARCHAR(191) NOT NULL,
    `description` TEXT         NULL,
    `address`     VARCHAR(191) NOT NULL,
    `phone`       VARCHAR(191) NULL,
    `imageUrl`    VARCHAR(191) NULL,
    `status`      ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`   DATETIME(3)  NOT NULL,
    `ownerId`     VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Restaurant_ownerId_key`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable Plat
CREATE TABLE `Plat` (
    `id`           VARCHAR(191)   NOT NULL,
    `name`         VARCHAR(191)   NOT NULL,
    `description`  TEXT           NULL,
    `price`        DECIMAL(10, 2) NOT NULL,
    `imageUrl`     VARCHAR(191)   NULL,
    `available`    BOOLEAN        NOT NULL DEFAULT true,
    `createdAt`    DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`    DATETIME(3)    NOT NULL,
    `restaurantId` VARCHAR(191)   NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable Commande
CREATE TABLE `Commande` (
    `id`              VARCHAR(191)   NOT NULL,
    `status`          ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'ON_DELIVERY', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `totalPrice`      DECIMAL(10, 2) NOT NULL,
    `deliveryAddress` VARCHAR(191)   NOT NULL,
    `createdAt`       DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`       DATETIME(3)    NOT NULL,
    `userId`          VARCHAR(191)   NOT NULL,
    `restaurantId`    VARCHAR(191)   NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable CommandePlat
CREATE TABLE `CommandePlat` (
    `id`         VARCHAR(191)   NOT NULL,
    `quantity`   INTEGER        NOT NULL DEFAULT 1,
    `unitPrice`  DECIMAL(10, 2) NOT NULL,
    `createdAt`  DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`  DATETIME(3)    NOT NULL,
    `commandeId` VARCHAR(191)   NOT NULL,
    `platId`     VARCHAR(191)   NOT NULL,

    UNIQUE INDEX `CommandePlat_commandeId_platId_key`(`commandeId`, `platId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Restaurant` ADD CONSTRAINT `Restaurant_ownerId_fkey`
    FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Plat` ADD CONSTRAINT `Plat_restaurantId_fkey`
    FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commande` ADD CONSTRAINT `Commande_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commande` ADD CONSTRAINT `Commande_restaurantId_fkey`
    FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommandePlat` ADD CONSTRAINT `CommandePlat_commandeId_fkey`
    FOREIGN KEY (`commandeId`) REFERENCES `Commande`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommandePlat` ADD CONSTRAINT `CommandePlat_platId_fkey`
    FOREIGN KEY (`platId`) REFERENCES `Plat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
