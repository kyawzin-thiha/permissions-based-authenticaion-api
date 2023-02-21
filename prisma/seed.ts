import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	const adminRole = await prisma.role.upsert({
		where: {
			name: 'Admin',
		},
		update: {},
		create: {
			name: 'Admin',
			description: 'This is default admin role',
			permission: {
				create: {
					read: true,
					write: true,
					delete: true,
					admin: true,
				},
			},
		},
	});

	await prisma.role.upsert({
		where: {
			name: 'Viewer',
		},
		update: {},
		create: {
			name: 'Viewer',
			description: 'This is default viewer role',
			permission: {
				create: {
					read: true,
					write: false,
					delete: false,
					admin: false,
				},
			},
		},
	});

	await prisma.role.upsert({
		where: {
			name: 'Editor',
		},
		update: {},
		create: {
			name: 'Editor',
			description: 'This is default editor role',
			permission: {
				create: {
					read: true,
					write: true,
					delete: true,
					admin: false,
				},
			},
		},
	});

	await prisma.account.upsert({
		where: {
			username: 'root',
		},
		update: {},
		create: {
			username: 'root',
			password: 'root',
			user: {
				create: {
					name: "Root User",
					avatar: "",
					email: "",
					role: {
						connect: {
							id: adminRole.id,
						}
					}
				}
			}
		},
	});
}

main()
	.catch(() => {
		process.exit(1);
	})
	.finally(async () => await prisma.$disconnect());
