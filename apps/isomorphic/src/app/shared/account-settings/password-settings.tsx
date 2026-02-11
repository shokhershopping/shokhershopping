'use client';

import { useState } from 'react';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@core/ui/form';
import { Button, Password, Text } from 'rizzui';
import { ProfileHeader } from '@/app/shared/account-settings/profile-settings';
import HorizontalFormBlockWrapper from '@/app/shared/account-settings/horiozontal-block';
import {
  passwordFormSchema,
  PasswordFormTypes,
} from '@/validators/password-settings.schema';
import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import toast from 'react-hot-toast';
export default function PasswordSettingsView({
  settings,
}: {
  settings?: PasswordFormTypes;
}) {
  const [isLoading, setLoading] = useState(false);
  const [reset, setReset] = useState({});
  const { user, updateUserPassword } = useFirebaseAuth();

  const onSubmit: SubmitHandler<PasswordFormTypes> = async (data) => {
    setLoading(true);
    try {
      await updateUserPassword(data.currentPassword || '', data.newPassword);
      toast.success(<Text as="b">Password successfully updated!</Text>);
      setReset({
        currentPassword: '',
        newPassword: '',
        confirmedPassword: '',
      });
    } catch (error: Error | any) {
      toast.error(<Text as="b">{error.message}</Text>);
    } finally {
      setLoading(false);
    }
  };

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
                description={user?.email || ''}
              />

              <div className="mx-auto w-full max-w-screen-2xl">
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
    </>
  );
}
