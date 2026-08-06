'use client';

import dynamic from 'next/dynamic';
import QuillLoader from '@core/components/loader/quill-loader';
import { Text } from 'rizzui';

const QuillEditor = dynamic(() => import('@core/ui/quill-editor'), {
  ssr: false,
  loading: () => <QuillLoader className="h-[240px]" />,
});

const contentEditorModules = {
  toolbar: [
    [{ header: [2, 3, 4, false] }],
    ['bold', 'italic', 'underline'],
    ['blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

const contentEditorFormats = [
  'header',
  'bold',
  'italic',
  'underline',
  'blockquote',
  'list',
  'link',
];

export interface ContentPostEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function ContentPostEditor({
  value,
  onChange,
  error,
}: ContentPostEditorProps) {
  return (
    <div className="col-span-full">
      <QuillEditor
        label="Content"
        value={value}
        onChange={onChange}
        error={error}
        modules={contentEditorModules}
        formats={contentEditorFormats}
        className="[&_.ql-container]:min-h-[220px] [&_.ql-editor]:min-h-[220px]"
        labelClassName="mb-1.5 font-medium text-gray-700 dark:text-gray-600"
      />
      <Text className="mt-2 text-xs text-gray-500">
        Content is sanitized on save; unsupported markup and unsafe links are
        removed.
      </Text>
    </div>
  );
}
