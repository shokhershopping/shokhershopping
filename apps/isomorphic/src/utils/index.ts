import { User } from '@clerk/nextjs/server';

export const notificationMetadataFormatter = (
  category: string, // order, transaction, inventory
  optionName: string, // title
  option: string, // email, push, sms
  user: User | null
) => {
  return {
    ...user?.publicMetadata,
    preferences: {
      ...(user?.publicMetadata?.preferences || {}),
      notifications: {
        ...((user?.publicMetadata?.preferences as any)?.notifications || {}),
        [category]: {
          ...((user?.publicMetadata?.preferences as any)?.notifications?.[
            category
          ] || {}),
          [optionName]: option,
        },
      },
    },
  };
};

export const notificationMetadataParser = (
  user: User | null,
  category: string,
  optionName: string
) => {
  const metadata = user?.publicMetadata as any;
  return metadata?.preferences?.notifications?.[category]?.[optionName];
};
