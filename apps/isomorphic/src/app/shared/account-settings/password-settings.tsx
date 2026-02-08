'use client';

import { useEffect, useState } from 'react';
import { SubmitHandler, Controller } from 'react-hook-form';
import { PiDesktop } from 'react-icons/pi';
import { Form } from '@core/ui/form';
import { Button, Password, Title, Text } from 'rizzui';
import cn from '@core/utils/class-names';
import { ProfileHeader } from '@/app/shared/account-settings/profile-settings';
import HorizontalFormBlockWrapper from '@/app/shared/account-settings/horiozontal-block';
import {
  passwordFormSchema,
  PasswordFormTypes,
} from '@/validators/password-settings.schema';
import { useAuth, useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';
export default function PasswordSettingsView({
  settings,
}: {
  settings?: PasswordFormTypes;
}) {
  const [isLoading, setLoading] = useState(false);
  const [reset, setReset] = useState({});
  const [sessions, setSessions] = useState<any>([]);
  const { user } = useUser();

  const onSubmit: SubmitHandler<PasswordFormTypes> = async (data) => {
    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      console.log('Password settings data ->', data);
      const passwordUpdate = {
        newPassword: data.newPassword,
        signOutOfOtherSessions: true,
      } as any;

      if (user?.passwordEnabled) {
        passwordUpdate['currentPassword'] = data.currentPassword;
      }
      try {
        await user?.updatePassword(passwordUpdate);
        toast.success(<Text as="b">Password successfully updated!</Text>);
        setReset({
          currentPassword: '',
          newPassword: '',
          confirmedPassword: '',
        });
      } catch (error: Error | any) {
        toast.error(<Text as="b">{error.message}</Text>);
      }
    }, 600);
  };

  useEffect(() => {
    user?.getSessions().then((sess) => {
      setSessions(sess);
    });
  }, [user]);

  return (
    <>
      <Form<PasswordFormTypes>
        validationSchema={passwordFormSchema}
        resetValues={reset}
        onSubmit={onSubmit}
        className="@container"
        useFormProps={{
          mode: 'onChange',
          defaultValues: {
            ...settings,
          },
        }}
      >
        {({ register, control, formState: { errors }, getValues }) => {
          return (
            <>
              <ProfileHeader
                title={user?.fullName || 'John Doe'}
                description={user?.primaryEmailAddress?.emailAddress || ''}
              />

              <div className="mx-auto w-full max-w-screen-2xl">
                {user?.passwordEnabled && (
                  <HorizontalFormBlockWrapper
                    title="Current Password"
                    titleClassName="text-base font-medium"
                  >
                    <Controller
                      control={control}
                      name="currentPassword"
                      render={({ field: { onChange, value } }) => (
                        <Password
                          placeholder="Enter current password"
                          helperText={
                            (getValues().currentPassword?.length ?? 0) < 8 &&
                            'Your current password must be more than 8 characters'
                          }
                          onChange={onChange}
                          error={errors.currentPassword?.message}
                        />
                      )}
                    />
                  </HorizontalFormBlockWrapper>
                )}
                <HorizontalFormBlockWrapper
                  title="New Password"
                  titleClassName="text-base font-medium"
                >
                  <Controller
                    control={control}
                    name="newPassword"
                    render={({ field: { onChange, value } }) => (
                      <Password
                        placeholder="Enter your password"
                        helperText={
                          getValues().newPassword.length < 8 &&
                          'Your current password must be more than 8 characters'
                        }
                        onChange={onChange}
                        error={errors.newPassword?.message}
                      />
                    )}
                  />
                </HorizontalFormBlockWrapper>

                <HorizontalFormBlockWrapper
                  title="Confirm New Password"
                  titleClassName="text-base font-medium"
                >
                  <Controller
                    control={control}
                    name="confirmedPassword"
                    render={({ field: { onChange, value } }) => (
                      <Password
                        placeholder="Enter your password"
                        onChange={onChange}
                        error={errors.confirmedPassword?.message}
                      />
                    )}
                  />
                </HorizontalFormBlockWrapper>

                <div className="mt-6 flex w-auto items-center justify-end gap-3">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button type="submit" variant="solid" isLoading={isLoading}>
                    Update Password
                  </Button>
                </div>
              </div>
            </>
          );
        }}
      </Form>
      <LoggedDevices className="mt-10" sessions={sessions} />
    </>
  );
}

// Logged devices
function LoggedDevices({
  className,
  sessions,
}: {
  className?: string;
  sessions: any[];
}) {
  return (
    <div className={cn('mx-auto w-full max-w-screen-2xl', className)}>
      <div className="border-b border-dashed border-muted">
        <Title as="h2" className="mb-3 text-xl font-bold text-gray-900">
          Where you’re logged in
        </Title>
        <Text className="mb-6 text-sm text-gray-500">
          We’ll alert you via olivia@untitledui.com if there is any unusual
          activity on your account.
        </Text>
      </div>
      {sessions.map((session) => {
        return (
          <div
            key={session.id}
            className="flex items-center gap-6 border-b border-dashed border-muted py-6"
          >
            <PiDesktop className="h-7 w-7 text-gray-500" />

            <div>
              <div className="mb-2 flex items-center gap-2">
                <Title
                  as="h3"
                  className="text-base font-medium text-gray-900 dark:text-gray-700"
                >
                  {session.latestActivity.deviceType} -{' '}
                  {session.latestActivity.browserName}
                </Title>
                <Text
                  as="span"
                  className="relative hidden rounded-md border border-muted py-1.5 pe-2.5 ps-5 text-xs font-semibold text-gray-900 before:absolute before:start-2.5 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-green sm:block"
                >
                  {session.status === 'active'
                    ? 'Active Now'
                    : `Last seen ${session.lastActiveAt.toLocaleString()}`}
                </Text>
              </div>
              <div className="flex items-center gap-2">
                <Text className="text-sm text-gray-500">
                  {session.latestActivity.city},{' '}
                  {session.latestActivity.country} (
                  {session.latestActivity.ipAddress})
                </Text>
                <span className="h-1 w-1 rounded-full bg-gray-600" />
                <Text className="text-sm text-gray-500">
                  {session.lastActiveAt.toLocaleString()}
                </Text>
              </div>
              {session.status === 'active' && (
                <Text
                  as="span"
                  className="relative mt-2 inline-block rounded-md border border-muted py-1.5 pe-2.5 ps-5 text-xs font-semibold text-gray-900 before:absolute before:start-2.5 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-green sm:hidden"
                >
                  Active Now
                </Text>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
