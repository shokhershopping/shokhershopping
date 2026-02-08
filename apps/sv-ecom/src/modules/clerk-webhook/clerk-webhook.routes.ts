import { Router } from 'express';
import { verifyWebhook } from '@clerk/express/webhooks';
import express from 'express';
import { User } from '@prisma/client';
import prisma from '../../prismaClient'; // Adjust the import path as necessary
const router = Router();

router.post(
    '/',
    // Add this middleware to get raw body for verification
    express.raw({ type: 'application/json' }),
    async (req, res) => {
        try {
            console.log(process.env.CLERK_WEBHOOK_SIGNING_SECRET);

            // Verify the webhook
            const evt = await verifyWebhook(req, {
                signingSecret: process.env
                    .CLERK_WEBHOOK_SIGNING_SECRET as string,
            });

            // Do something with payload
            const { id } = evt.data;
            const eventType = evt.type;
            console.log(
                `Received webhook with ID ${id} and event type of ${eventType}`
            );

            let user = {} as User;

            if (eventType === 'user.created') {
                user = await prisma.user.create({
                    data: {
                        id: id,
                        email: evt.data.email_addresses[0].email_address,
                        name: evt.data.first_name + ' ' + evt.data.last_name,
                        image: evt.data.image_url,
                    },
                });
                console.log('User created:', user);
            }

            if (eventType === 'user.updated') {
                user = await prisma.user.upsert({
                    where: {
                        id: id,
                    },
                    update: {
                        email: evt.data.email_addresses[0].email_address,
                        name: evt.data.first_name + ' ' + evt.data.last_name,
                        image: evt.data.image_url,
                    },
                    create: {
                        id: id,
                        email: evt.data.email_addresses[0].email_address,
                        name: evt.data.first_name + ' ' + evt.data.last_name,
                        image: evt.data.image_url,
                    },
                });
                console.log('User updated:', user);
            }

            if (eventType === 'user.deleted') {
                user = await prisma.user.delete({
                    where: {
                        id: id,
                    },
                });
                console.log('User deleted:', user);
            }

            res.json({
                message: 'Webhook received successfully',
                eventType,
                user,
            });
        } catch (err) {
            console.error('Error verifying webhook:', err);
            res.status(400).send('Error verifying webhook');
        }
    }
);

export default router;
