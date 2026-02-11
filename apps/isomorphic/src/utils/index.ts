interface UserWithMetadata {
  publicMetadata?: Record<string, any>;
  [key: string]: any;
}

export const notificationMetadataFormatter = (
  category: string, // order, transaction, inventory
  optionName: string, // title
  option: string, // email, push, sms
  user: UserWithMetadata | null
) => {
  return {
    ...user?.publicMetadata,
    preferences: {
      ...(user?.publicMetadata?.preferences || {}),
      notifications: {
        ...(user?.publicMetadata?.preferences?.notifications || {}),
        [category]: {
          ...(user?.publicMetadata?.preferences?.notifications?.[category] ||
            {}),
          [optionName]: option,
        },
      },
    },
  };
};

export const notificationMetadataParser = (
  user: UserWithMetadata | null,
  category: string,
  optionName: string
) => {
  const metadata = user?.publicMetadata as any;
  return metadata?.preferences?.notifications?.[category]?.[optionName];
};
