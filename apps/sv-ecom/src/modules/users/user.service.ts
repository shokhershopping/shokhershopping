import { User } from '@prisma/client';
import { clerkClient, User as ClerkUser } from '@clerk/express';
import { IResponse, Metadata, PaginationParams } from '../../types';
import { CustomError } from '../../utils/CustomError';
import prisma from '../../prismaClient';

export const getUsers = async ({
    limit,
    page,
}: PaginationParams): Promise<IResponse<User[]>> => {
    try {
        const [users, counts] = await Promise.all([
            prisma.user.findMany({
                take: limit,
                skip: (page - 1) * limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.user.count(),
        ]);
        const response: IResponse<User[]> = {
            status: 'success',
            message: 'Users fetched successfully',
            data: users,
            total: counts,
            totalPages: Math.ceil(counts / limit),
            page,
            limit,
            hasNextPage: counts > page * limit,
            hasPrevPage: page > 1,
        };
        return response;
    } catch (error) {
        throw new CustomError('Error occurred while fetching users', 500);
    }
};

export const getUserById = async (
    id: string
): Promise<
    IResponse<
        | (User & {
              metadata: UserPublicMetadata;
          })
        | null
    >
> => {
    try {
        const [user, clerkUser] = await Promise.all([
            prisma.user.findUnique({
                where: {
                    id,
                },
            }),
            clerkClient.users.getUser(id),
        ]);

        const response: IResponse<
            | (User & {
                  metadata: UserPublicMetadata;
              })
            | null
        > = {
            status: 'success',
            message: 'User fetched successfully',
            data: user ? { ...user, metadata: clerkUser.publicMetadata } : null,
        };
        return response;
    } catch (error) {
        console.log(error);
        throw new CustomError('Error occurred while fetching user', 500);
    }
};

export const updateUserMetadata = async (
    id: string,
    metadata: Partial<Metadata>
): Promise<ClerkUser> => {
    try {
        const user = await clerkClient.users.updateUserMetadata(id, {
            publicMetadata: {
                ...metadata,
            },
        });
        return user;
    } catch (error) {
        throw new CustomError(
            'Error occurred while updating user metadata',
            500
        );
    }
};

/**
 * Ensure user exists in database (upsert operation)
 * Creates or updates user based on Clerk user data
 * @param userData - User data from Clerk
 * @returns Promise<IResponse<User>>
 */
export const ensureUserExists = async (userData: {
    id: string;
    email: string;
    name?: string;
    image?: string;
}): Promise<IResponse<User>> => {
    try {
        const user = await prisma.user.upsert({
            where: {
                id: userData.id,
            },
            update: {
                email: userData.email,
                name: userData.name || '',
                image: userData.image || '',
            },
            create: {
                id: userData.id,
                email: userData.email,
                name: userData.name || '',
                image: userData.image || '',
            },
        });

        const response: IResponse<User> = {
            status: 'success',
            message: 'User verified successfully',
            data: user,
        };

        return response;
    } catch (error) {
        console.error('Error ensuring user exists:', error);
        throw new CustomError('Error occurred while verifying user', 500);
    }
};
