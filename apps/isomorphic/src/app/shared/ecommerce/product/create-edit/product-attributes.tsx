'use client';

import { useCallback } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Input, Button, ActionIcon, Select, Text, Title } from 'rizzui';
import TrashIcon from '@core/components/icons/trash';
import { PiPlusBold } from 'react-icons/pi';
import {
  ATTRIBUTE_PRESETS,
  PRESET_OPTIONS,
  type ProductAttribute,
} from './form-utils';
import cn from '@core/utils/class-names';

export default function ProductAttributes({ className }: { className?: string }) {
  const { control, watch, setValue } = useFormContext();
  const currentPreset = watch('productAttributePreset') || '';

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'productAttributes',
  });

  const handlePresetChange = useCallback(
    (value: string) => {
      setValue('productAttributePreset', value);
      if (value === 'custom') {
        // Keep existing attributes, let user customize
        return;
      }
      const presetAttrs = ATTRIBUTE_PRESETS[value] || [];
      replace(presetAttrs);
    },
    [setValue, replace]
  );

  const addAttribute = useCallback(() => {
    append({ key: '', label: '', inputType: 'text', options: [] });
    if (currentPreset !== 'custom') {
      setValue('productAttributePreset', 'custom');
    }
  }, [append, currentPreset, setValue]);

  const handleRemove = useCallback(
    (index: number) => {
      remove(index);
      setValue('productAttributePreset', 'custom');
    },
    [remove, setValue]
  );

  return (
    <div className={cn('space-y-5', className)}>
      <Title as="h6" className="text-base font-semibold">
        Product Attributes
      </Title>
      <Text className="text-sm text-gray-500">
        Choose a preset or define custom attributes for your product variants.
      </Text>

      {/* Preset Selector */}
      <Controller
        name="productAttributePreset"
        control={control}
        render={({ field: { value } }) => (
          <Select
            label="Attribute Preset"
            options={PRESET_OPTIONS}
            value={value}
            onChange={handlePresetChange}
            getOptionValue={(option) => option.value}
            displayValue={(selected) =>
              PRESET_OPTIONS.find((o) => o.value === selected)?.label || 'Select preset'
            }
            placeholder="Select a preset"
            className="max-w-md"
          />
        )}
      />

      {/* Attribute List */}
      {fields.length > 0 && (
        <div className="space-y-3">
          <Text className="text-sm font-medium text-gray-700">
            Defined Attributes ({fields.length})
          </Text>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-end gap-3 rounded-lg border border-muted p-3"
            >
              <Controller
                name={`productAttributes.${index}.label`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Label"
                    placeholder="e.g. Color, Size, RAM"
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const newLabel = e.target.value;
                      onChange(newLabel);
                      // Auto-derive key from label
                      const autoKey = newLabel
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '_')
                        .replace(/^_|_$/g, '');
                      setValue(`productAttributes.${index}.key`, autoKey);
                    }}
                    className="flex-1"
                  />
                )}
              />

              <Controller
                name={`productAttributes.${index}.inputType`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="Input Type"
                    options={[
                      { value: 'text', label: 'Text' },
                      { value: 'select', label: 'Dropdown' },
                    ]}
                    value={value}
                    onChange={onChange}
                    getOptionValue={(option) => option.value}
                    displayValue={(selected) =>
                      selected === 'select' ? 'Dropdown' : 'Text'
                    }
                    className="w-36"
                  />
                )}
              />

              {watch(`productAttributes.${index}.inputType`) === 'select' && (
                <Controller
                  name={`productAttributes.${index}.options`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Options (comma-separated)"
                      placeholder="e.g. XS, S, M, L, XL"
                      value={Array.isArray(value) ? value.join(', ') : ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const opts = e.target.value
                          .split(',')
                          .map((s: string) => s.trim())
                          .filter(Boolean);
                        onChange(opts);
                      }}
                      className="flex-1"
                    />
                  )}
                />
              )}

              <ActionIcon
                onClick={() => handleRemove(index)}
                variant="flat"
                color="danger"
                className="shrink-0"
              >
                <TrashIcon className="h-4 w-4" />
              </ActionIcon>
            </div>
          ))}
        </div>
      )}

      {fields.length === 0 && currentPreset === 'generic' && (
        <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center">
          <Text className="text-sm text-gray-500">
            No attributes defined. Variants will be identified by name only.
          </Text>
        </div>
      )}

      {/* Add Custom Attribute Button */}
      <Button onClick={addAttribute} variant="outline" className="w-auto">
        <PiPlusBold className="me-2 h-4 w-4" /> Add Custom Attribute
      </Button>
    </div>
  );
}
